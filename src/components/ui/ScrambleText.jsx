import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "01<>/|_-+=:#*";

// Small metadata labels "decode" each time they scroll into view: characters resolve left to
// right from random glyphs in about 0.6 s. Screen readers get the final text immediately.
const ScrambleText = ({ text, className = "", as: Tag = "span" }) => {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const inView = useInView(ref, { amount: 0.8 });
    const [shown, setShown] = useState(text);

    useEffect(() => {
        if (!inView || reduced) {
            setShown(text);
            return undefined;
        }
        const total = 620;
        let frame = 0;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min(1, (now - start) / total);
            const settled = Math.floor(progress * text.length);
            setShown(
                text
                    .split("")
                    .map((char, index) => (index < settled || char === " " ? char : GLYPHS[(index * 7 + Math.floor(now / 40)) % GLYPHS.length]))
                    .join(""),
            );
            if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [inView, reduced, text]);

    return (
        <Tag ref={ref} className={className}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">{shown}</span>
        </Tag>
    );
};

export default ScrambleText;