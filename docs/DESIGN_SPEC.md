# Portfolio redesign: design specification

Status: approved. Phases 3 and 4 implemented: foundation, hero, Lattice, Selected Work, The String, About, Expertise, Research & Recognition, Contact. Branch: `portfolio-redesign`. See section 10 for Phase 4 changes.
This document contains no private or employer-confidential information and is safe to commit. Factual content lives in `CONTENT_TO_CONFIRM.md`, which is git-ignored.

---

## 1. Creative direction

**Luminescence, hybrid.** A premium digital identity for an engineer, software developer and product builder.

| Layer | Taken from | What it contributes |
| --- | --- | --- |
| Visual identity | B, Luminescence | Deep graphite environment, light as the single motif, one 3D composition |
| Typography and layout | A, Cover Story | Large editorial type, generous whitespace, photographs as plates, long-form case studies |
| Information structure | C, Revision History | Specification tables, labelled metadata, every fact sourced from a data file with a status |

### The idea

Light reveals structure. Parts of a system are dim until attention reaches them, then they light and their connections become visible. This is the only metaphor on the site.

### What it must not become

The concept came from electroluminescence imaging, but nothing on the site depicts solar hardware. No cells, modules, busbars, panels, suns or energy iconography, and no solar vocabulary in the interface. The visual language is abstract: points, lines, a lattice, a pulse of light. It should read equally well for enterprise software, product work and computer vision.

### Rules of restraint

1. One accent colour, used only for the active or current item.
2. Light effects exist only inside the 3D lattice. Never on borders, buttons or text.
3. No gradient text, no glass panels, no drop shadows as decoration. Corners are square (0 to 2 px).
4. One WebGL canvas on the whole site.
5. One orchestrated motion moment per section. Nothing loops except the lattice at rest.
6. Nothing is drawn over the face in the portrait.

---

## 2. Design tokens

### Colour

Final palette, as implemented in `tailwind.config.js` and `src/index.css`. It supersedes the earlier petrol, silver and amber proposal.

| Token | Value | Role |
| --- | --- | --- |
| `graphite-950` | `#0A0B0D` | Page background |
| `graphite-900` | `#101216` | Raised surface, overlays |
| `graphite-800` | `#181B20` | Table stripes, quiet fills |
| `graphite-700` | `#22262D` | Strong fills |
| `line` | `#2A2E36` | Hairlines, dividers, control borders |
| `muted` | `#8F949C` | Metadata and labels (neutral grey) |
| `soft` | `#BDB9B1` | Secondary body text |
| `paper` | `#EDE9E1` | Body text (warm white) |
| `bright` | `#F8F5EF` | Headings, primary button |
| `cyan` | `#45D9F2` | The one accent: current section, focus ring, the light pulse, hover on primary actions |

Dark only. No theme toggle: the identity depends on the dark environment, and one theme halves the maintenance.

### Typography

| Role | Face | Use |
| --- | --- | --- |
| Display | Archivo, variable, width 125 | Name, section titles, timeline years. Uppercase only for the name |
| Text | Archivo, width 100 | Body copy, 17 to 19 px, line height 1.6, measure 60 to 68 characters |
| Editorial | Newsreader italic | Standfirsts, one pull line per section. The Cover Story influence |
| Data | IBM Plex Mono | Dates, labels, metadata, stack lists. 12 to 13 px, tracked, uppercase for labels |

Three families, self-hosted as subset WOFF2 files with `font-display: swap`. No third-party font request.

Scale (px): 12, 13, 15, 17, 19, 24, 32, 44, 64, 96, then fluid for the name with `clamp()`.

### Layout

- 12-column grid, 1320 px maximum, side gutters 24 px on phones and 64 px on desktop.
- Section spacing 160 px on desktop, 96 px on phones. Whitespace is the main luxury signal.
- Each section opens with a mono label row (section name, a short descriptor), then a display title. This is the Revision History influence: structure that states what you are looking at.
- Breakpoints: 640, 1024, 1440. Designed phone-first.

### Motion

