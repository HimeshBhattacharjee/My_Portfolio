import { useEffect, useRef } from "react";
import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    DoubleSide,
    Mesh,
    NormalBlending,
    PerspectiveCamera,
    Plane,
    Points,
    Raycaster,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";
import { buildLattice, CAMERA } from "./latticeGeometry";
import { onHeroSignal } from "./signal";

// The Lattice: one canvas, two draw calls (points and connections), one shared set of
// uniforms. While the hero is on screen the field breathes slowly, drawn at about 24 frames
// a second; anything else moving (the opening pulse, a ripple, the pointer, the camera
// easing) draws at the full rate. Nothing is drawn while the hero is off screen or the
// tab is hidden.
//
// Light in the lattice:
//   - the opening pulse travels once from beneath the portrait;
//   - each time the hero name glitches, a signal ripple runs out from a point beneath the
//     name: a ring of light through the points, connections brightening as it passes,
//     and a soft cyan glow around its origin that fades as the ring moves on. The name's
//     glitch and the ripple are one event (see signal.js); the mesh has no timer of its own;
//   - clicking or tapping in the hero sends a ripple out from that point;
//   - on fine pointers, the field lights a little under the cursor and the camera leans
//     towards it, so the field reads as depth.
//
// At rest the field is always lit: every connection is a filament with light falling off
// on either side (drawn as screen-space quads, since GL lines are one pixel wide), and
// every node has a hot centre and a soft halo. Breathing and ripples only add to that.
//
// Each theme has its own palette: additive light on graphite in the dark theme, ink and
// electric blue with ordinary blending on paper in the light theme.
//
// Written against plain Three.js with named imports (rather than React Three Fiber, which
// registers the whole THREE namespace) so the bundler can drop every class the scene does
// not use. Same shaders, geometry and behaviour as before.

const PULSE_DELAY = 0.55;
const PULSE_DURATION = 4.4;
const RIPPLE_DURATION = 3.4;
const RIPPLE_REACH = 10;
// The signal ripple that accompanies the name glitch: wider reaching and brighter than a
// tap ripple, with a halo at its origin.
const SIGNAL_DURATION = 3.4;
const SIGNAL_REACH = 11;
const SIGNAL_GAIN = 1.45;
const SIGNAL_HALO = 1;
// Used when the point beneath the name does not fall on the lattice plane.
const SIGNAL_FALLBACK = [-3.2, -1.2];
const MAX_DPR = 1.5;
// Ambient breathing: one slow, smooth swell of the field (seconds per breath). While
// nothing else moves, frames are drawn at a reduced rate: the change per frame is tiny,
// so the lower rate is invisible and keeps the GPU mostly idle.
const BREATH_PERIOD = 7.5;
const BREATH_FRAME_S = 1 / 24;

// Connections are drawn as thin screen-space quads rather than GL lines: GL lines are one
// device pixel wide on every mainstream browser (lineWidth is ignored), which leaves no
// room for light around them. Each quad carries a bright core and a soft falloff, so a
// connection reads as a lit filament. Widths are in CSS pixels.
const LINE_HALF_WIDTH = 4.6;
const LINE_CORE = 0.8;
// Smallest node sprite, in CSS pixels, so even distant nodes keep a visible halo.
const MIN_POINT = 7;

const PALETTES = {
    // ink: idle colour of connections and node bodies; accent: light carried by the
    // pulse, pointer and ripple; soft: the halo colour around nodes and connections (and
    // around a signal ripple's origin); peak: the hot centre of each node and the crest
    // of the ripple ring. halo scales halo strength per theme; haloMax caps it, so on paper
    // (ordinary blending) a lit halo stays a tint instead of becoming an opaque disc.
    // Dark: additive electric cyan and blue on graphite, so overlapping light adds up.
    dark: { ink: "#2FB6F2", accent: "#66EAFF", soft: "#3E74FF", peak: "#E6FCFF", alpha: 0.50, halo: 0.78, haloMax: 0.82, blending: AdditiveBlending },
    // On paper light cannot add, so it is drawn as ink: electric blue filaments with soft
    // indigo halos and saturated blue centres, with ordinary blending. Its own palette,
    // not the dark one dimmed.
    light: { ink: "#1D4FE0", accent: "#0A6CFF", soft: "#5A4CF0", peak: "#0B3BC9", alpha: 0.30, halo: 0.78, haloMax: 0.34, blending: NormalBlending },
};

