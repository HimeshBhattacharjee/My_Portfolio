// A sequence of stages joined by connectors, with a signal passing from one to the next on
// a loop. The animation is CSS (see .flow in work.css): one keyframe set shared by every
// stage and connector, offset by --i, so nothing runs in JavaScript. `playing` pauses it
// (off screen, or while the visitor drives the figure by hand); `lit` pins one stage on.
// With reduced motion the loop never starts and every stage is shown at rest.
const FlowStrip = ({ steps, playing = true, lit = null, label, className = "" }) => (
    <ol className={`flow ${className}`} data-playing={playing && lit === null} data-manual={lit !== null} aria-label={label} style={{ "--n": steps.length }}>
        {steps.map((step, index) => (
            <li key={step} className="flow__stage" data-lit={lit === null ? undefined : index <= lit} style={{ "--i": index }}>
                <span className="flow__dot" aria-hidden="true" />
                <span className="flow__name">{step}</span>
                {index < steps.length - 1 && <span className="flow__link" aria-hidden="true" />}
            </li>
        ))}
    </ol>
);

export default FlowStrip;