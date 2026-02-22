export { default } from "./DiagramEditor";
import type { DiagramSchema, ValidationIssue } from "../../types/schema";

function issueId() {
    return crypto.randomUUID();
}

export function validateSchema(schema: DiagramSchema): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const nodesById = new Map(schema.nodes.map((n) => [n.id, n]));

    // 5) edges -> existing nodes
    for (const e of schema.edges) {
        if (!nodesById.has(e.from)) {
            issues.push({
                id: issueId(),
                level: "error",
                message: `Edge "${e.id}" has invalid "from": node "${e.from}" not found`,
                edgeId: e.id,
            });
        }
        if (!nodesById.has(e.to)) {
            issues.push({
                id: issueId(),
                level: "error",
                message: `Edge "${e.id}" has invalid "to": node "${e.to}" not found`,
                edgeId: e.id,
            });
        }
    }

    const starts = schema.nodes.filter((n) => n.type === "start");
    const ends = schema.nodes.filter((n) => n.type === "end");

    // 1) exactly one start
    if (starts.length === 0) {
        issues.push({
            id: issueId(),
            level: "error",
            message: "No Start node. Add exactly one Start.",
        });
    } else if (starts.length > 1) {
        issues.push({
            id: issueId(),
            level: "error",
            message: `Too many Start nodes (${starts.length}). Must be exactly one.`,
        });
    }

    // 2) at least one end
    if (ends.length === 0) {
        issues.push({
            id: issueId(),
            level: "error",
            message: "No End node. Add at least one End.",
        });
    }

    // indices for in/out edges
    const inCount = new Map<string, number>();
    const outCount = new Map<string, number>();

    for (const n of schema.nodes) {
        inCount.set(n.id, 0);
        outCount.set(n.id, 0);
    }

    for (const e of schema.edges) {
        inCount.set(e.to, (inCount.get(e.to) ?? 0) + 1);
        outCount.set(e.from, (outCount.get(e.from) ?? 0) + 1);
    }

    // 3) start cannot have incoming
    for (const s of starts) {
        const inc = inCount.get(s.id) ?? 0;
        if (inc > 0) {
            issues.push({
                id: issueId(),
                level: "error",
                message: "Start node must not have incoming connections.",
                nodeId: s.id,
            });
        }
    }

    // 4) end cannot have outgoing
    for (const e of ends) {
        const out = outCount.get(e.id) ?? 0;
        if (out > 0) {
            issues.push({
                id: issueId(),
                level: "error",
                message: "End node must not have outgoing connections.",
                nodeId: e.id,
            });
        }
    }

    for (const n of schema.nodes) {
        if (n.type !== "start") {
            const inc = inCount.get(n.id) ?? 0;
            if (inc === 0) {
                issues.push({
                    id: issueId(),
                    level: "warning",
                    message: `Node "${n.name}" has no incoming connections.`,
                    nodeId: n.id,
                });
            }
        }
    }

    for (const n of schema.nodes) {
        if (n.type !== "end") {
            const out = outCount.get(n.id) ?? 0;
            if (out === 0) {
                issues.push({
                    id: issueId(),
                    level: "warning",
                    message: `Node "${n.name}" has no outgoing connections.`,
                    nodeId: n.id,
                });
            }
        }
    }

    return issues;
}
