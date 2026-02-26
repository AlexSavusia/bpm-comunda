import type { DiagramSchema } from "../../../types/schema";
import type { Point } from "./geometry";

export type NodeRect = { w: number; h: number };

const EPS = 1e-6;

function getNodeCenter(schema: DiagramSchema, nodeId: string, rect: NodeRect): Point | null {
    const n = schema.nodes.find((x) => x.id === nodeId);
    if (!n) return null;
    return { x: n.position.x + rect.w / 2, y: n.position.y + rect.h / 2 };
}


export function intersectRectBorder(center: Point, target: Point, rect: NodeRect): Point {
    const dx = target.x - center.x;
    const dy = target.y - center.y;


    if (Math.abs(dx) < EPS && Math.abs(dy) < EPS) return center;

    const halfW = rect.w / 2;
    const halfH = rect.h / 2;


    const tx = dx !== 0 ? halfW / Math.abs(dx) : Number.POSITIVE_INFINITY;

    const ty = dy !== 0 ? halfH / Math.abs(dy) : Number.POSITIVE_INFINITY;

    const t = Math.min(tx, ty);

    return { x: center.x + dx * t, y: center.y + dy * t };
}


export function getEdgePolylineSmart(
    schema: DiagramSchema,
    edgeId: string,
    nodeRect: NodeRect
): Point[] | null {
    const edge = schema.edges.find((e) => e.id === edgeId);
    if (!edge) return null;

    const wps = edge.waypoints ?? [];

    const fromCenter = getNodeCenter(schema, edge.from, nodeRect);
    const toCenter = getNodeCenter(schema, edge.to, nodeRect);
    if (!fromCenter || !toCenter) return null;

    const nextPoint = wps[0] ?? toCenter;
    const prevPoint = wps[wps.length - 1] ?? fromCenter;

    const start = intersectRectBorder(fromCenter, nextPoint, nodeRect);
    const end = intersectRectBorder(toCenter, prevPoint, nodeRect);

    return [start, ...wps, end];
}