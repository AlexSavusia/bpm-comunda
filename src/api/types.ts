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
    template?: { key: string; properties: Record<string, any> } | null;
    actionType: string;
};

export type ApiProcessFlow = {
    id: Uuid;
    fromNodeId: Uuid;
    toNodeId: Uuid;
    coordinates?: ApiCoordinate[];
    condition?: string | null;
    mainFlow: boolean;
};

export type ApiProcessDefinition = {
    rootNodeId: Uuid;
    nodes: ApiProcessNode[];
    flows: ApiProcessFlow[];
};

export type ApiProcessDraft = {
    name: string;
    description?: string;
    active?: boolean;
    processDefinition: ApiProcessDefinition;
};

export type ApiProcess = ApiProcessDraft & {
    setId: string;
    version: number;
    createdAt: string;
};

