// Holding pen for unconfirmed content. Nothing in this module is ever rendered, in
// development or in production (see ./index.js), and the "strip-drafts" plugin in
// vite.config.js replaces it with an empty module during `vite build`, so its text can never
// be read in the shipped JavaScript.
//
// Currently empty. The two unapproved metrics for the Quality Portal (reporting time saved,
// packaging cost reduction) are listed in CONTENT_TO_CONFIRM.md only, not in code.
// To publish an item: confirm it there, then add it to its data file with status "confirmed".

// Extra points for a project, keyed by project id: { after, text, status: "draft", source }.
export const draftPoints = {};

// Unconfirmed honours: { id, title, detail, status: "draft", source }.
export const draftHonours = [];