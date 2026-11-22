import { useEffect } from "react";

// Focus-responsive text: written content is fully lit while it sits in the reading region
// of the viewport and steps back (dimmer, very slightly soft) as it leaves at the top or
// bottom. Scrolling back reverses it.
//
// One IntersectionObserver for the whole site, created on first use. It only writes a
// data-focus attribute ("in" or "out"); the transition itself is CSS (see .focus-text in
// interactions.css), so no text block ever re-renders while the page scrolls. Text stays in
// the DOM, selectable and readable by assistive technology; nothing is display:none.
//
// The effect uses filter: opacity() blur() and the independent `translate` property, never
// `opacity` or `transform`, so it can sit on elements Framer Motion also animates.
//
// Text being read is never dimmed: hover and focus-within hold it lit (CSS), and so does an
// active text selection inside it (one selectionchange listener, below).

let observer = null;
let selectionBound = false;
const held = new Set();

function getObserver() {
    if (observer) return observer;
    observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                entry.target.dataset.focus = entry.isIntersecting ? "in" : "out";
            }
        },
        // The reading region: everything but a band at the top (under the navigation) and
        // the bottom of the viewport.
        { rootMargin: "-12% 0px -14% 0px" },
    );
    return observer;
}

function bindSelection() {
    if (selectionBound) return;
    selectionBound = true;
    document.addEventListener("selectionchange", () => {
        const selection = document.getSelection();
        const node = selection && !selection.isCollapsed ? selection.anchorNode : null;
        const element = node ? (node.nodeType === 1 ? node : node.parentElement) : null;
        const host = element?.closest(".focus-text") ?? null;
        held.forEach((item) => {
            if (item !== host) {
                delete item.dataset.hold;
                held.delete(item);
            }
        });
        if (host && !held.has(host)) {
            host.dataset.hold = "true";
            held.add(host);
        }
    });
}

export function useFocusText(ref) {
    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === "undefined") return undefined;
        bindSelection();
        const io = getObserver();
        io.observe(element);
        return () => {
            io.unobserve(element);
            delete element.dataset.focus;
            held.delete(element);
        };
    }, [ref]);
}