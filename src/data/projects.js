// Selected work. Only completed work appears: classification 1 (showcase-ready) or
// 2 (completed prototype, always labelled). See private/content-audit.md for the full
// evaluation of every repository, and the reasons others are left out.
//
// Gate: `status` on the project, and on any individual point or link. Only "confirmed"
// reaches a production build (see ./index.js). Metrics awaiting disclosure approval are kept
// out of the code entirely and listed in CONTENT_TO_CONFIRM.md.

/**
 * @typedef {Object} Point
 * @property {string} text
 * @property {'confirmed'|'draft'} [status]   Defaults to the project's status.
 * @property {string} [note]                   Shown beside the point, e.g. "In progress".
 * @property {string} [source]
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} short                    Index label in the hero.
 * @property {string} kind                     Display label, e.g. "Academic project".
 * @property {'project'|'professional'} context
 * @property {boolean} [prototype]             Renders a "Prototype" label.
 * @property {string} [badge]                  Short label beside the title, e.g. "Internal project".
 * @property {string} period                   Display text, from the source.
 * @property {string} summary                  One sentence.
 * @property {string} problem
 * @property {string} idea
 * @property {string} role
 * @property {Point[]} built
 * @property {string[]} [impact]             Qualitative results, shown in the details panel.
 * @property {{step: string, detail: string}[]} how
 * @property {string[]} stack
 * @property {{label: string, url: string, status?: string}[]} [links]
 * @property {string[]} [publications]          Ids from recognition.js.
 * @property {string} figure                    Which illustrative figure to draw.
 * @property {string} caption                   Honest caption for the figure.
 * @property {'confirmed'|'draft'} status
 * @property {string} source                    Never rendered.
 */

