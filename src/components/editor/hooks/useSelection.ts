// src/components/editor/hooks/useSelection.ts
import { useState } from "react";

export type WaypointRef = {
    edgeId: string;
    index: number;
};

export function useSelection() {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointRef | null>(null);

    const selectNode = (id: string) => {
        setSelectedEdgeId(null);
        setSelectedWaypoint(null);
        setSelectedNodeId(id);
    };

    const selectEdge = (id: string) => {
        setSelectedNodeId(null);
        setSelectedWaypoint(null);
        setSelectedEdgeId(id);
    };

    const selectWaypoint = (edgeId: string, index: number) => {
        setSelectedNodeId(null);
        setSelectedEdgeId(edgeId);
        setSelectedWaypoint({ edgeId, index });
    };

    const clearSelection = () => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setSelectedWaypoint(null);
    };

    return {
        selectedNodeId,
        selectedEdgeId,
        selectedWaypoint,
        setSelectedWaypoint,
        selectNode,
        selectEdge,
        selectWaypoint,
        clearSelection,
    };
}