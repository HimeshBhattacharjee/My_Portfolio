// Content gate, run before every production build (see "build" in package.json).
// Dependency-free. Fails the build when a confirmed entry is incomplete or inconsistent:
//   - timeline: missing title, summary, start date or source; malformed dates; end before start
//   - projects: missing summary, period or source; a confirmed project without a figure caption
//   - every data file: a confirmed entry with no source
//   - optional: any confirmed, public-facing text containing a term from the git-ignored
//     blocklist at private/blocklist.txt (one term per line, # for comments)
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const load = (path) => import(new URL(`../src/data/${path}`, import.meta.url));

const { timeline } = await load("timeline.js");
const { projects } = await load("projects.js");
const { publications, honours, credentials } = await load("recognition.js");
const { links } = await load("profile.js");
const { draftPoints, draftHonours } = await load("drafts.js");

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);
const confirmed = (item) => item.status === "confirmed";
const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const asNumber = (date) => {
    const [year, month = "01"] = date.split("-");
    return Number(year) * 12 + Number(month);
};

const ids = new Set();
for (const entry of timeline) {
    const where = `timeline/${entry.id}`;
    if (ids.has(entry.id)) fail(where, "duplicate id");
    ids.add(entry.id);
    if (!["confirmed", "draft"].includes(entry.status)) fail(where, "status must be confirmed or draft");
    if (!confirmed(entry)) continue;
    for (const field of ["title", "summary", "start", "source"]) {
        if (!entry[field]) fail(where, `confirmed entry is missing "${field}"`);
    }
    if (entry.start && !DATE.test(entry.start)) fail(where, `start "${entry.start}" is not YYYY or YYYY-MM`);
    if (entry.order && !/^\d{4}-(0[1-9]|1[0-2])$/.test(entry.order)) fail(where, `order "${entry.order}" is not YYYY-MM`);
    if (entry.order && entry.start && !entry.order.startsWith(entry.start.slice(0, 4))) fail(where, "order must fall in the start year");
    if (entry.end && !DATE.test(entry.end)) fail(where, `end "${entry.end}" is not YYYY or YYYY-MM`);
    if (entry.start && entry.end && asNumber(entry.end) < asNumber(entry.start)) fail(where, "end is before start");
    if (entry.projectId && !projects.some((project) => project.id === entry.projectId)) {
        fail(where, `projectId "${entry.projectId}" does not exist in projects.js`);
    }
}

for (const project of projects) {
    const where = `projects/${project.id}`;
    if (!confirmed(project)) continue;
    for (const field of ["title", "summary", "period", "source", "caption"]) {
        if (!project[field]) fail(where, `confirmed project is missing "${field}"`);
    }
    for (const id of project.publications ?? []) {
        if (!publications.some((publication) => publication.id === id)) fail(where, `unknown publication "${id}"`);
    }
}

for (const [name, list] of [["publications", publications], ["honours", honours], ["credentials", credentials], ["links", links]]) {
    for (const item of list) {
        if (confirmed(item) && !item.source) fail(`${name}/${item.id}`, "confirmed entry has no source");
    }
}

// Drafts must stay drafts, with a source, and each draft point must have an anchor.
for (const [projectId, points] of Object.entries(draftPoints)) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) fail(`drafts/${projectId}`, "unknown project");
    for (const point of points) {
        if (point.status !== "draft") fail(`drafts/${projectId}`, `"${point.text.slice(0, 40)}" must have status "draft"`);
        if (!point.source) fail(`drafts/${projectId}`, "draft point has no source");
        if (project && !project.built.some((item) => item.text.startsWith(point.after))) {
            fail(`drafts/${projectId}`, `no confirmed point starts with "${point.after}"`);
        }
    }
}
for (const item of draftHonours) {
    if (item.status !== "draft") fail(`drafts/${item.id}`, 'must have status "draft"');
}

// Credentials: complete, with ISO dates that match, and the issue date not before the exam.
for (const item of credentials.filter(confirmed)) {
    const where = `credentials/${item.id}`;
    for (const field of ["title", "issuer", "issued", "issuedISO", "detail"]) {
        if (!item[field]) fail(where, `confirmed credential is missing "${field}"`);
    }
    for (const field of ["issuedISO", "examinedISO"]) {
        if (item[field] && !/^\d{4}-\d{2}-\d{2}$/.test(item[field])) fail(where, `${field} is not YYYY-MM-DD`);
    }
    if (item.examinedISO && item.issuedISO && item.examinedISO > item.issuedISO) fail(where, "examined after issued");
    const entry = timeline.find((row) => row.id === item.id);
    if (entry && item.issuedISO && !item.issuedISO.startsWith(entry.start)) fail(where, "timeline date does not match the issue date");
}

// Public text must never carry a development status or placeholder wording.
const PLACEHOLDER = /\b(draft|not published|in preparation|coming soon|placeholder|lorem ipsum|content pending|tbd|to be confirmed)\b/i;
const publicCopy = (item) => JSON.stringify(item, (key, value) => (key === "source" || key === "status" ? undefined : value));
for (const [name, list] of [["timeline", timeline], ["projects", projects], ["publications", publications], ["honours", honours], ["credentials", credentials]]) {
    for (const item of list.filter(confirmed)) {
        const match = publicCopy(item).match(PLACEHOLDER);
        if (match) fail(`${name}/${item.id}`, `public text contains placeholder wording "${match[0]}"`);
    }
}

// Optional blocklist of terms that must never appear in published text.
const blocklistPath = resolve(root, "private/blocklist.txt");
if (existsSync(blocklistPath)) {
    const terms = readFileSync(blocklistPath, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((term) => term.toLowerCase());
    // Sources are private notes and never rendered, so they are excluded from the scan.
    const publicText = (item) =>
        JSON.stringify(item, (key, value) => (key === "source" ? undefined : value)).toLowerCase();
    const scan = (name, list) =>
        list.filter(confirmed).forEach((item) => {
            const text = publicText(item);
            terms.filter((term) => text.includes(term)).forEach((term) => fail(`${name}/${item.id}`, `contains blocked term "${term}"`));
        });
    scan("timeline", timeline);
    scan("projects", projects);
    scan("publications", publications);
    scan("honours", honours);
    scan("credentials", credentials);
}

if (errors.length > 0) {
    console.error(`Content check failed (${errors.length}):\n  - ${errors.join("\n  - ")}`);
    process.exit(1);
}
const count = (list) => list.filter(confirmed).length;
console.log(
    `Content check passed: ${count(timeline)} timeline entries, ${count(projects)} projects, ` +
        `${count(publications)} publications, ${count(honours)} honours, ${count(credentials)} credentials confirmed.`,
);
