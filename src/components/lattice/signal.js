// The hero's signal: a tiny event channel between the name and the Lattice.
//
// The page-wide glitch scheduler (hooks/useGlitch.js) decides when the hero name glitches.
// When it does, Hero.jsx emits a signal here with a point on screen beneath the name, and
// the Lattice scene sends a ripple of light out from that point. One beat, one event: the
// mesh never runs a timer of its own, so the two always happen together.
//
// Plain module state rather than React context, so emitting never re-renders anything.

const listeners = new Set();

export function emitHeroSignal(detail) {
    for (const listener of listeners) listener(detail);
}

export function onHeroSignal(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}