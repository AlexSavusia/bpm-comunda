import type { NodeType } from "../types/schema";

export type BackendNodeKey =
    | "event_start"
    | "event_end"
    | "task_service"
    | "gateway_exclusive";

/**
 * UI NodeType -> backend node key
 * Все “неподдержанные” бэком типы маппим в ближайший аналог.
 */
export const NODE_KEY_MAP: Record<NodeType, BackendNodeKey> = {
    startEvent: "event_start",
    endEvent: "event_end",

    task: "task_service",

    exclusiveGateway: "gateway_exclusive",

    // нет в descriptors — деградируем безопасно
    intermediateThrowEvent: "task_service",
    parallelGateway: "gateway_exclusive",
    eventBasedGateway: "gateway_exclusive",
};

export function backendKeyToNodeType(key: string): NodeType {
    switch (key) {
        case "event_start":
            return "startEvent";
        case "event_end":
            return "endEvent";
        case "task_service":
            return "task";
        case "gateway_exclusive":
            return "exclusiveGateway";
        default:
            // если бэк добавит новые node keys — не ломаемся
            return "task";
    }
}