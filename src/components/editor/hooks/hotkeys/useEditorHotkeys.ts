import { useDeleteHotkeys } from "./useDeleteHotkeys";
import { useEscapeHotkey } from "./useEscapeHotkey";
import { useViewportResetHotkey } from "./useViewportResetHotkey";
import { useEffect } from "react";

type SelectedWaypoint = { edgeId: string; index: number } | null;

type Args = {
    enabled?: boolean;

    // selection state
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    selectedWaypoint: SelectedWaypoint;

    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // selection actions
    selectNode: (id: string | null) => void;
    selectEdge: (id: string | null) => void;
    clearWaypoint: () => void;

    // mutations
    removeNode: (nodeId: string) => void;
    removeEdge: (edgeId: string) => void;
    removeWaypoint: (edgeId: string, index: number) => void;

    // viewport
    resetViewport: () => void;
};

export function useEditorHotkeys(args: Args) {



    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;

            const el = document.activeElement as HTMLElement | null;
            const isTyping =
                el?.tagName === "INPUT" ||
                el?.tagName === "TEXTAREA" ||
                (el as any)?.isContentEditable;

            // Undo/Redo (не ломаем ввод)
            if (isMod && !isTyping) {
                const key = e.key.toLowerCase();

                // Ctrl/Cmd+Z
                if (key === "z" && !e.shiftKey) {
                    e.preventDefault();
                    if (args.canUndo) args.undo();
                    return;
                }

                // Ctrl/Cmd+Shift+Z  OR  Ctrl/Cmd+Y
                if ((key === "z" && e.shiftKey) || key === "y") {
                    e.preventDefault();
                    if (args.canRedo) args.redo();
                    return;
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [args]);

    const { enabled = true } = args;
    useDeleteHotkeys({
        enabled,
        selectedWaypoint: args.selectedWaypoint,
        selectedEdgeId: args.selectedEdgeId,
        selectedNodeId: args.selectedNodeId,

        removeWaypoint: args.removeWaypoint,
        removeEdge: args.removeEdge,
        removeNode: args.removeNode,

        clearWaypoint: args.clearWaypoint,
        selectEdge: args.selectEdge,
        selectNode: args.selectNode,
    });

    useEscapeHotkey({
        enabled,
        clearWaypoint: args.clearWaypoint,
        selectEdge: args.selectEdge,
        selectNode: args.selectNode,
    });

    useViewportResetHotkey({
        enabled,
        resetViewport: args.resetViewport,
    });
}