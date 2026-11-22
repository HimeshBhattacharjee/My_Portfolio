import { useRef } from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const SPRING = { stiffness: 180, damping: 20, mass: 0.6 };

// A plate that tilts towards the pointer in 3D, with a soft highlight under the cursor and
// a thin line of light that travels its border on hover. Fine pointers only; touch devices
// and reduced motion get a flat plate. Children stay fully interactive.
const TiltCard = ({ children, className = "", max = 5 }) => {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
    const enabled = fine && !reduced;

    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING);
    const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING);

    const onMove = (event) => {
        const element = ref.current;
        if (!enabled || !element) return;
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        px.set(x);
        py.set(y);
        element.style.setProperty("--mx", `${x * 100}%`);
        element.style.setProperty("--my", `${y * 100}%`);
    };

    const onLeave = () => {
        px.set(0.5);
        py.set(0.5);
    };

    return (
        <m.div
            ref={ref}
            className={`tilt ${className}`}
            data-tilt={enabled}
            style={enabled ? { rotateX, rotateY, transformPerspective: 1200 } : undefined}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
        >
            {children}
            <span className="tilt__glare" aria-hidden="true" />
        </m.div>
    );
};

export default TiltCard;