const SHARED_VERTEX = /* glsl */ `
    attribute float aDist;
    uniform float uPulse;
    uniform vec2 uPointer;
    uniform float uPointerStrength;
    uniform vec2 uRippleOrigin;
    uniform float uRipple;
    uniform float uRippleGain;
    uniform float uHalo;
    uniform float uTime;
    varying float vGlow;
    varying float vBase;
    varying float vFade;
    varying float vRipple;
    varying float vHalo;
    varying float vBreath;

    void shade(vec4 mv) {
        float d = aDist - uPulse;
        float wave = exp(-d * d * 58.0);
        float settled = 1.0 - smoothstep(-0.12, 0.04, d);
        float pd = distance(position.xz, uPointer);
        float hover = exp(-pd * pd * 0.55) * uPointerStrength;
        float rd = distance(position.xz, uRippleOrigin) - uRipple;
        float ripple = exp(-rd * rd * 1.25) * uRippleGain;
        // A faint trail just inside the ring, so the light reads as travelling outward.
        float trail = exp(rd * 1.1) * step(rd, 0.0) * uRippleGain * 0.3;
        float od = distance(position.xz, uRippleOrigin);
        vHalo = exp(-od * od * 0.12) * uHalo;
        vRipple = clamp(ripple + trail, 0.0, 1.5);
        // Breathing: the field swells and settles together, with a slow drift across its
        // width so it reads as current in the structure rather than a blink. Smooth sines
        // only: no noise, no flicker, no colour jumps. Range 0..1.
        vBreath = 0.5 + 0.5 * sin(uTime * ${((2 * Math.PI) / BREATH_PERIOD).toFixed(4)} - position.x * 0.16 + position.z * 0.08);
        vGlow = clamp(wave + hover * 0.75 + ripple + trail + vHalo * 0.45, 0.0, 1.0);
        vBase = settled;
        float depth = -mv.z;
        vFade = (1.0 - smoothstep(7.5, 18.0, depth)) * smoothstep(1.2, 3.4, depth);
    }
`;

// Brightness model, shared by points and connections:
//   idle   the resting light, always on: 0.82 before the opening pulse reaches a node,
//          1.0 after it. Never depends on the pointer, a click or a ripple.
//   breath a slow swell on top of idle (0..1), never below it.
//   lit    transient light from the pulse, pointer and ripples, added on top.
// Colours are written through <colorspace_fragment>: the palette is stored in linear
// space by three.js, and without the sRGB encode every colour reached the screen darker
// and duller than its token.
const SHARED_FRAGMENT = /* glsl */ `
    uniform vec3 uWarm;
    uniform vec3 uCyan;
    uniform vec3 uSoft;
    uniform vec3 uPeak;
    uniform float uAlpha;
    uniform float uHaloGain;
    uniform float uHaloMax;
    varying float vGlow;
    varying float vBase;
    varying float vFade;
    varying float vRipple;
    varying float vHalo;
    varying float vBreath;

    float idleLight() { return 0.82 + vBase * 0.18; }
    float transientLight() { return clamp(vGlow * 0.8 + vRipple, 0.0, 1.6); }
    vec3 bodyColor(float lit) {
        vec3 c = mix(uWarm, uCyan, clamp(lit * 0.75 + vBreath * 0.22, 0.0, 1.0));
        return mix(c, uSoft, clamp(vHalo, 0.0, 1.0) * 0.4);
    }
`;

const POINT_VERTEX = /* glsl */ `
    ${SHARED_VERTEX}
    attribute float aSize;
    uniform float uPixelRatio;

    void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        shade(mv);
        // The sprite is much larger than the node itself: most of it is halo.
        float size = aSize * (1.0 + vGlow * 0.55 + vRipple * 0.5) * 96.0 / -mv.z;
        gl_PointSize = max(size, ${MIN_POINT.toFixed(1)}) * uPixelRatio;
    }
`;

