import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useFocusBand } from "../../hooks/useFocusBand";
import Marker from "./Marker";
import EntryDetails from "./EntryDetails";
import { computeSpans, formatRange, sortEntries, TYPE_LABEL } from "./scale";

// The desktop Journey (1024 px and wider): a central spine with milestones alternating
// left and right, in the structure of the original academic timeline.
//
// Scroll drives it, but never moves it: the page scrolls normally and nothing listens to
// the wheel. A thin focus band across the middle of the viewport (see useFocusBand) decides
// which milestone is current. That card expands, its node lights and its connector draws;
// cards already passed contract and step back; cards still ahead wait, compact.
//
// No reflow: every row reserves the height of its fully expanded card (measured), and the
// card is centred on its node, so it grows up and down inside its own row. Expanding or
// contracting a card never moves anything else on the page, and so never moves the focus
// band onto a different row, which is what keeps the interaction free of jitter.
//
// Manual control: the card heading is a button. It pins a card open (or closes the current
// one). A card being pointed at or containing keyboard focus never collapses underneath
// the visitor.

const FILL_SPRING = { stiffness: 140, damping: 30, mass: 0.6, restDelta: 0.0005 };

function useRowHeight(headRef, bodyRef) {
    const [height, setHeight] = useState(null);
    useLayoutEffect(() => {
        const head = headRef.current;
        const body = bodyRef.current;
        if (!head || !body) return undefined;
        const measure = () => {
            const next = Math.ceil(head.offsetHeight + body.offsetHeight);
            setHeight((current) => (current === next ? current : next));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(head);
        observer.observe(body);
        return () => observer.disconnect();
    }, [headRef, bodyRef]);
    return height;
}

function Row({ entry, index, side, state, open, pinned, dim, register, onToggle, onHold }) {
    const headRef = useRef(null);
    const bodyRef = useRef(null);
    const contentHeight = useRowHeight(headRef, bodyRef);
    const panelId = `tl-${entry.id}`;
    const year = (entry.order ?? entry.start).slice(0, 4);

    return (
        <li
            ref={register(index)}
            className="tl__row"
            data-side={side}
            data-state={state}
            data-open={open}
            data-dim={dim}
            style={contentHeight ? { "--content-h": `${contentHeight}px` } : undefined}
        >
            <div className="tl__aside" aria-hidden="true">
                <span className="tl__year display">{year}</span>
                <span className="label tl__period">{formatRange(entry)}</span>
            </div>

            <span className="tl__node" aria-hidden="true">
                <span className="tl__halo" />
                <Marker type={entry.type} size={14} className="tl__marker" />
            </span>
            <span className="tl__connector" aria-hidden="true" />

            <article
                className="tl__card"
                aria-labelledby={`${panelId}-title`}
                onPointerEnter={() => onHold(index, true)}
                onPointerLeave={() => onHold(index, false)}
                onFocus={() => onHold(index, true)}
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) onHold(index, false);
                }}
            >
                <span className="tl__card-light" aria-hidden="true" />
                <button
                    ref={headRef}
                    type="button"
                    className="tl__head"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => onToggle(index)}
                >
                    <span className="label tl__meta">
                        <Marker type={entry.type} size={10} />
                        {TYPE_LABEL[entry.type]}
                        <span aria-hidden="true">·</span>
                        <span>{formatRange(entry)}</span>
                    </span>
                    <span id={`${panelId}-title`} className="tl__title">
                        {entry.title}
                    </span>
                    {entry.org && <span className="tl__org">{entry.org}</span>}
                    <span className="tl__toggle label" aria-hidden="true">
                        <span className="tl__plus" />
                        {pinned ? "Pinned" : open ? "Close" : "Open"}
                    </span>
                </button>
                <EntryDetails entry={entry} open={open} id={panelId} className="tl__details" measureRef={bodyRef} />
            </article>
        </li>
    );
}

