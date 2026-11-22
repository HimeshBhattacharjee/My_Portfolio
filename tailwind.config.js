/** @type {import('tailwindcss').Config} */
// Utilities read the semantic tokens in src/styles/tokens.css, so every Tailwind class
// follows the active theme. Do not add raw hex colours here.
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                surface: "var(--surface)",
                line: "var(--line)",
                fg: {
                    DEFAULT: "var(--fg)",
                    strong: "var(--fg-strong)",
                    soft: "var(--fg-soft)",
                    muted: "var(--fg-muted)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    ink: "var(--accent-ink)",
                },
                danger: "var(--danger)",
            },
            fontFamily: {
                sans: ["Archivo", "Arial", "Helvetica Neue", "sans-serif"],
                serif: ["Newsreader", "Georgia", "Times New Roman", "serif"],
                mono: ["IBM Plex Mono", "ui-monospace", "Cascadia Mono", "Consolas", "monospace"],
            },
            maxWidth: {
                shell: "82.5rem",
                measure: "36rem",
            },
            transitionTimingFunction: {
                lumen: "cubic-bezier(0.2, 0.7, 0.2, 1)",
            },
        },
    },
    plugins: [],
};
