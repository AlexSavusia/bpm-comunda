export type MetadataDescriptor = {
    key: string;
    name: string;
    description: string | null;
    type: "Event" | "Task" | "Gateway" | string;
};

export type MetadataTemplateProperty = {
    key: string;
    description: string;
    required: boolean;
    secret: boolean;
};

export type MetadataTemplate = {
    key: string;
    nodeKey: string;
    name: string;
    description: string | null;
    properties: MetadataTemplateProperty[];
};

export type MetadataResponse = {
    descriptors: MetadataDescriptor[];
    templates: MetadataTemplate[];
};