- Vocabulary: dim to lit (opacity and colour), short rises of 12 to 16 px, line draw for dividers. Durations 300 to 700 ms, easing `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Framer Motion for layout transitions (panel to case study) and scroll-linked values (The String).
- `prefers-reduced-motion`: no scroll-linked movement, no sweeps, lattice rendered as a still frame, content visible immediately.

---

## 3. Sections

Order: Hero, Profile, Selected Work, Journey, Expertise, Beyond Work, Contact.

### Hero

- **Left:** name in expanded capitals, widening from condensed to expanded once on load (font width axis). Below it a mono role line and one Newsreader sentence of intent. Two actions: View work, Résumé.
- **Right:** the portrait (section 4).
- **Behind and below the text:** the Lattice (section 5).
- Height is content-driven with a minimum of 88 vh so the next section shows on first view.
- Phones: portrait first at 1:1, name beneath, lattice as a low horizon band.

### Profile

Two columns. Left: about 130 words in the first person. Right: three practice areas set as a specification list (area, what it means, one linked proof). A "Currently" row for ongoing learning. Optional detail plate from the portrait (hands and watch).

### Selected Work

See section 7.

### Journey

The String. See section 6.

### Expertise

A specification table grouped by problem, not a logo wall: Build, Data and cloud, Vision and ML, Process and quality. Each row: capability, tools, and a link to the project or milestone that evidences it. Rows without evidence are not listed.

### Beyond Work

Short prose, one image, at most four interests. No icons.

### Contact

Left: one sentence and direct links (email, LinkedIn, GitHub, résumé). Right: the form. Footer colophon: built with React, Three.js, Framer Motion; set in Archivo, Newsreader, IBM Plex Mono.

### Navigation

- Top bar: monogram left; Résumé and Contact right. Transparent over the hero, solid `graphite-950` after. *(Superseded in the final refinement: the bar is fixed and always visible, on a translucent theme-aware surface with a restrained blur and a hairline edge.)*
- Progress rail on the bottom edge on desktop: one tick per section, the current one in cyan, each a link. It is an ordinary `<nav>` list.
- Phones: the rail becomes a bottom-centre label showing the current section; tapping opens a full-screen index.
- Skip-to-content link, visible focus rings in cyan, section headings reachable by landmark.

---

## 4. Portrait

Source: `public/images/Himesh_Image.png` (1086 × 1448). The original file is kept untouched.

**Permitted:** CSS cropping (`object-fit`, `object-position`), a CSS mask feathering the left and bottom edges into the page, proportional resizing into AVIF and WebP at 480, 720 and 1086 px with the PNG as fallback, descriptive alt text.

**Not permitted:** regeneration, retouching, smoothing, relighting, colour grading, duotone, blend modes, mirroring, stretching, tilt or hover distortion, any overlay crossing the face.

| Crop | Ratio | Use |
| --- | --- | --- |
| Hero | 4:5, head to chest | Desktop hero, right side, gaze toward the name |
| Square | 1:1, head and shoulders | Phone hero, social sharing image |
| Detail | 3:2, hands and watch | Profile or Beyond Work |

The mask is applied to the image element only, so the photograph itself is never modified. Because the source is 1086 px wide, the hero image column is capped at 540 CSS px.

---

## 5. The Lattice: the one 3D composition

An abstract field of interconnected points on a receding plane, sitting low in the hero.

- **Rest:** points and connecting lines at low brightness in warm white.
- **On load:** one pulse of light travels through the connections from the portrait side to the far edge. Points brighten as it passes and settle to a faint lit state.
- **Pointer:** nearby points brighten gently. No pointer on touch devices; a slow ambient drift of brightness instead.
- **Meaning:** interconnected systems, and light revealing structure. It is not a depiction of any product.

Implementation constraints:

- One `<Canvas>`, mounted in the hero only, loaded with `React.lazy` after first paint.
- Two draw calls: one `InstancedMesh` for points, one `LineSegments` for connections. One small custom shader with a time and pointer uniform. No textures, no models, no post-processing, no shadows.
- Device pixel ratio capped at 1.5. `frameloop="demand"` driven by a ticker that stops when the hero leaves the viewport or the tab is hidden.
- Fallback: a static SVG of the same lattice for reduced motion, missing WebGL, or `navigator.hardwareConcurrency <= 4` combined with a small screen.
- `drei` is not required. Target: 3D chunk under 170 KB gzipped (three core plus R3F), fetched after the page is interactive.

---

## 6. The String: professional timeline

A single line of time with milestones attached, generated from `src/data/timeline.js`.

### Categories

Distinguished by marker shape as well as lane, never by colour alone.

| Category | Marker | Lane |
| --- | --- | --- |
| Role (employer, designation) | Solid square, with a band for the tenure | Above |
| Project | Diamond | Above |
| Education | Ring, with a band for the period | Below |
| Credential (certification, training, coursework) | Double ring | Below |
| Achievement | Triangle | Below |

### Desktop (1024 px and wider)

- The section is taller than the viewport and its content is `position: sticky`. Native vertical scrolling drives a horizontal translation of the string through Framer Motion `useScroll`. No wheel events are intercepted, so the browser's own scrolling, scrollbar, keyboard and touchpad behaviour are unchanged.
- A fixed marker at centre shows the active milestone, which is the only cyan element. Its detail sits below in an editorial panel: date in display numerals, title, organisation, designation, a short account, tags, and a link to a case study where one exists.
- Pinned distance is capped at about 300 vh regardless of entry count; density is handled by the time scale, not by more scrolling.
- Minimap of the whole string with the visible window. Clicking jumps.
- Filters: All, Career, Education, Projects, Credentials. Non-matching markers dim and stay in place.

### Accessibility safeguards

- "Skip the journey" link before the section, and a **List view** toggle that replaces the string with a plain chronological list. The choice is remembered.
- All milestones exist in the DOM as an ordered list of buttons in chronological order. Tab and arrow keys move between them, and focusing one scrolls the page to its position.
- Reduced motion selects the list view automatically.
- Nothing is reachable only by hovering or by horizontal scrolling.

### Phones and tablets

A vertical spine on the left with a sticky year label. A line fills downward as you scroll. Markers keep their shapes; tenures are brackets on the spine. Each milestone is a row that expands in place on tap. No horizontal movement.

### Time scale

Linear by date with a minimum gap between markers, so dense years expand slightly and empty years compress, and year ticks always show where you are.

### Data schema

```js
/**
 * @typedef {Object} TimelineEntry
 * @property {string}  id            Unique, kebab-case.
 * @property {'role'|'education'|'project'|'credential'|'achievement'} type
 * @property {string}  title         Designation, degree, project or credential name.
 * @property {string}  [org]         Organisation as displayed. Use the anonymised form if required.
 * @property {string}  [location]
 * @property {string}  start         'YYYY-MM' or 'YYYY'.
 * @property {string|null} [end]     'YYYY-MM', 'YYYY', or null for a single date.
 * @property {boolean} [ongoing]     True if it continues to the present.
 * @property {string}  summary       One or two sentences.
 * @property {string[]} [points]     Up to four short points.
 * @property {string[]} [tags]
 * @property {{label:string,url:string}[]} [links]
 * @property {string}  [projectId]   Links to an entry in projects.js.
 * @property {string}  [groupId]     Ties designations to one employer band.
 * @property {boolean} [featured]    Larger marker.
 * @property {'confirmed'|'draft'} status   Only 'confirmed' is published.
 * @property {'public'|'anonymised'} visibility
 * @property {string}  source        Where the fact came from. Never rendered.
 */
