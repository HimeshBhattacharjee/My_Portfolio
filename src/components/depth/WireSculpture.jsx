import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { icosphere, octahedron, ring } from "./wireGeometry";

// Wireframe sculptures for the sections that follow the hero. Real 3D geometry, projected
// with perspective into SVG every frame: no second WebGL context (the Lattice keeps the only
// one), crisp lines at any size, and colours that come straight from the theme tokens.
//
// Cost: a few hundred vertex projections and two path strings per frame. Frames run only
// while the sculpture is on screen and the tab is visible; with reduced motion one static
// frame is drawn and nothing else. The pointer leans the sculpture a little (fine pointers
// only), eased so it moves like something with weight.
//
// Depth reads through two paths per layer: edges facing the viewer are drawn brighter than
// edges behind, and satellites are scaled and dimmed with distance.

const VARIANTS = {
    // Contact: a geodesic sphere inside three orbital rings, satellites tethered to it.
    contact: {
        build() {
            const sphere = icosphere(1);
            return {
                mesh: sphere,
                rings: [ring(1.5, 1.2, 0.35), ring(1.85, 1.38, -0.5, 96), ring(1.28, 0.25, 1.1)],
                satellites: [
                    { ring: 0, speed: 0.22, phase: 0 },
                    { ring: 0, speed: 0.22, phase: Math.PI },
                    { ring: 1, speed: -0.14, phase: 1.2 },
                    { ring: 1, speed: -0.14, phase: 3.9 },
                    { ring: 2, speed: 0.3, phase: 2.2 },
                ],
            };
        },
        satellites: 5,
        spin: 0.07,
        pitch: 0.42,
        lean: { x: 0.45, y: 0.22 },
        focal: 3.6,
        scale: 0.42,
    },
    // About: an orbital structure around a small core; quieter, slower.
    about: {
        build() {
            return {
                mesh: octahedron(0.34),
                rings: [ring(1.1, 1.25, 0.2), ring(1.55, 1.05, -0.65, 96), ring(1.9, 1.45, 0.9, 110)],
                satellites: [
                    { ring: 0, speed: 0.16, phase: 0.5 },
                    { ring: 1, speed: -0.1, phase: 2.4 },
                    { ring: 2, speed: 0.07, phase: 4.1 },
                ],
            };
        },
        satellites: 3,
        spin: 0.045,
        pitch: 0.3,
        lean: { x: 0.3, y: 0.15 },
        focal: 4.2,
        scale: 0.42,
    },
};

function rotate([x, y, z], yaw, pitch) {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
}

