import type { DiagramSchema, DiagramNode, DiagramEdge } from "../types/schema";
import type { ApiProcessDefinition, ApiCoordinate, ApiProcessNode, ApiProcessFlow } from "./types";
import { backendKeyToNodeType } from "./nodeKeyMap";

function coordToPos(c: ApiCoordinate) {
    return { x: c.x, y: c.y };
}

function coordsToWaypoints(coords?: ApiCoordinate[]) {
    if (!coords?.length) return undefined;
    return coords.map((c) => ({ x: c.x, y: c.y }));
}

// const DEFAULT_TEMPLATE_KEY = "template_noop";

/** Api -> DiagramSchema */
export function apiDefinitionToDiagramSchema(def: ApiProcessDefinition): DiagramSchema {
    const nodes: DiagramNode[] = def.nodes.map((n: ApiProcessNode) => ({
        id: n.id,
        type: backendKeyToNodeType(n.key),
        name: n.name ?? "",
        position: coordToPos(n.coordinate),
        nodeKey: n.key,
        templateKey: n.template?.key,
        templateProps: n.template?.properties ?? {},
    }));

    const edges: DiagramEdge[] = def.flows.map((f: ApiProcessFlow) => ({
        id: f.id,
        from: f.fromNodeId,
        to: f.toNodeId,
        waypoints: coordsToWaypoints(f.coordinates),
    }));

    return { nodes, edges };
}

/** DiagramSchema -> ApiProcessDefinition */
export function diagramSchemaToApiDefinition(schema: DiagramSchema, rootNodeId?: string): ApiProcessDefinition {
    const nodes = schema.nodes.map((n) => {
        const backendKey = n.nodeKey;
        if (!backendKey) throw new Error("nodeKey missing");


        return {
            key: backendKey,
            id: n.id,
            name: n.name,
            description: "",

            coordinate: { x: n.position.x, y: n.position.y },

            template: { key: n.templateKey ?? "template_noop", properties: n.templateProps ?? {} },
            actionType: backendKey,
        };
    });

    const flows = schema.edges.map((e) => ({
        id: e.id,
        fromNodeId: e.from,
        toNodeId: e.to,
        mainFlow: e.mainFlow !== false,
        condition: e.condition,
        coordinates: e.waypoints?.map((p) => ({ x: p.x, y: p.y })) ?? [],
    }));

    return {
        rootNodeId: rootNodeId ?? schema.nodes[0]?.id ?? crypto.randomUUID(),
        nodes,
        flows,
    };
}