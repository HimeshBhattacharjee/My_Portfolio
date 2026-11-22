// Date formatting, ordering and overlap spans for the Journey timeline.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const toMonth = (date) => {
    const [year, month = "01"] = date.split("-");
    return Number(year) * 12 + (Number(month) - 1);
};

const currentMonth = () => {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
};

const formatOne = (date) => {
    if (!date) return "";
    const [year, month] = date.split("-");
    return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
};

export const formatRange = (entry) => {
    if (entry.ongoing) return `${formatOne(entry.start)} – Present`;
    if (!entry.end) return formatOne(entry.start);
    const [startYear] = entry.start.split("-");
    const [endYear] = entry.end.split("-");
    // "Jan – Feb 2024" when both fall in the same year.
    if (startYear === endYear && entry.start.includes("-") && entry.end.includes("-")) {
        return `${MONTHS[Number(entry.start.split("-")[1]) - 1]} – ${formatOne(entry.end)}`;
    }
    return `${formatOne(entry.start)} – ${formatOne(entry.end)}`;
};

export const TYPE_LABEL = {
    role: "Role",
    internship: "Internship",
    education: "Education",
    project: "Project",
    publication: "Publication",
    achievement: "Award",
    credential: "Credential",
};

export const FILTERS = [
    { id: "all", label: "All", match: () => true },
    { id: "career", label: "Career", match: (entry) => entry.type === "role" || entry.type === "internship" },
    { id: "projects", label: "Projects", match: (entry) => entry.type === "project" },
    { id: "education", label: "Education", match: (entry) => entry.type === "education" },
    {
        id: "recognition",
        label: "Recognition",
        match: (entry) => ["publication", "achievement", "credential"].includes(entry.type),
    },
];

// Display order. `order` (sort position only) lets a year-only entry sit where it belongs
// without a month ever being shown.
const sortKey = (entry) => toMonth(entry.order ?? entry.start);

export const sortEntries = (entries) => [...entries].sort((a, b) => sortKey(a) - sortKey(b) || a.id.localeCompare(b.id));

// Last month an entry covers: ongoing entries run to now, a year-only end covers its year.
const endMonthOf = (entry) => {
    if (entry.ongoing) return currentMonth();
    if (!entry.end) return null;
    return toMonth(entry.end) + (entry.end.length === 4 ? 11 : 0);
};

// Periods that overlap later milestones, so the timeline can show them running alongside
// instead of forcing a false sequence. Each span runs from its own row to the last row that
// starts before it ends (or to the "now" cap, index = sorted.length, when ongoing). Lanes keep
// concurrent spans apart.
export function computeSpans(sorted) {
    const spans = [];
    sorted.forEach((entry, from) => {
        const endMonth = endMonthOf(entry);
        if (endMonth === null) return;
        let to = from;
        sorted.forEach((other, index) => {
            if (index > from && toMonth(other.start) <= endMonth) to = index;
        });
        if (entry.ongoing) to = sorted.length;
        if (to > from) spans.push({ id: entry.id, from, to });
    });
    const laneEnds = [];
    for (const span of spans) {
        let lane = laneEnds.findIndex((end) => end <= span.from);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = span.to;
        span.lane = lane;
    }
    return spans;
}