import { useEffect, useRef } from "react";
import { decrypt, isRunning, registerLabel } from "./decrypt";

// A navigation label that decrypts (see decrypt.js) when its link is hovered with a mouse
// or pen, or receives keyboard focus. Pointer leave and blur settle it on the real text at
// once. Touch input does nothing here: touch screens get the shared cycle instead.
//
// The real text stays in the DOM as the link's accessible name; the code is an aria-hidden
// overlay, so assistive technology and the layout never see it.
const DecryptLabel = ({ text, className = "" }) => {
    const hostRef = useRef(null);
    const codeRef = useRef(null);

    useEffect(() => {
        const host = hostRef.current;
        const { label, unregister } = registerLabel(host, codeRef.current, text);
        // The label is a child of the link; listen on the link, so the whole hit area counts.
        const link = host.closest("a, button") ?? host;

        const play = () => {
            if (!isRunning(label)) decrypt([label]);
        };
        const onEnter = (event) => {
            if (event.pointerType === "mouse" || event.pointerType === "pen") play();
        };
        const onFocus = () => {
            // Keyboard focus only: a mouse click also focuses the link, and must not restart
            // the run its hover has just played.
            if (link.matches(":focus-visible")) play();
        };
        const settle = () => label.stop();

        link.addEventListener("pointerenter", onEnter);
        link.addEventListener("pointerleave", settle);
        link.addEventListener("focus", onFocus);
        link.addEventListener("blur", settle);
        return () => {
            link.removeEventListener("pointerenter", onEnter);
            link.removeEventListener("pointerleave", settle);
            link.removeEventListener("focus", onFocus);
            link.removeEventListener("blur", settle);
            unregister();
        };
    }, [text]);

    return (
        <span ref={hostRef} className={`decrypt ${className}`.trim()}>
            <span className="decrypt__text">{text}</span>
            <span ref={codeRef} className="decrypt__code" aria-hidden="true" />
        </span>
    );
};

export default DecryptLabel;