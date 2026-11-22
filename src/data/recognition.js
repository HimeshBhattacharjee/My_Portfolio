// Research and recognition. Same gate as the other data files: only "confirmed" items
// reach a production build (see ./index.js).

export const publications = [
    {
        id: "medcom-2025",
        title: "IntuitIQ – AI Driven Calculator",
        short: "IEEE MEDCOM 2025",
        authors: "H. Bhattacharjee et al.",
        venue: "2025 Modern Electronics Devices and Intelligent Communication Systems (MEDCOM)",
        publisher: "IEEE",
        detail: "Greater Noida, India · pp. 16–20",
        year: "2025",
        doi: "10.1109/MEDCOM67532.2025.11405395",
        url: "https://doi.org/10.1109/MEDCOM67532.2025.11405395",
        type: "Conference paper",
        status: "confirmed",
        source: "Résumé, Publications",
    },
    {
        id: "ijetece-2025",
        title: "IntuitIQ – AI Driven Calculator: A Review",
        short: "IJETECE · Vol. 9, Issue 1, 2025",
        authors: "H. Bhattacharjee et al.",
        venue: "International Journal on Emerging Trends in Electronics & Communication Engineering",
        detail: "Vol. 9, Issue 1 · ISSN 2581-558X",
        year: "2025",
        type: "Journal article",
        status: "confirmed",
        source: "Résumé, Publications",
    },
];

export const honours = [
    {
        id: "invitare",
        title: "First prize, INVITARE",
        detail: "Inter-college innovative project competition organised by FIEM, for developing a personalised AI assistant.",
        date: "April 2023",
        type: "Award",
        status: "confirmed",
        source: "Résumé, Achievements",
    },
    {
        id: "kaggle-genai",
        title: "5-Day Generative AI Intensive, Google on Kaggle",
        detail: "Completed the course and built a Gemini-based handwriting analysis prototype for handwritten character recognition.",
        // No date: the résumé does not give one, and none is invented.
        date: null,
        type: "Course",
        status: "confirmed",
        source: "Résumé, Achievements. Completion date not in résumé",
    },
];

// Verified credentials, shown as their own showcase in Research & Recognition.
// Certificate reference and licence IDs are deliberately never published, and no
// verification URL is given because none has been supplied.
export const credentials = [
    {
        id: "six-sigma-green-belt",
        title: "AI-Enabled Lean Six Sigma Green Belt",
        certificateType: "Certificate of Achievement",
        issuer: "Benchmark Six Sigma",
        distinction: "Future-Ready: AI Proficiency Validated",
        issued: "22 June 2026",
        issuedISO: "2026-06-22",
        examined: "12 June 2026",
        examinedISO: "2026-06-12",
        detail: "Competency demonstrated through training and examination against the Exemplar Global–SSG Six Sigma Green Belt body of knowledge.",
        recognition: "Benchmark Seal of Excellence, for a high score",
        status: "confirmed",
        source: "Original certificate, verified by the owner (Phase 7 brief)",
    },
];