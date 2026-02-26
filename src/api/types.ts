// src/api/types.ts
export type Uuid = string;

export type PageResponse<T> = {
    page: number;
    size: number;
    total: number;
    data: T[];
};

export type ApiCoordinate = { x: number; y: number };

export type ApiProcessNode = {
    key: string;
    id: Uuid;
    name: string;
    description?: string;
    coordinate: ApiCoordinate;
    template?: {
        key: string;
        properties: Record<string, any>;
    };
    actionType: string;
};

export type ApiProcessFlow = {
    id: Uuid;
    fromNodeId: Uuid;
    toNodeId: Uuid;
    coordinates?: ApiCoordinate[];
    mainFlow: boolean;
};

export type ApiProcessDefinition = {
    rootNodeId: Uuid;
    nodes: ApiProcessNode[];
    flows: ApiProcessFlow[];
};

export type ApiProcess = {
    setId: Uuid;
    version: number;
    name: string;
    description?: string;
    active: boolean;
    processDefinition: ApiProcessDefinition;
    createdAt: string; // ISO
};