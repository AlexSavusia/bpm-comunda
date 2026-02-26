import { useWindowKeydown } from "./useWindowKeydown";
import { isTypingTarget } from "./keyboardUtils";

type SelectedWaypoint = { edgeId: string; index: number } | null;

type Args = {
    selectedWaypoint: SelectedWaypoint;
    selectedEdgeId: string | null;
    selectedNodeId: string | null;

    removeWaypoint: (edgeId: string, index: number) => void;
    removeEdge: (edgeId: string) => void;
    removeNode: (nodeId: string) => void;

    clearWaypoint: () => void;
    selectEdge: (id: string | null) => void;
    selectNode: (id: string | null) => void;

    enabled?: boolean;
};

export function useDeleteHotkeys(args: Args) {
    const {
        selectedWaypoint,
        selectedEdgeId,
        selectedNodeId,

        removeWaypoint,
        removeEdge,
        removeNode,

        clearWaypoint,
        selectEdge,
        selectNode,

        enabled = true,
    } = args;

    useWindowKeydown(
        (e) => {
            if (e.key !== "Delete" && e.key !== "Backspace") return;
            if (isTypingTarget(e.target)) return;

            if (selectedWaypoint) {
                e.preventDefault();
                removeWaypoint(selectedWaypoint.edgeId, selectedWaypoint.index);
                clearWaypoint();
                return;
            }

            if (selectedEdgeId) {
                e.preventDefault();
                removeEdge(selectedEdgeId);
                selectEdge(null);
                return;
            }

            if (selectedNodeId) {
                e.preventDefault();
                removeNode(selectedNodeId);
                selectNode(null);
            }
        },
        { enabled }
    );
}