```

Example of adding an entry:

```js
{
  id: 'example-credential',
  type: 'credential',
  title: '',
  org: '',
  start: '',
  end: null,
  summary: '',
  tags: [],
  status: 'draft',
  visibility: 'public',
  source: ''
}
```

### Publication gate

- `src/data/index.js` exports only entries with `status: 'confirmed'`. In development, drafts render with a dashed outline and a "Draft" label; in a production build they are filtered out before rendering.
- A dependency-free script, `scripts/check-content.mjs`, runs before `vite build` and fails the build if a confirmed entry lacks a date, a source, or has `end` before `start`, or if any confirmed entry marked `anonymised` contains a term from a local, git-ignored blocklist of names that must not appear.
- `projects.js`, `profile.js` and `expertise.js` use the same `status` field and the same gate.

---

## 7. Selected Work

### Ranking

| Rank | Project | Why | Condition |
| --- | --- | --- | --- |
| 1 | Safarnama | An independent product: the only project that can be shown completely, with real screens and a live link. Demonstrates product judgement end to end | Needs all facts and material from the owner; none were available at specification time |
| 2 | Quality Operations Platform | The deepest engineering story: full-stack, role-based workflows, reporting, analytics | Anonymised. Illustrative visuals only |
| 3 | EL Image Analysis | The differentiator: computer vision applied to inspection | Method-led. Feature only if the work reached at least a working prototype |
| 4 | Performance Management System | Enterprise workflow breadth | Feature only if enough approved facts exist; otherwise a compact entry in the index |

Layout: the first project as a full-width lead, the next two side by side, the fourth conditional. If only two are ready at launch, the layout holds with two.

### Anonymisation rules for professional work

- Employer described generically ("a manufacturing organisation") unless naming is approved in writing.
- No proprietary screenshots, internal datasets, employee names or IDs, client data, internal system names, infrastructure details, or business figures.
- Architecture shown at the level of a generic pattern (client, API, database, object storage) and nothing more specific.
- Results stated qualitatively unless a figure is explicitly approved. If nothing can be stated, the Result block is omitted.

### Illustrative mockups

For projects without approved screenshots, interfaces are redrawn in code (HTML, CSS, SVG) in the site's own visual language, populated with obviously synthetic data, and captioned "Illustrative interface. Synthetic data." They are not imitations of the real screens.

| Project | Lead figure |
| --- | --- |
| Safarnama | Real screens, plus an animated settlement diagram if the product computes one |
| Quality Operations Platform | A redrawn review workflow (record, verify, approve) and a generic trend chart |
| EL Image Analysis | A procedurally generated greyscale sample with synthetic defects and detection overlays |
| Performance Management System | A goal hierarchy diagram through one review cycle |

### Case study

Opens as an overlay from the panel with a shared layout transition, addressable by hash (`#work/<id>`), closes back to the same scroll position, traps focus, and closes on Escape.

