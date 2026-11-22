import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { publishedCredentials, publishedHonours, publishedPublications } from "../data";
import { figureIn, reveal, revealGroup, inView, wipe } from "../utils/motion";
import SectionHeader from "./ui/SectionHeader";
import CredentialShowcase from "./recognition/CredentialShowcase";
import FocusText from "./ui/FocusText";
import GlitchText from "./ui/GlitchText";
import TiltCard from "./ui/TiltCard";
import Marker from "./journey/Marker";
import { ArrowUpRight } from "./ui/Icons";

const HONOUR_MARKER = { Award: "achievement", Course: "credential" };

// Translucent sheets drifting behind the papers at three depths. Decorative only.
const FloatingSheets = ({ near, mid, far }) => (
    <div className="research__sheets" aria-hidden="true">
        <m.span className="research__sheet research__sheet--far" style={{ y: far }} />
        <m.span className="research__sheet research__sheet--mid" style={{ y: mid }} />
        <m.span className="research__sheet research__sheet--near" style={{ y: near }} />
    </div>
);

// 05 · Research & recognition. Publications as layered document sheets with their full
// citation; honours as a register with achievement markers. Items without a known date show
// none rather than an invented one.
const Recognition = () => {
    const sectionRef = useRef(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
    const near = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [120, -120]);
    const mid = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [70, -70]);
    const far = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [30, -30]);
    return (
        <section id="recognition" ref={sectionRef} className="section research" aria-labelledby="recognition-title">
            <FloatingSheets near={near} mid={mid} far={far} />
            <div className="shell">
                <SectionHeader
                    id="recognition-title"
                    label="05 · Research & recognition"
                    title="On the record"
                    standfirst="Two papers on IntuitIQ, a Lean Six Sigma Green Belt, and the moments along the way."
                />
                <div className="recog">
                    <ol className="papers" aria-label="Publications">
                        {publishedPublications.map((paper, index) => (
                            <m.li key={paper.id} className="paper" variants={figureIn} initial="hidden" whileInView="show" viewport={inView}>
                                <TiltCard max={3}>
                                    <article className="sheet" aria-labelledby={`paper-${paper.id}`}>
                                        <header className="sheet__head">
                                            <p className="label">
                                                {paper.type} · {paper.year}
                                            </p>
                                            <span className="sheet__num display" aria-hidden="true">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </header>
                                        <FocusText as={m.div} variants={revealGroup} initial="hidden" whileInView="show" viewport={inView}>
                                            <m.h3 variants={wipe} id={`paper-${paper.id}`} className="sheet__title standfirst">
                                                <GlitchText text={`“${paper.title}”`} weight={0.6} />
                                            </m.h3>
                                            <m.p variants={reveal} className="sheet__venue">
                                                {paper.venue}
                                            </m.p>
                                        </FocusText>
                                        <dl className="sheet__meta">
                                            <div>
                                                <dt className="label">Authors</dt>
                                                <dd>{paper.authors}</dd>
                                            </div>
                                            {paper.publisher && (
                                                <div>
                                                    <dt className="label">Publisher</dt>
                                                    <dd>{paper.publisher}</dd>
                                                </div>
                                            )}
                                            <div>
                                                <dt className="label">Details</dt>
                                                <dd>{paper.detail}</dd>
                                            </div>
                                            {paper.doi && (
                                                <div className="sheet__doi">
                                                    <dt className="label">DOI</dt>
                                                    <dd>
                                                        <a href={paper.url} target="_blank" rel="noreferrer" className="textlink">
                                                            {paper.doi} <ArrowUpRight width={14} height={14} />
                                                            <span className="sr-only">(opens in a new tab)</span>
                                                        </a>
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>
                                    </article>
                                </TiltCard>
                            </m.li>
                        ))}
                    </ol>

                    <m.div className="honours" variants={revealGroup} initial="hidden" whileInView="show" viewport={inView}>
                        <m.h3 variants={reveal} className="label honours__label">
                            Recognition and learning
                        </m.h3>
                        <ul>
                            {publishedHonours.map((item) => (
                                <FocusText as={m.li} key={item.id} variants={reveal} className="honour">
                                    <span className="honour__marker" aria-hidden="true">
                                        <Marker type={HONOUR_MARKER[item.type] ?? "achievement"} size={12} />
                                    </span>
                                    <span className="label honour__type">{item.type}</span>
                                    <span className="honour__title">{item.title}</span>
                                    <span className="honour__detail">{item.detail}</span>
                                    {item.date && <span className="label honour__date">{item.date}</span>}
                                </FocusText>
                            ))}
                        </ul>
                    </m.div>
                </div>
                {publishedCredentials.map((credential) => (
                    <CredentialShowcase key={credential.id} credential={credential} />
                ))}
            </div>
        </section>
    );
};

export default Recognition;