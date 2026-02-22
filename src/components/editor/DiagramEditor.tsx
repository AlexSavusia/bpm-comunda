import { useMemo, useRef, useState } from "react";
import type { DiagramSchema, DiagramNode, NodeType } from "../../types/schema";
import { validateSchema } from "./validateSchema";
import type { MouseEvent } from "react";



const initialSchema: DiagramSchema = {
    nodes: [],
    edges: [],
};
const NODE_W = 160;
const NODE_H = 56;

function uid() {
    return crypto.randomUUID();
}

export default function DiagramEditor() {
    const [schema, setSchema] = useState<DiagramSchema>(initialSchema);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

    const selectedEdge = useMemo(() => {
        return schema.edges.find((e) => e.id === selectedEdgeId) ?? null;
    }, [schema.edges, selectedEdgeId]);

    const selectedNode = useMemo(() => {
        return schema.nodes.find((n) => n.id === selectedNodeId) ?? null;
    }, [schema.nodes, selectedNodeId]);

    const issues = useMemo(() => validateSchema(schema), [schema]);


    const addNode = (type: NodeType) => {
        const idx = schema.nodes.length;
        const node: DiagramNode = {
            id: uid(),
            type,
            name: type.toUpperCase(),
            position: { x: 40 + (idx % 3) * 200, y: 40 + Math.floor(idx / 3) * 120 },
        };

        setSchema((prev) => ({
            ...prev,
            nodes: [...prev.nodes, node],
        }));

        setSelectedNodeId(node.id);
    };

    const renameSelected = (name: string) => {
        if (!selectedNodeId) return;

        setSchema((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) => (n.id === selectedNodeId ? { ...n, name } : n)),
        }));
    };

    const nodeIdWithError = useMemo(() => {
        const s = new Set<string>();
        for (const it of issues) if (it.nodeId) s.add(it.nodeId);
        return s;
    }, [issues]);

    const [isConnectMode, setIsConnectMode] = useState(false);
    const [connectFromNodeId, setConnectFromNodeId] = useState<string | null>(null);

    const addEdge = (from: string, to: string) => {
        if (from === to) return;

        setSchema((prev) => {
            const exists = prev.edges.some((e) => e.from === from && e.to === to);
            if (exists) return prev;

            return {
                ...prev,
                edges: [
                    ...prev.edges,
                    { id: uid(), from, to },
                ],
            };
        });
    };

    const onNodeClick = (nodeId: string) => {
        setSelectedEdgeId(null);
        setSelectedNodeId(nodeId);

        if (!isConnectMode) return;

        if (!connectFromNodeId) {
            setConnectFromNodeId(nodeId);
            return;
        }

        addEdge(connectFromNodeId, nodeId);
        setConnectFromNodeId(null);
    };

    const onEdgeClick = (edgeId: string) => {
        setSelectedNodeId(null);
        setSelectedEdgeId(edgeId);
    };

    const removeEdge = (edgeId: string) => {
        setSchema((prev) => ({
            ...prev,
            edges: prev.edges.filter((e) => e.id !== edgeId),
        }));
    };

    const removeNode = (nodeId: string) => {
        setSchema((prev) => ({
            ...prev,
            nodes: prev.nodes.filter((n) => n.id !== nodeId),
            edges: prev.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
        }));

        setSelectedNodeId((prev) => (prev === nodeId ? null : prev));
        setConnectFromNodeId((prev) => (prev === nodeId ? null : prev));
        setSelectedEdgeId(null);
    };

    const setNodePosition = (nodeId: string, x: number, y: number) => {
        setSchema((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) =>
                n.id === nodeId ? { ...n, position: { x, y } } : n
            ),
        }));
    };

    type DragState =
        | null
        | {
        nodeId: string;
        pointerOffsetX: number;
        pointerOffsetY: number;
    };

    const [drag, setDrag] = useState<DragState>(null);

    const canvasRef = useRef<HTMLDivElement | null>(null);

    const getCanvasPoint = (e: MouseEvent<HTMLDivElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: e.clientX, y: e.clientY };
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onNodeMouseDown = (
        e: MouseEvent<HTMLDivElement>, nodeId: string
    ) => {
        e.preventDefault();

        const node = schema.nodes.find((n) => n.id === nodeId);
        if (!node) return;

        if (isConnectMode) return;

        const p = getCanvasPoint(e);
        const offsetX = p.x - node.position.x;
        const offsetY = p.y - node.position.y;


        setDrag({ nodeId, pointerOffsetX: offsetX, pointerOffsetY: offsetY });
    };

    const onCanvasMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!drag) return;

        const p = getCanvasPoint(e);
        const x = p.x - drag.pointerOffsetX;
        const y = p.y - drag.pointerOffsetY;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const maxX = rect.width - NODE_W;
        const maxY = rect.height - NODE_H;

        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));

        setNodePosition(drag.nodeId, clampedX, clampedY);
    };

    const onCanvasMouseUp = () => {
        if (!drag) return;
        setDrag(null);
    };


    const clampEdgePoint = (fromId: string, toId: string) => {
        const from = schema.nodes.find((n) => n.id === fromId);
        const to = schema.nodes.find((n) => n.id === toId);
        if (!from || !to) return null;

        const fromCenter = { x: from.position.x + NODE_W / 2, y: from.position.y + NODE_H / 2 };
        const toCenter = { x: to.position.x + NODE_W / 2, y: to.position.y + NODE_H / 2 };

        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            return {
                start: {
                    x: fromCenter.x + (dx > 0 ? NODE_W / 2 : -NODE_W / 2),
                    y: fromCenter.y,
                },
                end: {
                    x: toCenter.x + (dx > 0 ? -NODE_W / 2 : NODE_W / 2),
                    y: toCenter.y,
                },
            };
        }

        return {
            start: {
                x: fromCenter.x,
                y: fromCenter.y + (dy > 0 ? NODE_H / 2 : -NODE_H / 2),
            },
            end: {
                x: toCenter.x,
                y: toCenter.y + (dy > 0 ? -NODE_H / 2 : NODE_H / 2),
            },
        };
    };


    return (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 340px", height: "calc(100vh - 64px)" }}>
            {/* LEFT: Palette */}
            <div style={{ borderRight: "1px solid #e5e7eb", padding: 12 }}>
                <h3 style={{ margin: "0 0 12px" }}>Palette</h3>
                <div style={{ display: "grid", gap: 8 }}>
                    <button onClick={() => addNode("start")}>+ Start</button>
                    <button onClick={() => addNode("task")}>+ Task</button>
                    <button onClick={() => addNode("gateway")}>+ Gateway</button>
                    <button onClick={() => addNode("end")}>+ End</button>
                    <hr style={{ margin: "12px 0" }} />

                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={isConnectMode}
                            onChange={(e) => {
                                setIsConnectMode(e.target.checked);
                                setConnectFromNodeId(null);
                            }}
                        />
                        Connect mode
                    </label>

                    {isConnectMode && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                            {connectFromNodeId ? "Select target node…" : "Select source node…"}
                        </div>
                    )}
                    {isConnectMode && (
                        <button
                            onClick={() => setConnectFromNodeId(null)}
                            style={{ marginTop: 8 }}
                            disabled={!connectFromNodeId}
                        >
                            Cancel source
                        </button>
                    )}
                </div>
            </div>

            {/* CENTER: Canvas */}
            <div style={{ padding: 12 }}>
                <h3 style={{ margin: "0 0 12px" }}>Canvas (пока список)</h3>

                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                        Edges: {schema.edges.length}
                    </div>

                    {schema.edges.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>No connections</div>
                    ) : (
                        <div style={{ display: "grid", gap: 6 }}>
                            {schema.edges.map((e) => (
                                <div
                                    key={e.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        fontSize: 12,
                                        fontFamily: "monospace",
                                        padding: 8,
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 8,
                                    }}
                                >
                                    <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {e.from} → {e.to}
                                    </div>

                                    <button
                                        onClick={() => removeEdge(e.id)}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 8,
                                            border: "1px solid #e5e7eb",
                                            cursor: "pointer",
                                        }}
                                        title="Remove edge"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {schema.nodes.length === 0 ? (
                    <div style={{ color: "#6b7280" }}>Добавь элемент слева</div>
                ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                        <div
                            ref={canvasRef}
                            style={{
                                position: "relative",
                                height: "520px",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                background: "#fff",
                                overflow: "hidden",
                            }}
                            onMouseMove={onCanvasMouseMove}
                            onMouseUp={onCanvasMouseUp}
                            onMouseLeave={onCanvasMouseUp}
                            onMouseDown={() => {
                                if (drag) return;
                                setSelectedNodeId(null);
                                setSelectedEdgeId(null);
                            }}
                        >
                            <svg
                                width="100%"
                                height="100%"
                                style={{ position: "absolute", inset: 0 }}
                                pointerEvents="none"
                            >
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

                                {schema.edges.map((e) => {
                                    const p = clampEdgePoint(e.from, e.to);
                                    if (!p) return null;

                                    const isSelected = e.id === selectedEdgeId;

                                    return (
                                        <g key={e.id}>
                                            {/* HITBOX: ловим клик */}
                                            <line
                                                x1={p.start.x}
                                                y1={p.start.y}
                                                x2={p.end.x}
                                                y2={p.end.y}
                                                stroke="transparent"
                                                strokeWidth={12}
                                                pointerEvents="stroke"
                                                onMouseDown={(ev) => {
                                                    ev.stopPropagation();
                                                    onEdgeClick(e.id);
                                                }}
                                            />

                                            {/* VISIBLE */}
                                            <line
                                                x1={p.start.x}
                                                y1={p.start.y}
                                                x2={p.end.x}
                                                y2={p.end.y}
                                                stroke={isSelected ? "#2563eb" : "#374151"}
                                                strokeWidth={isSelected ? 3 : 2}
                                                markerEnd="url(#arrow)"
                                                pointerEvents="none"
                                            />
                                        </g>
                                    );
                                })}
                            </svg>
                            {schema.nodes.map((n) => {
                                const hasError = nodeIdWithError.has(n.id);
                                const isSource = isConnectMode && connectFromNodeId === n.id;

                                return (
                                    <div
                                        key={n.id}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            onNodeMouseDown(e, n.id);
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNodeClick(n.id);
                                        }}
                                        style={{
                                            position: "absolute",
                                            left: n.position.x,
                                            top: n.position.y,
                                            width: 160,
                                            padding: 10,
                                            border: hasError
                                                ? "1px solid #ef4444"
                                                : isSource
                                                    ? "2px solid #2563eb"
                                                    : "1px solid #d1d5db",
                                            borderRadius: 10,
                                            cursor: isConnectMode ? "pointer" : drag?.nodeId === n.id ? "grabbing" : "grab",
                                            background: n.id === selectedNodeId ? "#eef2ff" : "white",
                                            userSelect: "none",
                                        }}
                                    >
                                        <b>{n.name}</b>
                                        <div style={{ fontSize: 12, color: "#6b7280" }}>{n.type}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* RIGHT: Properties */}
            <div style={{ borderLeft: "1px solid #e5e7eb", padding: 12 }}>
                <h3 style={{ margin: "0 0 12px" }}>Properties</h3>

                {selectedEdge ? (
                    <div style={{ display: "grid", gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>Edge ID</div>
                            <div style={{ fontFamily: "monospace" }}>{selectedEdge.id}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>From</div>
                            <div style={{ fontFamily: "monospace" }}>{selectedEdge.from}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>To</div>
                            <div style={{ fontFamily: "monospace" }}>{selectedEdge.to}</div>
                        </div>

                        <button
                            onClick={() => {
                                removeEdge(selectedEdge.id);
                                setSelectedEdgeId(null);
                            }}
                            style={{
                                marginTop: 12,
                                height: 36,
                                borderRadius: 8,
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                color: "#b91c1c",
                                cursor: "pointer",
                            }}
                        >
                            Delete edge
                        </button>
                    </div>
                ) : !selectedNode ? (
                    <div style={{ color: "#6b7280" }}>Выбери элемент на canvas</div>
                ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>ID</div>
                            <div style={{ fontFamily: "monospace" }}>{selectedNode.id}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>Type</div>
                            <div>{selectedNode.type}</div>
                        </div>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>Name</span>
                            <input
                                value={selectedNode.name}
                                onChange={(e) => renameSelected(e.target.value)}
                                style={{
                                    height: 36,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    padding: "0 10px",
                                }}
                            />
                        </label>

                        <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>Validation</div>
                            <div style={{ color: issues.length ? "#b91c1c" : "#16a34a" }}>
                                {issues.length ? `${issues.length} issue(s)` : "OK"}
                            </div>
                        </div>
                        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                            {issues.length === 0 ? (
                                <div style={{ fontSize: 12, color: "#16a34a" }}>No issues 🎯</div>
                            ) : (
                                issues.map((it) => (
                                    <button
                                        key={it.id}
                                        onClick={() => {
                                            if (it.nodeId) setSelectedNodeId(it.nodeId);
                                        }}
                                        style={{
                                            textAlign: "left",
                                            padding: 10,
                                            borderRadius: 8,
                                            border: "1px solid #fca5a5",
                                            background: "#fef2f2",
                                            cursor: it.nodeId ? "pointer" : "default",
                                        }}
                                        disabled={!it.nodeId}
                                        title={!it.nodeId ? "This issue is not linked to a specific node yet" : "Click to select node"}
                                    >
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>{it.level.toUpperCase()}</div>
                                        <div style={{ fontSize: 13 }}>{it.message}</div>
                                    </button>
                                ))
                            )}
                        </div>
                        <button
                            onClick={() => removeNode(selectedNode.id)}
                            style={{
                                marginTop: 12,
                                height: 36,
                                borderRadius: 8,
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                color: "#b91c1c",
                                cursor: "pointer",
                            }}
                        >
                            Delete node
                        </button>

                    </div>
                )}
            </div>
        </div>
    );
}
