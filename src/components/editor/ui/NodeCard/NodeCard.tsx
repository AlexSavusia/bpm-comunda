import type { MouseEvent as ReactMouseEvent } from "react";
import type { DiagramNode } from "../../../../types/schema";
import { NodeIcon } from "../NodeIcon";
import "./NodeCard.css";

type Props = {
    node: DiagramNode;

    isSelected: boolean;
    hasError: boolean;
    isDragging: boolean;

    onMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
    onClick: (e: ReactMouseEvent<HTMLDivElement>) => void;

    size?: number;
};

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
        >
            {hasError && <div className="node__badge">!</div>}
            <div className="nodeLabel">{node.name}</div>
            <NodeIcon type={node.type} size={22} />
        </div>
    );
}