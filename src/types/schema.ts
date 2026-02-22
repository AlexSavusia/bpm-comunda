export type NodeType = "start" | "task" | "gateway" | "end";

export type Point = { x: number; y: number };

export type DiagramNode = {
    id: string;
    type: NodeType;
    position: Point;
    name: string;
};

export type DiagramEdge = {
    id: string;
    from: string;
    to: string;
    name?: string;
};

export type DiagramSchema = {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
};

export type ValidationIssue = {
    id: string;
    level: "error" | "warning";
    message: string;
    nodeId?: string;
    edgeId?: string;
};
