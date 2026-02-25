import type { NodeType } from "../../../types/schema";

type Props = { type: NodeType; size?: number };

export function NodeIcon({ type, size = 18 }: Props) {
    const s = size;
    const c = s / 2;

    const stroke = "#111827";
    const light = "#6b7280";

    switch (type) {
        case "startEvent":
            return (
                <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <circle cx={c} cy={c} r={c - 2} fill="none" stroke={stroke} strokeWidth="2" />
                </svg>
            );

        case "intermediateThrowEvent":
            return (
                <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <circle cx={c} cy={c} r={c - 2} fill="none" stroke={stroke} strokeWidth="2" />
                    <circle cx={c} cy={c} r={c - 6} fill="none" stroke={light} strokeWidth="2" />
                </svg>
            );

        case "endEvent":
            return (
                <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <circle cx={c} cy={c} r={c - 2} fill="none" stroke={stroke} strokeWidth="3" />
                </svg>
            );

        case "task":
            return (
                <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <rect x="3" y="4" width={s - 6} height={s - 8} rx="3" fill="none" stroke={stroke} strokeWidth="2" />
                </svg>
            );

        case "exclusiveGateway":
            return (
                <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <path d={`M ${c} 2 L ${s - 2} ${c} L ${c} ${s - 2} L 2 ${c} Z`} fill="none" stroke={stroke} strokeWidth="2" />
                    <path d={`M ${c-4} ${c-4} L ${c+4} ${c+4} M ${c+4} ${c-4} L ${c-4} ${c+4}`} stroke={stroke} strokeWidth="2" />
                </svg>
            );

        case "parallelGateway":
            return (
                <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <path d={`M ${c} 2 L ${s - 2} ${c} L ${c} ${s - 2} L 2 ${c} Z`} fill="none" stroke={stroke} strokeWidth="2" />
                    <path d={`M ${c} ${c-5} V ${c+5} M ${c-5} ${c} H ${c+5}`} stroke={stroke} strokeWidth="2" />
                </svg>
            );

        case "eventBasedGateway":
            return (
                <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
                    <path d={`M ${c} 2 L ${s - 2} ${c} L ${c} ${s - 2} L 2 ${c} Z`} fill="none" stroke={stroke} strokeWidth="2" />
                    <circle cx={c} cy={c} r={c - 7} fill="none" stroke={light} strokeWidth="2" />
                </svg>
            );

        default:
            return null;
    }
}