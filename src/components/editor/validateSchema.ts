import type { DiagramSchema, ValidationIssue } from "../../types/schema";

function issueId() {
    return crypto.randomUUID();
}

export function validateSchema(schema: DiagramSchema): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const nodesById = new Map(schema.nodes.map((n) => [n.id, n]));

    // edges -> existing nodes
    for (const e of schema.edges) {
        if (!nodesById.has(e.from)) {
            issues.push({
                id: issueId(),
                level: "error",
                i18nKey: "validation.edgeInvalidFrom",
                i18nParams: { edgeId: e.id, nodeId: e.from },
                edgeId: e.id,
            });
        }

        if (!nodesById.has(e.to)) {
            issues.push({
                id: issueId(),
                level: "error",
                i18nKey: "validation.edgeInvalidTo",
                i18nParams: { edgeId: e.id, nodeId: e.to },
                edgeId: e.id,
            });
        }
    }

    const starts = schema.nodes.filter((n) => n.type === "startEvent");
    const ends = schema.nodes.filter((n) => n.type === "endEvent");

    // exactly one start
    if (starts.length === 0) {
        issues.push({
            id: issueId(),
            level: "error",
            i18nKey: "validation.noStart",
        });
    } else if (starts.length > 1) {
        issues.push({
            id: issueId(),
            level: "error",
            i18nKey: "validation.tooManyStarts",
            i18nParams: { count: starts.length },
        });
    }

    // at least one end
    if (ends.length === 0) {
        issues.push({
            id: issueId(),
            level: "error",
            i18nKey: "validation.noEnd",
        });
    }

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

    // start cannot have incoming
    for (const s of starts) {
        if ((inCount.get(s.id) ?? 0) > 0) {
            issues.push({
                id: issueId(),
                level: "error",
                i18nKey: "validation.startHasIncoming",
                nodeId: s.id,
            });
        }
    }

    // end cannot have outgoing
    for (const e of ends) {
        if ((outCount.get(e.id) ?? 0) > 0) {
            issues.push({
                id: issueId(),
                level: "error",
                i18nKey: "validation.endHasOutgoing",
                nodeId: e.id,
            });
        }
    }

    for (const n of schema.nodes) {
        if (n.type !== "startEvent" && (inCount.get(n.id) ?? 0) === 0) {
            issues.push({
                id: issueId(),
                level: "warning",
                i18nKey: "validation.noIncoming",
                i18nParams: { name: n.name },
                nodeId: n.id,
            });
        }
    }

    for (const n of schema.nodes) {
        if (n.type !== "endEvent" && (outCount.get(n.id) ?? 0) === 0) {
            issues.push({
                id: issueId(),
                level: "warning",
                i18nKey: "validation.noOutgoing",
                i18nParams: { name: n.name },
                nodeId: n.id,
            });
        }
    }

    return issues;
}