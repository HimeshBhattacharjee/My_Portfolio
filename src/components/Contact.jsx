import { useRef, useState } from "react";
import { m } from "framer-motion";
import emailjs from "@emailjs/browser";
import { profile, publishedLinks, site } from "../data";
import { reveal, revealGroup } from "../utils/motion";
import SectionHeader from "./ui/SectionHeader";
import DownloadCV from "./ui/DownloadCV";
import Cosmos from "./ui/Cosmos";
import WireSculpture from "./depth/WireSculpture";
import { ArrowRight, ArrowUpRight } from "./ui/Icons";

/* ------------------------------------------------------------------
   Contact form → EmailJS → the connected email service → my inbox.

   Configuration comes from the environment (see .env.example and docs/EMAILJS_SETUP.md).
   The service ID, template ID and public key are public by design (they ship in the
   bundle); protect them with allowed origins in the EmailJS dashboard. No private key
   or access token is ever used here.

   The RECIPIENT IS NOT SENT FROM THE BROWSER. It is fixed in the EmailJS template's
   "To Email" field, so a visitor cannot redirect messages by editing the request.
   Reply-To is the visitor's address ({{email}}), so replying answers them directly.
------------------------------------------------------------------- */
const config = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
const configured = Boolean(config.serviceId && config.templateId && config.publicKey);

const LIMITS = { name: 80, email: 254, subject: 120, message: 4000 };
const MIN_MESSAGE = 10;
// One message a minute from this browser. Enforced here and by the SDK's limitRate.
// This only slows down casual repeats; real abuse protection is the dashboard's origin
// restriction and the provider's own limits (see docs/EMAILJS_SETUP.md).
const THROTTLE_MS = 60_000;

const empty = { name: "", email: "", subject: "", message: "", hb_check: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const directEmail = publishedLinks.find((link) => link.id === "email");

// Plain text only: trim, drop control characters (keeping line breaks in the message),
// cap the length. EmailJS escapes {{double-brace}} variables when it renders the email.
const clean = (value, max, multiline = false) =>
    value
        .replace(multiline ? /[^\P{Cc}\n\t]/gu : /\p{Cc}/gu, "")
        .trim()
        .slice(0, max);

function validate(form) {
    const errors = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!name) errors.name = "Please add your name.";
    else if (name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;
    if (!email) errors.email = "Please add your email address.";
    else if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email) errors.email = "Please check the email address.";
    if (!subject) errors.subject = "Please add a subject.";
    else if (subject.length > LIMITS.subject) errors.subject = `Please keep the subject under ${LIMITS.subject} characters.`;
    if (message.length < MIN_MESSAGE) errors.message = "Please write a short message.";
    else if (message.length > LIMITS.message) errors.message = `Please keep the message under ${LIMITS.message} characters.`;
    return errors;
}

// What a failed send means for the visitor. Never a success message.
function failureText(error) {
    if (error?.status === 429) return "A message was sent from this browser a moment ago. Please wait a minute before sending another.";
    if (error?.status === 0 || error instanceof TypeError) return "The mail service could not be reached. Please check your connection and try again.";
    return "The message could not be sent. Please try again in a moment.";
}

function Field({ name, label, error, count, children }) {
    return (
        <div className="field" data-invalid={error ? "true" : undefined}>
            <label htmlFor={`contact-${name}`} className="label field__label">
                <span>{label}</span>
                {count}
            </label>
            {children}
            {error && (
                <span id={`contact-${name}-error`} className="field__error">
                    {error}
                </span>
            )}
        </div>
    );
}

