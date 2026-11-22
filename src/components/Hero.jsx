import { useCallback, useRef } from "react";
import { m } from "framer-motion";
import { profile, publishedProjects, publishedLinks } from "../data";
import { reveal } from "../utils/motion";
import { useAmbientGlitch, useGlitch } from "../hooks/useGlitch";
import Lattice from "./lattice/Lattice";
import { emitHeroSignal } from "./lattice/signal";
import Portrait from "./hero/Portrait";
import DownloadCV from "./ui/DownloadCV";
import GlitchText from "./ui/GlitchText";
import RichText from "./ui/RichText";
import FocusText from "./ui/FocusText";
import { ArrowDown, ArrowRight, GitHubIcon, LinkedInIcon } from "./ui/Icons";

const socialIcons = { github: GitHubIcon, linkedin: LinkedInIcon };

const group = (delay) => ({
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: delay } },
});

const Hero = () => {
    const { name, roles, statement, intro } = profile;
    const socials = publishedLinks.filter((link) => socialIcons[link.id]);
    const nameGlitch = useGlitch();
    const nameRef = useRef(null);

    // Both lines of the name glitch together, as one target of the page-wide scheduler:
    // an occasional signal disturbance while the name is on screen, never on hover.
    // The same beat sends a ripple of light through the Lattice, starting from a point
    // beneath the name (see lattice/signal.js). Only a glitch that really plays emits it.
    const { play: playName } = nameGlitch;
    const playNameSignal = useCallback(() => {
        if (!playName()) return;
        const rect = nameRef.current?.getBoundingClientRect();
        if (!rect) return;
        emitHeroSignal({
            x: rect.left + rect.width * (0.25 + Math.random() * 0.5),
            y: rect.bottom - rect.height * 0.1,
        });
    }, [playName]);
    useAmbientGlitch(nameRef, playNameSignal, 1.4);

    return (
        <section id="top" className="hero" aria-labelledby="hero-name">
            <span className="tech-grid" aria-hidden="true" />
            <Lattice />
            <Portrait />

            <div className="shell hero__inner">
                <m.div className="hero__lead" variants={group(0.25)} initial="hidden" animate="show">
                    <m.p variants={reveal} className="label hero__eyebrow">
                        <i aria-hidden="true" />
                        {roles.map((role, index) => (
                            <span key={role}>
                                {role}
                                {index < roles.length - 1 && (
                                    <span aria-hidden="true" className="hero__sep">
                                        /
                                    </span>
                                )}
                            </span>
                        ))}
                    </m.p>
                    <FocusText as={m.p} variants={reveal} className="standfirst hero__statement">
                        {statement}
                    </FocusText>
                </m.div>

                <h1 id="hero-name" ref={nameRef} className="hero__name">
                    <GlitchText text={name.first} className="hero__name-first" glitch={nameGlitch} />
                    <span className="sr-only"> </span>
                    <GlitchText text={name.last} className="hero__name-last" glitch={nameGlitch} />
                </h1>

                <m.div className="hero__foot" variants={group(0.9)} initial="hidden" animate="show">
                    <m.div variants={reveal}>
                        <FocusText as="p" className="hero__intro">
                            <RichText text={intro} />
                        </FocusText>
                        <div className="hero__actions">
                            <a href="#work" className="btn btn--primary">
                                View selected work
                                <ArrowDown width={16} height={16} />
                            </a>
                            <DownloadCV />
                            {socials.map((link) => {
                                const Icon = socialIcons[link.id];
                                return (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="icon-link"
                                        aria-label={`${link.label} profile (opens in a new tab)`}
                                    >
                                        <Icon />
                                    </a>
                                );
                            })}
                        </div>
                    </m.div>

                    <m.nav variants={reveal} aria-label="Selected work">
                        <div className="index__head label">
                            <span>Selected work</span>
                            <a href="#work" className="inline-flex items-center gap-2 text-fg-soft hover:text-fg-strong">
                                All
                                <ArrowDown width={13} height={13} />
                            </a>
                        </div>
                        {publishedProjects.map((project) => (
                            <a key={project.id} href={`#work/${project.id}`} className="index__row">
                                <span>{project.title}</span>
                                <span className="label hidden sm:inline">{project.short}</span>
                                <ArrowRight width={15} height={15} />
                            </a>
                        ))}
                    </m.nav>
                </m.div>
            </div>
        </section>
    );
};

export default Hero;