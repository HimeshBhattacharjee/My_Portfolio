import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { ThemeContext } from "./context";

// Theme management.
//
// First paint: the inline script in index.html has already written data-theme on <html>
// (saved choice, otherwise the system preference), so there is no flash of the wrong
// theme. This provider only takes over from there:
//   - a visitor's explicit choice is saved in localStorage and restored next time;
//   - until they choose, the site keeps following the system preference live;
//   - switching cross-fades colours, or, where the View Transitions API exists, reveals
//     the new theme as a circle growing from the toggle.

const STORAGE_KEY = "hb-theme"; // Also read by the inline script in index.html.
const THEME_COLOR = { dark: "#0A0B0D", light: "#F4F1EA" };

const readSaved = () => {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved === "light" || saved === "dark" ? saved : null;
    } catch {
        return null;
    }
};

const systemTheme = () => (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

function applyTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => document.documentElement.dataset.theme || readSaved() || systemTheme());

    // Keep following the system until the visitor makes a choice of their own.
    useEffect(() => {
        const query = window.matchMedia("(prefers-color-scheme: light)");
        const onChange = () => {
            if (readSaved()) return;
            const next = query.matches ? "light" : "dark";
            applyTheme(next);
            setThemeState(next);
        };
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    const setTheme = useCallback((next, origin) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* Storage unavailable: the choice lasts for this visit only. */
        }

        const commit = () => {
            applyTheme(next);
            setThemeState(next);
        };

        if (prefersReducedMotion()) {
            commit();
            return;
        }

        if (document.startViewTransition && origin) {
            const { x, y } = origin;
            const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
            const transition = document.startViewTransition(() => flushSync(commit));
            transition.ready
                .then(() => {
                    document.documentElement.animate(
                        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                        { duration: 620, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
                    );
                })
                .catch(() => { });
            return;
        }

        const root = document.documentElement;
        root.classList.add("theme-switching");
        commit();
        window.setTimeout(() => root.classList.remove("theme-switching"), 520);
    }, []);

    const toggleTheme = useCallback((origin) => setTheme(theme === "dark" ? "light" : "dark", origin), [setTheme, theme]);

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}