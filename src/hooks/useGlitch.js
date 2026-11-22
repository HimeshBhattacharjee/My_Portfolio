import { useCallback, useEffect, useRef, useState } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const reducedMotion = () => window.matchMedia(REDUCED).matches;

// State for a one-shot glitch. play() switches it on (ignored while already playing or
// when the visitor prefers reduced motion); done() is wired to the animated layer's
// animationend. Nothing ever loops. Who calls play() is the scheduler's business below.
export function useGlitch() {
    const [on, setOn] = useState(false);
    const timer = useRef(0);
    const playing = useRef(false);

    const done = useCallback(() => {
        playing.current = false;
        window.clearTimeout(timer.current);
        setOn(false);
    }, []);

    // Returns true when a glitch actually started, so a caller can tie other effects to it.
    const play = useCallback(() => {
        if (playing.current || reducedMotion()) return false;
        playing.current = true;
        setOn(true);
        // Safety net in case animationend never fires (element hidden mid-play).
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(done, 900);
        return true;
    }, [done]);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    return { on, play, done };
}

/* ------------------------------------------------------------------
   The ambient glitch scheduler.

   One timer for the whole page, on a fixed five-second cadence. On every beat it:
     1. looks at the registered targets that are currently on screen (at least half
        visible, measured by one shared IntersectionObserver);
     2. chooses one: the target that has waited longest, scaled by its weight, and never
        the same target twice in a row when there is a choice. Heavier targets (the hero
        name) come round more often; the logo, at a low weight, only now and then;
     3. plays that one target's short glitch (about 0.5 s) and nothing else;
     4. waits for the next beat. Beats are measured from the schedule, not from the end of
        the previous glitch, so the rhythm does not drift.

   Never two at once: a beat is skipped if the previous glitch is somehow still running.
   Off-screen elements never play. If nothing eligible is on screen, or the only element
   on screen played on the previous beat, the beat passes quietly. Paused entirely while the tab is hidden (and restarted with a fresh five
   seconds when it returns), while nothing is registered, and when the visitor prefers
   reduced motion. Hover, focus, touch and scroll play no part.
------------------------------------------------------------------- */
export const GLITCH_CADENCE_MS = 5000;
const GLITCH_BUSY_MS = 900;

const targets = new Set();
let timer = 0;
let nextBeat = 0;
let busyUntil = 0;
let last = null;
let observer = null;
let listening = false;

function pick(now) {
    // Never the same target on two consecutive beats. When the only target on screen has
    // just played, this beat rests, so a lone element glitches at most every ten seconds
    // instead of flickering every five.
    const pool = [...targets].filter((target) => target.visible && target !== last);
    let best = null;
    let bestScore = -Infinity;
    for (const target of pool) {
        const score = (now - target.playedAt + GLITCH_CADENCE_MS) * target.weight;
        if (score > bestScore) {
            best = target;
            bestScore = score;
        }
    }
    return best;
}

function beat() {
    timer = 0;
    const now = performance.now();
    if (now >= busyUntil) {
        const target = pick(now);
        last = target;
        if (target) {
            target.playedAt = now;
            busyUntil = now + GLITCH_BUSY_MS;
            target.play.current();
        }
    }
    nextBeat += GLITCH_CADENCE_MS;
    // If the page was throttled and beats were missed, rejoin the cadence rather than
    // firing the missed beats back to back.
    if (nextBeat <= now) nextBeat = now + GLITCH_CADENCE_MS;
    timer = window.setTimeout(beat, nextBeat - now);
}

function start() {
    stop();
    if (targets.size === 0 || document.hidden || reducedMotion()) return;
    nextBeat = performance.now() + GLITCH_CADENCE_MS;
    timer = window.setTimeout(beat, GLITCH_CADENCE_MS);
}

function stop() {
    window.clearTimeout(timer);
    timer = 0;
}

// Tab hidden: stop. Visible again: a fresh five seconds, so nothing fires the moment the
// visitor returns.
const onVisibility = () => start();

function listen() {
    if (listening) return;
    listening = true;
    document.addEventListener("visibilitychange", onVisibility);
    window.matchMedia(REDUCED).addEventListener?.("change", onVisibility);
    observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                const target = entry.target.__glitchTarget;
                if (target) target.visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
            }
        },
        { threshold: [0, 0.5, 1] },
    );
}

function unlisten() {
    if (!listening || targets.size > 0) return;
    listening = false;
    document.removeEventListener("visibilitychange", onVisibility);
    window.matchMedia(REDUCED).removeEventListener?.("change", onVisibility);
    observer?.disconnect();
    observer = null;
    stop();
    last = null;
}

// Registers an element with the scheduler. `play` is called when it is chosen; `weight`
// sets how often it is chosen relative to the others (1 = a section heading).
export function useAmbientGlitch(ref, play, weight = 1, enabled = true) {
    const playRef = useRef(play);
    playRef.current = play;

    useEffect(() => {
        const element = ref.current;
        if (!element || !enabled) return undefined;
        listen();
        const target = { play: playRef, weight, visible: false, playedAt: performance.now() };
        element.__glitchTarget = target;
        targets.add(target);
        observer.observe(element);
        if (!timer) start();
        return () => {
            observer?.unobserve(element);
            delete element.__glitchTarget;
            targets.delete(target);
            if (last === target) last = null;
            if (targets.size === 0) unlisten();
        };
    }, [ref, weight, enabled]);
}