Structure: Context, My role, What I built, How it works (one diagram), Result, Stack. A specification strip at the top gives role, period, type and status.

### Earlier work

A typographic index below the featured projects: year, name, one line, stack, link. No thumbnails.

---

## 8. Technical plan

### Issues from Phase 1 and their resolution

| Issue | Resolution |
| --- | --- |
| About 60 MB of assets | Remove `public/planet` (28.5 MB), `public/desktop_pc` (11 MB), `herobg.png` (15.8 MB), the old project images and unused template logos. Portrait served as responsive AVIF and WebP. Budget: under 1.5 MB transferred on first load, 3D included |
| 16 WebGL canvases | One canvas, the Lattice, hero only. Skill icons, planet and stars are removed, not ported |
| Contact error handling | Rewrite with `async`/`await` and `try`/`catch`/`finally`. Inline status region with `aria-live`. Field validation, disabled state while sending, honeypot field. No `alert()` |
| Fictional testimonials | Component and data deleted. No testimonial section unless real, permitted quotes are supplied |
| Stale `dist/` | See below |
| Broken classes and markup | Disappear with the rewritten components; ESLint run added to the pre-build check |
| No SEO | Title, description, canonical, Open Graph and Twitter tags, generated social image, JSON-LD `Person`, `robots.txt`, `sitemap.xml` |
| No deployment config | `netlify.toml`: build command, publish directory, long-lived cache headers for hashed assets, security headers |

### The stale `dist/` folder

