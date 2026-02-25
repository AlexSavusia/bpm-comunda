import { useEffect } from "react";
import { useEvent } from "./useEvent";

type Options = {
    enabled?: boolean;
};

export function useWindowKeydown(handler: (e: KeyboardEvent) => void, opts: Options = {}) {
    const { enabled = true } = opts;
    const onKeyDown = useEvent(handler);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [enabled, onKeyDown]);
}