export type MetadataDescriptor = {
    key: string; // например "task_service"
    name: string; // "Service task"
    description: string | null;
    type: "Event" | "Task" | "Gateway" | string;
};

export type MetadataTemplateProperty = {
    key: string; // "uri"
    description: string;
    required: boolean;
    secret: boolean;
};

export type MetadataTemplate = {
    key: string; // "rest_template"
    nodeKey: string; // regex string "^task_.*$"
    name: string;
    description: string | null;
    properties: MetadataTemplateProperty[];
};

export type MetadataResponse = {
    descriptors: MetadataDescriptor[];
    templates: MetadataTemplate[];
};