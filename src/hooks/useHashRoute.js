import { useCallback, useEffect, useRef, useState } from "react";

// Projects open in place on the one-page site, and stay addressable as #work/<id>.
// Each project article carries id="work/<id>", so following such a link scrolls to it
// natively; this hook then opens its details. Opening or closing a project updates the
// address with replaceState: shareable, but no history entries and no scroll jumps.
const PREFIX = "#work/";

const read = () => (window.location.hash.startsWith(PREFIX) ? decodeURIComponent(window.location.hash.slice(PREFIX.length)) : null);

export function useProjectRoute() {
    const [open, setOpen] = useState(() => {
        const id = typeof window === "undefined" ? null : read();
        return id ? new Set([id]) : new Set();
    });
    const openRef = useRef(open);
    openRef.current = open;

    useEffect(() => {
        const sync = () => {
            const id = read();
            if (id) setOpen((current) => (current.has(id) ? current : new Set(current).add(id)));
        };
        window.addEventListener("hashchange", sync);
        // A deep link on first load: the target only exists once React has rendered.
        const initial = read();
        let frame = 0;
        if (initial) {
            frame = requestAnimationFrame(() => document.getElementById(`work/${initial}`)?.scrollIntoView());
        }
        return () => {
            window.removeEventListener("hashchange", sync);
            cancelAnimationFrame(frame);
        };
    }, []);

    const toggle = useCallback((id) => {
        const opening = !openRef.current.has(id);
        setOpen((current) => {
            const next = new Set(current);
            if (opening) next.add(id);
            else next.delete(id);
            return next;
        });
        if (opening) window.history.replaceState(null, "", `${PREFIX}${id}`);
        else if (read() === id) window.history.replaceState(null, "", "#work");
    }, []);

    const isOpen = useCallback((id) => open.has(id), [open]);

    return { isOpen, toggle };
}