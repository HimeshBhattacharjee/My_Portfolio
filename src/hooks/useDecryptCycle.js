import { useEffect } from "react";
import { addCycleContainer, CYCLE_EVERY_MS } from "../components/ui/decrypt";

// Opts a navigation container into the page's touch decryption cycle (see
// components/ui/decrypt.js) while `enabled` is true.
export function useDecryptCycle(containerRef, enabled, firstDelay = CYCLE_EVERY_MS) {
    useEffect(() => {
        const container = containerRef.current;
        if (!enabled || !container) return undefined;
        return addCycleContainer(container, firstDelay);
    }, [containerRef, enabled, firstDelay]);
}