const Contact = () => {
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ state: "idle", text: "" });
    const lastSent = useRef(0);
    const sectionRef = useRef(null);
    const frame = useRef(0);

    // Ambient light: a soft pool of the accent colour follows the pointer through the
    // section. One CSS custom property update per frame; no layout, no re-render.
    const onPointerMove = (event) => {
        const section = sectionRef.current;
        if (!section || frame.current) return;
        const { clientX, clientY } = event;
        frame.current = requestAnimationFrame(() => {
            frame.current = 0;
            const rect = section.getBoundingClientRect();
            section.style.setProperty("--lx", `${clientX - rect.left}px`);
            section.style.setProperty("--ly", `${clientY - rect.top}px`);
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
        if (status.state === "sent" || status.state === "error") setStatus({ state: "idle", text: "" });
    };

    const fail = (text) => setStatus({ state: "error", text, direct: true });

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (status.state === "sending") return;

        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            setStatus({ state: "invalid", text: "Please check the highlighted fields." });
            // Focus the first field that needs attention (by id: the aria-invalid attributes
            // only appear on the next render).
            const first = ["name", "email", "subject", "message"].find((field) => found[field]);
            document.getElementById(`contact-${first}`)?.focus({ preventScroll: false });
            return;
        }
        // Honeypot: a field people never see. If it is filled, nothing is sent, and the
        // visitor is told so honestly (with the direct address), in case autofill did it.
        if (form.hb_check) return fail("The message could not be sent.");
        if (!configured) return fail("The contact form is not configured on this copy of the site.");
        if (Date.now() - lastSent.current < THROTTLE_MS) return fail(failureText({ status: 429 }));

        const name = clean(form.name, LIMITS.name);
        const email = clean(form.email, LIMITS.email);
        const subject = clean(form.subject, LIMITS.subject);
        const message = clean(form.message, LIMITS.message, true);

        setStatus({ state: "sending", text: "Sending your message." });
        try {
            await emailjs.send(
                config.serviceId,
                config.templateId,
                {
                    // The template's variables (docs/EMAILJS_SETUP.md).
                    name,
                    email,
                    subject,
                    message,
                    time: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) + " IST",
                    source: `Portfolio contact form · ${site.url}`,
                    // The same values under the names the earlier template used, so an
                    // un-updated template still shows who wrote. Safe to drop once the
                    // template uses the names above.
                    from_name: name,
                    from_email: email,
                    reply_to: email,
                },
                {
                    publicKey: config.publicKey,
                    blockHeadless: true,
                    limitRate: { id: "portfolio-contact", throttle: THROTTLE_MS },
                },
            );
            lastSent.current = Date.now();
            setStatus({ state: "sent", text: `Thank you, ${name.split(" ")[0]}. Your message has been sent, and I will reply to ${email}.` });
            setForm(empty);
        } catch (error) {
            fail(failureText(error));
        }
    };

    const sending = status.state === "sending";
    const describedBy = (field) => (errors[field] ? `contact-${field}-error` : undefined);
    const messageLength = form.message.trim().length;

    return (
        <section id="contact" ref={sectionRef} className="section contact" aria-labelledby="contact-title" onPointerMove={onPointerMove}>
            {/* The closing environment: a night sky, light that follows the pointer, a
                dimensional floor, and a wireframe sculpture in orbit. Decorative only. */}
            <div className="contact__env" aria-hidden="true">
                <Cosmos variant="contact" />
                <span className="contact__light" />
                <span className="contact__floor">
                    <span />
                </span>
                <div className="contact__sculpture">
                    <span className="contact__cast" />
                    <WireSculpture variant="contact" hostRef={sectionRef} />
                </div>
            </div>
            <div className="shell relative">
                <SectionHeader
                    id="contact-title"
                    label="06 · Contact"
                    title="Write to me"
                    standfirst="About a role, a collaboration, or a problem that sits somewhere between hardware and software."
                />

                <m.div
                    className="grid gap-x-16 gap-y-14 lg:grid-cols-12"
                    variants={revealGroup}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.15 }}
                >
                    <m.div variants={reveal} className="lg:col-span-4">
                        <p className="label mb-4">Direct</p>
                        <ul>
                            {publishedLinks.map((link) => {
                                const external = !link.url.startsWith("mailto:");
                                return (
                                    <li key={link.id}>
                                        <a
                                            href={link.url}
                                            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                                            className="index__row contact-link"
                                        >
                                            <span>{link.label}</span>
                                            <span className="label contact-link__display">{link.display}</span>
                                            {external ? <ArrowUpRight width={15} height={15} /> : <ArrowRight width={15} height={15} />}
                                            {external && <span className="sr-only">(opens in a new tab)</span>}
                                        </a>
                                    </li>
                                );
                            })}
                            <li>
                                <DownloadCV variant="row">CV</DownloadCV>
                            </li>
                        </ul>
                        <p className="label mt-8">Based in {profile.location}</p>
                    </m.div>

                    <m.form
                        variants={reveal}
                        className="contact-form lg:col-span-7 lg:col-start-6 flex flex-col gap-8"
                        onSubmit={handleSubmit}
                        noValidate
                        aria-busy={sending}
                        data-state={status.state}
                    >
                        <div className="grid gap-8 sm:grid-cols-2">
                            <Field name="name" label="Name" error={errors.name}>
                                <input
                                    id="contact-name"
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    required
                                    maxLength={LIMITS.name}
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={sending}
                                    aria-invalid={errors.name ? "true" : undefined}
                                    aria-describedby={describedBy("name")}
                                />
                            </Field>
                            <Field name="email" label="Email" error={errors.email}>
                                <input
                                    id="contact-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    inputMode="email"
                                    required
                                    maxLength={LIMITS.email}
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={sending}
                                    aria-invalid={errors.email ? "true" : undefined}
                                    aria-describedby={describedBy("email")}
                                />
                            </Field>
                        </div>
                        <Field name="subject" label="Subject" error={errors.subject}>
                            <input
                                id="contact-subject"
                                type="text"
                                name="subject"
                                autoComplete="off"
                                required
                                maxLength={LIMITS.subject}
                                value={form.subject}
                                onChange={handleChange}
                                disabled={sending}
                                aria-invalid={errors.subject ? "true" : undefined}
                                aria-describedby={describedBy("subject")}
                            />
                        </Field>
                        <Field
                            name="message"
                            label="Message"
                            error={errors.message}
                            count={
                                messageLength > LIMITS.message * 0.75 ? (
                                    <span className="field__count">
                                        {messageLength} / {LIMITS.message}
                                    </span>
                                ) : null
                            }
                        >
                            <textarea
                                id="contact-message"
                                name="message"
                                rows="5"
                                required
                                maxLength={LIMITS.message}
                                value={form.message}
                                onChange={handleChange}
                                disabled={sending}
                                aria-invalid={errors.message ? "true" : undefined}
                                aria-describedby={describedBy("message")}
                            />
                        </Field>
                        {/* Honeypot, hidden from people and assistive technology. */}
                        <div className="contact-trap" aria-hidden="true">
                            <label htmlFor="contact-hb-check">Leave this field empty</label>
                            <input id="contact-hb-check" type="text" name="hb_check" value={form.hb_check} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                        </div>
                        <div className="contact-form__foot">
                            <button type="submit" className="btn btn--primary contact-submit" disabled={sending}>
                                {sending ? (
                                    <>
                                        Sending
                                        <span className="contact-submit__dots" aria-hidden="true">
                                            <i />
                                            <i />
                                            <i />
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Send message
                                        <ArrowRight width={16} height={16} />
                                    </>
                                )}
                            </button>
                            <div role="status" aria-live="polite" className="contact-status" data-state={status.state}>
                                {status.text && <p>{status.text}</p>}
                                {status.direct && directEmail && (
                                    <p>
                                        You can email me directly at{" "}
                                        <a href={directEmail.url} className="textlink">
                                            {directEmail.display}
                                        </a>
                                        .
                                    </p>
                                )}
                            </div>
                        </div>
                    </m.form>
                </m.div>
            </div>
        </section>
    );
};

export default Contact;