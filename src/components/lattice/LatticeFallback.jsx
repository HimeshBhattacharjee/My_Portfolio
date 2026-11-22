import { useMemo } from "react";
import { projectLattice } from "./latticeGeometry";

const VIEW_W = 1600;
const VIEW_H = 1000;
// Depth fade is quantised into this many opacity steps. Each step is one <path> per layer,
// so the whole drawing is a few dozen DOM nodes instead of one element per point and line.
const STEPS = 8;

const round = (n) => Math.round(n * 10) / 10;

// A full circle as two arcs.
const circle = (x, y, r) => {
    const rr = round(r);
    return `M${round(x - rr)} ${round(y)}a${rr} ${rr} 0 1 0 ${round(rr * 2)} 0a${rr} ${rr} 0 1 0 ${-round(rr * 2)} 0`;
};

function batch(points, lines) {
    const step = (fade) => Math.min(STEPS - 1, Math.round(fade * (STEPS - 1)));
    const groups = () => Array.from({ length: STEPS }, () => []);
    const lineGroups = groups();
    const nodeGroups = groups();
    const haloGroups = groups();
    const innerHaloGroups = groups();
    const centreGroups = groups();

    for (const { a, b, fade } of lines) {
        if (fade <= 0) continue;
        lineGroups[step(fade)].push(`M${round(a.x)} ${round(a.y)}L${round(b.x)} ${round(b.y)}`);
    }
    for (const { x, y, r, fade } of points) {
        if (fade <= 0) continue;
        const s = step(fade);
        // Two concentric halo layers, so the light falls off in steps rather than ending
        // at a hard disc edge.
        haloGroups[s].push(circle(x, y, r * 3.6 + 2));
        innerHaloGroups[s].push(circle(x, y, r * 2.1 + 1.2));
        nodeGroups[s].push(circle(x, y, r * 1.15 + 0.6));
        centreGroups[s].push(circle(x, y, Math.max(0.6, r * 0.5)));
    }

    // Opacity rises with nearness; the farthest step is kept faintly visible.
    const toPaths = (parts, max) =>
        parts
            .map((d, i) => ({ d: d.join(""), opacity: max * (0.12 + (0.88 * i) / (STEPS - 1)) }))
            .filter((group) => group.d);

    return {
        lines: toPaths(lineGroups, 1),
        halos: toPaths(haloGroups, 0.55),
        innerHalos: toPaths(innerHaloGroups, 0.75),
        nodes: toPaths(nodeGroups, 1),
        centres: toPaths(centreGroups, 1),
    };
}

// Static rendering of the Lattice. Shown first on every visit, and kept as the only
// rendering when motion is reduced or WebGL is unavailable, so it carries the same
// luminous identity as the scene without any animation: each connection is a soft wide
// stroke of halo light under a bright filament, and each node a soft halo, a lit body and
// a hot centre. Layered strokes and fills only (no SVG filters), so it costs one paint.
// Colours and strengths come from the --lattice-* tokens, which each theme sets.
const LatticeFallback = ({ hidden = false }) => {
    const { lines, halos, innerHalos, nodes, centres } = useMemo(() => {
        const projected = projectLattice(VIEW_W, VIEW_H);
        return batch(projected.points, projected.lines);
    }, []);

    const fixed = (n) => n.toFixed(3);

    return (
        <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
            style={{
                opacity: hidden ? 0 : 1,
                transition: "opacity 900ms cubic-bezier(0.2, 0.7, 0.2, 1)",
            }}
        >
            {/* Halo light around each connection. */}
            <g fill="none" strokeLinecap="round" style={{ stroke: "var(--lattice-halo)", opacity: "var(--lattice-line-halo)" }}>
                {lines.map((group) => (
                    <path
                        key={group.opacity}
                        d={group.d}
                        strokeWidth="6"
                        vectorEffect="non-scaling-stroke"
                        strokeOpacity={fixed(group.opacity)}
                    />
                ))}
            </g>
            {/* The filaments themselves. */}
            <g fill="none" strokeLinecap="round" style={{ stroke: "var(--lattice-glow)", opacity: "var(--lattice-line)" }}>
                {lines.map((group) => (
                    <path
                        key={group.opacity}
                        d={group.d}
                        strokeWidth="1.4"
                        vectorEffect="non-scaling-stroke"
                        strokeOpacity={fixed(group.opacity)}
                    />
                ))}
            </g>
            <g style={{ fill: "var(--lattice-halo)", opacity: "var(--lattice-node-halo)" }}>
                {halos.map((group) => (
                    <path key={group.opacity} d={group.d} fillOpacity={fixed(group.opacity)} />
                ))}
                {innerHalos.map((group) => (
                    <path key={`inner-${group.opacity}`} d={group.d} fillOpacity={fixed(group.opacity)} />
                ))}
            </g>
            <g style={{ fill: "var(--lattice-glow)" }}>
                {nodes.map((group) => (
                    <path key={group.opacity} d={group.d} fillOpacity={fixed(Math.min(1, group.opacity * 1.1))} />
                ))}
            </g>
            <g style={{ fill: "var(--lattice-core)" }}>
                {centres.map((group) => (
                    <path key={group.opacity} d={group.d} fillOpacity={fixed(group.opacity)} />
                ))}
            </g>
        </svg>
    );
};

export default LatticeFallback;