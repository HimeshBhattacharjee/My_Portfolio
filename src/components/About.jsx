import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile, publishedAbout } from "../data";
import { reveal, revealGroup, inView } from "../utils/motion";
import GlitchText from "./ui/GlitchText";
import RichText from "./ui/RichText";
import ScrambleText from "./ui/ScrambleText";
import FocusText from "./ui/FocusText";
import { ArrowRight } from "./ui/Icons";
import WireSculpture from "./depth/WireSculpture";

// 03 · About. A vertical plate from the same photograph, cropped by CSS to the face and
// upper torso (never the lower half). The image drifts a few pixels against its frame as
// the section scrolls by: restrained parallax, uniform translation only, off with reduced
// motion. The image data is untouched.
function Plate() {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const { portrait } = profile;
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-18, 18]);
    // The orbit behind the plate drifts against it, slower than the page: layered depth.
    const orbitY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);

    return (
        <m.figure ref={ref} variants={reveal} className="about__plate">
            {/* Behind the plate in the stacking order: nothing is ever drawn over the photograph. */}
            <m.div className="about__orbit" aria-hidden="true" style={{ y: orbitY }}>
                <WireSculpture variant="about" />
            </m.div>
            <div className="about__plate-frame">
                <m.img
                    src={portrait.webp[1].src}
                    srcSet={portrait.webp.map((file) => `${file.src} ${file.width}w`).join(", ")}
                    sizes="(min-width: 1024px) 22rem, 70vw"
                    width={portrait.width}
                    height={portrait.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{ y }}
                />
            </div>
            <span className="about__plate-rule" aria-hidden="true" />
            <figcaption className="label about__plate-caption">
                <span>Fig. 02</span>
                <span>{profile.location}</span>
            </figcaption>
        </m.figure>
    );
}

const About = () => {
    const { paragraphs, practice, currently } = publishedAbout;

    return (
        <section id="about" className="section about" aria-labelledby="about-title">
            <span className="about__glow" aria-hidden="true" />
            <span className="about__planes" aria-hidden="true">
                <span />
                <span />
            </span>
            <div className="shell about__grid">
                <m.div className="about__lead" variants={revealGroup} initial="hidden" whileInView="show" viewport={inView}>
                    <m.div variants={reveal}>
                        <ScrambleText as="p" className="label section-head__label" text="03 · About" />
                    </m.div>
                    <FocusText as={m.h2} variants={reveal} id="about-title" className="display about__title">
                        <GlitchText text="Between" />{" "}
                        <em>disciplines</em>
                    </FocusText>
                    <Plate />
                </m.div>

                <m.div className="about__body" variants={revealGroup} initial="hidden" whileInView="show" viewport={inView}>
                    {paragraphs.map((text, index) => (
                        <FocusText as={m.p} key={index} variants={reveal} className={index === 0 ? "about__first" : undefined}>
                            <RichText text={text} />
                        </FocusText>
                    ))}

                    <m.dl variants={reveal} className="practice">
                        {practice.map((item, index) => (
                            <FocusText key={item.area} className="practice__row">
                                <dt>
                                    <span className="label practice__num">{String(index + 1).padStart(2, "0")}</span>
                                    {item.area}
                                </dt>
                                <dd>
                                    <span>{item.detail}</span>
                                    <a href={item.proof.href} className="textlink">
                                        {item.proof.label} <ArrowRight width={13} height={13} />
                                    </a>
                                </dd>
                            </FocusText>
                        ))}
                        {currently && (
                            <div className="practice__row practice__row--now">
                                <dt>
                                    <span className="now-dot" aria-hidden="true" />
                                    Currently
                                </dt>
                                <dd>
                                    <span>{currently.text}</span>
                                </dd>
                            </div>
                        )}
                    </m.dl>
                </m.div>
            </div>
        </section>
    );
};

export default About;