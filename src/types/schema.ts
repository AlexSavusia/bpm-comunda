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
    nodeKey?: string;
    name: string;
    position: { x: number; y: number };
    templateKey?: string;
    templateProps?: Record<string, any>;
};


export type DiagramEdge = {
    id: string;
    from: string;
    to: string;
    waypoints?: Point[];
    mainFlow?: boolean;
    condition?: string;
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

