const base = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "square",
    "aria-hidden": true,
    focusable: false,
};

export const ArrowRight = (props) => (
    <svg {...base} {...props}>
        <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
);

export const ArrowDown = (props) => (
    <svg {...base} {...props}>
        <path d="M12 4v15M6 13l6 6 6-6" />
    </svg>
);

export const ArrowUpRight = (props) => (
    <svg {...base} {...props}>
        <path d="M7 17 17 7M8 7h9v9" />
    </svg>
);

export const Close = (props) => (
    <svg {...base} {...props}>
        <path d="M5 5l14 14M19 5 5 19" />
    </svg>
);

export const GitHubIcon = (props) => (
    <svg {...base} stroke="none" fill="currentColor" {...props}>
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
);

export const LinkedInIcon = (props) => (
    <svg {...base} stroke="none" fill="currentColor" {...props}>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-1.9 3.76-1.9 4.02 0 4.76 2.5 4.76 5.76v6.04h-4v-5.36c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83v5.45h-4V9.75Z" />
    </svg>
);

export const MailIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M3.5 5.5h17v13h-17zM4 6l8 6.5L20 6" />
    </svg>
);

export const DownloadIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M12 3.5v11M7 10l5 5 5-5M4.5 19.5h15" />
    </svg>
);