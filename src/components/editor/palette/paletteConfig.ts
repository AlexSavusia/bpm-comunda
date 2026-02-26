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
            { type: "startEvent", i18nKey: "palette.startEvent" },
            { type: "endEvent", i18nKey: "palette.endEvent" },
        ],
    },
    {
        i18nKey: "palette.tasks",
        items: [{ type: "task", i18nKey: "palette.taskService" }], // сделай ключ в i18n
    },
    {
        i18nKey: "palette.gateways",
        items: [{ type: "exclusiveGateway", i18nKey: "palette.exclusiveGateway" }],
    },
];