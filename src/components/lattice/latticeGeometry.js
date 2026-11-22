// Geometry for the Lattice, shared by the WebGL scene and the static SVG fallback.
// Deterministic (seeded), so both renderings show the same structure.

export const CAMERA = {
    position: [0, 3.0, 6.4],
    target: [0, 0.55, -3],
    fov: 36,
};

const COLS = 46;
const ROWS = 26;
const WIDTH = 21;
const NEAR_Z = 2.6;
const FAR_Z = -10.5;
// The pulse starts beneath the portrait and travels outward.
const ORIGIN = [4.6, -3.4];

function mulberry32(seed) {
    let a = seed;
    return function next() {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

let cache = null;

export function buildLattice() {
    if (cache) return cache;

    const rand = mulberry32(11);
    const count = COLS * ROWS;
    const positions = new Float32Array(count * 3);
    const dist = new Float32Array(count);
    const size = new Float32Array(count);
    const cellX = WIDTH / (COLS - 1);
    const cellZ = (NEAR_Z - FAR_Z) / (ROWS - 1);
    let maxDist = 0;

    for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) {
            const i = r * COLS + c;
            const x = (c / (COLS - 1) - 0.5) * WIDTH + (rand() - 0.5) * cellX * 0.66;
            const z = NEAR_Z - r * cellZ + (rand() - 0.5) * cellZ * 0.66;
            const y =
                Math.sin(x * 0.42 + 0.8) * Math.cos(z * 0.5) * 0.4 + (rand() - 0.5) * 0.14;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            const d = Math.hypot(x - ORIGIN[0], z - ORIGIN[1]);
            dist[i] = d;
            if (d > maxDist) maxDist = d;
            const s = rand();
            size[i] = 0.55 + s * s * 1.7;
        }
    }

    for (let i = 0; i < count; i += 1) dist[i] /= maxDist;

    // Irregular connections: most neighbours, a few diagonals, some gaps.
    const edges = [];
    for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) {
            const i = r * COLS + c;
            if (c < COLS - 1 && rand() < 0.74) edges.push(i, i + 1);
            if (r < ROWS - 1 && rand() < 0.74) edges.push(i, i + COLS);
            if (c < COLS - 1 && r < ROWS - 1 && rand() < 0.13) edges.push(i, i + COLS + 1);
        }
    }

    cache = { count, positions, dist, size, edges: new Uint16Array(edges) };
    return cache;
}

// Simple perspective projection matching the scene camera, for the SVG fallback.
export function projectLattice(viewWidth, viewHeight) {
    const { count, positions, size, edges } = buildLattice();
    const [ex, ey, ez] = CAMERA.position;
    const [tx, ty, tz] = CAMERA.target;

    let fx = tx - ex;
    let fy = ty - ey;
    let fz = tz - ez;
    const fl = Math.hypot(fx, fy, fz);
    fx /= fl;
    fy /= fl;
    fz /= fl;
    // right = forward x up(0,1,0)
    let rx = -fz;
    let rz = fx;
    const rl = Math.hypot(rx, rz);
    rx /= rl;
    rz /= rl;
    // up = right x forward
    const ux = -rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy;

    const tan = Math.tan((CAMERA.fov * Math.PI) / 360);
    const aspect = viewWidth / viewHeight;
    const points = new Array(count);

    for (let i = 0; i < count; i += 1) {
        const vx = positions[i * 3] - ex;
        const vy = positions[i * 3 + 1] - ey;
        const vz = positions[i * 3 + 2] - ez;
        const depth = vx * fx + vy * fy + vz * fz;
        const px = (vx * rx + vz * rz) / (depth * tan * aspect);
        const py = (vx * ux + vy * uy + vz * uz) / (depth * tan);
        const fade = Math.min(1, Math.max(0, (17 - depth) / 11));
        points[i] = {
            x: (px * 0.5 + 0.5) * viewWidth,
            y: (0.5 - py * 0.5) * viewHeight,
            r: Math.max(0.5, (size[i] * 7.5) / depth),
            fade,
            visible: depth > 0.4,
        };
    }

    const lines = [];
    for (let e = 0; e < edges.length; e += 2) {
        const a = points[edges[e]];
        const b = points[edges[e + 1]];
        if (a.visible && b.visible) lines.push({ a, b, fade: Math.min(a.fade, b.fade) });
    }

    return { points: points.filter((p) => p.visible), lines };
}