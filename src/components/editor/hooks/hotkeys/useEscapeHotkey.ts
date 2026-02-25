import { useWindowKeydown } from "./useWindowKeydown";

type Args = {
    clearWaypoint: () => void;
    selectEdge: (id: string | null) => void;
    selectNode: (id: string | null) => void;
    enabled?: boolean;
};

export function useEscapeHotkey(args: Args) {
    const { clearWaypoint, selectEdge, selectNode, enabled = true } = args;

    useWindowKeydown(
        (e) => {
            if (e.key !== "Escape") return;

            e.preventDefault();
            clearWaypoint();
            selectEdge(null);
            selectNode(null);
        },
        { enabled }
    );
}