- Built on 14 June at 23:05 by a Vite dev session whose logs remain as `.codex-vite.*.log`. It references components (`Achievements`, `Publications`, `Skills`, `Projects`, `FloatingCta`, `ThemeToggle`) that no longer exist in the source tree.
- It is not what is deployed. The live site serves a different bundle with the original title.
- It is git-ignored and was never committed.
- Its copy contains unverified professional claims. They are listed in `CONTENT_TO_CONFIRM.md` and must not be reused without confirmation.
- Recommendation: delete `dist/` and the two log files once the claims list has been reviewed. A fresh build regenerates `dist/`.

### Dependencies

| Package | Finding | Action |
| --- | --- | --- |
| `@truffle/hdwallet-provider` | Never imported. Ethereum wallet tooling | Remove |
| `git` | Never imported | Remove |
| `react-simple-typewriter` | Never imported | Remove |
| `react-tilt` | Used by the old cards | Remove with those components |
| `react-vertical-timeline-component` | Used by the old timeline | Remove; The String is custom |
| `react-router-dom` | Used only for a logo link | Remove; hash state handles case studies |
| `maath` | Used only by the star field | Remove |
| `@react-three/drei` | Used by the old scenes | Remove if the Lattice does not need it |
| `tailwindcss` | Listed under `dependencies` | Move to `devDependencies` |
| `react`, `react-dom`, `vite`, `framer-motion`, `three`, `@react-three/fiber`, `@emailjs/browser` | In use | Keep |

No new runtime dependency is planned. `node_modules` is currently out of sync with `package.json` and needs `npm install` before anything runs.

### Secrets and configuration

- EmailJS identifiers move to `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` in `.env.local` (git-ignored) and in Netlify's environment settings. A `.env.example` with empty values is committed.
- Anything prefixed `VITE_` is embedded in the public bundle by design. The EmailJS public key is meant to be public; protection comes from restricting allowed origins in the EmailJS dashboard, which should be enabled.
- The recipient address is set in the EmailJS template, not in client code.
- `private/` and `CONTENT_TO_CONFIRM.md` are git-ignored. The résumé belongs in `private/`.

### Structure

```
src/
  data/        index.js  profile.js  timeline.js  projects.js  expertise.js  beyond.js
  sections/    Hero  Profile  Work  Journey  Expertise  Beyond  Contact
  components/
    timeline/  String  Marker  Band  Detail  Minimap  ListView
    work/      Panel  CaseStudy  figures/
    three/     Lattice  LatticeFallback
    ui/        Rail  TopBar  Button  Plate  SpecTable
  hooks/       useActiveSection  useReducedMotion  useHashRoute
  styles/      tokens.css  fonts.css
scripts/       check-content.mjs
```

### Performance and quality targets

- Largest Contentful Paint under 2.5 s on a mid-range phone over 4G; the LCP element is the name, not the canvas.
- Initial JavaScript under 120 KB gzipped before the lazy 3D chunk.
- No layout shift from fonts or the portrait (explicit dimensions, matched fallback metrics).
- 60 fps scrolling through The String on an ordinary laptop; only `transform` and `opacity` are animated.
- WCAG AA contrast, full keyboard operation, tested with a screen reader on the timeline and the case-study overlay.

### Roadmap

| Phase | Work | Done when |
| --- | --- | --- |
| 0. Content | Résumé reviewed, `CONTENT_TO_CONFIRM.md` answered, decisions in section 9 made | Timeline and project data can be marked confirmed |
| 1. Foundation | `npm install`, dependency cleanup, tokens, fonts, data layer with the publication gate, portrait derivatives, asset removal, `.env.example`, `netlify.toml` | Empty shell builds; content check passes |
| 2. Shell and hero | Top bar, rail, hero typography, portrait, Lattice with fallback | Hero meets the performance targets on a phone |
| 3. The String | Desktop string, list view, phone spine, filters, minimap, keyboard | Usable by keyboard and with reduced motion |
| 4. Selected Work | Panels, case-study overlay, figures, earlier-work index | Each featured project has approved copy |
| 5. Remaining sections | Profile, Expertise, Beyond Work, Contact with the repaired form | Form verified for success and failure |
| 6. Quality pass | Accessibility, SEO, social image, performance audit, cross-device check | Targets above are met |
| 7. Review | Local preview for the owner. Commit, push and deploy only on explicit approval | Sign-off |

