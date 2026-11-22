import { useId } from "react";
import { m } from "framer-motion";
import { useTheme } from "../../theme/context";

const spring = { type: "spring", stiffness: 260, damping: 22 };
const RAYS = Array.from({ length: 8 }, (_, index) => (index * Math.PI) / 4);

// A sun that sets into a moon. The disc grows and a second disc slides across it to carve
// the crescent; the rays retract. The label always names the action, not the state.
const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();
    const dark = theme === "dark";
    const next = dark ? "light" : "dark";
    const maskId = `theme-mask-${useId().replace(/:/g, "")}`;

    const onClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        // Keyboard activation reports 0,0; start the reveal from the button's centre instead.
        const keyboard = event.clientX === 0 && event.clientY === 0;
        toggleTheme({
            x: keyboard ? rect.left + rect.width / 2 : event.clientX,
            y: keyboard ? rect.top + rect.height / 2 : event.clientY,
        });
    };

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`}
            onClick={onClick}
            aria-label={`Switch to ${next} theme`}
            title={`Switch to ${next} theme`}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <mask id={maskId}>
                    <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
                    <m.circle r="6.5" fill="#000" initial={false} animate={{ cx: dark ? 16.5 : 30, cy: dark ? 8 : 0 }} transition={spring} />
                </mask>
                <m.circle
                    cx="12"
                    cy="12"
                    fill="currentColor"
                    mask={`url(#${maskId})`}
                    initial={false}
                    animate={{ r: dark ? 8 : 4.6 }}
                    transition={spring}
                />
                <m.g
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ opacity: dark ? 0 : 1, rotate: dark ? -45 : 0, scale: dark ? 0.6 : 1 }}
                    style={{ originX: "12px", originY: "12px" }}
                    transition={spring}
                >
                    {RAYS.map((angle) => (
                        <line
                            key={angle}
                            x1={12 + Math.cos(angle) * 7.6}
                            y1={12 + Math.sin(angle) * 7.6}
                            x2={12 + Math.cos(angle) * 9.8}
                            y2={12 + Math.sin(angle) * 9.8}
                        />
                    ))}
                </m.g>
            </svg>
        </button>
    );
};

export default ThemeToggle;