/** @type {Project[]} */
export const projects = [
    {
        id: "intuitiq",
        short: "AI · Published",
        title: "IntuitIQ",
        kind: "Academic project · Team of four",
        context: "project",
        period: "Dec 2024 – May 2025",
        summary:
            "An AI calculator that solves problems you draw or type, and shows every step of the working.",
        problem:
            "Calculators expect clean, typed input. Real problems arrive as handwriting, sketches, circuit diagrams and word problems, and a bare answer teaches nothing.",
        idea:
            "Let people work the way they do on paper. Draw on a canvas or type in plain language, and get back the expression the system understood, the steps, and the result, placed right where you were working.",
        role: "One of four final-year ECE students. Credited in the app as C++/Python coder and web + AI developer; every commit in the public repository is mine.",
        built: [
            { text: "A whiteboard canvas with freehand pencil, lines, rectangles, ellipses, text, eraser, colour and selection, with undo and redo." },
            { text: "An image pipeline: the canvas is sent as a PNG to a FastAPI service and read by Gemini 2.0 Flash under a structured prompt." },
            { text: "A text pipeline: typed problems in a rich-text panel are solved by Mistral Large at low temperature for consistent working." },
            { text: "Problem coverage from arithmetic and simultaneous equations to probability, integration, resistor networks and Kirchhoff's laws." },
            { text: "Variables assigned on the canvas (x = 4) carried into later problems." },
            { text: "Results typeset with MathJax as draggable answers on the canvas, and a per-user history stored in MongoDB." },
        ],
        how: [
            { step: "Draw or type", detail: "React canvas (Rough.js, perfect-freehand) or Tiptap rich-text panel" },
            { step: "Send", detail: "PNG or text, plus assigned variables, to FastAPI" },
            { step: "Solve", detail: "Gemini 2.0 Flash for images, Mistral Large for text, each with a case-by-case prompt" },
            { step: "Parse", detail: "Structured {expr, steps, result}, with a fallback extractor when the reply is malformed" },
            { step: "Show and keep", detail: "MathJax result on the canvas; history in MongoDB" },
        ],
        stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Mantine", "Clerk", "FastAPI", "Python", "Gemini API", "Mistral API", "MongoDB"],
        links: [
            { label: "Live app", url: "https://intuitiq.netlify.app/", status: "confirmed" },
            { label: "Source on GitHub", url: "https://github.com/HimeshBhattacharjee/IntuitIQ", status: "confirmed" },
        ],
        publications: ["medcom-2025", "ijetece-2025"],
        figure: "intuitiq",
        caption: "Both input modes, redrawn in code from the app's source.",
        status: "confirmed",
        source: "Résumé (period, description, publications); IntuitIQ repository source (all implementation detail); in-app team credits",
    },
    {
        id: "sign-language-gloves",
        short: "Hardware",
        title: "Sign Language Gloves",
        kind: "Academic project · Hardware",
        context: "project",
        period: "Jan – Feb 2024",
        summary:
            "A sensor glove that turns hand gestures into readable and audible English text.",
        problem:
            "Sign language is fluent for those who know it and opaque to almost everyone else, which leaves the person signing to bridge the gap.",
        idea:
            "Read the hand directly. Pressure sensors respond as the fingers form a gesture, a microcontroller recognises the pattern, and the result arrives as text and speech.",
        role: "Designed the glove: sensors, microcontroller and wireless link.",
        built: [
            { text: "Pressure sensors placed on the glove to register how the hand is shaped." },
            { text: "An Arduino UNO reading the sensors and matching readings to gestures." },
            { text: "A Bluetooth link carrying the recognised gesture as English text, displayed and spoken aloud." },
        ],
        how: [
            { step: "Sense", detail: "Pressure sensors respond as the hand forms a gesture" },
            { step: "Recognise", detail: "Arduino UNO maps the sensor pattern to a gesture" },
            { step: "Transmit", detail: "Bluetooth sends the result to a receiving device" },
            { step: "Speak", detail: "The gesture appears as English text and is read aloud" },
        ],
        stack: ["Arduino UNO", "Pressure sensors", "Bluetooth"],
        links: [],
        figure: "glove",
        caption: "Schematic of the glove and its signal path. Sensor placement is approximate.",
        status: "confirmed",
        source: "Résumé only. No public repository exists",
    },
    {
        id: "intelliview",
        short: "AI prototype",
        title: "IntelliView",
        kind: "AI prototype",
        context: "project",
        prototype: true,
        period: "2025",
        summary:
            "An AI interview coach that reads a résumé, scores it for applicant-tracking systems and runs a mock interview.",
        problem:
            "Job seekers rarely get specific feedback on a résumé before it is filtered out, or a safe place to rehearse the interview that follows.",
        idea:
            "One session: upload the résumé, see where it is strong and weak, then practise questions drawn from it, with a report to take away.",
        role: "Every commit in the public repository is mine.",
        built: [
            { text: "PDF résumé upload with an in-app preview." },
            { text: "ATS compatibility score, strengths, weaknesses and tailored recommendations from Gemini 1.5 Flash." },
            { text: "Mock-interview questions in three tracks: general, technical, and HR or situational." },
            { text: "Interactive feedback charts and a downloadable PDF report." },
        ],
        how: [
            { step: "Upload", detail: "PDF parsed with PyMuPDF" },
            { step: "Analyse", detail: "Gemini 1.5 Flash returns structured feedback" },
            { step: "Practise", detail: "Question tracks generated from the résumé" },
            { step: "Report", detail: "Plotly charts and an FPDF report" },
        ],
        stack: ["Python", "Streamlit", "Gemini API", "PyMuPDF", "Plotly", "FPDF", "Google Colab"],
        links: [
            { label: "Source on GitHub", url: "https://github.com/HimeshBhattacharjee/IntelliView", status: "confirmed" },
        ],
        figure: "intelliview",
        caption: "The four stages of a session, redrawn as structure only. No scores or results are shown.",
        status: "confirmed",
        source: "IntelliView repository: notebook source (features verified in code), README; first commit May 2025. Runs from Colab through ngrok, so there is no permanent live link",
    },
    {
        id: "quality-digitalisation",
        short: "Professional work",
        title: "Quality Portal",
        kind: "Professional Work · Quality Digitalisation",
        // An internal, authenticated application. Presented as a case study only: no link to
        // the application, no screenshots, no real records, no internal addresses.
        badge: "Completed · Internal",
        context: "professional",
        period: "Vikram Solar · Sep 2025 – present",
        summary:
            "An IPQC digitalisation portal that moves quality test reports and audit check sheets off paper into one traceable, accessible system.",
        problem:
            "In-process quality records lived on paper, in spreadsheets and on individual workstations. Reports were slow to fill in, hard to trace back to their source and difficult for other functions to see.",
        idea:
            "One portal for in-process quality test reports and audit check sheets, with data fetched straight from the machines where it is produced, so every record is traceable and visible to the teams who rely on it.",
        role: "As a Graduate Engineer Trainee in the Quality department, I completed the portal's digitalisation of in-process test reports and audit check sheets, and enabled direct data fetching from local Windows workstations to AWS S3.",
        built: [
            { text: "Digital in-process quality (IPQC) test reports, replacing paper and spreadsheet records." },
            { text: "Audit check-sheet workflows completed and kept inside the same portal." },
            { text: "Direct fetching of quality-report data from local Windows workstations to AWS S3." },
            { text: "Traceable records, with quality information accessible across functions." },
        ],
        // Qualitative only. Quantified results await the company's disclosure approval.
        impact: [
            "Improved traceability of in-process quality records.",
            "Better access to quality information for the teams who use it.",
            "Less manual report filling, with data fetched directly from the source machines.",
        ],
        how: [
            { step: "Capture", detail: "Test data produced on local Windows workstations" },
            { step: "Transfer", detail: "Fetched directly to AWS S3" },
            { step: "Record", detail: "Test reports and audit check sheets completed in the portal" },
            { step: "Trace", detail: "Records traceable and visible across functions" },
        ],
        stack: ["AWS S3", "Automated data fetching", "Report automation", "Dashboard reporting"],
        links: [],
        figure: "quality",
        caption: "Interface recreated for this site with synthetic records. The production portal, its screens and its data remain internal.",
        status: "confirmed",
        source: "Résumé work-experience bullets 1 and 2 (portal, S3 fetching); the SAP integration is no longer part of this work (final-refinement brief); Phase 5/7 briefs (name, category). Impact wording qualitative from résumé bullets 1 and 2. Repository deliberately not linked (brief)",
    },
];