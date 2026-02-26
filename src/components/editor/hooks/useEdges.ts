import { useMemo, useState, useCallback } from "react";
import type { DiagramSchema, DiagramNode, NodeType } from "../../../types/schema";
import { validateSchema } from "../validateSchema";
import type { Point } from "../utils/geometry";
import { dist2, projectToSegment, snapPoint } from "../utils/geometry";
import { useHistoryState } from "./history/useHistoryState";
import type { MetadataTemplate } from "../../../api/metadataTypes";


const NODE_W = 160;
const NODE_H = 56;

const initialSchema: DiagramSchema = { nodes: [], edges: [] };

function uid() {
    return crypto.randomUUID();
}

type DragNode =
    | null
    | { nodeId: string; pointerOffsetX: number; pointerOffsetY: number };

type WaypointDrag =
    | null
    | { edgeId: string; index: number; axis: "x" | "y"; start: Point };

type UseEdgesArgs = {
    getWorldPoint: (e: React.MouseEvent<Element>) => Point;
    isSnapEnabled: boolean;
    gridSize: 8 | 16;
    selectNode: (id: string | null) => void;
    selectEdge: (id: string | null) => void;
    selectedEdgeId: string | null;
    templates: MetadataTemplate[];
};

export function useEdges(args: UseEdgesArgs) {
    const { getWorldPoint, isSnapEnabled, gridSize, selectNode, selectEdge, selectedEdgeId } = args;

    const history = useHistoryState<DiagramSchema>(initialSchema, { limit: 200 });

    const schema = history.present;
    const setSchema = history.set;

    const issues = useMemo(() => validateSchema(schema), [schema]);

    const nodeIdWithError = useMemo(() => {
        const s = new Set<string>();
        for (const it of issues) if (it.nodeId) s.add(it.nodeId);
        return s;
    }, [issues]);

    const [isConnectMode, setIsConnectMode] = useState(false);
    const [connectFromNodeId, setConnectFromNodeId] = useState<string | null>(null);

    const addNode = useCallback((type: NodeType) => {
        const idx = schema.nodes.length;

        const node: DiagramNode = {
            id: uid(),
            type,
            name: type.toUpperCase(),
            position: { x: 40 + (idx % 3) * 200, y: 40 + Math.floor(idx / 3) * 120 },
        };

        setSchema((prev) => ({ ...prev, nodes: [...prev.nodes, node] }));
        selectNode(node.id);
    }, [schema.nodes.length, selectNode, setSchema]);

    const addNodeFromDescriptor = useCallback((descriptorKey: string, descriptorName: string, descriptorType: string) => {
        const idx = schema.nodes.length;

        const node: DiagramNode = {
            id: uid(),
            type: descriptorType,
            nodeKey: descriptorKey,
            name: descriptorName,
            position: { x: 40 + (idx % 3) * 200, y: 40 + Math.floor(idx / 3) * 120 },
            templateKey: null,
            templateProps: {},
        };

        setSchema((prev) => ({ ...prev, nodes: [...prev.nodes, node] }));
        selectNode(node.id);
    }, [schema.nodes.length, selectNode, setSchema]);


    const renameNode = useCallback((nodeId: string, name: string) => {
        setSchema((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, name } : n)),
        }));
    }, []);

    function safeRegexTest(pattern: string, value: string) {
        try { return new RegExp(pattern).test(value); } catch { return false; }
    }

    function getTemplateByKey(templates: MetadataTemplate[], nodeKey: string, templateKey: string) {
        const allowed = templates.filter(t => safeRegexTest(t.nodeKey, nodeKey));
        return allowed.find(t => t.key === templateKey) ?? null;
    }

    function ensureRequiredProps(
        tpl: MetadataTemplate,
        current: Record<string, any> | undefined
    ) {
        const next: Record<string, any> = { ...(current ?? {}) };
        const props = tpl.properties ?? [];
        for (const p of props) {
            if (!p.required) continue;
            if (!(p.key in next)) next[p.key] = ""; // можно заменить на p.default если он есть
        }
        return next;
    }

    const setNodeTemplate = useCallback(
        (nodeId: string, templateKey: string | null) => {
            setSchema((prev) => ({
                ...prev,
                nodes: prev.nodes.map((n) => {
                    if (n.id !== nodeId) return n;

                    if (!templateKey) {
                        return { ...n, templateKey: null, templateProps: {} };
                    }

                    // если ключ не меняется — ничего не трогаем
                    if (n.templateKey === templateKey) return n;

                    const nodeKey = n.nodeKey ?? "";
                    const tpl = getTemplateByKey(args.templates, nodeKey, templateKey);

                    const nextProps = tpl
                        ? ensureRequiredProps(tpl, n.templateProps)
                        : (n.templateProps ?? {});

                    return { ...n, templateKey, templateProps: nextProps };
                }),
            }));
        },
        [setSchema, args.templates]
    );

    const setNodeTemplateProp = useCallback((nodeId: string, propKey: string, value: any) => {
        setSchema((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) => {
                if (n.id !== nodeId) return n;
                const nextProps = { ...(n.templateProps ?? {}) };

                if (value === undefined) {
                    delete nextProps[propKey];
                } else {
                    nextProps[propKey] = value;
                }

                return { ...n, templateProps: nextProps };
            }),
        }));
    }, [setSchema]);

    const addEdge = useCallback((from: string, to: string) => {
        if (from === to) return;

        setSchema((prev) => {
            const exists = prev.edges.some((e) => e.from === from && e.to === to);
            if (exists) return prev;

            return {
                ...prev,
                edges: [
                    ...prev.edges,
                    {
                        id: uid(),
                        from,
                        to,
                        mainFlow: true,
                        condition: "",
                    },
                ],
            };
        });
    }, []);

    const removeEdge = useCallback((edgeId: string) => {
        setSchema((prev) => ({ ...prev, edges: prev.edges.filter((e) => e.id !== edgeId) }));
    }, []);

    const removeNode = useCallback((nodeId: string) => {
        setSchema((prev) => ({
            ...prev,
            nodes: prev.nodes.filter((n) => n.id !== nodeId),
            edges: prev.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
        }));
        setConnectFromNodeId((p) => (p === nodeId ? null : p));
    }, []);

    const onNodeClick = useCallback((nodeId: string) => {
        selectNode(nodeId);

        if (!isConnectMode) return;

        if (!connectFromNodeId) {
            setConnectFromNodeId(nodeId);
            return;
        }

        addEdge(connectFromNodeId, nodeId);
        setConnectFromNodeId(null);
    }, [addEdge, connectFromNodeId, isConnectMode, selectNode]);

    const onEdgeClick = useCallback((edgeId: string) => {
        selectEdge(edgeId);
    }, [selectEdge]);


    const clampEdgePoint = useCallback((fromId: string, toId: string) => {
        const from = schema.nodes.find((n) => n.id === fromId);
        const to = schema.nodes.find((n) => n.id === toId);
        if (!from || !to) return null;

        const fromCenter = { x: from.position.x + NODE_W / 2, y: from.position.y + NODE_H / 2 };
        const toCenter = { x: to.position.x + NODE_W / 2, y: to.position.y + NODE_H / 2 };

        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            return {
                start: { x: fromCenter.x + (dx > 0 ? NODE_W / 2 : -NODE_W / 2), y: fromCenter.y },
                end: { x: toCenter.x + (dx > 0 ? -NODE_W / 2 : NODE_W / 2), y: toCenter.y },
            };
        }

        return {
            start: { x: fromCenter.x, y: fromCenter.y + (dy > 0 ? NODE_H / 2 : -NODE_H / 2) },
            end: { x: toCenter.x, y: toCenter.y + (dy > 0 ? -NODE_H / 2 : NODE_H / 2) },
        };
    }, [schema.nodes]);

    const getEdgePolyline = useCallback((edgeId: string): Point[] | null => {
        const edge = schema.edges.find((e) => e.id === edgeId);
        if (!edge) return null;
        const p = clampEdgePoint(edge.from, edge.to);
        if (!p) return null;
        return [p.start, ...(edge.waypoints ?? []), p.end];
    }, [schema.edges, clampEdgePoint]);

    const setNodePosition = useCallback((nodeId: string, x: number, y: number) => {
        setSchema((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, position: { x, y } } : n)),
        }));
    }, []);


    const [dragNode, setDragNode] = useState<DragNode>(null);

    const onNodeMouseDown = useCallback((e: React.MouseEvent<Element>, nodeId: string) => {
        e.preventDefault();
        if (isConnectMode) return;

        const node = schema.nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const p = getWorldPoint(e);
        setDragNode({
            nodeId,
            pointerOffsetX: p.x - node.position.x,
            pointerOffsetY: p.y - node.position.y,
        });
    }, [getWorldPoint, isConnectMode, schema.nodes]);

    const updateNodeDrag = useCallback((e: React.MouseEvent<Element>) => {
        if (!dragNode) return false;

        const p = getWorldPoint(e);
        const rawX = p.x - dragNode.pointerOffsetX;
        const rawY = p.y - dragNode.pointerOffsetY;

        const shouldSnap = isSnapEnabled && !e.altKey;
        const next = shouldSnap ? snapPoint(rawX, rawY, gridSize) : { x: rawX, y: rawY };

        setNodePosition(dragNode.nodeId, next.x, next.y);
        return true;
    }, [dragNode, getWorldPoint, gridSize, isSnapEnabled, setNodePosition]);

    const endNodeDrag = useCallback(() => setDragNode(null), []);


    const [wpDrag, setWpDrag] = useState<WaypointDrag>(null);

    const setWaypoint = useCallback((edgeId: string, index: number, x: number, y: number) => {
        setSchema((prev) => ({
            ...prev,
            edges: prev.edges.map((e) => {
                if (e.id !== edgeId) return e;
                const wps = [...(e.waypoints ?? [])];
                if (!wps[index]) return e;
                wps[index] = { x, y };
                return { ...e, waypoints: wps };
            }),
        }));
    }, []);

    type Axis = "x" | "y";

    const getWaypointAxis = (edgeId: string, index: number): Axis => {
        const edge = schema.edges.find((e) => e.id === edgeId);
        if (!edge?.waypoints?.length) return "x";

        const prev = edge.waypoints[index - 1];
        const curr = edge.waypoints[index];
        const next = edge.waypoints[index + 1];

        if (!curr) return "x";
        if (!prev && !next) return "x";

        if (prev && next) {
            return Math.abs(prev.x - next.x) > Math.abs(prev.y - next.y) ? "y" : "x";
        }

        const n = prev ?? next!;
        return Math.abs(n.x - curr.x) > Math.abs(n.y - curr.y) ? "y" : "x";
    };

    const beginWaypointDrag = (edgeId: string, index: number, axis: Axis, start: Point) => {
        setWpDrag({ edgeId, index, axis, start });
    };

    const updateWaypointDrag = useCallback((e: React.MouseEvent<Element>) => {
        if (!wpDrag) return false;

        const p = getWorldPoint(e);

        let x = wpDrag.start.x;
        let y = wpDrag.start.y;

        if (wpDrag.axis === "x") x = p.x;
        else y = p.y;

        const shouldSnap = isSnapEnabled && !e.altKey;
        const next = shouldSnap ? snapPoint(x, y, gridSize) : { x, y };

        setWaypoint(wpDrag.edgeId, wpDrag.index, next.x, next.y);
        return true;
    }, [getWorldPoint, gridSize, isSnapEnabled, setWaypoint, wpDrag]);

    const endWaypointDrag = useCallback(() => setWpDrag(null), []);

    const addWaypointNearest = useCallback((edgeId: string, clickWorld: Point) => {
        const edge = schema.edges.find((e) => e.id === edgeId);
        if (!edge) return;

        const pts = getEdgePolyline(edgeId);
        if (!pts || pts.length < 2) return;

        let best = { segIndex: 0, proj: pts[0], d2: Number.POSITIVE_INFINITY };

        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const proj = projectToSegment(clickWorld, a, b);
            const d2v = dist2(clickWorld, proj);
            if (d2v < best.d2) best = { segIndex: i, proj, d2: d2v };
        }

        const newWpRaw = best.proj;

        const EPS = 6;
        const EPS2 = EPS * EPS;
        if (dist2(newWpRaw, pts[0]) < EPS2) return;
        if (dist2(newWpRaw, pts[pts.length - 1]) < EPS2) return;

        const existing = edge.waypoints ?? [];
        if (existing.some((w) => dist2(w, newWpRaw) < EPS2)) return;

        const shouldSnap = isSnapEnabled;
        const newWp = shouldSnap ? snapPoint(newWpRaw.x, newWpRaw.y, gridSize) : newWpRaw;

        const insertAt = best.segIndex;

        setSchema((prev) => ({
            ...prev,
            edges: prev.edges.map((e) => {
                if (e.id !== edgeId) return e;
                const wps = [...(e.waypoints ?? [])];
                wps.splice(insertAt, 0, newWp);
                return { ...e, waypoints: wps };
            }),
        }));
    }, [getEdgePolyline, gridSize, isSnapEnabled, schema.edges]);

    const removeWaypoint = useCallback((edgeId: string, index: number) => {
        setSchema((prev) => ({
            ...prev,
            edges: prev.edges.map((e) => {
                if (e.id !== edgeId) return e;
                if (!e.waypoints || !e.waypoints[index]) return e;

                const wps = [...e.waypoints];
                wps.splice(index, 1);

                return {
                    ...e,
                    waypoints: wps.length ? wps : undefined,
                };
            }),
        }));
    }, []);

    const loadSchema = useCallback((next: DiagramSchema) => {
        setSchema(next);
        history.reset(next);
        setIsConnectMode(false);
        setConnectFromNodeId(null);
    }, [setSchema, history]);

    const setEdgeMainFlow = useCallback((edgeId: string, value: boolean) => {
        setSchema((prev) => ({
            ...prev,
            edges: prev.edges.map((e) =>
                e.id === edgeId ? { ...e, mainFlow: value } : e
            ),
        }));
    }, []);

    const setEdgeCondition = useCallback((edgeId: string, value: string) => {
        setSchema((prev) => ({
            ...prev,
            edges: prev.edges.map((e) =>
                e.id === edgeId ? { ...e, condition: value } : e
            ),
        }));
    }, []);

    return {
        schema,
        loadSchema,
        setSchema,
        issues,
        nodeIdWithError,

        undo: history.undo,
        redo: history.redo,
        canUndo: history.canUndo,
        canRedo: history.canRedo,
        resetHistory: history.reset,

        isConnectMode,
        setIsConnectMode,
        connectFromNodeId,
        setConnectFromNodeId,

        addNode,
        addNodeFromDescriptor,
        renameNode,
        setNodeTemplate,
        setNodeTemplateProp,
        removeNode,

        addEdge,
        removeEdge,

        onNodeClick,
        onEdgeClick,

        getEdgePolyline,

        onNodeMouseDown,
        updateNodeDrag,
        endNodeDrag,
        dragNodeId: dragNode?.nodeId ?? null,

        beginWaypointDrag,
        getWaypointAxis,
        updateWaypointDrag,
        endWaypointDrag,

        addWaypointNearest,
        selectedEdgeId,

        removeWaypoint,
        setEdgeMainFlow,
        setEdgeCondition,
    };
}