import { useState } from "react";
import { m } from "framer-motion";
import { publishedAbout, publishedTimeline } from "../data";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { reveal, revealGroup, inView } from "../utils/motion";
import ListView from "./journey/ListView";
import SpineView from "./journey/SpineView";
import Marker from "./journey/Marker";
import Cosmos from "./ui/Cosmos";
import FocusText from "./ui/FocusText";
import GlitchText from "./ui/GlitchText";
import ScrambleText from "./ui/ScrambleText";
import { FILTERS, TYPE_LABEL } from "./journey/scale";

const LEGEND = ["role", "internship", "project", "education", "publication", "achievement", "credential"];

// 02 · Journey. From the start of the degree to the present role, from one data file and
// one publication gate. Desktop: a central spine with alternating cards that expand as
// they reach the middle of the screen. Phones and tablets: a vertical spine on the left.
const Journey = () => {
    const wide = useMediaQuery("(min-width: 1024px)");
    const [filterId, setFilterId] = useState("all");
    const filter = FILTERS.find((item) => item.id === filterId).match;
    const currently = publishedAbout.currently;

    return (
        <>
            <a href="#about" className="skip-link">
                Skip the journey
            </a>
            <section id="journey" className={`section journey${wide ? " journey--spine" : ""}`} aria-labelledby="journey-title">
                <span className="journey__depth" aria-hidden="true" />
                <Cosmos variant="journey" />
                <div className="shell">
                    <m.div className="journey-head" variants={revealGroup} initial="hidden" whileInView="show" viewport={inView}>
                        <m.div variants={reveal} className="journey-head__titles">
                            <ScrambleText as="p" className="label section-head__label" text="02 · Journey" />
                            <GlitchText as="h2" id="journey-title" className="display journey-head__title" text="Everything, in order" />
                            <FocusText as="p" className="standfirst journey-head__standfirst">
                                From the first year of engineering to the work I do today. Some of it overlaps, because
                                that is how it happened.
                            </FocusText>
                        </m.div>
                        <m.div variants={reveal} className="journey-head__controls">
                            <div className="chips" role="group" aria-label="Filter milestones">
                                {FILTERS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="chip"
                                        aria-pressed={filterId === item.id}
                                        onClick={() => setFilterId(item.id)}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </m.div>
                        <m.ul variants={reveal} className="legend" aria-label="Marker key">
                            {LEGEND.map((type) => (
                                <li key={type}>
                                    <Marker type={type} size={11} />
                                    {TYPE_LABEL[type]}
                                </li>
                            ))}
                        </m.ul>
                    </m.div>
                    {wide ? (
                        <SpineView entries={publishedTimeline} filter={filter} currently={currently} />
                    ) : (
                        <ListView entries={publishedTimeline} filter={filter} currently={currently} />
                    )}
                </div>
            </section>
        </>
    );
};

export default Journey;