const POINT_FRAGMENT = /* glsl */ `
    ${SHARED_FRAGMENT}

    void main() {
        float r = length(gl_PointCoord - 0.5);
        float idle = idleLight();
        float lit = transientLight();
        // Three layers in one sprite: a hot centre, the node's body and a soft halo.
        float centre = 1.0 - smoothstep(0.0, 0.06 + lit * 0.015, r);
        float core = 1.0 - smoothstep(0.06, 0.12 + lit * 0.02, r);
        float halo = exp(-r * r * (14.0 - min(lit, 1.0) * 4.0));
        float edge = 1.0 - smoothstep(0.42, 0.5, r);

        float coreA = core * clamp(idle * 0.86 + vBreath * 0.1 + lit * 0.5, 0.0, 1.0);
        float haloA = min(halo * (0.55 + vBreath * 0.1 + lit * 0.35) * idle * uHaloGain, uHaloMax);

        vec3 body = bodyColor(lit);
        vec3 coreColor = mix(body, uPeak, centre * clamp(0.6 + lit * 0.4, 0.0, 1.0));
        vec3 haloColor = mix(body, uSoft, 0.35);
        float alpha = max(coreA, haloA);
        vec3 color = mix(haloColor, coreColor, clamp(coreA / max(alpha, 0.0001), 0.0, 1.0));
        gl_FragColor = vec4(color, alpha * edge * vFade * uAlpha);
        #include <colorspace_fragment>
    }
`;

// Each connection is a quad: both ends of the edge, pushed apart sideways in screen
// space. aOther is the far end of the edge, aSide the side of the quad (-1 or 1), aDir
// flips the edge direction for the far-end vertices so both ends agree on "sideways".
const LINE_VERTEX = /* glsl */ `
    ${SHARED_VERTEX}
    attribute vec3 aOther;
    attribute float aSide;
    attribute float aDir;
    uniform vec2 uResolution;
    uniform float uPixelRatio;
    varying float vAcross;
    varying float vCoreFrac;

    void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec4 clip = projectionMatrix * mv;
        vec4 otherClip = projectionMatrix * modelViewMatrix * vec4(aOther, 1.0);
        shade(mv);

        vec2 half_res = uResolution * 0.5;
        vec2 a = clip.xy / clip.w * half_res;
        vec2 b = otherClip.xy / otherClip.w * half_res;
        vec2 dir = b - a;
        dir = length(dir) > 0.0001 ? normalize(dir) * aDir : vec2(1.0, 0.0);
        vec2 normal = vec2(-dir.y, dir.x);

        float lit = clamp(vGlow * 0.8 + vRipple, 0.0, 1.6);
        float perspective = clamp(7.0 / -mv.z, 0.55, 1.35);
        float halfWidth = (${LINE_HALF_WIDTH.toFixed(2)} + lit * 2.2) * perspective * uPixelRatio;
        float coreHalf = (${LINE_CORE.toFixed(2)} + lit * 0.45) * uPixelRatio;
        vCoreFrac = clamp(coreHalf / halfWidth, 0.05, 0.9);
        vAcross = aSide;

        clip.xy += normal * aSide * halfWidth / half_res * clip.w;
        gl_Position = clip;
    }
`;

const LINE_FRAGMENT = /* glsl */ `
    ${SHARED_FRAGMENT}
    varying float vAcross;
    varying float vCoreFrac;

    void main() {
        float a = abs(vAcross);
        float idle = idleLight();
        float lit = transientLight();
        // A bright filament with light falling off on either side.
        float core = 1.0 - smoothstep(vCoreFrac * 0.45, vCoreFrac, a);
        float glow = exp(-a * a * 3.0) * (1.0 - smoothstep(0.85, 1.0, a));

        // Connections carry the ripple more strongly than the points, so the signal is
        // seen running along the structure.
        float coreA = core * clamp(idle * 0.62 + vBreath * 0.12 + lit * 0.55 + vHalo * 0.15, 0.0, 1.0);
        float glowA = min(glow * (0.3 + vBreath * 0.08 + lit * 0.32 + vHalo * 0.12) * idle * uHaloGain, uHaloMax);

        vec3 body = bodyColor(lit);
        vec3 coreColor = mix(body, uPeak, clamp(vRipple, 0.0, 1.0) * 0.45);
        vec3 glowColor = mix(body, uSoft, 0.4);
        float alpha = max(coreA, glowA);
        vec3 color = mix(glowColor, coreColor, clamp(coreA / max(alpha, 0.0001), 0.0, 1.0));
        gl_FragColor = vec4(color, alpha * vFade * uAlpha);
        #include <colorspace_fragment>
    }
`;

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

