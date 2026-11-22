import { useEffect, useRef } from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { profile } from "../../data";
import { useAmbientGlitch, useGlitch } from "../../hooks/useGlitch";

const SPRING = { stiffness: 70, damping: 18, mass: 0.8 };

function Corners() {
    return (
        <>
            <span />
            <span />
            <span />
            <span />
        </>
    );
}

// The original photograph, framed. Presentation is CSS only: crop, position, edge
// feathering. The frame, registration corners, rim light and glitch all live around the
// photograph. The image is never filtered, recoloured, distorted or covered at the face.
//
// Depth: with a fine pointer, the photograph and its frame drift a few pixels in opposite
// directions, so the plate reads as layered rather than flat. Uniform translation only.
const Portrait = () => {
    const { portrait } = profile;
    const reduced = useReducedMotion();
    const glitch = useGlitch();

    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const sx = useSpring(px, SPRING);
    const sy = useSpring(py, SPRING);
    const photoX = useTransform(sx, (v) => v * -6);
    const photoY = useTransform(sy, (v) => v * -4);
    const frameX = useTransform(sx, (v) => v * 10);
    const frameY = useTransform(sy, (v) => v * 7);

    useEffect(() => {
        if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
        const onMove = (event) => {
            px.set(event.clientX / window.innerWidth - 0.5);
            py.set(event.clientY / window.innerHeight - 0.5);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [reduced, px, py]);

    // Now and then the scheduler chooses the frame. Frame, marks and rim only: never the
    // photograph itself.
    const frameRef = useRef(null);
    useAmbientGlitch(frameRef, glitch.play, 0.6);

    return (
        <div ref={frameRef} className="portrait" data-glitch={glitch.on ? "on" : "off"}>
            <m.div
                className="portrait__photo"
                style={{ x: photoX, y: photoY }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
            >
                <picture>
                    <source
                        type="image/webp"
                        srcSet={portrait.webp.map((file) => `${file.src} ${file.width}w`).join(", ")}
                        sizes={portrait.sizes}
                    />
                    <img
                        src={portrait.src}
                        width={portrait.width}
                        height={portrait.height}
                        alt={portrait.alt}
                        decoding="async"
                        fetchpriority="high"
                        draggable="false"
                    />
                </picture>
            </m.div>

            <m.div
                className="portrait__decor"
                aria-hidden="true"
                style={{ x: frameX, y: frameY }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
            >
                <div className="portrait__frame">
                    <Corners />
                </div>
                <div className="portrait__glitch portrait__glitch--a">
                    <div className="portrait__frame">
                        <Corners />
                    </div>
                </div>
                <div className="portrait__glitch portrait__glitch--b" onAnimationEnd={glitch.done}>
                    <div className="portrait__frame">
                        <Corners />
                    </div>
                </div>
                <span className="portrait__rim" />
                <span className="portrait__caption label">
                    <b>HB</b> · {profile.location} · Fig. 01
                </span>
            </m.div>
        </div>
    );
};

export default Portrait;