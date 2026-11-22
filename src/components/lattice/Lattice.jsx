import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "../../theme/context";
import LatticeFallback from "./LatticeFallback";

// Three.js lives in its own chunk, fetched after first paint.
const LatticeScene = lazy(() => import("./LatticeScene"));

// Delay plus duration of the .hero__name opening animation in index.css.
const NAME_ANIMATION_MS = 1700;

function supportsWebGL() {
    try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
        return false;
    }
}

class SceneBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { failed: false };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch() {
        this.props.onError?.();
    }

    render() {
        return this.state.failed ? null : this.props.children;
    }
}

// Mount point for the Lattice. The static SVG is always rendered first; the WebGL
// scene replaces it once it has drawn a frame. With reduced motion, or without WebGL,
// the static version is all that loads.
const Lattice = () => {
    const reducedMotion = useReducedMotion();
    const { theme } = useTheme();
    const hostRef = useRef(null);
    const activeRef = useRef(true);
    // Set by the scene: requests one frame. Needed because an on-demand loop that paused
    // while the hero was off screen has nothing else to restart it.
    const wakeRef = useRef(null);
    const [enabled, setEnabled] = useState(false);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (reducedMotion || !supportsWebGL()) return undefined;
        // Parsing Three.js and compiling the shaders costs a few long frames. Where the name
        // runs its opening width animation (wider than 767px, main-thread layout work), wait
        // until it has finished so the two never compete. Phones skip that animation.
        const nameAnimates = !window.matchMedia("(max-width: 767px)").matches;
        const delay = nameAnimates ? NAME_ANIMATION_MS : 0;
        let idleId = null;
        const timerId = window.setTimeout(() => {
            const start = () => setEnabled(true);
            if ("requestIdleCallback" in window) {
                idleId = window.requestIdleCallback(start, { timeout: 1200 });
            } else {
                start();
            }
        }, delay);
        return () => {
            window.clearTimeout(timerId);
            if (idleId !== null) window.cancelIdleCallback(idleId);
        };
    }, [reducedMotion]);

    // Pause all rendering work while the hero is off screen or the tab is hidden.
    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;
        let onScreen = true;
        const sync = () => {
            const wasActive = activeRef.current;
            activeRef.current = onScreen && document.visibilityState === "visible";
            if (activeRef.current && !wasActive) wakeRef.current?.();
        };
        const observer = new IntersectionObserver(
            ([entry]) => {
                onScreen = entry.isIntersecting;
                sync();
            },
            { threshold: 0.02 },
        );
        observer.observe(host);
        document.addEventListener("visibilitychange", sync);
        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", sync);
        };
    }, []);

    const showScene = enabled && !failed && !reducedMotion;

    return (
        <div ref={hostRef} className="hero__lattice" aria-hidden="true">
            <LatticeFallback hidden={showScene && ready} />
            {showScene && (
                <SceneBoundary onError={() => setFailed(true)}>
                    <Suspense fallback={null}>
                        <div>
                            <LatticeScene
                                activeRef={activeRef}
                                wakeRef={wakeRef}
                                onReady={() => setReady(true)}
                                theme={theme}
                            />
                        </div>
                    </Suspense>
                </SceneBoundary>
            )}
        </div>
    );
};

export default Lattice;