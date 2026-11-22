// Central profile content. Facts trace to private/content-audit.md (git-ignored).
// Anything not yet approved carries status: "draft" and is never rendered (see ./index.js).

export const site = {
    url: "https://himeshb.netlify.app/",
};

export const profile = {
    name: { first: "Himesh", last: "Bhattacharjee" },
    roles: ["Electronics engineer", "Software developer", "Automation Enthusiast"],
    // Hero standfirst: three finished pieces of work, stated plainly (quality portal,
    // IntuitIQ, Sign Language Gloves). Source: résumé.
    statement: "I build intelligent digital solutions that simplify complexity, bridge ideas with technology, and create meaningful real-world impact.",
    // **double asterisks** mark emphasis; see src/components/ui/RichText.jsx.
    intro:
        "Graduate Engineer Trainee in Quality at **Vikram Solar**, moving inspection reports and audit check sheets off paper and into one traceable portal. Outside work I build AI tools: **IntuitIQ**, an AI calculator I built with three classmates, was published at **IEEE MEDCOM 2025**.",
    location: "Kolkata, India",
    portrait: {
        // The original photograph, kept unchanged. Served only to browsers without WebP support.
        src: "/images/Himesh_Image.png",
        // Proportional WebP resizes of the original (quality 92, no other processing).
        webp: [
            { src: "/images/portrait/himesh-480.webp", width: 480 },
            { src: "/images/portrait/himesh-768.webp", width: 768 },
            { src: "/images/portrait/himesh-1086.webp", width: 1086 },
        ],
        // Rendered width of the cropped image at each breakpoint (see .portrait__photo in index.css).
        // Keep in step with the preload in index.html.
        sizes: "(min-width: 1024px) 55vw, 100vw",
        width: 1086,
        height: 1448,
        alt: "Himesh Bhattacharjee, seated outdoors in a dark blazer and sunglasses, looking to one side.",
    },
};

// The résumé, published unchanged from the owner's supplied PDF (byte-identical copy).
export const cv = {
    href: "/files/Himesh_Bhattacharjee_CV.pdf",
    filename: "Himesh_Bhattacharjee_CV.pdf",
    size: "172 KB",
};

export const links = [
    {
        id: "email",
        label: "Email",
        display: "bhattacharjeehimesh@gmail.com",
        url: "mailto:bhattacharjeehimesh@gmail.com",
        status: "confirmed",
        source: "Résumé header; GitHub profile README",
    },
    {
        id: "linkedin",
        label: "LinkedIn",
        display: "in/himeshbhattacharjee",
        url: "https://in.linkedin.com/in/himeshbhattacharjee",
        status: "confirmed",
        source: "Résumé header; Phase 4 brief",
    },
    {
        id: "github",
        label: "GitHub",
        display: "HimeshBhattacharjee",
        url: "https://github.com/HimeshBhattacharjee",
        status: "confirmed",
        source: "Résumé header; Phase 1 brief",
    },
];

// About section. First person, about 130 words. Every claim maps to the résumé or the audit.
export const about = {
    paragraphs: [
        "I studied Electronics and Communication Engineering at the Future Institute of Engineering and Management in Kolkata, and never kept hardware and software in separate boxes. **A glove that turns hand gestures into speech. An AI calculator that reads handwritten maths. A portal that takes quality reports off paper.** Different problems, one habit: watch how people actually work, then remove the friction.",
        "Today I am a Graduate Engineer Trainee in the Quality department at Vikram Solar, where most of my work is digitalising quality processes. Outside it, I keep building with applied AI and interface design. I care about clean data, honest interfaces and details that hold up after the demo.",
    ],
    practice: [
        {
            area: "Software that fits a workflow",
            detail: "Web applications and internal tools shaped around the people who use them.",
            proof: { label: "Quality Portal", href: "#work/quality-digitalisation" },
        },
        {
            area: "Applied AI",
            detail: "Vision-language and language models put to work on structured, checkable output.",
            proof: { label: "IntuitIQ", href: "#work/intuitiq" },
        },
        {
            area: "Hardware meets software",
            detail: "Sensors, microcontrollers and wireless links, carried through to an interface.",
            proof: { label: "Sign Language Gloves", href: "#work/sign-language-gloves" },
        },
    ],
    currently: {
        // Deliberately generic: the platforms are still in development and their details are
        // not for publication.
        text: "Working on enterprise software platforms.",
        status: "confirmed",
        source: "Final-refinement brief: generic wording approved by Himesh; SAP integration withdrawn",
    },
};

// Sections that exist on the page. Navigation is generated from this list.
export const sections = [
    { id: "work", label: "Work", index: "01" },
    { id: "journey", label: "Journey", index: "02" },
    { id: "about", label: "About", index: "03" },
    { id: "expertise", label: "Expertise", index: "04" },
    { id: "recognition", label: "Research", index: "05" },
    { id: "contact", label: "Contact", index: "06" },
];