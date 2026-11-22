// Navigation text decryption.
//
// A label briefly turns into coded characters, then resolves left to right back into its
// real spelling:  WORK → #@!% → W@!% → WO#% → WOR! → WORK
//
// The real text never leaves the DOM. Each label (see DecryptLabel.jsx) keeps its text in
// place, made transparent while decrypting, and the code is drawn in an aria-hidden overlay
// on top. Screen readers, the link's accessible name and the layout never see the glyphs,
// and nothing shifts width while they change.
//
// One requestAnimationFrame loop drives every label in a run, writing textContent directly,
// so a run costs no React renders. Several labels started together (the touch cycle) share
// one clock: they scramble together, resolve at the same relative pace and settle on the
// same frame.

export const GLYPHS = "#@!%&*/\\+=?";
const HOVER_MS = 560;
export const CYCLE_MS = 760;
// The opening share of a run in which every character is code.
const SCRAMBLED = 0.24;
// How often unresolved characters change glyph. Slower than the frame rate, so the code
// reads as characters being tried rather than noise.
const SWAP_MS = 48;

const REDUCED = "(prefers-reduced-motion: reduce)";
export const reducedMotion = () => window.matchMedia(REDUCED).matches;

const glyph = (avoid) => {
    let next = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    if (next === avoid) next = GLYPHS[(GLYPHS.indexOf(next) + 1) % GLYPHS.length];
    return next;
};

// Every mounted label, for the touch cycle to find.
const labels = new Set();

// A label: `host` wraps the real text and carries data-decrypting; `code` is the overlay.
export function registerLabel(host, code, text) {
    const label = { host, code, text, run: null };
    label.stop = () => stopLabel(label);
    labels.add(label);
    const unregister = () => {
        stopLabel(label);
        labels.delete(label);
    };
    return { label, unregister };
}

function settle(label) {
    label.run = null;
    label.code.textContent = "";
    delete label.host.dataset.decrypting;
}

function stopLabel(label) {
    const run = label.run;
    if (!run) return;
    run.items = run.items.filter((item) => item.label !== label);
    settle(label);
    if (run.items.length === 0) {
        cancelAnimationFrame(run.frame);
        run.resolve();
    }
}

export function isRunning(label) {
    return Boolean(label.run);
}

// Decrypts the given labels together. Returns a promise that resolves when they settle.
export function decrypt(list, duration = HOVER_MS) {
    if (list.length === 0 || reducedMotion()) return Promise.resolve();
    return new Promise((resolve) => {
        const run = { items: [], frame: 0, start: performance.now(), swappedAt: -Infinity, resolve };
        for (const label of list) {
            stopLabel(label);
            label.run = run;
            label.host.dataset.decrypting = "true";
            run.items.push({ label, chars: [...label.text], code: [...label.text].map((char) => glyph(char)) });
        }

        const step = (now) => {
            const progress = Math.min(1, (now - run.start) / duration);
            const swap = now - run.swappedAt >= SWAP_MS;
            if (swap) run.swappedAt = now;
            // 0 during the scrambled opening, then rising to 1, eased so the last characters
            // land a touch more gently than the first.
            const t = progress <= SCRAMBLED ? 0 : (progress - SCRAMBLED) / (1 - SCRAMBLED);
            const resolvedShare = 1 - Math.pow(1 - t, 1.4);

            for (const item of run.items) {
                const { chars, code } = item;
                const resolved = progress >= 1 ? chars.length : Math.floor(resolvedShare * chars.length);
                let out = "";
                for (let i = 0; i < chars.length; i += 1) {
                    if (i < resolved || chars[i] === " ") {
                        out += chars[i];
                    } else {
                        if (swap) code[i] = glyph(code[i]);
                        out += code[i];
                    }
                }
                if (item.label.code.textContent !== out) item.label.code.textContent = out;
            }

            if (progress < 1) {
                run.frame = requestAnimationFrame(step);
                return;
            }
            for (const item of run.items) settle(item.label);
            run.items = [];
            resolve();
        };
        run.frame = requestAnimationFrame(step);
    });
}

/* ------------------------------------------------------------------
   The touch cycle: one scheduler for the whole page.

   Touch screens have no hover, so on devices without hover (or with a coarse pointer)
   every visible navigation label decrypts together, as one event, every five seconds.
   Navigation containers opt in with useDecryptCycle(); the cycle runs only while at least
   one is registered (the phone menu registers only while it is open), and:
     - never overlaps itself: a beat is skipped while the previous run is still going;
     - pauses while the tab is hidden, restarting with a fresh interval on return;
     - rests for a few seconds after the visitor touches or focuses the navigation;
     - does nothing when the visitor prefers reduced motion.
   It only redraws text: it never scrolls, focuses, or changes the active section.
------------------------------------------------------------------- */
export const CYCLE_EVERY_MS = 5000;
const QUIET_AFTER_INTERACTION_MS = 6000;

const containers = new Set();
let timer = 0;
let running = false;
let quietUntil = 0;
let listening = false;

const visible = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";

function beat() {
    timer = 0;
    schedule(CYCLE_EVERY_MS);
    if (running || document.hidden || reducedMotion() || performance.now() < quietUntil) return;
    const batch = [...labels].filter(
        (label) => !label.run && [...containers].some((container) => container.contains(label.host)) && visible(label.host),
    );
    if (batch.length === 0) return;
    running = true;
    decrypt(batch, CYCLE_MS).then(() => {
        running = false;
    });
}

function schedule(delay) {
    window.clearTimeout(timer);
    timer = containers.size > 0 && !document.hidden ? window.setTimeout(beat, delay) : 0;
}

const onVisibility = () => schedule(CYCLE_EVERY_MS);
const onInteract = () => {
    quietUntil = performance.now() + QUIET_AFTER_INTERACTION_MS;
};

// Registers a navigation container with the cycle. `firstDelay` sets when its first run
// happens (e.g. just after the phone menu has finished opening); later runs follow the
// five-second cadence.
export function addCycleContainer(container, firstDelay = CYCLE_EVERY_MS) {
    containers.add(container);
    container.addEventListener("pointerdown", onInteract, { passive: true });
    container.addEventListener("focusin", onInteract);
    if (!listening) {
        listening = true;
        document.addEventListener("visibilitychange", onVisibility);
    }
    schedule(firstDelay);
    return () => {
        containers.delete(container);
        container.removeEventListener("pointerdown", onInteract);
        container.removeEventListener("focusin", onInteract);
        for (const label of labels) if (container.contains(label.host)) label.stop();
        if (containers.size === 0) {
            window.clearTimeout(timer);
            timer = 0;
            listening = false;
            document.removeEventListener("visibilitychange", onVisibility);
        }
    };
}