import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, m, useScroll } from "framer-motion";
import { profile, sections, publishedLinks } from "../data";
import { useActiveSection, useScrolled } from "../hooks/useActiveSection";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useDecryptCycle } from "../hooks/useDecryptCycle";
import { EASE } from "../utils/motion";
import BrandMark from "./ui/BrandMark";
import DecryptLabel from "./ui/DecryptLabel";
import DownloadCV from "./ui/DownloadCV";
import ThemeToggle from "./ui/ThemeToggle";
import { Close } from "./ui/Icons";

const INDICATOR_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.7 };

// Devices without hover (or with a coarse pointer) get the timed decryption cycle.
const TOUCH = "(hover: none), (pointer: coarse)";
const TOUCH_BAR = "(min-width: 1024px) and (hover: none), (min-width: 1024px) and (pointer: coarse)";
// The phone menu's first decryption, once its links have finished arriving.
const MENU_FIRST_DECRYPT_MS = 950;

// Desktop: section links with an indicator that slides to the active section. Hover and
// keyboard focus draw the same cyan underline as the indicator and decrypt the label (see
// DecryptLabel). On touch screens wide enough to show these links (a tablet in landscape),
// every label decrypts together every five seconds instead (see ui/decrypt.js); that never
// scrolls or changes the active section.
function SectionLinks({ active }) {
    const listRef = useRef(null);
    const linkRefs = useRef({});
    const [box, setBox] = useState(null);
    // Only where this bar is shown (1024 px and up); below that the phone menu runs the cycle.
    const touch = useMediaQuery(TOUCH_BAR);
    useDecryptCycle(listRef, touch);

    useLayoutEffect(() => {
        const measure = () => {
            const link = linkRefs.current[active];
            const list = listRef.current;
            if (!link || !list) return setBox(null);
            setBox({ x: link.offsetLeft, width: link.offsetWidth });
        };
        measure();
        // Fonts can arrive after first layout and change link widths.
        document.fonts?.ready.then(measure);
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [active]);

    return (
        <ul ref={listRef} className="navlinks">
            <m.li
                className="navlinks__indicator"
                role="presentation"
                aria-hidden="true"
                initial={false}
                animate={box ? { x: box.x, width: box.width, opacity: 1 } : { opacity: 0 }}
                transition={INDICATOR_SPRING}
            />
            {sections.map((section) => (
                <li key={section.id}>
                    <a
                        ref={(element) => {
                            linkRefs.current[section.id] = element;
                        }}
                        href={`#${section.id}`}
                        className="navlink label"
                        aria-current={active === section.id ? "true" : undefined}
                    >
                        <DecryptLabel text={section.label} className="navlink__text" />
                    </a>
                </li>
            ))}
        </ul>
    );
}

// Phone index: full screen, opened from the bar. Locks page scroll, traps focus, closes on
// Escape, and returns focus to the toggle.
function Menu({ active, onClose, toggleRef }) {
    const menuRef = useRef(null);
    const navRef = useRef(null);
    // The menu exists only while open, so the cycle runs only while it is visible.
    const touch = useMediaQuery(TOUCH);
    useDecryptCycle(navRef, touch, MENU_FIRST_DECRYPT_MS);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const toggle = toggleRef.current;
        menuRef.current?.querySelector("a, button")?.focus();

        const onKey = (event) => {
            if (event.key === "Escape") onClose();
            if (event.key !== "Tab" || !menuRef.current) return;
            const items = menuRef.current.querySelectorAll("a, button");
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKey);
            toggle?.focus();
        };
    }, [onClose, toggleRef]);

    return (
        <m.div
            id="site-menu"
            ref={menuRef}
            className="menu lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site index"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
            <span className="tech-grid" aria-hidden="true" />
            <div className="shell menu__head">
                <span className="label">Index</span>
                <div className="topbar__actions">
                    <ThemeToggle />
                    <button type="button" className="menu-toggle label" onClick={onClose}>
                        Close <Close width={16} height={16} />
                    </button>
                </div>
            </div>
            <nav ref={navRef} aria-label="Sections" className="shell relative flex-1 flex flex-col justify-center">
                {[{ id: "top", label: "Home", index: "00" }, ...sections].map((section, index) => (
                    <m.a
                        key={section.id}
                        href={`#${section.id}`}
                        className="menu__link"
                        aria-current={active === section.id ? "true" : undefined}
                        onClick={onClose}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.12 + 0.045 * index }}
                    >
                        <span className="label">{section.index}</span>
                        <DecryptLabel text={section.label} />
                    </m.a>
                ))}
            </nav>
            <m.div
                className="shell relative flex flex-wrap items-center gap-x-7 gap-y-3 py-7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
            >
                <DownloadCV variant="menu" />
                {publishedLinks.map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        {...(link.id === "email" ? {} : { target: "_blank", rel: "noreferrer" })}
                        className="label min-h-[2.75rem] inline-flex items-center"
                        style={{ color: "var(--fg)" }}
                    >
                        {link.label}
                        {link.id !== "email" && <span className="sr-only"> (opens in a new tab)</span>}
                    </a>
                ))}
            </m.div>
        </m.div>
    );
}

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const scrolled = useScrolled();
    const active = useActiveSection(sections.map((section) => section.id));
    const { scrollYProgress } = useScroll();
    const toggleRef = useRef(null);
    const close = useCallback(() => setOpen(false), []);
    const fullName = `${profile.name.first} ${profile.name.last}`;

    return (
        <>
            <header className="topbar" data-solid={scrolled}>
                <div className="shell">
                    <div className="topbar__bar">
                        <a href="#top" className="monogram" aria-label={`${fullName}, back to top`}>
                            <BrandMark variant="nav" glitch />
                        </a>

                        <nav aria-label="Sections" className="hidden lg:block">
                            <SectionLinks active={active} />
                        </nav>

                        <div className="topbar__actions">
                            {/* Below 1024 px the CV lives in the menu and the hero, keeping the
                                bar clear of the portrait. */}
                            <DownloadCV variant="nav" className="hidden lg:inline-flex">
                                CV
                            </DownloadCV>
                            <ThemeToggle />
                            <button
                                ref={toggleRef}
                                type="button"
                                className="menu-toggle label lg:hidden"
                                aria-expanded={open}
                                aria-controls="site-menu"
                                onClick={() => setOpen(true)}
                            >
                                Menu <span className="menu-toggle__lines" aria-hidden="true" />
                            </button>
                        </div>

                        <m.span className="topbar__progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {open && <Menu active={active} onClose={close} toggleRef={toggleRef} />}
            </AnimatePresence>
        </>
    );
};

export default Navbar;