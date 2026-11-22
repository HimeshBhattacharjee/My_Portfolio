// Expertise, grouped by the problem it solves rather than as a logo wall.
// Rule: a row exists only if a project or milestone on the page evidences it.

export const expertise = [
    {
        id: "build",
        group: "Build",
        rows: [
            {
                capability: "Web applications",
                tools: ["React", "TypeScript", "JavaScript", "Vite", "Tailwind CSS"],
                evidence: [{ label: "IntuitIQ", href: "#work/intuitiq" }, { label: "This site", href: "#top" }],
            },
            {
                capability: "APIs and back ends",
                tools: ["Python", "FastAPI", "Pydantic", "MongoDB"],
                evidence: [{ label: "IntuitIQ", href: "#work/intuitiq" }],
            },
            {
                capability: "3D and motion on the web",
                tools: ["Three.js", "WebGL / GLSL", "Framer Motion"],
                evidence: [{ label: "This site", href: "#top" }],
            },
        ],
    },
    {
        id: "ai",
        group: "Applied AI and data",
        rows: [
            {
                capability: "Generative AI in products",
                tools: ["Gemini API", "Mistral API", "Prompt design for structured output"],
                evidence: [{ label: "IntuitIQ", href: "#work/intuitiq" }, { label: "IntelliView", href: "#work/intelliview" }],
            },
            {
                capability: "Rapid AI prototypes",
                tools: ["Streamlit", "Google Colab", "Plotly", "PyMuPDF"],
                evidence: [{ label: "IntelliView", href: "#work/intelliview" }],
            },
            {
                capability: "Data science",
                tools: ["Python", "Data preprocessing", "Predictive modelling"],
                evidence: [{ label: "Ardent internship", href: "#journey" }],
            },
        ],
    },
    {
        id: "hardware",
        group: "Hardware",
        rows: [
            {
                capability: "Embedded prototyping",
                tools: ["Arduino UNO", "Pressure sensors", "Bluetooth", "C++"],
                evidence: [{ label: "Sign Language Gloves", href: "#work/sign-language-gloves" }],
            },
            {
                capability: "Electronics foundations",
                tools: ["Digital electronics", "Signals and systems", "Network theory"],
                evidence: [{ label: "B.Tech, ECE", href: "#journey" }],
            },
        ],
    },
    {
        id: "quality",
        group: "Process and quality",
        rows: [
            {
                capability: "Quality digitalisation",
                tools: ["AWS S3", "Report automation", "Dashboard reporting", "Data traceability"],
                evidence: [{ label: "Quality Portal", href: "#work/quality-digitalisation" }],
            },
            {
                capability: "Quality systems",
                tools: ["IPQC", "FQC", "Audit check sheets", "PCN", "SOP", "RCA / CAPA"],
                evidence: [{ label: "Vikram Solar", href: "#work/quality-digitalisation" }],
            },
        ],
    },
];