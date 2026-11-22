import { useEffect, useState } from "react";

// Reports which section currently occupies the middle of the viewport.
export function useActiveSection(ids) {
    const [active, setActive] = useState("");
    const key = ids.join(",");

    useEffect(() => {
        const elements = key
            .split(",")
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        if (elements.length === 0) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                    else setActive((current) => (current === entry.target.id ? "" : current));
                });
            },
            { rootMargin: "-45% 0px -50% 0px" },
        );
        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [key]);

    return active;
}

// True once the page has scrolled past the given distance.
export function useScrolled(offset = 24) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > offset);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [offset]);

    return scrolled;
}