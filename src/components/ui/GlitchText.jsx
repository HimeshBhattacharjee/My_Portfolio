import { useRef } from "react";
import { useAmbientGlitch, useGlitch } from "../../hooks/useGlitch";

// Text with a one-shot chromatic glitch: two aria-hidden copies in the glitch colours are
// sliced and displaced for about half a second, then vanish. Nothing loops or flickers.
//
// It is never triggered by the visitor. The page-wide scheduler in hooks/useGlitch.js
// plays one on-screen target every five seconds.
//
//   glitch: pass a value from useGlitch() to drive several pieces of text together (the
//           hero name plays both lines at once). The owner then registers with the
//           scheduler itself, and this component does not.
//   weight: how often this text is chosen relative to other targets.
//
// Reduced motion: the CSS animations are only defined under prefers-reduced-motion:
// no-preference, and the scheduler never runs.
const GlitchText = ({ text, as: Tag = "span", className = "", glitch, weight = 1, ...rest }) => {
    const own = useGlitch();
    const { on, done } = glitch ?? own;
    const ref = useRef(null);
    useAmbientGlitch(ref, own.play, weight, !glitch);

    return (
        <Tag ref={ref} className={`glitch ${className}`} data-glitch={on ? "on" : "off"} {...rest}>
            <span className="glitch__base" onAnimationEnd={done}>
                {text}
            </span>
            <span className="glitch__layer glitch__layer--a" aria-hidden="true">
                {text}
            </span>
            <span className="glitch__layer glitch__layer--b" aria-hidden="true">
                {text}
            </span>
        </Tag>
    );
};

export default GlitchText;