const SpineView = ({ entries, filter, currently }) => {
    const reduced = useReducedMotion();
    const listRef = useRef(null);
    const spineRef = useRef(null);
    const sorted = useMemo(() => sortEntries(entries), [entries]);
    const spans = useMemo(() => computeSpans(sorted), [sorted]);
    const [active, register] = useFocusBand();

    // Manual state. pinned: opened by the visitor. held: being pointed at or focused when the
    // focus moved on, so it stays open until the visitor leaves it. dismissed: the current
    // card, closed by the visitor (until the focus moves to another card).
    const [pinned, setPinned] = useState(() => new Set());
    const [held, setHeld] = useState(() => new Set());
    const [dismissed, setDismissed] = useState(null);
    const hovering = useRef(new Set());
    const [lastActive, setLastActive] = useState(active);

    // Focus moved: forget a dismissal, and keep the old card open while it is in use.
    if (active !== lastActive) {
        setLastActive(active);
        setDismissed(null);
        if (lastActive !== null && hovering.current.has(lastActive)) {
            setHeld((current) => new Set(current).add(lastActive));
        }
    }

    const isOpen = (index) => pinned.has(index) || held.has(index) || (index === active && dismissed !== index);

    const onToggle = (index) => {
        if (isOpen(index)) {
            setPinned((current) => {
                const next = new Set(current);
                next.delete(index);
                return next;
            });
            setHeld((current) => {
                const next = new Set(current);
                next.delete(index);
                return next;
            });
            if (index === active) setDismissed(index);
        } else {
            setPinned((current) => new Set(current).add(index));
            if (dismissed === index) setDismissed(null);
        }
    };

    const onHold = useCallback((index, on) => {
        if (on) {
            hovering.current.add(index);
            return;
        }
        hovering.current.delete(index);
        setHeld((current) => {
            if (!current.has(index)) return current;
            const next = new Set(current);
            next.delete(index);
            return next;
        });
    }, []);

    // Row geometry for the overlap spans and the travelling light.
    const [centres, setCentres] = useState([]);
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list) return undefined;
        const measure = () => {
            const rows = [...list.querySelectorAll(":scope > .tl__list > .tl__row, :scope > .tl__now")];
            setCentres(rows.map((row) => row.offsetTop + row.offsetHeight / 2));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        return () => observer.disconnect();
    }, [sorted.length]);

    // The lit part of the spine follows the scroll position, with a light spring so wheel
    // steps read as one continuous movement.
    // Measured against the spine itself, so its point of light sits exactly on the focus band.
    const { scrollYProgress } = useScroll({ target: spineRef, offset: ["start 50%", "end 50%"] });
    const smooth = useSpring(scrollYProgress, FILL_SPRING);
    const fill = reduced ? scrollYProgress : smooth;
    const headTop = useTransform(fill, (p) => `${Math.min(1, Math.max(0, p)) * 100}%`);

    const stateOf = (index) => {
        if (active === null) return "ahead";
        if (index === active) return "current";
        return index < active ? "past" : "ahead";
    };

    const glowY = active !== null && centres[active] !== undefined ? centres[active] : null;

    return (
        <div ref={listRef} className="tl" data-started={active !== null}>
            <span className="tl__grid tech-grid" aria-hidden="true" />
            <span
                className="tl__glow"
                aria-hidden="true"
                style={glowY !== null ? { transform: `translate3d(-50%, ${glowY}px, 0)`, opacity: 1 } : undefined}
            />

            <div ref={spineRef} className="tl__spine" aria-hidden="true">
                <span className="tl__rail" />
                <m.span className="tl__fill" style={{ scaleY: fill }} />
                <m.span className="tl__head-light" style={{ top: headTop }} />
            </div>

            {/* Periods that run alongside later milestones (B.Tech, overlapping projects,
                the current role). Decorative: every card states its own dates. */}
            {centres.length > 0 &&
                spans.map((span) => {
                    const top = centres[span.from];
                    const bottom = centres[span.to];
                    if (top === undefined || bottom === undefined) return null;
                    const lit = active !== null && active >= span.from && active <= span.to;
                    return (
                        <span
                            key={span.id}
                            className="tl__span"
                            aria-hidden="true"
                            data-lit={lit}
                            data-dim={!filter(sorted[span.from])}
                            style={{ top, height: bottom - top, "--lane": span.lane }}
                        />
                    );
                })}

            <ol className="tl__list" aria-label="Milestones, in chronological order">
                {sorted.map((entry, index) => (
                    <Row
                        key={entry.id}
                        entry={entry}
                        index={index}
                        side={index % 2 === 0 ? "left" : "right"}
                        state={stateOf(index)}
                        open={isOpen(index)}
                        pinned={pinned.has(index)}
                        dim={!filter(entry)}
                        register={register}
                        onToggle={onToggle}
                        onHold={onHold}
                    />
                ))}
            </ol>

            {currently && (
                <div className="tl__now" data-lit={active === sorted.length - 1}>
                    <span className="tl__now-node" aria-hidden="true" />
                    <p className="label tl__now-label">Present</p>
                    <p className="tl__now-text">
                        <span className="sr-only">Currently: </span>
                        {currently.text}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SpineView;