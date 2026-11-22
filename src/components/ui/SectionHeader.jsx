import { m } from "framer-motion";
import { reveal, revealGroup, inView } from "../../utils/motion";
import GlitchText from "./GlitchText";
import ScrambleText from "./ScrambleText";
import FocusText from "./FocusText";

// Shared section opening: a mono label that decodes once, a display title that the ambient
// scheduler glitches now and then, and an optional editorial standfirst.
// `id` goes on the heading so the section can use aria-labelledby.
const SectionHeader = ({ id, label, title, standfirst, children }) => (
    <m.header className="section-head" variants={revealGroup} initial="hidden" whileInView="show" viewport={inView}>
        <m.div variants={reveal}>
            <ScrambleText as="p" className="label section-head__label" text={label} />
        </m.div>
        <FocusText as={m.div} variants={reveal}>
            <GlitchText as="h2" id={id} className="display section-head__title" text={title} />
        </FocusText>
        {standfirst && (
            <FocusText as={m.p} variants={reveal} className="standfirst section-head__standfirst">
                {standfirst}
            </FocusText>
        )}
        {children}
    </m.header>
);

export default SectionHeader;