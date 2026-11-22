import { useId, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { EASE } from "../../utils/motion";
import FlowStrip from "./FlowStrip";

// Illustrative figures for Selected Work. Every figure is drawn in code, populated with
// obviously synthetic content, and captioned as illustrative wherever it is shown.
// None of them reproduces a real screen, a real device or real data.

const draw = (reduced, delay = 0, duration = 0.9) =>
    reduced
        ? { initial: false }
        : {
            initial: { pathLength: 0, opacity: 0 },
            whileInView: { pathLength: 1, opacity: 1 },
            viewport: { once: false, amount: 0.5 },
            transition: { pathLength: { duration, ease: EASE, delay }, opacity: { duration: 0.01, delay } },
        };

const appear = (reduced, delay = 0) =>
    reduced
        ? { initial: false }
        : {
            initial: { opacity: 0, y: 8 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: false, amount: 0.5 },
            transition: { duration: 0.6, ease: EASE, delay },
        };

/* ------------------------------------------------------------------
   IntuitIQ: the canvas and the text panel, as two modes
------------------------------------------------------------------- */

const TOOLS = ["Select", "Pencil", "Line", "Rect", "Ellipse", "Text", "Eraser"];

const MODES = [
    {
        id: "canvas",
        label: "Draw",
        model: "Gemini 2.0 Flash",
        expr: "Right triangle, legs 3 and 4",
        steps: ["c² = 3² + 4²", "c² = 9 + 16 = 25", "c = √25"],
        result: "c = 5",
    },
    {
        id: "text",
        label: "Type",
        model: "Mistral Large",
        expr: "P(both red), 2 drawn without replacement",
        steps: ["P(1st red) = 3/8", "P(2nd red) = 2/7", "P = 3/8 × 2/7 = 6/56"],
        result: "P = 0.1071",
    },
];

const QUESTION = "A bag holds 3 red and 5 blue balls. Two are drawn without replacement. What is the probability both are red?";

function IntuitCanvas({ reduced }) {
    const gridId = useId();
    return (
        <svg viewBox="0 0 520 380" className="fig-iq__svg" aria-hidden="true" focusable="false">
            <defs>
                <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" style={{ fill: "var(--line)" }} />
                </pattern>
            </defs>
            <rect width="520" height="380" fill={`url(#${gridId})`} />
            <g fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--fg)" }}>
                <m.path d="M101 81 C 99 140, 103 220, 100 301" {...draw(reduced, 0.1, 0.7)} />
                <m.path d="M100 301 C 180 303, 270 298, 341 300" {...draw(reduced, 0.75, 0.7)} />
                <m.path d="M342 299 C 270 240, 180 150, 101 81" {...draw(reduced, 1.4, 0.8)} />
                <m.path d="M100 277 L 124 278 L 125 301" strokeWidth="1.6" {...draw(reduced, 2.1, 0.4)} />
            </g>
            <m.g className="fig-iq__hand" {...appear(reduced, 2.3)}>
                <text x="74" y="200">3</text>
                <text x="212" y="336">4</text>
                <text x="232" y="178">c = ?</text>
            </m.g>
        </svg>
    );
}

function IntuitText({ reduced }) {
    const words = QUESTION.split(" ");
    return (
        <div className="fig-iq__editor" aria-hidden="true">
            <div className="fig-iq__editor-bar">
                <span>B</span>
                <span>I</span>
                <span>U</span>
                <span>x²</span>
                <span>x₂</span>
            </div>
            <p className="fig-iq__question">
                {words.map((word, index) => (
                    <m.span
                        key={`${word}-${index}`}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: reduced ? 0 : 0.15 + index * 0.04 }}
                    >
                        {word}{" "}
                    </m.span>
                ))}
            </p>
        </div>
    );
}

