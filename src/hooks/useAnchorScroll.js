import { useEffect } from "react";

// In-page links (#work, #top, #work/<id>, ...) scroll smoothly via CSS. Chrome cancels a
// smooth scroll part-way when certain things change under it on the way: here the
// Journey's cards opening and closing (their panels switch `inert`) as the page passes
// them. A long jump, such as Back to top from the footer, then stops mid-page.
//
// This guard leaves the native navigation alone (the hash still changes, so project deep
// links still open their details) and only finishes the journey: when scrolling settles
// short of the target, it continues from there, a few times at most. It stands down the
// moment the visitor scrolls, touches or presses a key themselves.
const SETTLE_MS = 140;
const MAX_TRIES = 4;
const TOLERANCE = 6;

export function useAnchorScroll() {
    useEffect(() => {
        let cleanup = () => { };

        const onClick = (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = event.target.closest?.('a[href^="#"]');
            if (!link) return;
            const id = decodeURIComponent(link.getAttribute("href").slice(1));
            const target = id && document.getElementById(id);
            if (!target) return;

            cleanup();
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
            let tries = 0;
            let timer = 0;

            const reached = () => {
                const top = target.getBoundingClientRect().top;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                // At the target, or as close as the page allows (the very top or bottom).
                return Math.abs(top - offset) <= TOLERANCE || (top > offset && window.scrollY <= 0) || (top < offset && window.scrollY >= maxScroll - 1);
            };

            const settle = () => {
                if (reached() || tries >= MAX_TRIES) return cleanup();
                tries += 1;
                target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
            };

            const onScroll = () => {
                window.clearTimeout(timer);
                timer = window.setTimeout(settle, SETTLE_MS);
            };

            const standDown = () => cleanup();

            window.addEventListener("scroll", onScroll, { passive: true });
            window.addEventListener("wheel", standDown, { passive: true });
            window.addEventListener("touchstart", standDown, { passive: true });
            window.addEventListener("keydown", standDown);
            const expiry = window.setTimeout(standDown, 8000);

            cleanup = () => {
                window.clearTimeout(timer);
                window.clearTimeout(expiry);
                window.removeEventListener("scroll", onScroll);
                window.removeEventListener("wheel", standDown);
                window.removeEventListener("touchstart", standDown);
                window.removeEventListener("keydown", standDown);
                cleanup = () => { };
            };
        };

        document.addEventListener("click", onClick);
        return () => {
            document.removeEventListener("click", onClick);
            cleanup();
        };
    }, []);
}