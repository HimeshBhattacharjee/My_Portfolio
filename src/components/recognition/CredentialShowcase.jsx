import { m } from "framer-motion";
import { draw, reveal, revealGroup, inView } from "../../utils/motion";
import FocusText from "../ui/FocusText";
import GlitchText from "../ui/GlitchText";

// A verified credential, set as an editorial plate rather than a badge: a fine seal of
// concentric rules drawn in on arrival, then the title, issuer and dates as a citation.
// Only facts from the original certificate appear. The certificate's reference and licence
// IDs are never shown, and there is no verification link because none has been supplied.

const TICKS = Array.from({ length: 36 }, (_, index) => (index * Math.PI * 2) / 36);

function Seal() {
    return (
        <svg className="credential__seal" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
            <m.circle cx="60" cy="60" r="56" variants={draw} className="credential__seal-outer" />
            <m.circle cx="60" cy="60" r="44" variants={draw} className="credential__seal-inner" />
            <g className="credential__seal-ticks">
                {TICKS.map((angle, index) => (
                    <line
                        key={angle}
                        x1={60 + Math.cos(angle) * 47.5}
                        y1={60 + Math.sin(angle) * 47.5}
                        x2={60 + Math.cos(angle) * (index % 3 === 0 ? 52.5 : 50.5)}
                        y2={60 + Math.sin(angle) * (index % 3 === 0 ? 52.5 : 50.5)}
                    />
                ))}
            </g>
            <text x="60" y="58" textAnchor="middle" className="credential__seal-mark">
                GB
            </text>
            <text x="60" y="74" textAnchor="middle" className="credential__seal-sub">
                LEAN · SIX SIGMA
            </text>
        </svg>
    );
}

const CredentialShowcase = ({ credential }) => {
    if (!credential) return null;
    const titleId = `credential-${credential.id}`;

    return (
        <m.article
            className="credential"
            aria-labelledby={titleId}
            variants={revealGroup}
            initial="hidden"
            whileInView="show"
            viewport={inView}
        >
            <span className="credential__rule" aria-hidden="true" />
            <m.div variants={reveal} className="credential__emblem">
                <Seal />
            </m.div>

            <div className="credential__body">
                <m.p variants={reveal} className="label credential__kicker">
                    <span>Credential</span>
                    <span>{credential.certificateType}</span>
                    <span className="credential__verified">Completed</span>
                </m.p>
                <m.div variants={reveal}>
                    <GlitchText as="h3" id={titleId} className="credential__title" text={credential.title} weight={0.8} />
                </m.div>
                <m.p variants={reveal} className="credential__issuer">
                    Issued by <strong>{credential.issuer}</strong>
                    <span className="credential__distinction">{credential.distinction}</span>
                </m.p>
                <FocusText as={m.p} variants={reveal} className="credential__detail">
                    {credential.detail}
                </FocusText>
                <m.dl variants={reveal} className="credential__meta">
                    <div>
                        <dt className="label">Issued</dt>
                        <dd>
                            <time dateTime={credential.issuedISO}>{credential.issued}</time>
                        </dd>
                    </div>
                    {credential.examined && (
                        <div>
                            <dt className="label">Examination</dt>
                            <dd>
                                <time dateTime={credential.examinedISO}>{credential.examined}</time>
                            </dd>
                        </div>
                    )}
                    {credential.recognition && (
                        <div className="credential__honour">
                            <dt className="label">Recognition</dt>
                            <dd>{credential.recognition}</dd>
                        </div>
                    )}
                </m.dl>
            </div>
        </m.article>
    );
};

export default CredentialShowcase;