import { useRef } from "react";
import { m, useReducedMotion } from "framer-motion";
import { publishedPublications } from "../../data";
import { EASE } from "../../utils/motion";
import { EXPAND, useInert } from "../journey/expand";
import FocusText from "../ui/FocusText";
import { ArrowUpRight, Close } from "../ui/Icons";
import Pipeline from "./Pipeline";

const group = {
    hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const item = {
    hidden: { opacity: 0, y: 12, transition: { duration: 0.2 } },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

// A project's full story, unfolded in place below its presentation: the problem, the
// approach, my part, what was built, how it works, the stack, publications and links.
// Collapsed, it is inert (out of the tab order and the accessibility tree), matching
// aria-expanded on the toggle. The panel's own Close button hands focus back to the toggle.
const ProjectDetails = ({ project, open, id, onClose, showIdea = true, showPipeline = true }) => {
    const reduced = useReducedMotion();
    const ref = useRef(null);
    useInert(ref, !open);
    const professional = project.context === "professional";
    const papers = (project.publications ?? []).map((paperId) => publishedPublications.find((paper) => paper.id === paperId)).filter(Boolean);
    const titleId = `${id}-title`;

    return (
        <m.div
            ref={ref}
            id={id}
            className="pdetail"
            role="region"
            aria-labelledby={titleId}
            initial={false}
            animate={{ height: open ? "auto" : 0 }}
            transition={reduced ? { duration: 0 } : EXPAND}
        >
            <m.div className="pdetail__inner" initial={false} animate={open ? "show" : "hidden"} variants={reduced ? undefined : group}>
                <h4 id={titleId} className="sr-only">
                    {project.title}: details
                </h4>
                <m.div variants={reduced ? undefined : item} className="pdetail__grid">
                    <FocusText as="section" className="pdetail__block">
                        <h5 className="label pdetail__label">
                            <span>01</span> The problem
                        </h5>
                        <p>{project.problem}</p>
                    </FocusText>
                    {showIdea && (
                        <FocusText as="section" className="pdetail__block">
                            <h5 className="label pdetail__label">
                                <span>02</span> The approach
                            </h5>
                            <p>{project.idea}</p>
                        </FocusText>
                    )}
                    <FocusText as="section" className="pdetail__block">
                        <h5 className="label pdetail__label">
                            <span>{showIdea ? "03" : "02"}</span> My part
                        </h5>
                        <p>{project.role}</p>
                    </FocusText>
                </m.div>

                <m.section variants={reduced ? undefined : item} className="pdetail__built">
                    <h5 className="label pdetail__label">{professional ? "Capabilities delivered" : "What I built"}</h5>
                    <ul>
                        {project.built.map((point) => (
                            <FocusText as="li" key={point.text} data-state={point.note ? "progress" : "done"}>
                                <span>{point.text}</span>
                                {point.note && <span className="tag tag--progress">{point.note}</span>}
                            </FocusText>
                        ))}
                    </ul>
                </m.section>

                {project.impact?.length > 0 && (
                    <m.section variants={reduced ? undefined : item} className="pdetail__impact">
                        <h5 className="label pdetail__label">Impact</h5>
                        <ul>
                            {project.impact.map((line) => (
                                <FocusText as="li" key={line}>
                                    {line}
                                </FocusText>
                            ))}
                        </ul>
                    </m.section>
                )}

                {showPipeline && (
                    <m.div variants={reduced ? undefined : item}>
                        <Pipeline steps={project.how} label={professional ? "Architecture, in general terms" : "How it works"} />
                    </m.div>
                )}

                <m.div variants={reduced ? undefined : item} className="pdetail__foot">
                    <div className="pdetail__stack">
                        <h5 className="label pdetail__label">{professional ? "Tools and methods" : "Stack"}</h5>
                        <ul>
                            {project.stack.map((tool) => (
                                <li key={tool}>{tool}</li>
                            ))}
                        </ul>
                    </div>

                    {papers.length > 0 && (
                        <div className="pdetail__papers">
                            <h5 className="label pdetail__label">Published</h5>
                            <ul>
                                {papers.map((paper) => (
                                    <li key={paper.id}>
                                        <span className="pdetail__paper-title">“{paper.title}”</span>
                                        <span className="label">
                                            {paper.venue}, {paper.year}
                                        </span>
                                        {paper.url && (
                                            <a href={paper.url} target="_blank" rel="noreferrer" className="textlink">
                                                DOI {paper.doi} <ArrowUpRight width={14} height={14} />
                                                <span className="sr-only">(opens in a new tab)</span>
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pdetail__actions">
                        {project.links.map((link) => (
                            <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="btn btn--ghost">
                                {link.label}
                                <ArrowUpRight width={16} height={16} />
                                <span className="sr-only">(opens in a new tab)</span>
                            </a>
                        ))}
                        <button type="button" className="pdetail__close label" onClick={onClose}>
                            Close details <Close width={15} height={15} />
                        </button>
                    </div>
                </m.div>
            </m.div>
        </m.div>
    );
};

export default ProjectDetails;