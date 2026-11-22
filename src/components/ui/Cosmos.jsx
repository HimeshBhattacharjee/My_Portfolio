import { useEffect, useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";

/* ------------------------------------------------------------------
   Cosmos: the quiet space environment behind the Journey, Contact and the footer.

   Pure CSS and SVG. No canvas, no particle library, no per-frame JavaScript:
   - nebula: layered radial gradients in the theme's cyan, violet and deep tones,
     drifting very slowly;
   - stars: two tiled SVG masks filled with --cosmos-star, so one tile gives white
     points of light in the dark theme and inked blue points on paper. The near
     layer breathes (an opacity animation on one layer, compositor only);
   - constellations: a few fine figures, kept to the margins of the content;
   - parallax: the star layers drift a few dozen pixels with scroll (transform only).

   Animations pause (animation-play-state) while the section is well outside the
   viewport. Reduced motion: no drift, no breathing, no parallax. Phones: no parallax.
------------------------------------------------------------------- */

// Deterministic, so the sky is the same on every visit and in every render.
function seeded(seed) {
    let t = seed >>> 0;
    return () => {
        t = (t + 0x6d2b79f5) >>> 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function starTile(size, count, [rMin, rMax], seed) {
    const random = seeded(seed);
    let dots = "";
    for (let i = 0; i < count; i += 1) {
        const x = (random() * size).toFixed(1);
        const y = (random() * size).toFixed(1);
        const r = (rMin + random() * (rMax - rMin)).toFixed(2);
        const o = (0.35 + random() * 0.65).toFixed(2);
        dots += `<circle cx='${x}' cy='${y}' r='${r}' fill-opacity='${o}'/>`;
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${dots}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const FAR = starTile(380, 16, [0.45, 0.85], 7);
const NEAR = starTile(820, 11, [0.9, 1.6], 23);

// Constellations: points in a 100 x 70 box and the lines between them. Positions keep
// them in the margins and the empty half of each timeline row.
const FIGURES = {
    a: { points: [[6, 52], [22, 40], [38, 46], [55, 22], [71, 30], [92, 12]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
    b: { points: [[10, 14], [30, 30], [24, 58], [52, 50], [74, 62], [88, 38]], lines: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]] },
    c: { points: [[8, 30], [26, 18], [46, 26], [60, 50], [82, 44], [64, 10]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]] },
};

const PLACEMENTS = {
    journey: [
        { figure: "a", style: { top: "9%", left: "2%" }, width: 220 },
        { figure: "b", style: { top: "34%", right: "3%" }, width: 190 },
        { figure: "c", style: { top: "61%", left: "4%" }, width: 210 },
        { figure: "a", style: { top: "87%", right: "5%" }, width: 170 },
    ],
    contact: [
        { figure: "b", style: { top: "12%", left: "40%" }, width: 200 },
        { figure: "c", style: { bottom: "16%", left: "3%" }, width: 180 },
    ],
    // In the open space between the brand block and the index, clear of every link.
    footer: [{ figure: "a", style: { top: "12%", left: "34%" }, width: 150 }],
};

function Constellation({ figure, style, width }) {
    const { points, lines } = FIGURES[figure];
    return (
        <svg className="cosmos__figure" style={{ ...style, width }} viewBox="0 0 100 70" aria-hidden="true" focusable="false">
            {lines.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} vectorEffect="non-scaling-stroke" />
            ))}
            {points.map(([x, y], index) => (
                <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 1.3 : 0.9} />
            ))}
        </svg>
    );
}

const Cosmos = ({ variant = "journey", className = "" }) => {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const wide = useMediaQuery("(min-width: 768px)");
    const parallax = wide && !reduced;

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const farY = useTransform(scrollYProgress, [0, 1], [-24, 24]);
    const nearY = useTransform(scrollYProgress, [0, 1], [-70, 70]);
    const figY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

    // Pause ambient animation while the section is far from the viewport.
    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        const observer = new IntersectionObserver(
            ([entry]) => element.setAttribute("data-active", entry.isIntersecting ? "true" : "false"),
            { rootMargin: "30% 0px" },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`cosmos cosmos--${variant} ${className}`} data-active="false" aria-hidden="true">
            <span className="cosmos__nebula" />
            <m.span className="cosmos__stars cosmos__stars--far" style={{ "--tile": FAR, y: parallax ? farY : 0 }} />
            <m.span className="cosmos__stars cosmos__stars--near" style={{ "--tile": NEAR, y: parallax ? nearY : 0 }} />
            <m.span className="cosmos__figures" style={{ y: parallax ? figY : 0 }}>
                {PLACEMENTS[variant].map((placement, index) => (
                    <Constellation key={index} {...placement} />
                ))}
            </m.span>
        </div>
    );
};

export default Cosmos;