import { useEffect } from "react";

// Collapsed content is inert: out of the tab order and the accessibility tree, matching
// aria-expanded="false" on its toggle. React 18 has no `inert` prop, so it is set directly.
export function useInert(ref, inert) {
    useEffect(() => {
        if (ref.current) ref.current.inert = inert;
    }, [ref, inert]);
}

// Height spring for every expanding panel on the site: critically damped, no bounce.
export const EXPAND = { type: "spring", stiffness: 210, damping: 30, mass: 0.9, restDelta: 0.5 };