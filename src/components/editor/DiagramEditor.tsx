import { useEffect, useMemo, useState } from "react";
import { useViewport } from "./hooks/useViewport";
import { useSelection } from "./hooks/useSelection";
import { useEditorHotkeys } from "./hooks/hotkeys/useEditorHotkeys";
import { useEdges } from "./hooks/useEdges";
import { useProcesses } from "./hooks/useProcesses";
import { useMetadata } from "./hooks/useMetadata";
import { useTranslation } from "react-i18next";
import { validateSchema } from "./validateSchema";
import EdgeLayer from "./EdgeLayer";
import Palette from "./palette/Palette";
import NodeCard from "./ui/NodeCard";
import HotkeysHelp from "./ui/HotkeysHelp/HotkeysHelp";
import InspectorPanel from "./ui/InspectorPanel";
import "./DiagramEditor.css";

const NODE_SIZE = 56;
export default function DiagramEditor() {
    const { t,i18n } = useTranslation();
    const selection = useSelection();
    const viewport = useViewport();
    const processes = useProcesses();
    const meta = useMetadata();

    const [processName, setProcessName] = useState("");
    const [processDescription, setProcessDescription] = useState("");
    const [isSnapEnabled, setIsSnapEnabled] = useState(true);
    const [gridSize, setGridSize] = useState<8 | 16>(16);
    const [didAutoCreate, setDidAutoCreate] = useState(false);

    const edges = useEdges({
        getWorldPoint: (e) => viewport.getWorldPoint(e),
        isSnapEnabled,
        gridSize,
        selectNode: selection.selectNode,
        selectEdge: selection.selectEdge,
        selectedEdgeId: selection.selectedEdgeId,
    });

    useEditorHotkeys({
        selectedNodeId: selection.selectedNodeId,
        selectedEdgeId: selection.selectedEdgeId,
        selectedWaypoint: selection.selectedWaypoint,

        selectNode: selection.selectNode,
        selectEdge: selection.selectEdge,
        clearWaypoint: () => selection.setSelectedWaypoint(null),

        removeNode: edges.removeNode,
        removeEdge: edges.removeEdge,
        removeWaypoint: edges.removeWaypoint,

        resetViewport: viewport.resetViewport,

        undo: edges.undo,
        redo: edges.redo,
        canUndo: edges.canUndo,
        canRedo: edges.canRedo,
    });
    useEffect(() => {
        if (didAutoCreate) return;
        if (processes.selected) return;

        const p = processes.createNew({ name: "New process", description: "", active: true });

        selection.clear();
        edges.loadSchema({ nodes: [], edges: [] });

        setProcessName(p.name ?? "New process");
        setProcessDescription(p.description ?? "");

        setDidAutoCreate(true);
    }, [didAutoCreate, processes, selection, edges]);

    const issues = useMemo(() => validateSchema(edges.schema), [edges.schema]);

    const selectedNode = useMemo(
        () => edges.schema.nodes.find((n) => n.id === selection.selectedNodeId) ?? null,
        [edges.schema.nodes, selection.selectedNodeId]
    );

    const selectedEdge = useMemo(
        () => edges.schema.edges.find((e) => e.id === selection.selectedEdgeId) ?? null,
        [edges.schema.edges, selection.selectedEdgeId]
    );
    console.log('key',processes.selected?.processDefinition?.nodes?.map(n => ({ key: n.key, actionType: n.actionType, template: n.template?.key })));


    return (
        <div className="de">
            {/* LEFT */}
            <div className="de__left">
                <div className="process-list">
                    {processes.items.map((p) => {
                        const isActive = p.setId === processes.selected?.setId;

                        return (
                            <div
                                key={p.setId}
                                className={`process-item ${isActive ? "active" : ""}`}
                                onClick={() => {
                                    processes.setSelected(p);
                                    selection.clear();
                                    edges.loadSchema(processes.toDiagramSchema(p));
                                    setProcessName(p.name ?? "");
                                    setProcessDescription(p.description ?? "");
                                }}
                            >
                                <div className="process-item__name">{p.name}</div>
                                {p.active && <span className="process-item__badge">active</span>}
                            </div>
                        );
                    })}
                </div>
                <div className="process-meta">
                    <label className="de__check" style={{ display: "block" }}>
                        <div style={{ marginBottom: 6 }}>Name</div>
                        <input
                            value={processName}
                            onChange={(e) => setProcessName(e.target.value)}
                            disabled={!processes.selected}
                            style={{ width: "100%" }}
                        />
                    </label>

                    <label className="de__check" style={{ display: "block" }}>
                        <div style={{ marginBottom: 6 }}>Description</div>
                        <textarea
                            value={processDescription}
                            onChange={(e) => setProcessDescription(e.target.value)}
                            disabled={!processes.selected}
                            rows={3}
                            style={{ width: "100%", resize: "vertical" }}
                        />
                    </label>
                </div>
                <Palette
                    groups={meta.paletteGroups}
                    isLoading={meta.isLoading}
                    error={meta.error}
                    onAdd={(descriptorKey) => {
                        const d = meta.data?.descriptors.find(x => x.key === descriptorKey);
                        if (!d) return;
                        edges.addNodeFromDescriptor(d.key, d.name);
                    }}
                />


                <button
                    className="segmented__btn"
                    disabled={!processes.selected || processes.isSaving}
                    onClick={() =>
                        processes.saveFromDiagram(edges.schema, {
                            name: processName,
                            description: processDescription,
                        })
                    }
                >
                    Save
                </button>

                <div className="de__leftSection">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <div className="segmented">
                            <button className="segmented__btn" disabled={!edges.canUndo} onClick={edges.undo}>
                                {t("editor.undo")}
                            </button>
                            <button className="segmented__btn" disabled={!edges.canRedo} onClick={edges.redo}>
                                {t("editor.redo")}
                            </button>
                        </div>
                    </div>

                    <label className="de__check">
                        <input
                            type="checkbox"
                            checked={isSnapEnabled}
                            onChange={(e) => setIsSnapEnabled(e.target.checked)}
                        />
                        <span>{t("editor.snapToGrid")}</span>
                    </label>

                    <label className="de__check">
                        <input
                            type="checkbox"
                            checked={edges.isConnectMode}
                            onChange={(e) => {
                                edges.setIsConnectMode(e.target.checked);
                                edges.setConnectFromNodeId(null);
                            }}
                        />
                        <span>{t("editor.connectMode")}</span>
                    </label>
                    <div className="editor-controls">
                        <HotkeysHelp t={t} />

                        {/* Language switch */}
                        <div className="segmented">
                            <button
                                className={i18n.language === "ru" ? "segmented__btn active" : "segmented__btn"}
                                onClick={() => i18n.changeLanguage("ru")}
                            >
                                RU
                            </button>
                            <button
                                className={i18n.language === "en" ? "segmented__btn active" : "segmented__btn"}
                                onClick={() => i18n.changeLanguage("en")}
                            >
                                EN
                            </button>
                        </div>
                        {/* Grid size */}
                        <div className="segmented">
                            <button
                                className={gridSize === 8 ? "segmented__btn active" : "segmented__btn"}
                                disabled={!isSnapEnabled}
                                onClick={() => setGridSize(8)}
                            >
                                8 px
                            </button>
                            <button
                                className={gridSize === 16 ? "segmented__btn active" : "segmented__btn"}
                                disabled={!isSnapEnabled}
                                onClick={() => setGridSize(16)}
                            >
                                16 px
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CANVAS */}
            <div className="de__center">
                <div
                    ref={viewport.canvasRef}
                    className="de__canvas"
                    style={{ cursor: viewport.panMode ? "grab" : "default" }}
                    onWheel={viewport.onWheel}
                    onMouseDown={(e) => {
                        viewport.onCanvasMouseDown(e);

                        if (!viewport.panMode) {
                            selection.setSelectedWaypoint(null);
                            selection.selectEdge(null);
                            selection.selectNode(null);
                        }
                    }}
                    onMouseMove={(e) => {
                        if (edges.updateWaypointDrag(e)) return;
                        viewport.onCanvasMouseMovePan(e);
                        if (edges.updateNodeDrag(e)) return;
                    }}
                    onMouseUp={() => {
                        viewport.endPan();
                        edges.endWaypointDrag();
                        edges.endNodeDrag();
                    }}
                    onMouseLeave={() => {
                        viewport.endPan();
                        edges.endWaypointDrag();
                        edges.endNodeDrag();
                    }}
                >
                    <div className="de__canvasInner" style={viewport.canvasInnerStyle}>
                        <EdgeLayer
                            schema={edges.schema}
                            nodeRect={{ w: NODE_SIZE, h: NODE_SIZE }}
                            selectedEdgeId={selection.selectedEdgeId}
                            selectedWaypoint={selection.selectedWaypoint}
                            onSelectEdge={selection.selectEdge}
                            onAddWaypoint={edges.addWaypointNearest}
                            onSelectWaypoint={selection.selectWaypoint}
                            onBeginWaypointDrag={(edgeId, idx) => {
                                const axis = edges.getWaypointAxis(edgeId, idx);
                                const w = edges.schema.edges.find(e => e.id === edgeId)?.waypoints?.[idx];
                                if (!w) return;
                                edges.beginWaypointDrag(edgeId, idx, axis, { x: w.x, y: w.y });
                            }}
                            getWorldPoint={viewport.getWorldPoint}
                        />

                        {edges.schema.nodes.map((n) => (
                            <NodeCard
                                key={n.id}
                                node={n}
                                isSelected={n.id === selection.selectedNodeId}
                                hasError={edges.nodeIdWithError.has(n.id)}
                                isDragging={edges.dragNodeId === n.id}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    edges.onNodeMouseDown(e, n.id);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    edges.onNodeClick(n.id);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="de__right">
                <InspectorPanel
                    t={t}
                    templates={meta.templates}
                    selectedNode={selectedNode}
                    selectedEdge={selectedEdge}
                    selectedWaypoint={selection.selectedWaypoint}
                    onSelectNode={selection.selectNode}
                    onSelectEdge={selection.selectEdge}
                    onSelectWaypoint={selection.selectWaypoint}
                    onClearWaypoint={() => selection.setSelectedWaypoint(null)}
                    onRenameNode={edges.renameNode}
                    onSetNodeTemplate={edges.setNodeTemplate}
                    onSetNodeTemplateProp={edges.setNodeTemplateProp}
                    onDeleteNode={edges.removeNode}
                    onDeleteEdge={edges.removeEdge}
                    onDeleteWaypoint={edges.removeWaypoint}
                    issues={issues}
                    onSetEdgeMainFlow={edges.setEdgeMainFlow}
                    onSetEdgeCondition={edges.setEdgeCondition}
                />
            </div>
        </div>
    );
}