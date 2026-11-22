// The String: professional timeline data.
// Only entries with status "confirmed" reach production (see ./index.js), and
// scripts/check-content.mjs fails the build if a confirmed entry is missing a date or a source.
// Entries without a known date (the Kaggle course) are deliberately absent: a timeline
// cannot place them without inventing one. They appear in recognition.js instead.

/**
 * @typedef {Object} TimelineEntry
 * @property {string} id                 Unique, kebab-case.
 * @property {'role'|'internship'|'education'|'project'|'publication'|'credential'|'achievement'} type
 * @property {string} title              Designation, degree, project or credential name.
 * @property {string} [org]              Organisation as displayed.
 * @property {string} [location]
 * @property {string} start              'YYYY-MM' or 'YYYY'.
 * @property {string} [order]            'YYYY-MM'. Sort position only, never displayed. For
 *                                       entries whose source gives a year but no month.
 * @property {string|null} [end]         'YYYY-MM', 'YYYY', or null for a single date.
 * @property {boolean} [ongoing]
 * @property {string} summary
 * @property {string[]} [points]
 * @property {string[]} [tags]
 * @property {{label: string, url: string}[]} [links]
 * @property {string} [projectId]        Links to an entry in projects.js.
 * @property {string} [groupId]
 * @property {boolean} [featured]
 * @property {'confirmed'|'draft'} status
 * @property {'public'|'anonymised'} visibility
 * @property {string} source             Where the fact came from. Never rendered.
 */

/** @type {TimelineEntry[]} */
export const timeline = [
    {
        id: "btech-ece",
        type: "education",
        title: "B.Tech, Electronics and Communication Engineering",
        org: "Future Institute of Engineering and Management",
        location: "Kolkata",
        start: "2021-08",
        end: "2025-07",
        summary: "Four years of electronics, signals and communication, with software running through all of it.",
        tags: ["Digital electronics", "Signals and systems", "Network theory"],
        featured: true,
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Education; core skills for tags",
    },
    {
        id: "invitare-2023",
        type: "achievement",
        title: "First prize, INVITARE",
        org: "Inter-college innovative project competition, FIEM",
        start: "2023-04",
        end: null,
        summary: "Won first prize for developing a personalised AI assistant.",
        tags: ["AI assistant"],
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Achievements",
    },
    {
        id: "ardent-internship",
        type: "internship",
        title: "Data Science Intern",
        org: "Ardent Computech Pvt. Ltd.",
        start: "2024-01",
        end: "2024-02",
        summary: "Built a Python stock-price prediction model, from data preprocessing through model building to interpreting the results.",
        tags: ["Python", "Data preprocessing", "Modelling"],
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Industrial training and internships",
    },
    {
        id: "sign-language-gloves",
        type: "project",
        title: "Sign Language Gloves",
        org: "Academic project",
        start: "2024-01",
        end: "2024-02",
        summary: "Designed a glove with pressure sensors, an Arduino UNO and Bluetooth that turns hand gestures into readable and audible English text.",
        points: ["Signal path: pressure sensors, Arduino UNO, Bluetooth, then text and speech."],
        tags: ["Arduino UNO", "Sensors", "Bluetooth"],
        projectId: "sign-language-gloves",
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Academic projects",
    },
    {
        id: "intuitiq",
        type: "project",
        title: "IntuitIQ, AI calculator",
        org: "Academic project, team of four",
        start: "2024-12",
        end: "2025-05",
        summary: "Built an AI calculator that solves drawn and typed problems with step-by-step working, using Gemini, Mistral and a FastAPI back end.",
        points: [
            "Drawn problems read by Gemini 2.0 Flash; typed problems solved by Mistral Large.",
            "Answers typeset on the canvas, with a per-user history in MongoDB.",
        ],
        tags: ["Generative AI", "React", "FastAPI"],
        projectId: "intuitiq",
        featured: true,
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Academic projects; repository for the stack",
    },
    {
        id: "edunet-internship",
        type: "internship",
        title: "AI Intern",
        org: "Edunet Foundation (Microsoft & AICTE)",
        start: "2025-04",
        end: "2025-05",
        summary: "Completed AI-focused training, applying AI concepts to engineering problem-solving use cases.",
        tags: ["Artificial intelligence"],
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Industrial training and internships",
    },
    {
        id: "btech-graduation",
        type: "education",
        title: "Graduated, B.Tech ECE",
        org: "Future Institute of Engineering and Management",
        start: "2025-07",
        end: null,
        summary: "Completed the degree with a CGPA of 8.79 out of 10.",
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Education: Aug 2021 to Jul 2025, CGPA 8.79/10",
    },
    {
        id: "intuitiq-publications",
        type: "publication",
        title: "IntuitIQ published",
        org: "IEEE MEDCOM 2025 and IJETECE",
        start: "2025",
        // The résumé gives the year only. Placed after graduation and before Vikram Solar,
        // as in the owner's Phase 5 brief; only "2025" is ever displayed.
        order: "2025-08",
        end: null,
        summary: "Two papers on IntuitIQ: a conference paper at IEEE MEDCOM 2025 in Greater Noida, and a review in the International Journal on Emerging Trends in Electronics & Communication Engineering.",
        links: [{ label: "IEEE Xplore", url: "https://ieeexplore.ieee.org/document/11405395" }],
        projectId: "intuitiq",
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Publications. Month not stated in the résumé, so year only",
    },
    {
        id: "vikram-solar-get",
        type: "role",
        title: "Graduate Engineer Trainee, Quality",
        org: "Vikram Solar",
        start: "2025-09",
        end: null,
        ongoing: true,
        summary: "Digitalising quality processes in the Quality department, from paper and spreadsheets to traceable records.",
        points: [
            "Completed a portal for in-process quality test reports and audit check sheets.",
            "Enabled direct transfer of quality-report data from local machines to AWS S3.",
            "Completed a Process Change Note implementation, from impact assessment to controlled documentation.",
            "Contributed to a team initiative to reduce packaging cost while maintaining packaging quality, pallet safety and line usability.",],
        tags: ["Quality digitalisation", "AWS S3", "Process change"],
        projectId: "quality-digitalisation",
        featured: true,
        status: "confirmed",
        visibility: "public",
        source: "Résumé, Work experience",
    },
    {
        id: "six-sigma-green-belt",
        type: "credential",
        title: "AI-Enabled Lean Six Sigma Green Belt",
        org: "Benchmark Six Sigma · Certificate of Achievement",
        // Milestone date is the certificate's issue date; the examination date is secondary.
        start: "2026-06",
        end: null,
        summary: "Demonstrated the required competency through training and examination against the Exemplar Global–SSG Six Sigma Green Belt body of knowledge.",
        points: [
            "Examination 12 June 2026 · certificate issued 22 June 2026.",
            "Future-Ready: AI Proficiency Validated, with the Benchmark Seal of Excellence for a high score.",
        ],
        tags: ["Lean Six Sigma", "Process improvement", "Quality"],
        featured: true,
        status: "confirmed",
        visibility: "public",
        source: "Original certificate, verified by the owner (Phase 7 brief): exam 12 Jun 2026, issued 22 Jun 2026. Reference and licence IDs deliberately not published",
    },
];