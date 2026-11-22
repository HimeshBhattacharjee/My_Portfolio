import { m, useReducedMotion } from "framer-motion";
import { EASE } from "../../utils/motion";

// "How it works" as a row of stages joined by one line. The line draws once when it enters
// the viewport and a single point of light travels along it: the site's one metaphor.
const Pipeline = ({ steps, label = "How it works" }) => {
    const reduced = useReducedMotion();
    return (
        <figure className="pipeline">
            <figcaption className="label pipeline__label">{label}</figcaption>
            <div className="pipeline__track">
                <m.span
                    className="pipeline__line"
                    aria-hidden="true"
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: false, amount: 0.6 }}
                    transition={{ duration: 1.1, ease: EASE }}
                />
                {!reduced && (
                    <m.span
                        className="pipeline__pulse"
                        aria-hidden="true"
                        initial={{ left: "0%", opacity: 0 }}
                        whileInView={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                        viewport={{ once: false, amount: 0.6 }}
                        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.9 }}
                    />
                )}
                <ol className="pipeline__steps">
                    {steps.map((item, index) => (
                        <li key={item.step} className="pipeline__step">
                            <span className="pipeline__node" aria-hidden="true" />
                            <span className="label">{String(index + 1).padStart(2, "0")}</span>
                            <strong>{item.step}</strong>
                            <span className="pipeline__detail">{item.detail}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </figure>
    );
};

export default Pipeline;