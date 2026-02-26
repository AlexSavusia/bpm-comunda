import { useState, useCallback } from "react";

export type WaypointRef = {
    edgeId: string;
    index: number;
};

export function useSelection() {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointRef | null>(null);

    const selectNode = (id: string | null) => {
        setSelectedEdgeId(null);
        setSelectedWaypoint(null);
        setSelectedNodeId(id);
    };

    const selectEdge = (id: string | null) => {
        setSelectedNodeId(null);
        setSelectedWaypoint(null);
        setSelectedEdgeId(id);
    };

    const selectWaypoint = useCallback((edgeId: string, index: number) => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setSelectedWaypoint({ edgeId, index });
    }, []);

    const clear = useCallback(() => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setSelectedWaypoint(null);
    }, []);

    return {
        selectedNodeId,
        selectedEdgeId,
        selectedWaypoint,
        setSelectedWaypoint,
        selectNode,
        selectEdge,
        selectWaypoint,
        clear
    };
}