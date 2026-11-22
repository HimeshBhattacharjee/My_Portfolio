import { profile, links, sections, about, site, cv } from "./profile";
import { projects } from "./projects";
import { timeline } from "./timeline";
import { publications, honours, credentials } from "./recognition";
import { expertise } from "./expertise";

// Publication gate. Only items with status "confirmed" are exported, in development and in
// production alike, so a visitor (or a reviewer on `npm run dev`) never sees an unconfirmed
// item or a development status. Unconfirmed content lives in ./drafts.js, which nothing
// renders. scripts/check-content.mjs validates confirmed entries before every build.
const isPublished = (item, parentStatus = "confirmed") => (item.status ?? parentStatus) === "confirmed";

const published = (items) => items.filter((item) => isPublished(item));

// Projects carry gated points and links as well as their own status.
const gateProject = (project) => ({
    ...project,
    built: project.built.filter((point) => isPublished(point, project.status)),
    links: (project.links ?? []).filter((link) => isPublished(link, project.status)),
});

export const publishedLinks = published(links);
export const publishedTimeline = published(timeline);
export const publishedProjects = published(projects).map(gateProject);
export const publishedPublications = published(publications);
export const publishedHonours = published(honours);
export const publishedCredentials = published(credentials);

export const publishedAbout = {
    ...about,
    currently: isPublished(about.currently) ? about.currently : null,
};

export { profile, sections, expertise, site, cv };