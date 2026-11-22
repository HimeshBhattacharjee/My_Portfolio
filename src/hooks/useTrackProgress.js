import { useEffect } from "react";
import { useMotionValue } from "framer-motion";

// Progress (0 to 1) of a reading line through an element: 0 while the element's top is
// below the line, 1 once its bottom has passed it. The line sits at `anchor` of the
// viewport height (0.6 = 60% down).
//
// Measured from the element's real box on every scroll frame, and again whenever the
// element changes size (details opening or closing, responsive reflow, late fonts), so the
// value is right even when nothing scrolls. Returns a MotionValue: no React re-renders.
export function useTrackProgress(ref, anchor = 0.6) {
    const progress = useMotionValue(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        let frame = 0;

        const measure = () => {
            frame = 0;
            const rect = element.getBoundingClientRect();
            if (rect.height <= 0) return;
            const line = window.innerHeight * anchor;
            progress.set(Math.min(1, Math.max(0, (line - rect.top) / rect.height)));
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        const observer = new ResizeObserver(schedule);
        observer.observe(element);
        document.fonts?.ready.then(schedule);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            observer.disconnect();
        };
    }, [ref, anchor, progress]);

    return progress;
}