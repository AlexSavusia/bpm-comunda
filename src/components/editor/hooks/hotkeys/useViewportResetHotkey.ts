import { useWindowKeydown } from "./useWindowKeydown";
import { isModKey } from "./keyboardUtils";

type Args = {
    resetViewport: () => void;
    enabled?: boolean;
};

export function useViewportResetHotkey(args: Args) {
    const { resetViewport, enabled = true } = args;

    useWindowKeydown(
        (e) => {
            if (!isModKey(e)) return;
            if (e.key !== "0") return;

            e.preventDefault();
            resetViewport();
        },
        { enabled }
    );
}