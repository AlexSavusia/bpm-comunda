import type { MouseEvent as ReactMouseEvent } from "react";
import type { DiagramNode } from "../../../../types/schema";
import "./NodeCard.css";

type Props = {
    node: DiagramNode;

    isSelected: boolean;
    hasError: boolean;
    isDragging: boolean;

    onMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
    onClick: (e: ReactMouseEvent<HTMLDivElement>) => void;

    size?: number; // квадрат
};

function Icon({ kind }: { kind: string }) {
    const k = kind.toLowerCase();

    if ( k === "start") {
        return (
            <svg viewBox="0 0 24 24" className="node__svg" aria-hidden="true">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
        );
    }

    if (k === "end") {
        return (
            <svg viewBox="0 0 24 24" className="node__svg" aria-hidden="true">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
        );
    }

    if (k === "service task") {
        return (
            <svg viewBox="0 0 24 24" className="node__svg" aria-hidden="true">
                <rect x="5" y="7" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M8 10h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    if (k === "exclusive gateway") {
        return (
            <svg viewBox="0 0 24 24" className="node__svg" aria-hidden="true">
                <path
                    d="M12 4 20 12 12 20 4 12 12 4Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path d="M9.5 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className="node__svg" aria-hidden="true">
            <path d="M6 6h12v12H6z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function typeClass(t: string) {
    const k = t.toLowerCase();
    if (k === "end") return "node--end";
    if (k === "start") return "node--start";
    if (k === "service task") return "node--task";
    if (k === "exclusive gateway") return "node--gateway";
    return "node--other";
}

export default function NodeCard({
                                     node,
                                     isSelected,
                                     hasError,
                                     isDragging,
                                     onMouseDown,
                                     onClick,
                                     size = 56,
                                 }: Props) {
    const cls = [
        "node",
        "node--square",
        typeClass(node.type),
        isSelected && "node--selected",
        hasError && "node--error",
        isDragging && "node--dragging",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={cls}
            style={{
                left: node.position.x,
                top: node.position.y,
                width: size,
                height: size,
            }}
            onMouseDown={onMouseDown}
            onClick={onClick}
            title={node.name}
            role="button"
            tabIndex={0}
        >
            {hasError && <div className="node__badge">!</div>}
            <Icon kind={node.type} />
        </div>
    );
}