// Expands the lattice's edges (pairs of point indices) into quads for LINE_VERTEX: four
// vertices and two triangles per connection, still drawn in a single call.
function buildConnectionQuads({ positions, dist, edges }) {
    const quads = edges.length / 2;
    const position = new Float32Array(quads * 12);
    const other = new Float32Array(quads * 12);
    const side = new Float32Array(quads * 4);
    const dir = new Float32Array(quads * 4);
    const qDist = new Float32Array(quads * 4);
    const index = new Uint16Array(quads * 6);

    for (let q = 0; q < quads; q += 1) {
        const a = edges[q * 2];
        const b = edges[q * 2 + 1];
        // Vertex order: near end (both sides), then far end (both sides).
        const ends = [a, a, b, b];
        const others = [b, b, a, a];
        const sides = [1, -1, 1, -1];
        const dirs = [1, 1, -1, -1];
        for (let k = 0; k < 4; k += 1) {
            const v = q * 4 + k;
            for (let c = 0; c < 3; c += 1) {
                position[v * 3 + c] = positions[ends[k] * 3 + c];
                other[v * 3 + c] = positions[others[k] * 3 + c];
            }
            side[v] = sides[k];
            dir[v] = dirs[k];
            qDist[v] = dist[ends[k]];
        }
        const v0 = q * 4;
        index.set([v0, v0 + 1, v0 + 2, v0 + 2, v0 + 1, v0 + 3], q * 6);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(position, 3));
    geometry.setAttribute("aOther", new BufferAttribute(other, 3));
    geometry.setAttribute("aSide", new BufferAttribute(side, 1));
    geometry.setAttribute("aDir", new BufferAttribute(dir, 1));
    geometry.setAttribute("aDist", new BufferAttribute(qDist, 1));
    geometry.setIndex(new BufferAttribute(index, 1));
    return geometry;
}

function createScene(canvas, palette) {
    const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
        stencil: false,
        depth: false,
    });
    renderer.setClearColor(0x000000, 0);

    const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 40);
    camera.position.set(...CAMERA.position);
    camera.lookAt(...CAMERA.target);

    const data = buildLattice();
    const uniforms = {
        uPulse: { value: -0.25 },
        uPointer: { value: new Vector2(60, 60) },
        uPointerStrength: { value: 0 },
        uPixelRatio: { value: 1 },
        uRippleOrigin: { value: new Vector2(0, 0) },
        uRipple: { value: 0 },
        uRippleGain: { value: 0 },
        uHalo: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: new Vector2(1, 1) },
        uWarm: { value: new Color(palette.ink) },
        uCyan: { value: new Color(palette.accent) },
        uSoft: { value: new Color(palette.soft) },
        uPeak: { value: new Color(palette.peak) },
        uAlpha: { value: palette.alpha },
        uHaloGain: { value: palette.halo },
        uHaloMax: { value: palette.haloMax },
    };

    const position = new BufferAttribute(data.positions, 3);
    const aDist = new BufferAttribute(data.dist, 1);

    const pointGeometry = new BufferGeometry();
    pointGeometry.setAttribute("position", position);
    pointGeometry.setAttribute("aDist", aDist);
    pointGeometry.setAttribute("aSize", new BufferAttribute(data.size, 1));

    const lineGeometry = buildConnectionQuads(data);

    const common = { uniforms, transparent: true, depthWrite: false, depthTest: false, blending: palette.blending };
    const pointMaterial = new ShaderMaterial({ ...common, vertexShader: POINT_VERTEX, fragmentShader: POINT_FRAGMENT });
    const lineMaterial = new ShaderMaterial({
        ...common,
        side: DoubleSide,
        vertexShader: LINE_VERTEX,
        fragmentShader: LINE_FRAGMENT,
    });

    const lines = new Mesh(lineGeometry, lineMaterial);
    const points = new Points(pointGeometry, pointMaterial);
    lines.frustumCulled = false;
    points.frustumCulled = false;

    const scene = new Scene();
    scene.add(lines, points);

    const dispose = () => {
        pointGeometry.dispose();
        lineGeometry.dispose();
        pointMaterial.dispose();
        lineMaterial.dispose();
        renderer.dispose();
    };

    const setPalette = (next) => {
        uniforms.uWarm.value.set(next.ink);
        uniforms.uCyan.value.set(next.accent);
        uniforms.uSoft.value.set(next.soft);
        uniforms.uPeak.value.set(next.peak);
        uniforms.uAlpha.value = next.alpha;
        uniforms.uHaloGain.value = next.halo;
        uniforms.uHaloMax.value = next.haloMax;
        for (const material of [pointMaterial, lineMaterial]) {
            material.blending = next.blending;
            material.needsUpdate = true;
        }
    };

    return { renderer, camera, scene, uniforms, setPalette, dispose };
}

