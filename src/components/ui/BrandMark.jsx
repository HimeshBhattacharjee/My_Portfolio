import { useRef } from "react";
import { useAmbientGlitch, useGlitch } from "../../hooks/useGlitch";

// The HB mark: the supplied artwork (master kept out of the build, in the git-ignored
// private/source-assets/hb-logo-source.png), cropped to the
// emblem and its glow, served at three widths. It keeps its original navy backing as a
// deliberate tile in both themes: the glow is part of the mark, and a cut-out would lose it.
// Never recoloured, inverted or redrawn.
//
// `glitch`: let the page-wide scheduler disturb the tile now and then, at a low weight.
// The disturbance is in the frame; the artwork itself only shifts by a pixel.
const SRC = "/images/brand/hb-logo-160.webp";
const SRCSET = "/images/brand/hb-logo-160.webp 160w, /images/brand/hb-logo-320.webp 320w, /images/brand/hb-logo-640.webp 640w";

const SIZES = { nav: "64px", footer: "(min-width: 768px) 176px, 144px" };

const BrandMark = ({ variant = "nav", glitch = false, className = "" }) => {
    const ref = useRef(null);
    const state = useGlitch();
    useAmbientGlitch(ref, state.play, 0.1, glitch);

    return (
        <span ref={ref} className={`brand-tile brand-tile--${variant} ${className}`} data-glitch={state.on ? "on" : "off"}>
            <img
                className="brand-tile__img"
                src={SRC}
                srcSet={SRCSET}
                sizes={SIZES[variant]}
                width="760"
                height="548"
                alt=""
                decoding="async"
                draggable="false"
                onAnimationEnd={state.done}
            />
            <span className="brand-tile__glitch brand-tile__glitch--a" aria-hidden="true" />
            <span className="brand-tile__glitch brand-tile__glitch--b" aria-hidden="true" />
        </span>
    );
};

export default BrandMark;