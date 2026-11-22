import { useRef } from "react";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "../ui/Icons";
import { EXPAND, useInert } from "./expand";
import FocusText from "../ui/FocusText";

export function EntryLinks({ entry }) {
    return (
        <>
            {entry.projectId && (
                <a href={`#work/${entry.projectId}`} className="textlink">
                    Open the project <ArrowRight width={14} height={14} />
                </a>
            )}
            {(entry.links ?? []).map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="textlink">
                    {link.label} <ArrowUpRight width={14} height={14} />
                    <span className="sr-only">(opens in a new tab)</span>
                </a>
            ))}
        </>
    );
}

// The expandable part of a milestone: summary, contributions, tools and links. Shared by the
// desktop card and the phone row. `measureRef` lets the desktop card reserve its full height.
const EntryDetails = ({ entry, open, id, className = "", measureRef }) => {
    const reduced = useReducedMotion();
    const ref = useRef(null);
    useInert(ref, !open);
    const transition = reduced ? { duration: 0 } : EXPAND;

    return (
        <m.div
            ref={ref}
            id={id}
            className={`entry-details ${className}`}
            initial={false}
            animate={{ height: open ? "auto" : 0 }}
            transition={transition}
        >
            <m.div
                ref={measureRef}
                className="entry-details__inner"
                initial={false}
                animate={{ opacity: open ? 1 : 0, y: open ? 0 : -6 }}
                transition={reduced ? { duration: 0 } : { duration: open ? 0.45 : 0.2, delay: open ? 0.08 : 0, ease: [0.2, 0.7, 0.2, 1] }}
            >
                <FocusText as="p" className="entry-details__summary">
                    {entry.summary}
                </FocusText>
                {entry.points?.length > 0 && (
                    <ul className="entry-details__points">
                        {entry.points.map((point) => (
                            <li key={point}>{point}</li>
                        ))}
                    </ul>
                )}
                {entry.tags?.length > 0 && (
                    <p className="label entry-details__tags">
                        <span className="sr-only">Tools and topics: </span>
                        {entry.tags.join(" · ")}
                    </p>
                )}
                {(entry.projectId || entry.links?.length > 0) && (
                    <div className="entry-details__links">
                        <EntryLinks entry={entry} />
                    </div>
                )}
            </m.div>
        </m.div>
    );
};

export default EntryDetails;