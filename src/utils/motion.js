// ------------------------------------------------------------------
// Luminescence motion conventions.
// One vocabulary: content moves from dim to lit with a short rise and a touch of focus.
// MotionConfig reducedMotion="user" (see App.jsx) removes the movement for visitors who
// ask for reduced motion; opacity changes remain, so nothing is ever left hidden.
//
// Reveals replay. Every section reveal uses `inView` below: it plays when the block comes
// into view, returns to its resting state once the block has left the viewport entirely,
// and plays again on the way back, in either scroll direction. Framer Motion enters at the
// `amount` threshold but only leaves when the element is fully out of view, so a block
// hovering at the viewport edge never flickers between states.
// ------------------------------------------------------------------
export const EASE = [0.2, 0.7, 0.2, 1];

export const reveal = {
    hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
};

export const revealGroup = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

// Shared viewport settings for every replaying reveal. `amount` is low enough that tall
// blocks on a phone still reach it.
export const inView = { once: false, amount: 0.2 };
export const inViewLoose = { once: false, amount: 0.1 };

// Wipe from left to right: for titles that should read as being written in, not faded in.
export const wipe = {
    hidden: { clipPath: "inset(0 100% 0 0)" },
    show: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

// Fine line drawing, for SVG strokes (the credential seal, rules).
export const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

// Project previews arrive from slightly below and tilted back, settling flat: a plate
// being laid on the table. Perspective is set on the element, so no wrapper is needed.
export const figureIn = {
    hidden: { opacity: 0, y: 36, rotateX: 9, transformPerspective: 1400 },
    show: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1400, transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] } },
};