const LatticeScene = ({ activeRef, wakeRef, onReady, theme = "dark" }) => {
    const canvasRef = useRef(null);
    const onReadyRef = useRef(onReady);
    const sceneRef = useRef(null);
    const themeRef = useRef(theme);
    onReadyRef.current = onReady;

    // Theme changes recolour the existing scene; nothing is rebuilt.
    useEffect(() => {
        themeRef.current = theme;
        const current = sceneRef.current;
        if (!current) return;
        current.setPalette(PALETTES[theme] ?? PALETTES.dark);
        current.invalidate();
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const host = canvas.parentElement;
        const { renderer, camera, scene, uniforms, setPalette, dispose } = createScene(
            canvas,
            PALETTES[themeRef.current] ?? PALETTES.dark,
        );

        const s = {
            frame: 0,
            last: 0,
            startedAt: 0,
            drawnAt: 0,
            ready: false,
            pointer: new Vector2(60, 60),
            target: new Vector2(60, 60),
            strength: 0,
            targetStrength: 0,
            // Camera lean, in normalised pointer units.
            lean: new Vector2(0, 0),
            leanTarget: new Vector2(0, 0),
            ripple: null,
        };
        const base = new Vector3(...CAMERA.position);
        const target = new Vector3(...CAMERA.target);

        const resize = () => {
            const width = host.clientWidth;
            const height = host.clientHeight;
            if (width === 0 || height === 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
            renderer.setPixelRatio(dpr);
            renderer.setSize(width, height, false);
            uniforms.uPixelRatio.value = dpr;
            uniforms.uResolution.value.set(width * dpr, height * dpr);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const tick = (time) => {
            s.frame = 0;
            const now = time / 1000;
            const delta = s.last ? Math.min(now - s.last, 0.05) : 0.016;
            s.last = now;

            if (!s.ready) {
                renderer.render(scene, camera);
                s.ready = true;
                onReadyRef.current?.();
            }
            if (!activeRef.current) {
                s.last = 0;
                return;
            }

            // The pulse follows wall-clock time so it lasts the same on slow and fast devices.
            if (!s.startedAt) s.startedAt = now;
            const progress = Math.min(1, Math.max(0, (now - s.startedAt - PULSE_DELAY) / PULSE_DURATION));
            uniforms.uPulse.value = -0.25 + easeInOut(progress) * 1.6;

            const k = 1 - Math.exp(-delta * 6);
            s.pointer.lerp(s.target, k);
            s.strength += (s.targetStrength - s.strength) * k;
            uniforms.uPointer.value.copy(s.pointer);
            uniforms.uPointerStrength.value = s.strength;

            // Camera lean: slower than the pointer glow, so the field feels heavy.
            s.lean.lerp(s.leanTarget, 1 - Math.exp(-delta * 2.4));
            camera.position.set(base.x + s.lean.x * 0.42, base.y - s.lean.y * 0.2, base.z);
            camera.lookAt(target);

            // Ripple: a ring of light expanding from its origin, fading as it travels. A
            // signal ripple also lights a halo at its origin that blooms quickly and fades.
            let rippling = false;
            if (s.ripple) {
                const { start, gain, duration, reach, halo, signal } = s.ripple;
                const t = (now - start) / duration;
                if (t >= 1) {
                    s.ripple = null;
                    uniforms.uRippleGain.value = 0;
                    uniforms.uHalo.value = 0;
                } else {
                    rippling = true;
                    // The signal travels at a steadier pace (quadratic rather than cubic
                    // ease-out), so the wave is seen crossing the mesh, not just flashing.
                    uniforms.uRipple.value = (signal ? easeOutQuad(t) : easeOut(t)) * reach;
                    uniforms.uRippleGain.value = gain * Math.pow(1 - t, signal ? 1.3 : 1) * Math.min(1, t * 10);
                    uniforms.uHalo.value = halo * Math.min(1, t * 9) * Math.pow(1 - t, 2.4);
                }
            }

            const pulsing = progress < 1;
            const easing =
                rippling ||
                Math.abs(s.targetStrength - s.strength) > 0.004 ||
                s.pointer.distanceToSquared(s.target) > 0.0004 ||
                s.lean.distanceToSquared(s.leanTarget) > 0.00002;

            // Breathing never stops while the hero is visible, so a frame is always asked
            // for; but while only the breath is changing, draws are spaced out to about 24
            // per second. Anything else moving draws at the display's full rate.
            if (pulsing || easing || now - s.drawnAt >= BREATH_FRAME_S) {
                uniforms.uTime.value = now - s.startedAt;
                renderer.render(scene, camera);
                s.drawnAt = now;
            }
            invalidate();
        };

        function invalidate() {
            if (!s.frame) s.frame = requestAnimationFrame(tick);
        }

        const startRipple = (x, z, gain, signal = false) => {
            s.ripple = {
                start: performance.now() / 1000,
                gain,
                duration: signal ? SIGNAL_DURATION : RIPPLE_DURATION,
                reach: signal ? SIGNAL_REACH : RIPPLE_REACH,
                halo: signal ? SIGNAL_HALO : 0,
                signal,
            };
            uniforms.uRippleOrigin.value.set(x, z);
            invalidate();
        };

        resize();
        invalidate();
        wakeRef.current = invalidate;
        sceneRef.current = { setPalette, invalidate };

        const resizeObserver = new ResizeObserver(() => {
            resize();
            renderer.render(scene, camera);
        });
        resizeObserver.observe(host);

        // Pointer: project onto the lattice plane. Listened for on the window because the
        // canvas sits behind the content and never receives pointer events itself.
        const finePointer = window.matchMedia("(pointer: fine)").matches;
        const raycaster = new Raycaster();
        const plane = new Plane(new Vector3(0, 1, 0), 0);
        const ndc = new Vector2();
        const hit = new Vector3();

        const onMove = (event) => {
            if (!activeRef.current) return;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
            raycaster.setFromCamera(ndc, camera);
            if (raycaster.ray.intersectPlane(plane, hit)) {
                s.target.set(hit.x, hit.z);
                s.targetStrength = 1;
            } else {
                s.targetStrength = 0;
            }
            s.leanTarget.set(event.clientX / window.innerWidth - 0.5, event.clientY / window.innerHeight - 0.5);
            invalidate();
        };

        // A click or tap anywhere in the hero sends a ripple out from that point.
        const heroSection = host.closest("section");
        const onDown = (event) => {
            if (!activeRef.current) return;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
            raycaster.setFromCamera(ndc, camera);
            if (raycaster.ray.intersectPlane(plane, hit)) startRipple(hit.x, hit.z, 0.95);
        };
        heroSection?.addEventListener("pointerdown", onDown, { passive: true });

        // The name's glitch: the signal arrives with a point on screen beneath the name,
        // projected onto the lattice plane as the ripple's origin.
        const offSignal = onHeroSignal(({ x, y }) => {
            if (!activeRef.current) return;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            ndc.set(((x - rect.left) / rect.width) * 2 - 1, -(((y - rect.top) / rect.height) * 2 - 1));
            raycaster.setFromCamera(ndc, camera);
            const landed = raycaster.ray.intersectPlane(plane, hit) && Math.abs(hit.x) < 10 && hit.z < 2.4 && hit.z > -9;
            const [ox, oz] = landed ? [hit.x, hit.z] : SIGNAL_FALLBACK;
            startRipple(ox, oz, SIGNAL_GAIN, true);
        });
        const onLeave = () => {
            s.targetStrength = 0;
            invalidate();
        };
        if (finePointer) {
            window.addEventListener("pointermove", onMove, { passive: true });
            document.documentElement.addEventListener("pointerleave", onLeave);
        }

        // Release GPU resources and listeners when the scene unmounts.
        return () => {
            cancelAnimationFrame(s.frame);
            offSignal();
            heroSection?.removeEventListener("pointerdown", onDown);
            sceneRef.current = null;
            resizeObserver.disconnect();
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            wakeRef.current = null;
            dispose();
        };
    }, [activeRef, wakeRef]);

    return <canvas ref={canvasRef} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }} />;
};

export default LatticeScene;