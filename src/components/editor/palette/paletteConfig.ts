import type { NodeType } from "../../../types/schema";

export type PaletteItem = {
    type: NodeType;
    i18nKey: string;
};

export type PaletteGroup = {
    i18nKey: string;
    items: PaletteItem[];
};

export const PALETTE: PaletteGroup[] = [
    {
        i18nKey: "palette.events",
        items: [
            { type: "intermediateThrowEvent", i18nKey: "palette.intermediateThrowEvent" },
            { type: "endEvent", i18nKey: "palette.endEvent" },
            { type: "startEvent", i18nKey: "palette.startEvent" }
        ],
    },
    {
        i18nKey: "palette.tasks",
        items: [{ type: "task", i18nKey: "palette.task" }],
    },
    {
        i18nKey: "palette.gateways",
        items: [
            { type: "exclusiveGateway", i18nKey: "palette.exclusiveGateway" },
            { type: "parallelGateway", i18nKey: "palette.parallelGateway" },
            { type: "eventBasedGateway", i18nKey: "palette.eventBasedGateway" },
        ],
    },
];