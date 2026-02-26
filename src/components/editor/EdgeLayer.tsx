import React from "react";
import type { DiagramSchema } from "../../types/schema";
import type { Point } from "./utils/geometry";
import { polylineToPath } from "./utils/geometry";
import { getEdgePolylineSmart, type NodeRect } from "./utils/edgeGeometry";

type Props = {
    schema: DiagramSchema;

    nodeRect: NodeRect;
    selectedEdgeId: string | null;
    selectedWaypoint: { edgeId: string; index: number } | null;


    onSelectEdge: (edgeId: string) => void;
    onAddWaypoint: (edgeId: string, p: Point) => void;

    onSelectWaypoint: (edgeId: string, index: number) => void;
    onBeginWaypointDrag: (edgeId: string, index: number, ev: React.MouseEvent<SVGCircleElement>) => void;

    getWorldPoint: (ev: React.MouseEvent<Element>) => Point;
};

export default function EdgeLayer({
                                      schema,
                                      nodeRect,
                                      selectedEdgeId,
                                      selectedWaypoint,
                                      onSelectEdge,
                                      onAddWaypoint,
                                      onSelectWaypoint,
                                      onBeginWaypointDrag,
                                      getWorldPoint,
                                  }: Props) {
    return (
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} pointerEvents="none">
            <defs>
                <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path d="M0,0 L0,6 L9,3 z" fill="#374151" />
                </marker>
            </defs>

            {schema.edges.map((edge) => {
                const pts = getEdgePolylineSmart(schema, edge.id, nodeRect);
                if (!pts) return null;

                const d = polylineToPath(pts);
                const isEdgeSelected = edge.id === selectedEdgeId;

                return (
                    <g key={edge.id}>
                        {/* HITBOX */}
                        <path
                            d={d}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={14}
                            pointerEvents="stroke"
                            onMouseDown={(ev) => {
                                ev.stopPropagation();
                                onSelectEdge(edge.id);

                                if (ev.altKey) {
                                    const p = getWorldPoint(ev);
                                    onAddWaypoint(edge.id, p);
                                }
                            }}
                        />

                        {/* VISIBLE */}
                        <path
                            d={d}
                            fill="none"
                            stroke={isEdgeSelected ? "#2563eb" : "#374151"}
                            strokeWidth={isEdgeSelected ? 3 : 2}
                            markerEnd="url(#arrow)"
                            pointerEvents="none"
                        />

                        {/* WAYPOINT HANDLES */}
                        {(edge.waypoints ?? []).map((w, idx) => {
                            const isWpSelected =
                                selectedWaypoint?.edgeId === edge.id && selectedWaypoint?.index === idx;

                            return (
                                <circle
                                    key={idx}
                                    cx={w.x}
                                    cy={w.y}
                                    r={isWpSelected ? 7 : 6}
                                    fill={isWpSelected ? "#2563eb" : "#fff"}
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    pointerEvents="all"
                                    onMouseDown={(ev) => {
                                        ev.stopPropagation();
                                        onSelectWaypoint(edge.id, idx);
                                        if (!ev.altKey) onBeginWaypointDrag(edge.id, idx, ev);
                                    }}
                                />
                            );
                        })}
                    </g>
                );
            })}
        </svg>
    );
}