import { useMemo, useState, useEffect } from "react";
import type { NodeType } from "../../types/schema";
import { useViewport } from "./hooks/useViewport";
import { useSelection } from "./hooks/useSelection";
import { useEdges } from "./hooks/useEdges";
import { polylineToPath } from "./utils/geometry";

export default function DiagramEditor() {
    const selection = useSelection();
    const viewport = useViewport();
    const [isSnapEnabled, setIsSnapEnabled] = useState(true);
    const [gridSize, setGridSize] = useState<8 | 16>(16);

    const edges = useEdges({
        getWorldPoint: (e) => viewport.getWorldPoint(e),
        isSnapEnabled,
        gridSize,
        selectNode: selection.selectNode,
        selectEdge: selection.selectEdge,
        selectedEdgeId: selection.selectedEdgeId,
    });

    const selectedNode = useMemo(
        () => edges.schema.nodes.find((n) => n.id === selection.selectedNodeId) ?? null,
        [edges.schema.nodes, selection.selectedNodeId]
    );

    const selectedEdge = useMemo(
        () => edges.schema.edges.find((e) => e.id === selection.selectedEdgeId) ?? null,
        [edges.schema.edges, selection.selectedEdgeId]
    );

    const onCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (edges.updateWaypointDrag(e)) return;
        viewport.onCanvasMouseMovePan(e);
        if (edges.updateNodeDrag(e)) return;
    };

    const onCanvasMouseUp = () => {
        viewport.endPan();
        edges.endWaypointDrag();
        edges.endNodeDrag();
    };

    const addNode = (type: NodeType) => edges.addNode(type);


    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.key === "Delete" || e.key === "Backspace") && selection.selectedWaypoint) {
                e.preventDefault();
                const { edgeId, index } = selection.selectedWaypoint;
                edges.removeWaypoint(edgeId, index);
                selection.setSelectedWaypoint(null);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selection.selectedWaypoint]);



    return (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 340px", height: "calc(100vh - 64px)" }}>
            {/* LEFT PANEL */}
            <div style={{ borderRight: "1px solid #e5e7eb", padding: 12, display: "grid", gap: 8 }}>
                <button onClick={() => addNode("start")}>+ Start</button>
                <button onClick={() => addNode("task")}>+ Task</button>
                <button onClick={() => addNode("gateway")}>+ Gateway</button>
                <button onClick={() => addNode("end")}>+ End</button>

                <hr />

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        checked={isSnapEnabled}
                        onChange={(e) => setIsSnapEnabled(e.target.checked)}
                    />
                    Snap to grid
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                    <button disabled={!isSnapEnabled} onClick={() => setGridSize(8)}>8px</button>
                    <button disabled={!isSnapEnabled} onClick={() => setGridSize(16)}>16px</button>
                </div>

                <hr />

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        checked={edges.isConnectMode}
                        onChange={(e) => {
                            edges.setIsConnectMode(e.target.checked);
                            edges.setConnectFromNodeId(null);
                        }}
                    />
                    Connect mode
                </label>

                <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Zoom: Ctrl/Cmd + wheel. Pan: hold Space and drag.
                </div>
            </div>

            {/* CANVAS */}
            <div style={{ padding: 12 }}>
                <div
                    ref={viewport.canvasRef}
                    style={{
                        position: "relative",
                        height: 520,
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "#fff",
                        cursor: viewport.panMode ? "grab" : "default",
                        overscrollBehavior: "contain",
                        touchAction: "none",
                    }}
                    onWheel={viewport.onWheel}
                    onMouseDown={viewport.onCanvasMouseDown}
                    onMouseMove={onCanvasMouseMove}
                    onMouseUp={onCanvasMouseUp}
                    onMouseLeave={onCanvasMouseUp}
                >
                    <div style={viewport.canvasInnerStyle}>
                        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} pointerEvents="none">
                            <defs>
                                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#374151" />
                                </marker>
                            </defs>

                            {edges.schema.edges.map((edge) => {
                                const pts = edges.getEdgePolyline(edge.id);
                                if (!pts) return null;

                                const d = polylineToPath(pts);
                                const isEdgeSelected = edge.id === selection.selectedEdgeId;

                                return (
                                    <g key={edge.id}>
                                        {/* HITBOX EDGE */}
                                        <path
                                            d={d}
                                            fill="none"
                                            stroke="transparent"
                                            strokeWidth={14}
                                            pointerEvents="stroke"
                                            onMouseDown={(ev) => {
                                                ev.stopPropagation();
                                                selection.selectEdge(edge.id);

                                                if (ev.altKey) {
                                                    const p = viewport.getWorldPoint(ev);
                                                    edges.addWaypointNearest(edge.id, p);
                                                }
                                            }}
                                        />

                                        {/* EDGE */}
                                        <path
                                            d={d}
                                            fill="none"
                                            stroke={isEdgeSelected ? "#2563eb" : "#374151"}
                                            strokeWidth={isEdgeSelected ? 3 : 2}
                                            markerEnd="url(#arrow)"
                                            pointerEvents="none"
                                        />

                                        {/* WAYPOINTS */}
                                        {edge.waypoints?.map((w, idx) => {
                                            const isSelected =
                                                selection.selectedWaypoint?.edgeId === edge.id &&
                                                selection.selectedWaypoint?.index === idx;

                                            return (
                                                <circle
                                                    key={idx}
                                                    cx={w.x}
                                                    cy={w.y}
                                                    r={isSelected ? 7 : 6}
                                                    fill={isSelected ? "#2563eb" : "#fff"}
                                                    stroke="#2563eb"
                                                    strokeWidth={2}
                                                    pointerEvents="all"
                                                    onMouseDown={(ev) => {
                                                        ev.stopPropagation();
                                                        selection.selectWaypoint(edge.id, idx);

                                                        if (!ev.altKey) {
                                                            const axis = edges.getWaypointAxis(edge.id, idx); // добавим helper (ниже)
                                                            edges.beginWaypointDrag(edge.id, idx, axis, { x: w.x, y: w.y });
                                                        }
                                                    }}
                                                />
                                            );
                                        })}
                                    </g>
                                );
                            })}
                        </svg>

                        {edges.schema.nodes.map((n) => (
                            <div
                                key={n.id}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    edges.onNodeMouseDown(e, n.id);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    edges.onNodeClick(n.id);
                                }}
                                style={{
                                    position: "absolute",
                                    left: n.position.x,
                                    top: n.position.y,
                                    width: 160,
                                    padding: 10,
                                    border: edges.nodeIdWithError.has(n.id) ? "1px solid #ef4444" : "1px solid #d1d5db",
                                    borderRadius: 10,
                                    userSelect: "none",
                                    background: n.id === selection.selectedNodeId ? "#eef2ff" : "#fff",
                                }}
                            >
                                <b>{n.name}</b>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>{n.type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ borderLeft: "1px solid #e5e7eb", padding: 12 }}>
                {selection.selectedWaypoint ? (
                    (() => {
                        const { edgeId, index } = selection.selectedWaypoint;
                        return (
                            <div style={{ display: "grid", gap: 8 }}>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>Waypoint</div>
                                <div style={{ fontFamily: "monospace" }}>Edge: {edgeId}</div>
                                <div>Index: {index}</div>

                                <button
                                    onClick={() => {
                                        edges.removeWaypoint(edgeId, index);
                                        selection.setSelectedWaypoint(null);
                                    }}
                                    style={{
                                        border: "1px solid #fecaca",
                                        background: "#fef2f2",
                                        color: "#b91c1c",
                                        borderRadius: 8,
                                        height: 36,
                                    }}
                                >
                                    Delete waypoint
                                </button>
                            </div>
                        );
                    })()
                ) : selectedEdge ? (
                    <div>
                        <div style={{ fontFamily: "monospace" }}>{selectedEdge.id}</div>
                    </div>
                ) : selectedNode ? (
                    <div>
                        <div style={{ fontFamily: "monospace" }}>{selectedNode.id}</div>
                    </div>
                ) : (
                    <div style={{ color: "#6b7280" }}>Выбери элемент</div>
                )}
            </div>
        </div>
    );
}