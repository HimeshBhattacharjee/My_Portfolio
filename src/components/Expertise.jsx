import { useMemo, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { expertise } from "../data";
import { EASE, reveal } from "../utils/motion";
import SectionHeader from "./ui/SectionHeader";
import FocusText from "./ui/FocusText";

const VIEW_W = 1200;
const VIEW_H = 360;

// A deterministic scatter for the background field, so it never changes between renders.
function field(count, seed) {
    let value = seed;
    const next = () => {
        value = (value * 16807) % 2147483647;
        return value / 2147483647;
    };
    return Array.from({ length: count }, () => ({ x: next() * VIEW_W, y: next() * VIEW_H, r: 0.6 + next() * 1.2 }));
}
const FIELD = [field(26, 7), field(18, 23), field(12, 91)];

// The constellation, derived entirely from the data: one hub per group along a gentle arc,
// its capabilities around it, one small satellite per listed tool, and a fine link between
// any two capabilities evidenced by the same piece of work. No levels or percentages.
function layoutGraph(groups) {
    const step = VIEW_W / groups.length;
    const nodes = [];
    const hubs = groups.map((group, g) => {
        const hub = { x: step * g + step / 2, y: VIEW_H / 2 + Math.sin((g / (groups.length - 1)) * Math.PI) * -26 + (g % 2 ? 22 : -22) };
        const count = group.rows.length;
        const members = group.rows.map((row, r) => {
            const angle = -Math.PI / 2 + ((r + 0.5) / count - 0.5) * Math.PI * 1.35 + (g % 2 ? Math.PI : 0);
            const node = {
                id: row.capability,
                group: group.id,
                x: hub.x + Math.cos(angle) * 118,
                y: hub.y + Math.sin(angle) * 84,
                tools: row.tools.length,
                evidence: row.evidence.map((item) => item.label),
                labelBelow: Math.sin(angle) > 0,
            };
            nodes.push(node);
            return node;
        });
        return { id: group.id, label: group.group, ...hub, members };
    });
    const links = [];
    for (let a = 0; a < nodes.length; a += 1) {
        for (let b = a + 1; b < nodes.length; b += 1) {
            if (nodes[a].group === nodes[b].group) continue;
            const shared = nodes[a].evidence.find((label) => label !== "This site" && nodes[b].evidence.includes(label));
            if (shared) links.push({ a: nodes[a], b: nodes[b], via: shared });
        }
    }
    return { hubs, nodes, links };
}

// The graph is a picture of the table beneath it, so it is hidden from assistive technology;
// the table carries the same information and drives the same highlights by keyboard.
function Graph({ active, onActive }) {
    const reduced = useReducedMotion();
    const ref = useRef(null);
    const graph = useMemo(() => layoutGraph(expertise), []);
    const activeNode = graph.nodes.find((node) => node.id === active);
    const activeGroup = active?.startsWith("group:") ? active.slice(6) : activeNode?.group;
    const isLinked = (node) => activeNode && graph.links.some((link) => (link.a === activeNode && link.b === node) || (link.b === activeNode && link.a === node));

    const draw = (delay) =>
        reduced
            ? { initial: false }
            : {
                initial: { pathLength: 0, opacity: 0 },
                whileInView: { pathLength: 1, opacity: 1 },
                viewport: { once: false, amount: 0.35 },
                transition: { pathLength: { duration: 1, ease: EASE, delay }, opacity: { duration: 0.01, delay } },
            };

    // Pointer parallax for the background field: three layers, three depths.
    const onMove = (event) => {
        const element = ref.current;
        if (!element || reduced) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--px", ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
        element.style.setProperty("--py", ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
    };

    return (
        <div className="graph-wrap" ref={ref} onPointerMove={onMove} onPointerLeave={() => onActive(null)}>
            <svg className="graph" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" focusable="false" data-active={Boolean(active)}>
                {FIELD.map((layer, depth) => (
                    <g key={depth} className="graph__field" style={{ "--depth": depth + 1 }}>
                        {layer.map((star, index) => (
                            <circle key={index} cx={star.x} cy={star.y} r={star.r} />
                        ))}
                    </g>
                ))}

                <m.path
                    className="graph__spine"
                    d={`M0 ${VIEW_H / 2} ${graph.hubs.map((hub) => `L${hub.x} ${hub.y}`).join(" ")} L${VIEW_W} ${VIEW_H / 2}`}
                    {...draw(0)}
                />

                {graph.links.map((link, index) => (
                    <m.path
                        key={`${link.a.id}-${link.b.id}`}
                        className="graph__link"
                        data-lit={activeNode === link.a || activeNode === link.b}
                        d={`M${link.a.x} ${link.a.y} Q ${(link.a.x + link.b.x) / 2} ${Math.min(link.a.y, link.b.y) - 60} ${link.b.x} ${link.b.y}`}
                        {...draw(0.9 + index * 0.05)}
                    />
                ))}

                {graph.hubs.map((hub, g) => (
                    <g key={hub.id} className="graph__group" data-lit={activeGroup === hub.id}>
                        {hub.members.map((node, n) => (
                            <m.path
                                key={node.id}
                                className="graph__edge"
                                data-lit={node.id === active || activeGroup === hub.id}
                                d={`M${hub.x} ${hub.y} L${node.x} ${node.y}`}
                                {...draw(0.35 + g * 0.12 + n * 0.05)}
                            />
                        ))}
                        {hub.members.map((node) => (
                            <g
                                key={node.id}
                                className="graph__node-group"
                                data-lit={node.id === active}
                                data-linked={Boolean(isLinked(node))}
                                onPointerEnter={() => onActive(node.id)}
                                onClick={() => onActive(node.id === active ? null : node.id)}
                            >
                                <g className="graph__orbit" style={{ transformOrigin: `${node.x}px ${node.y}px`, "--spin": `${18 + node.tools * 4}s` }}>
                                    {Array.from({ length: node.tools }, (_, t) => {
                                        const angle = (t / node.tools) * Math.PI * 2;
                                        return <circle key={t} className="graph__tool" cx={node.x + Math.cos(angle) * 13} cy={node.y + Math.sin(angle) * 13} r="1.6" />;
                                    })}
                                </g>
                                <circle className="graph__hit" cx={node.x} cy={node.y} r="22" />
                                <circle className="graph__node" cx={node.x} cy={node.y} r="4.5" />
                                <text className="graph__cap" x={node.x} y={node.labelBelow ? node.y + 34 : node.y - 26} textAnchor="middle">
                                    {node.id}
                                </text>
                            </g>
                        ))}
                        <g className="graph__hub-group" onPointerEnter={() => onActive(`group:${hub.id}`)}>
                            <circle className="graph__hit" cx={hub.x} cy={hub.y} r="20" />
                            <rect className="graph__hub" x={hub.x - 7} y={hub.y - 7} width="14" height="14" />
                            <text className="graph__label" x={hub.x + 16} y={hub.y + 4}>
                                {String(g + 1).padStart(2, "0")}
                            </text>
                            <text className="graph__group-name" x={hub.x} y={hub.y + (g % 2 ? -22 : 30)} textAnchor="middle">
                                {hub.label}
                            </text>
                        </g>
                    </g>
                ))}
            </svg>
            <p className="label graph__key" aria-hidden="true">
                <span className="graph__key-hub" /> Area <span className="graph__key-node" /> Capability <span className="graph__key-tool" /> One dot per
                tool <span className="graph__key-link" /> Shared evidence
            </p>
        </div>
    );
}

// 04 · Expertise. A specification table grouped by problem, under a constellation drawn from
// it. Every row cites the work on this page that evidences it; capabilities without
// evidence are simply not listed.
const Expertise = () => {
    const [active, setActive] = useState(null);
    const activeGroup = active?.startsWith("group:") ? active.slice(6) : null;

    return (
        <section id="expertise" className="section expertise" aria-labelledby="expertise-title">
            <span className="expertise__depth" aria-hidden="true" />
            <div className="shell">
                <SectionHeader
                    id="expertise-title"
                    label="04 · Expertise"
                    title="What I work with"
                    standfirst="Grouped by the problem it solves. Each line points to the work that proves it."
                />
                <Graph active={active} onActive={setActive} />
                <div className="spec">
                    <div className="spec__head label" aria-hidden="true">
                        <span>Capability</span>
                        <span>Tools and methods</span>
                        <span>Evidence</span>
                    </div>
                    {expertise.map((group, groupIndex) => (
                        <FocusText
                            as={m.section}
                            key={group.id}
                            className="spec__group"
                            aria-labelledby={`spec-${group.id}`}
                            data-lit={activeGroup === group.id}
                            variants={reveal}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: false, amount: 0.3 }}
                        >
                            <h3 id={`spec-${group.id}`} className="spec__group-title">
                                <span className="label">{String(groupIndex + 1).padStart(2, "0")}</span>
                                {group.group}
                            </h3>
                            <ul className="spec__rows">
                                {group.rows.map((row) => (
                                    <li
                                        key={row.capability}
                                        className="spec__row"
                                        data-lit={active === row.capability}
                                        onPointerEnter={() => setActive(row.capability)}
                                        onPointerLeave={() => setActive(null)}
                                        onFocus={() => setActive(row.capability)}
                                        onBlur={() => setActive(null)}
                                    >
                                        <span className="spec__cap">{row.capability}</span>
                                        <span className="spec__tools">
                                            <span className="sr-only">Tools: </span>
                                            {row.tools.join(" · ")}
                                        </span>
                                        <span className="spec__evidence">
                                            <span className="sr-only">Evidence: </span>
                                            {row.evidence.map((item, index) => (
                                                <span key={item.label}>
                                                    {index > 0 && <span aria-hidden="true">, </span>}
                                                    <a href={item.href}>{item.label}</a>
                                                </span>
                                            ))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </FocusText>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Expertise;