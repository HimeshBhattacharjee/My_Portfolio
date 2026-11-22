import { useMemo, useRef, useState } from "react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useFocusBand } from "../../hooks/useFocusBand";
import Marker from "./Marker";
import EntryDetails from "./EntryDetails";
import { formatRange, sortEntries, TYPE_LABEL } from "./scale";

// The vertical Journey for phones and tablets (below 1024 px). A spine on the left fills as
// you scroll; each year label sticks while its rows pass; every milestone is a row that
// expands in place when tapped. The row crossing the middle of the screen is marked as
// current (its marker lights and its title strengthens), but nothing opens by itself:
// on a narrow screen, content that grew on its own would push the text being read.
const ListView = ({ entries, filter, currently }) => {
    const reduced = useReducedMotion();
    const listRef = useRef(null);
    const [open, setOpen] = useState(() => new Set());
    const [active, register] = useFocusBand({ top: 42, bottom: 50 });
    const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 55%", "end 55%"] });
    const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.6, restDelta: 0.0005 });
    const fill = reduced ? scrollYProgress : smooth;
    const headTop = useTransform(fill, (p) => `${Math.min(1, Math.max(0, p)) * 100}%`);

    const sorted = useMemo(() => sortEntries(entries), [entries]);
    const years = useMemo(() => {
        const groups = [];
        sorted.forEach((entry, index) => {
            const year = (entry.order ?? entry.start).slice(0, 4);
            const group = groups[groups.length - 1];
            if (group && group.year === year) group.items.push({ entry, index });
            else groups.push({ year, items: [{ entry, index }] });
        });
        return groups;
    }, [sorted]);

    const toggle = (id) =>
        setOpen((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <div className="spine" ref={listRef}>
            <span className="spine__rail" aria-hidden="true" />
            <m.span className="spine__fill" aria-hidden="true" style={{ scaleY: fill }} />
            <m.span className="spine__head" aria-hidden="true" style={{ top: headTop }} />
            <ol className="spine__years">
                {years.map((group) => (
                    <li key={group.year} className="spine__year">
                        <h3 className="spine__year-label display">{group.year}</h3>
                        <ol className="spine__entries">
                            {group.items.map(({ entry, index }) => {
                                const expanded = open.has(entry.id);
                                const panelId = `spine-${entry.id}`;
                                const state = active === null ? "ahead" : index === active ? "current" : index < active ? "past" : "ahead";
                                return (
                                    <li
                                        key={entry.id}
                                        ref={register(index)}
                                        className="spine__entry"
                                        data-state={state}
                                        data-open={expanded}
                                        data-dim={!filter(entry)}
                                    >
                                        <Marker type={entry.type} className="spine__marker" />
                                        <button
                                            type="button"
                                            className="spine__toggle"
                                            aria-expanded={expanded}
                                            aria-controls={panelId}
                                            onClick={() => toggle(entry.id)}
                                        >
                                            <span className="label">
                                                {TYPE_LABEL[entry.type]} · {formatRange(entry)}
                                            </span>
                                            <span className="spine__title">{entry.title}</span>
                                            {entry.org && <span className="spine__org">{entry.org}</span>}
                                            <span className="spine__plus" aria-hidden="true" />
                                        </button>
                                        <EntryDetails entry={entry} open={expanded} id={panelId} className="spine__panel" />
                                    </li>
                                );
                            })}
                        </ol>
                    </li>
                ))}
            </ol>
            {currently && (
                <div className="spine__now">
                    <span className="spine__now-node" aria-hidden="true" />
                    <p className="label">Present</p>
                    <p className="spine__now-text">
                        <span className="sr-only">Currently: </span>
                        {currently.text}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ListView;