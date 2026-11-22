// Category markers. Categories differ by shape as well as by lane, never by colour alone.
const SHAPES = {
    role: <rect x="2" y="2" width="10" height="10" />,
    internship: <rect x="2.5" y="2.5" width="9" height="9" fill="none" strokeWidth="1.5" />,
    project: <path d="M7 1 13 7 7 13 1 7Z" />,
    education: <circle cx="7" cy="7" r="4.6" fill="none" strokeWidth="1.8" />,
    publication: <path d="M7 1.8 12.2 7 7 12.2 1.8 7Z" fill="none" strokeWidth="1.5" />,
    achievement: <path d="M7 1.5 13 12.5H1Z" />,
    credential: (
        <g fill="none" strokeWidth="1.3">
            <circle cx="7" cy="7" r="5.6" />
            <circle cx="7" cy="7" r="2.8" />
        </g>
    ),
};

const Marker = ({ type, size = 14, className = "" }) => (
    <svg
        className={`marker ${className}`}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0"
        aria-hidden="true"
        focusable="false"
    >
        {SHAPES[type] ?? SHAPES.project}
    </svg>
);

export default Marker;