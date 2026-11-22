import { useRef } from "react";
import { m, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { publishedProjects, publishedPublications } from "../data";
import { useProjectRoute } from "../hooks/useHashRoute";
import { useTrackProgress } from "../hooks/useTrackProgress";
import { figureIn, reveal, revealGroup, wipe } from "../utils/motion";
import SectionHeader from "./ui/SectionHeader";
import FocusText from "./ui/FocusText";
import GlitchText from "./ui/GlitchText";
import ProjectDetails from "./work/ProjectDetails";
import TiltCard from "./ui/TiltCard";
import { GloveFigure, IntelliViewFigure, IntuitIQFigure, QualityFigure } from "./work/figures";
import { ArrowUpRight } from "./ui/Icons";

// One presentation system for every project. The IntuitIQ layout is the standard:
// number, meta, title, standfirst, body (or a step breakdown), facts, actions; the figure
// beside it.
// Sides alternate by position (01 writeup left, 02 visual left, 03 writeup left, ...).
// What differs per project is only its figure and which facts it leads with.
const FEATURES = {
    intuitiq: { Figure: IntuitIQFigure, tilt: 4, facts: "publications", caption: (p) => `${p.caption} Switch between the two modes.` },
    "sign-language-gloves": { Figure: GloveFigure, tilt: 3, facts: "steps", factsLabel: "Technical breakdown" },
    intelliview: { Figure: IntelliViewFigure, tilt: 4, facts: "steps", factsLabel: "How a session works" },
    "quality-digitalisation": { Figure: QualityFigure, tilt: 3, facts: "capabilities", factsLabel: "Capabilities", band: true },
};

// The Details toggle for every project. The panel it controls unfolds in place.
function DetailsToggle({ project, open, onToggle }) {
    const label = project.context === "professional" ? "Case study details" : "Project details";
    return (
        <button
            type="button"
            className="btn btn--primary details-toggle"
            aria-expanded={open}
            aria-controls={`details-${project.id}`}
            data-toggle-for={project.id}
            onClick={onToggle}
        >
            {open ? "Close details" : label}
            <span className="details-toggle__plus" aria-hidden="true" />
            <span className="sr-only">: {project.title}</span>
        </button>
    );
}

const Meta = ({ project }) => (
    <p className="label work-meta">
        <span>{project.kind}</span>
        <span>{project.period}</span>
        {project.prototype && <span className="tag">Prototype</span>}
        {project.badge && <span className="tag tag--accent">{project.badge}</span>}
    </p>
);

// A node on the work rail, lit as its project comes into view.
const RailNode = () => (
    <m.span
        className="work-node"
        aria-hidden="true"
        initial={{ scale: 0.4, opacity: 0.3 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    />
);

// The block of facts each project leads with, in one shared ruled-list style.
function Facts({ project, kind, label }) {
    if (kind === "publications") {
        const papers = (project.publications ?? []).map((id) => publishedPublications.find((paper) => paper.id === id)).filter(Boolean);
        if (papers.length === 0) return null;
        return (
            <div className="pf__facts pf__facts--inline">
                <span className="label pf__facts-label">Published in</span>
                <ul>
                    {papers.map((paper) => (
                        <li key={paper.id}>{paper.short}</li>
                    ))}
                </ul>
            </div>
        );
    }

    if (kind === "steps") {
        return (
            <div className="pf__facts">
                <span className="label pf__facts-label">{label}</span>
                <FocusText as="ol" className="pf__steps">
                    {project.how.map((item, index) => (
                        <li key={item.step}>
                            <span className="label">
                                {String(index + 1).padStart(2, "0")} {item.step}
                            </span>
                            <span>{item.detail}</span>
                        </li>
                    ))}
                </FocusText>
            </div>
        );
    }

    // "capabilities": what the portal does, completed work first and ongoing work marked as
    // such, then the architecture in one line and the confidentiality note.
    return (
        <div className="pf__facts">
            <span className="label pf__facts-label">{label}</span>
            <FocusText as="ul" className="pf__points">
                {project.built.map((point) => (
                    <li key={point.text} data-state={point.note ? "progress" : "done"}>
                        <span className="pf__point-mark" aria-hidden="true" />
                        <span>{point.text}</span>
                        {point.note ? (
                            <span className="tag tag--progress">{point.note}</span>
                        ) : (
                            <span className="sr-only"> (completed)</span>
                        )}
                    </li>
                ))}
            </FocusText>
            <p className="label pf__tools">
                <span>Architecture</span> {project.how.map((step) => step.step).join(" → ")}
            </p>
            <p className="pf__note">
                An internal application behind company sign-in. No screens, records or internal details are reproduced here.
            </p>
        </div>
    );
}

function ProjectFeature({ project, index, open, onToggle, onClose }) {
    const feature = FEATURES[project.id];
    if (!feature) return null;
    const { Figure, tilt, facts, factsLabel, band } = feature;
    const number = String(index + 1).padStart(2, "0");
    const mirrored = index % 2 === 1;
    const link = project.links[0];
    const titleId = `${project.id}-title`;
    const caption = feature.caption ? feature.caption(project) : project.caption;

    const body = (
        <>
            <RailNode />
            <m.div
                className="pf__grid"
                variants={revealGroup}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.15 }}
            >
                <div className="pf__text">
                    <m.span variants={reveal} className="pf__index" aria-hidden="true">
                        {number}
                    </m.span>
                    <m.div variants={reveal}>
                        <Meta project={project} />
                        <m.h3 variants={wipe} id={titleId} className="pf__title">
                            <GlitchText text={project.title} weight={0.7} />
                        </m.h3>
                        <FocusText as="p" className="standfirst pf__summary">
                            {project.summary}
                        </FocusText>
                        {/* A step breakdown already states the approach; the body would repeat it. */}
                        {facts !== "steps" && (
                            <FocusText as="p" className="pf__body">
                                {project.idea}
                            </FocusText>
                        )}
                    </m.div>
                    <m.div variants={reveal}>
                        <Facts project={project} kind={facts} label={factsLabel} />
                    </m.div>
                    <m.div variants={reveal} className="pf__actions">
                        <DetailsToggle project={project} open={open} onToggle={onToggle} />
                        {link && (
                            <a href={link.url} target="_blank" rel="noreferrer" className="btn btn--ghost">
                                {link.label.replace(" on GitHub", "")} <ArrowUpRight width={16} height={16} />
                                <span className="sr-only">(opens in a new tab)</span>
                            </a>
                        )}
                    </m.div>
                </div>

                <m.figure variants={figureIn} className="pf__figure">
                    <TiltCard max={tilt}>
                        <Figure />
                    </TiltCard>
                    <figcaption className="label">{caption}</figcaption>
                </m.figure>
            </m.div>
            <ProjectDetails
                project={project}
                open={open}
                id={`details-${project.id}`}
                onClose={onClose}
                showIdea={facts === "steps"}
                showPipeline={facts !== "steps"}
            />
        </>
    );

    const className = `work-item pf${mirrored ? " pf--mirror" : ""}${band ? " pf--band" : ""}`;

    // Professional work sits in its own full-width band so it is never mistaken for a side
    // project; inside the band, the layout is exactly the same.
    if (band) {
        return (
            <article id={`work/${project.id}`} className={className} aria-labelledby={titleId} data-open={open}>
                <span className="pf__depth" aria-hidden="true" />
                <div className="shell pf__shell">{body}</div>
            </article>
        );
    }

    return (
        <div className="shell">
            <article id={`work/${project.id}`} className={className} aria-labelledby={titleId} data-open={open}>
                {body}
            </article>
        </div>
    );
}

// The work rail: one line down the left margin joining the projects, from the top of
// IntuitIQ to the end of the Quality Portal case study (its details included, when open).
// It fills as the visitor reads down, and a small marker of light rides its leading edge
// to the end cap. Progress is measured on the rail itself, so it always matches the rail's
// real length. Wide screens only, where the margin has room for it.
const WorkRail = ({ railRef, fill }) => {
    const head = useTransform(fill, (value) => `${value * 100}%`);
    return (
        <span ref={railRef} className="work-rail" aria-hidden="true">
            <m.span className="work-rail__fill" style={{ scaleY: fill }} />
            <m.span className="work-rail__run" style={{ y: head }}>
                <span className="work-rail__head" />
            </m.span>
            <span className="work-rail__end" />
        </span>
    );
};

const Work = () => {
    const railRef = useRef(null);
    const reduced = useReducedMotion();
    const progress = useTrackProgress(railRef, 0.6);
    const smoothRail = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.6, restDelta: 0.0005 });
    const { isOpen, toggle } = useProjectRoute();
    const projects = publishedProjects.filter((project) => FEATURES[project.id]);

    // Closing from the panel's own button returns focus to the project's toggle, so keyboard
    // users are never left inside content that has just collapsed.
    const closeFromPanel = (id) => () => {
        toggle(id);
        document.querySelector(`[data-toggle-for="${id}"]`)?.focus();
    };

    return (
        <section id="work" className="section work" aria-labelledby="work-title">
            <div className="shell">
                <SectionHeader
                    id="work-title"
                    label="01 · Selected work"
                    title="Finished work"
                    standfirst="Four projects, each taken to the end. Open any of them for the problem, my part in it and how it works."
                />
            </div>
            <div className="work__track">
                <WorkRail railRef={railRef} fill={reduced ? progress : smoothRail} />
                {projects.map((project, index) => (
                    <ProjectFeature
                        key={project.id}
                        project={project}
                        index={index}
                        open={isOpen(project.id)}
                        onToggle={() => toggle(project.id)}
                        onClose={closeFromPanel(project.id)}
                    />
                ))}
            </div>
        </section>
    );
};

export default Work;