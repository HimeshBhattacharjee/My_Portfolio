import { useCallback, useEffect, useRef, useState } from "react";

// Which item of a list is "in focus": the one crossing a thin band across the viewport.
//
// One IntersectionObserver for the whole list, never a scroll listener. The band is a
// horizontal strip (by default 8% of the viewport, centred), so at most two neighbouring
// items can touch it at once. Hysteresis keeps the result stable: the current item keeps
// focus until it has fully left the band, so two items close together never flicker
// between each other, and scrolling back up hands focus back in reverse order.
//
// Returns the focused index (null until the first item reaches the band) and a ref
// callback factory: <li ref={register(index)}>.
export function useFocusBand({ top = 46, bottom = 46 } = {}) {
    const [active, setActive] = useState(null);
    const elements = useRef(new Map());
    const inside = useRef(new Set());
    const observer = useRef(null);

    const choose = useCallback(() => {
        setActive((current) => {
            const candidates = [...inside.current];
            if (current !== null && inside.current.has(current)) return current;
            // Between items (or outside the list): hold the last one.
            if (candidates.length === 0) return current;
            if (current === null) return Math.min(...candidates);
            // The neighbour nearest the old focus: the direction of travel.
            return candidates.sort((a, b) => Math.abs(a - current) - Math.abs(b - current))[0];
        });
    }, []);

    useEffect(() => {
        const touching = inside.current;
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const index = Number(entry.target.dataset.focusIndex);
                    if (entry.isIntersecting) inside.current.add(index);
                    else inside.current.delete(index);
                }
                choose();
            },
            { rootMargin: `-${top}% 0px -${bottom}% 0px` },
        );
        observer.current = io;
        elements.current.forEach((element) => io.observe(element));
        return () => {
            io.disconnect();
            observer.current = null;
            touching.clear();
        };
    }, [top, bottom, choose]);

    // One stable ref callback per index, so React never detaches and re-attaches a row
    // on re-render (which would make the observer forget and re-learn it).
    const callbacks = useRef(new Map());
    const register = useCallback((index) => {
        if (!callbacks.current.has(index)) {
            callbacks.current.set(index, (element) => {
                const previous = elements.current.get(index);
                if (previous === element) return;
                if (previous) observer.current?.unobserve(previous);
                if (element) {
                    element.dataset.focusIndex = String(index);
                    elements.current.set(index, element);
                    observer.current?.observe(element);
                } else {
                    elements.current.delete(index);
                    inside.current.delete(index);
                }
            });
        }
        return callbacks.current.get(index);
    }, []);

    return [active, register];
}