Phases 1 and 2 do not depend on unconfirmed content and can begin once approved. Phases 3 to 5 need Phase 0.

---

## 9. Open decisions

Tracked in `CONTENT_TO_CONFIRM.md`, section "Decisions".

---

## 10. Phase 4 changes to this specification

| Area | Change | Reason |
| --- | --- | --- |
| Section order | Hero, Selected Work, The String, About, Expertise, Research & Recognition, Contact. "Beyond Work" is not built | Owner's Phase 4 brief; no confirmed interests to show |
| Selected Work | IntuitIQ lead; Sign Language Gloves (hardware, blueprint language); IntelliView (labelled prototype); professional work in its own band with a synthetic-data mockup. The section 7 ranking (Safarnama and others) is superseded | Only completed, evidenced work is shown |
| Lattice | Rewritten from React Three Fiber to plain Three.js with named imports. Same shaders, geometry, single canvas, on-demand rendering, visibility pausing, reduced-motion fallback and disposal. Chunk 219.7 KB to 118.4 KB gzipped | Section 5 target of 170 KB; R3F registers the whole THREE namespace |
| Publication gate | Drafts live in `src/data/drafts.js`; the `strip-drafts` plugin in `vite.config.js` replaces it with an empty module in production builds. `scripts/check-content.mjs` runs before every build | Render-time filtering alone still shipped draft text in the bundle |
| Timeline schema | Types `internship` (hollow square) and `publication` (hollow diamond) added | Internships and papers are distinct from roles and awards |

## 11. Phase 5 changes to this specification

| Area | Change | Reason |
| --- | --- | --- |
| Journey, desktop | The horizontal pinned String is replaced by a central vertical spine with alternating cards (`SpineView.jsx`), the structure of the original academic timeline. The milestone crossing a thin focus band in the middle of the viewport (`useFocusBand`, one IntersectionObserver with hysteresis) expands; passed cards contract and step back. Each row reserves its card's full expanded height, so expansion never reflows the page. Overlapping periods are drawn as rails beside the spine (`computeSpans`); the spine ends in a "Present" cap | Owner's Phase 5 brief. No wheel interception, no pinning |
| Journey, phones and tablets | Same vertical list structure, with a focus-band highlight, animated expand/collapse (collapsed content is inert) and the "Present" cap. The desktop "List view" toggle is retired | Mobile structure kept as asked; the toggle existed for the horizontal layout |
| Timeline data | `btech-graduation` added (Jul 2025, CGPA from the résumé). Optional `order` field (sort position only, never displayed) places the year-only publications after graduation | Owner's milestone list; no month invented |
| Focus-responsive text | `useFocusText`: one shared IntersectionObserver writes `data-focus`; CSS uses `filter: opacity() blur()` and `translate`, so it composes with Framer Motion. Held lit on hover, focus-within and active selection; gentler on phones; opacity only with reduced motion | Brief stage C |
| Selected Work | The case-study overlay is replaced by in-place expansion (`ProjectDetails.jsx`); `#work/<id>` deep links scroll to and open the project. Work rail joins the four projects. Gloves: signal-flow loop, synthetic sensor readings removed. IntelliView: stage tabs, no score or results. "Quality digitalisation" renamed "Quality Portal", labelled internal case study; the internal URL is not published anywhere | Brief stage D and confidentiality rules |
| Section depth | `depth/WireSculpture.jsx`: real 3D wireframe geometry projected to SVG per frame (no second WebGL context), paused off screen and in hidden tabs, static under reduced motion. Used by Contact (sphere, rings, satellites, floor, cast light/shadow) and About (orbit behind the plate). Expertise graph becomes a data-derived constellation; Research papers become layered document sheets | Brief stage E; Lattice stays the only WebGL canvas |
| Glitch | Name, portrait frame and section titles also glitch on scroll re-entry and keyboard focus, with cooldowns | Brief stage F |
| Styles | New files `work.css`, `journey.css`, `depth.css`; String and overlay styles removed (archived in `private/superseded/`) | Keep `sections.css` from growing |
