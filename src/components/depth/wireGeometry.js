// Geometry for the wireframe sculptures (see WireSculpture.jsx). Plain arrays, built once.
// Everything lives in a unit space centred on the origin; the component projects it.

// Icosphere: an icosahedron subdivided once (42 vertices, 120 edges), on the unit sphere.
export function icosphere(subdivisions = 1) {
    const t = (1 + Math.sqrt(5)) / 2;
    let vertices = [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map(normalise);
    let faces = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];
    for (let s = 0; s < subdivisions; s += 1) {
        const cache = new Map();
        const midpoint = (a, b) => {
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (!cache.has(key)) {
                const [ax, ay, az] = vertices[a];
                const [bx, by, bz] = vertices[b];
                vertices.push(normalise([(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2]));
                cache.set(key, vertices.length - 1);
            }
            return cache.get(key);
        };
        faces = faces.flatMap(([a, b, c]) => {
            const ab = midpoint(a, b);
            const bc = midpoint(b, c);
            const ca = midpoint(c, a);
            return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
        });
    }
    const edges = new Set();
    for (const [a, b, c] of faces) {
        for (const [p, q] of [[a, b], [b, c], [c, a]]) edges.add(p < q ? `${p}-${q}` : `${q}-${p}`);
    }
    return { vertices, edges: [...edges].map((key) => key.split("-").map(Number)) };
}

// Octahedron: the small core of the About orbit.
export function octahedron(radius = 1) {
    const vertices = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map(([x, y, z]) => [x * radius, y * radius, z * radius]);
    const edges = [];
    for (let a = 0; a < 6; a += 1) {
        for (let b = a + 1; b < 6; b += 1) {
            if (Math.floor(a / 2) !== Math.floor(b / 2)) edges.push([a, b]);
        }
    }
    return { vertices, edges };
}

// A circle of `segments` points, tilted about the x axis then the z axis.
export function ring(radius, tiltX, tiltZ, segments = 72) {
    const points = [];
    for (let i = 0; i < segments; i += 1) {
        const a = (i / segments) * Math.PI * 2;
        points.push(tilt([Math.cos(a) * radius, 0, Math.sin(a) * radius], tiltX, tiltZ));
    }
    return points;
}

export function tilt([x, y, z], tiltX, tiltZ) {
    const cx = Math.cos(tiltX);
    const sx = Math.sin(tiltX);
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const cz = Math.cos(tiltZ);
    const sz = Math.sin(tiltZ);
    return [x * cz - y1 * sz, x * sz + y1 * cz, z1];
}

function normalise([x, y, z]) {
    const length = Math.hypot(x, y, z);
    return [x / length, y / length, z / length];
}