export function IntuitIQFigure() {
    const reduced = useReducedMotion();
    const [mode, setMode] = useState("canvas");
    const active = MODES.find((item) => item.id === mode);
    const tabsId = useId();

    return (
        <div className="fig fig-iq">
            <div className="fig-iq__chrome">
                <span className="label">IntuitIQ</span>
                <div role="tablist" aria-label="Input mode" className="fig-iq__tabs">
                    {MODES.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            id={`${tabsId}-${item.id}`}
                            aria-selected={mode === item.id}
                            aria-controls={`${tabsId}-panel`}
                            className="fig-iq__tab"
                            onClick={() => setMode(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <span className="label fig-iq__model">{active.model}</span>
            </div>

            <div
                className="fig-iq__body"
                role="tabpanel"
                id={`${tabsId}-panel`}
                aria-labelledby={`${tabsId}-${mode}`}
            >
                <ul className="fig-iq__tools" aria-hidden="true">
                    {TOOLS.map((tool, index) => (
                        <li key={tool} data-on={mode === "canvas" && index === 1}>
                            {tool.slice(0, 2)}
                        </li>
                    ))}
                </ul>

                <div className="fig-iq__stage">
                    {mode === "canvas" ? <IntuitCanvas reduced={reduced} /> : <IntuitText reduced={reduced} />}

                    <m.div
                        key={mode}
                        className="fig-iq__answer"
                        {...(reduced
                            ? {}
                            : {
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                transition: { duration: 0.6, ease: EASE, delay: mode === "canvas" ? 2.6 : 1.3 },
                            })}
                    >
                        <p className="sr-only">
                            Example answer. Expression: {active.expr}. Steps: {active.steps.join("; ")}. Result: {active.result}.
                        </p>
                        <div aria-hidden="true">
                            <dl>
                                <dt className="label">expr</dt>
                                <dd>{active.expr}</dd>
                                <dt className="label">steps</dt>
                                <dd>
                                    <ol>
                                        {active.steps.map((step) => (
                                            <li key={step}>{step}</li>
                                        ))}
                                    </ol>
                                </dd>
                                <dt className="label">result</dt>
                                <dd className="fig-iq__result">{active.result}</dd>
                            </dl>
                        </div>
                    </m.div>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
   Sign Language Gloves: a blueprint, in a different visual language
------------------------------------------------------------------- */

// Schematic fingertip positions in the 640 x 400 drawing.
const SENSORS = [
    { name: "thumb", x: 52, y: 196 },
    { name: "index finger", x: 104, y: 70 },
    { name: "middle finger", x: 150, y: 52 },
    { name: "ring finger", x: 196, y: 66 },
    { name: "little finger", x: 236, y: 106 },
];

const GLOVE_FLOW = ["Pressure sensors", "Arduino UNO", "Bluetooth", "Text / Speech"];

// The signal path is the whole story: no readings, no values. Left alone, a pulse of light
// runs sensors, microcontroller, wireless link, output, on a loop (CSS, paused off screen).
// Pressing a fingertip takes over: that sensor and the full path light up together.
export function GloveFigure() {
    const reduced = useReducedMotion();
    const [active, setActive] = useState(null);
    const gridId = useId();
    const ref = useRef(null);
    const inView = useInView(ref, { amount: 0.35 });
    const lit = active !== null;
    const playing = inView && !reduced && !lit;

    return (
        <div ref={ref} className="fig fig-glove" data-playing={playing} data-lit={lit}>
            <div className="fig-glove__plate">
                <svg viewBox="0 0 640 400" className="fig-glove__svg" aria-hidden="true" focusable="false">
                    <defs>
                        <pattern id={gridId} width="16" height="16" patternUnits="userSpaceOnUse">
                            <path d="M16 0H0V16" fill="none" strokeWidth="1" style={{ stroke: "var(--surface-2)" }} />
                        </pattern>
                    </defs>
                    <rect width="640" height="400" fill={`url(#${gridId})`} />

                    {/* Glove outline */}
                    <g fill="none" strokeWidth="1.3" strokeLinejoin="round" style={{ stroke: "var(--fg-soft)" }}>
                        <m.path
                            d="M80 360 L80 250 C 70 236, 52 222, 40 200 C 34 186, 46 176, 58 184 L 92 222 L 92 92 C 92 76, 116 76, 116 92 L 116 180 L 138 180 L 138 72 C 138 56, 162 56, 162 72 L 162 180 L 184 180 L 184 86 C 184 70, 208 70, 208 86 L 208 186 L 226 186 L 226 124 C 226 110, 248 110, 248 124 L 248 300 C 248 330, 236 350, 228 360 Z"
                            {...draw(reduced, 0.1, 1.6)}
                        />
                        <m.path d="M80 330 H228 M80 342 H228" strokeDasharray="3 4" {...draw(reduced, 1.2, 0.6)} />
                    </g>

                    {/* Sensor leads: from each fingertip down to the cuff. */}
                    <g className="fig-glove__leads" fill="none" strokeWidth="1">
                        {SENSORS.map((sensor, index) => (
                            <path key={sensor.name} d={`M${sensor.x} ${sensor.y + 8} V ${300 - index * 3} H 228`} data-lit={active === index} />
                        ))}
                    </g>

                    {/* Signal path: glove, microcontroller, wireless link, output */}
                    <g fill="none" strokeWidth="1.3" className="fig-glove__wire">
                        <m.path d="M228 300 H 300 V 222 H 336" {...draw(reduced, 1.4, 0.6)} />
                        <m.path d="M456 222 H 486" {...draw(reduced, 1.9, 0.3)} />
                    </g>
                    {/* Travelling signal: a short dash of light run along each wire in turn. */}
                    <g fill="none" strokeWidth="2.2" strokeLinecap="round" className="fig-glove__signal">
                        <path className="fig-glove__signal-a" d="M228 300 H 300 V 222 H 336" pathLength="100" />
                        <path className="fig-glove__signal-b" d="M456 222 H 486" pathLength="100" />
                    </g>
                    <g className="fig-glove__waves" fill="none" strokeWidth="1.3">
                        <path d="M494 208 q 10 14 0 28" />
                        <path d="M504 200 q 16 22 0 44" />
                    </g>

                    {/* Arduino UNO, schematic */}
                    <m.g {...appear(reduced, 1.6)} className="fig-glove__board">
                        <rect x="336" y="176" width="120" height="92" strokeWidth="1.3" className="fig-glove__box" />
                        {Array.from({ length: 10 }, (_, i) => (
                            <rect key={i} x={346 + i * 10} y="182" width="5" height="7" style={{ fill: "var(--line)" }} />
                        ))}
                        <rect x="376" y="214" width="40" height="22" fill="none" className="fig-glove__chip" />
                        <text x="396" y="254" className="fig-glove__mono" textAnchor="middle">
                            ARDUINO UNO
                        </text>
                    </m.g>

                    {/* Output: text and speech */}
                    <m.g {...appear(reduced, 2.0)} className="fig-glove__out">
                        <rect x="524" y="176" width="100" height="92" strokeWidth="1.3" className="fig-glove__box" />
                        <text x="536" y="198" className="fig-glove__mono">
                            TEXT
                        </text>
                        <text x="536" y="228" className="fig-glove__word">
                            {lit ? "Hello" : "· · ·"}
                        </text>
                        <path className="fig-glove__speaker" d="M538 246 h6 l8 -6 v16 l-8 -6 h-6 z" />
                        <path className="fig-glove__speaker-waves" d="M558 242 q 5 6 0 12 M563 238 q 9 10 0 20" fill="none" strokeWidth="1.2" />
                        <text x="574" y="253" className="fig-glove__mono">
                            SPEECH
                        </text>
                    </m.g>

                    {/* Annotations */}
                    <g className="fig-glove__mono">
                        <text x="490" y="292" textAnchor="middle">
                            BLUETOOTH
                        </text>
                        <text x="80" y="384">PRESSURE SENSORS · SCHEMATIC</text>
                        <text x="336" y="164">MICROCONTROLLER</text>
                        <text x="524" y="164">OUTPUT</text>
                    </g>

                    {/* Sensors */}
                    {SENSORS.map((sensor, index) => (
                        <circle
                            key={sensor.name}
                            cx={sensor.x}
                            cy={sensor.y}
                            r="7"
                            className="fig-glove__sensor"
                            data-lit={active === index}
                            style={{ "--i": index }}
                        />
                    ))}
                </svg>

                {/* Real controls placed over each fingertip. */}
                {SENSORS.map((sensor, index) => (
                    <button
                        key={sensor.name}
                        type="button"
                        className="fig-glove__hit"
                        style={{ left: `${(sensor.x / 640) * 100}%`, top: `${(sensor.y / 400) * 100}%` }}
                        aria-pressed={active === index}
                        aria-label={`Press the ${sensor.name} sensor`}
                        onClick={() => setActive(active === index ? null : index)}
                        onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
                        onPointerLeave={(event) => event.pointerType === "mouse" && setActive(null)}
                    />
                ))}
            </div>
            <div className="fig-glove__foot">
                <FlowStrip steps={GLOVE_FLOW} playing={playing} lit={lit ? GLOVE_FLOW.length - 1 : null} label="Signal path" className="flow--mono" />
                <p className="fig-glove__hint label" aria-live="polite">
                    {lit ? `${SENSORS[active].name}: gesture recognised, sent and spoken` : "Press a fingertip"}
                </p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
   IntelliView: one session in four stages, as tabs
------------------------------------------------------------------- */

// Each stage shows what that step of the app produces, as structure only. No score, no
// feedback text and no results are shown: the prototype's real outputs depend on the résumé.
const IV_STAGES = [
    { id: "upload", label: "Upload", tool: "PyMuPDF", note: "The résumé PDF is uploaded and previewed in the app." },
    { id: "analyse", label: "Analyse", tool: "Gemini 1.5 Flash", note: "An ATS compatibility score out of 100, strengths, weaknesses and recommendations." },
    { id: "practise", label: "Practise", tool: "Gemini 1.5 Flash", note: "Interview questions drawn from the résumé, in three tracks." },
    { id: "report", label: "Report", tool: "Plotly · FPDF", note: "Feedback charts, and the whole session as a downloadable PDF." },
];

function Skeleton({ widths }) {
    return (
        <span className="fig-iv__lines" aria-hidden="true">
            {widths.map((width, index) => (
                <i key={index} style={{ width: `${width}%` }} />
            ))}
        </span>
    );
}

function IvPanel({ stage }) {
    if (stage === "upload") {
        return (
            <div className="fig-iv__view fig-iv__view--upload">
                <div className="fig-iv__doc">
                    <span className="label">resume.pdf</span>
                    <Skeleton widths={[86, 64, 92, 48, 78, 70, 56, 82, 44]} />
                </div>
                <div className="fig-iv__drop">
                    <span className="label">PDF preview</span>
                    <Skeleton widths={[70, 54, 62]} />
                </div>
            </div>
        );
    }
    if (stage === "analyse") {
        return (
            <div className="fig-iv__view fig-iv__view--analyse">
                <div className="fig-iv__dial" aria-hidden="true">
                    <svg viewBox="0 0 80 80" width="92" height="92">
                        <circle cx="40" cy="40" r="34" fill="none" strokeWidth="4" className="fig-iv__dial-track" />
                        <circle cx="40" cy="40" r="34" fill="none" strokeWidth="4" strokeDasharray="2 6" className="fig-iv__dial-ticks" />
                        <text x="40" y="44" textAnchor="middle" className="fig-iv__dial-text">
                            /100
                        </text>
                    </svg>
                    <span className="label">ATS score</span>
                </div>
                <ul className="fig-iv__fields">
                    {["Strengths", "Weaknesses", "Recommendations"].map((field, index) => (
                        <li key={field}>
                            <span className="label">{field}</span>
                            <Skeleton widths={[88 - index * 9, 62 + index * 7]} />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    if (stage === "practise") {
        return (
            <div className="fig-iv__view fig-iv__view--practise">
                <ul className="fig-iv__tracks">
                    <li data-on="true">General</li>
                    <li>Technical</li>
                    <li>HR / Situational</li>
                </ul>
                <ol className="fig-iv__questions">
                    {[78, 64, 84].map((width, index) => (
                        <li key={index}>
                            <span className="label">Q{index + 1}</span>
                            <Skeleton widths={[width, width - 22]} />
                        </li>
                    ))}
                </ol>
            </div>
        );
    }
    return (
        <div className="fig-iv__view fig-iv__view--report">
            <div className="fig-iv__charts" aria-hidden="true">
                <svg viewBox="0 0 80 80" width="84" height="84">
                    <circle cx="40" cy="40" r="28" fill="none" strokeWidth="12" className="fig-iv__pie-a" strokeDasharray="70 106" />
                    <circle cx="40" cy="40" r="28" fill="none" strokeWidth="12" className="fig-iv__pie-b" strokeDasharray="44 132" strokeDashoffset="-70" />
                    <circle cx="40" cy="40" r="28" fill="none" strokeWidth="12" className="fig-iv__pie-c" strokeDasharray="62 114" strokeDashoffset="-114" />
                </svg>
                <span className="fig-iv__bars">
                    {[58, 82, 40, 70].map((height, index) => (
                        <i key={index} style={{ height: `${height}%` }} />
                    ))}
                </span>
            </div>
            <div className="fig-iv__file">
                <span className="label">IntelliView_Report.pdf</span>
                <Skeleton widths={[74, 58]} />
            </div>
        </div>
    );
}

export function IntelliViewFigure() {
    const reduced = useReducedMotion();
    const [stage, setStage] = useState("upload");
    const tabsId = useId();
    const current = IV_STAGES.find((item) => item.id === stage);

    // Arrow keys move between tabs, as in any tab list.
    const onKeyDown = (event, index) => {
        const last = IV_STAGES.length - 1;
        let next = null;
        if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
        if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
        if (next === null) return;
        event.preventDefault();
        setStage(IV_STAGES[next].id);
        document.getElementById(`${tabsId}-${IV_STAGES[next].id}`)?.focus();
    };

    return (
        <div className="fig fig-iv">
            <div className="fig-iv__chrome">
                <span className="label">IntelliView</span>
                <div role="tablist" aria-label="Stages of a session" className="fig-iv__tabs">
                    {IV_STAGES.map((item, index) => (
                        <button
                            key={item.id}
                            id={`${tabsId}-${item.id}`}
                            type="button"
                            role="tab"
                            aria-selected={stage === item.id}
                            aria-controls={`${tabsId}-panel`}
                            tabIndex={stage === item.id ? 0 : -1}
                            className="fig-iv__tab"
                            onClick={() => setStage(item.id)}
                            onKeyDown={(event) => onKeyDown(event, index)}
                        >
                            <span className="fig-iv__tab-num">{String(index + 1).padStart(2, "0")}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
            <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${stage}`} className="fig-iv__body">
                <m.div key={stage} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                    <IvPanel stage={stage} />
                </m.div>
                <p className="fig-iv__note">
                    <span className="label">{current.tool}</span>
                    {current.note}
                </p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
   Quality Portal: an interface recreated with synthetic records, not the real portal.
   It shows only capabilities stated in the résumé: digital test reports and audit check
   sheets, data fetched from workstations into cloud storage, traceable records.
------------------------------------------------------------------- */

// The trace of one record, from the workstation where the data was produced to the report.
const STAGES = ["Captured", "Stored", "Reported"];
const RECORD_TYPES = [
    { id: "all", label: "All records" },
    { id: "report", label: "Test reports" },
    { id: "audit", label: "Audit check sheets" },
];
// Synthetic records. Stations, identifiers and times are made up for this site.
const RECORDS = [
    { id: "QR-0418", type: "report", station: "Station 04", stage: 2, trail: ["09:12", "10:40", "11:05"] },
    { id: "AC-0221", type: "audit", station: "Station 11", stage: 1, trail: ["09:30", "10:52"] },
    { id: "QR-0417", type: "report", station: "Station 02", stage: 2, trail: ["08:47", "09:58", "10:21"] },
    { id: "AC-0220", type: "audit", station: "Station 07", stage: 0, trail: ["10:15"] },
    { id: "QR-0416", type: "report", station: "Station 09", stage: 1, trail: ["08:20", "09:44"] },
];
const TYPE_NAME = { report: "Test report", audit: "Audit check sheet" };
const QA_FLOW = ["Capture", "Transfer", "Record", "Trace"];

export function QualityFigure() {
    const reduced = useReducedMotion();
    const ref = useRef(null);
    const inView = useInView(ref, { amount: 0.3 });
    const [type, setType] = useState("all");
    const [selected, setSelected] = useState(RECORDS[1].id);
    const rows = RECORDS.filter((item) => type === "all" || item.type === type);
    const record = rows.find((item) => item.id === selected) ?? rows[0];

    return (
        <div ref={ref} className="fig fig-qa">
            <div className="fig-qa__bar">
                <span className="label fig-qa__brand">
                    <i aria-hidden="true" /> Quality Portal
                </span>
                <span className="label fig-qa__flag">IPQC · Records</span>
            </div>

            <FlowStrip steps={QA_FLOW} playing={inView && !reduced} label="Data flow, in general terms" className="fig-qa__flow" />

            <div className="fig-qa__filters" role="group" aria-label="Filter records">
                {RECORD_TYPES.map((item) => (
                    <button key={item.id} type="button" aria-pressed={type === item.id} onClick={() => setType(item.id)}>
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="fig-qa__main">
                <table className="fig-qa__table">
                    <caption className="sr-only">Synthetic quality records. Select a record to see how it is traced from workstation to report.</caption>
                    <thead>
                        <tr>
                            <th scope="col">Record</th>
                            <th scope="col">Type</th>
                            <th scope="col" className="fig-qa__hide">
                                Station
                            </th>
                            <th scope="col">Trace</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item) => (
                            <tr key={item.id} data-selected={item.id === record.id}>
                                <td>
                                    <button type="button" onClick={() => setSelected(item.id)} aria-pressed={item.id === record.id}>
                                        {item.id}
                                    </button>
                                </td>
                                <td>{TYPE_NAME[item.type]}</td>
                                <td className="fig-qa__hide">{item.station}</td>
                                <td>
                                    <span className="fig-qa__pill" data-stage={item.stage}>
                                        {STAGES[item.stage]}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <m.aside
                    key={record.id}
                    className="fig-qa__detail"
                    aria-label={`Record ${record.id}`}
                    initial={reduced ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                >
                    <p className="label">{TYPE_NAME[record.type]}</p>
                    <p className="fig-qa__id">{record.id}</p>
                    <ol className="fig-qa__stages" aria-label={`Trace for ${record.id}`}>
                        {STAGES.map((stage, index) => (
                            <li
                                key={stage}
                                data-state={index < record.stage ? "done" : index === record.stage ? "current" : "todo"}
                                aria-current={index === record.stage ? "step" : undefined}
                            >
                                <span className="fig-qa__step-dot" aria-hidden="true" />
                                <span>{stage}</span>
                                <span className="label">{record.trail[index] ?? "—"}</span>
                            </li>
                        ))}
                    </ol>
                    <p className="label fig-qa__trail-note">Traceable from workstation to report</p>
                </m.aside>
            </div>
        </div>
    );
}