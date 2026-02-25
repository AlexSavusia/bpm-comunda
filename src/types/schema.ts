export type NodeType =
    | "startEvent"
    | "intermediateThrowEvent"
    | "endEvent"
    | "task"
    | "exclusiveGateway"
    | "parallelGateway"
    | "eventBasedGateway";

export type Point = { x: number; y: number };


export type DiagramNode = {
    id: string;
    type: NodeType;
    name: string;
    position: { x: number; y: number };
};


export type DiagramEdge = {
    id: string;
    from: string;
    to: string;
    waypoints?: Point[];
};


export type DiagramSchema = {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
};

export type ValidationIssue = {
    id: string;
    level: "error" | "warning";
    i18nKey: string;
    i18nParams?: Record<string, any>;
    nodeId?: string;
    edgeId?: string;
};