const WireSculpture = ({ variant = "contact", className = "", hostRef }) => {
    const reduced = useReducedMotion();
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return undefined;
        const config = VARIANTS[variant];
        const shape = config.build();
        const [meshBack, meshFront, ringBack, ringFront, tethers] = svg.querySelectorAll("path");
        const dots = [...svg.querySelectorAll("circle")];
        const lean = { x: 0, y: 0, tx: 0, ty: 0 };
        let frame = 0;
        let last = 0;
        let time = 0;
        let visible = false;

        const project = (point, yaw, pitch) => {
            const [x, y, z] = rotate(point, yaw, pitch);
            const s = config.focal / (config.focal - z);
            return [x * s * config.scale, -y * s * config.scale, z, s];
        };
        const fmt = (n) => n.toFixed(4);

        const render = () => {
            const yaw = time * config.spin + lean.x * config.lean.x;
            const pitch = config.pitch + lean.y * config.lean.y;

            const verts = shape.mesh.vertices.map((v) => project(v, yaw, pitch));
            let back = "";
            let front = "";
            for (const [a, b] of shape.mesh.edges) {
                const p = verts[a];
                const q = verts[b];
                const segment = `M${fmt(p[0])} ${fmt(p[1])}L${fmt(q[0])} ${fmt(q[1])}`;
                if (p[2] + q[2] > 0) front += segment;
                else back += segment;
            }
            meshBack.setAttribute("d", back);
            meshFront.setAttribute("d", front);

            let rBack = "";
            let rFront = "";
            const ringPoints = shape.rings.map((points) => points.map((point) => project(point, yaw, pitch)));
            for (const points of ringPoints) {
                for (let i = 0; i < points.length; i += 1) {
                    const p = points[i];
                    const q = points[(i + 1) % points.length];
                    const segment = `M${fmt(p[0])} ${fmt(p[1])}L${fmt(q[0])} ${fmt(q[1])}`;
                    if (p[2] + q[2] > 0) rFront += segment;
                    else rBack += segment;
                }
            }
            ringBack.setAttribute("d", rBack);
            ringFront.setAttribute("d", rFront);

            // Satellites ride their rings; each is tethered to the nearest point of the core.
            let tetherPath = "";
            shape.satellites.forEach((satellite, index) => {
                const points = shape.rings[satellite.ring];
                const position = (((time * satellite.speed + satellite.phase) / (Math.PI * 2)) % 1 + 1) % 1;
                const raw = points[Math.floor(position * points.length) % points.length];
                const p = project(raw, yaw, pitch);
                let nearest = verts[0];
                let best = Infinity;
                for (const v of verts) {
                    const d = (v[0] - p[0]) ** 2 + (v[1] - p[1]) ** 2 + (v[2] - p[2]) ** 2;
                    if (d < best) {
                        best = d;
                        nearest = v;
                    }
                }
                tetherPath += `M${fmt(p[0])} ${fmt(p[1])}L${fmt(nearest[0])} ${fmt(nearest[1])}`;
                const dot = dots[index];
                dot.setAttribute("cx", fmt(p[0]));
                dot.setAttribute("cy", fmt(p[1]));
                dot.setAttribute("r", fmt(0.018 * p[3]));
                dot.style.opacity = String(p[2] > 0 ? 1 : 0.4);
            });
            tethers.setAttribute("d", tetherPath);
        };

        const tick = (now) => {
            frame = 0;
            const delta = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
            last = now;
            time += delta;
            const k = 1 - Math.exp(-delta * 2.2);
            lean.x += (lean.tx - lean.x) * k;
            lean.y += (lean.ty - lean.y) * k;
            render();
            if (visible && document.visibilityState === "visible") frame = requestAnimationFrame(tick);
            else last = 0;
        };

        const start = () => {
            if (!frame && !reduced) frame = requestAnimationFrame(tick);
        };

        time = 8; // A composed starting pose rather than the axis-aligned one.
        render();
        if (reduced) return undefined;

        const io = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                if (visible) start();
            },
            { rootMargin: "80px 0px" },
        );
        io.observe(svg);
        const onVisibility = () => {
            if (document.visibilityState === "visible" && visible) start();
        };
        document.addEventListener("visibilitychange", onVisibility);

        const host = hostRef?.current ?? svg.parentElement;
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const onMove = (event) => {
            const rect = host.getBoundingClientRect();
            lean.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            lean.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        const onLeave = () => {
            lean.tx = 0;
            lean.ty = 0;
        };
        if (fine && host) {
            host.addEventListener("pointermove", onMove, { passive: true });
            host.addEventListener("pointerleave", onLeave);
        }

        return () => {
            cancelAnimationFrame(frame);
            io.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            if (fine && host) {
                host.removeEventListener("pointermove", onMove);
                host.removeEventListener("pointerleave", onLeave);
            }
        };
    }, [variant, reduced, hostRef]);

    const satellites = VARIANTS[variant].satellites;

    return (
        <svg ref={svgRef} className={`wire wire--${variant} ${className}`} viewBox="-1 -1 2 2" aria-hidden="true" focusable="false">
            <path className="wire__mesh wire__mesh--back" />
            <path className="wire__mesh wire__mesh--front" />
            <path className="wire__ring wire__ring--back" />
            <path className="wire__ring wire__ring--front" />
            <path className="wire__tether" />
            {Array.from({ length: satellites }, (_, index) => (
                <circle key={index} className="wire__dot" r="0.018" />
            ))}
        </svg>
    );
};

export default WireSculpture;