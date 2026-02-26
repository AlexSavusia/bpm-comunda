import { useCallback, useEffect, useState } from "react";
import type { ApiProcess, ApiProcessDraft } from "../../../api/types";
import { processApi } from "../../../api";
import type { DiagramSchema } from "../../../types/schema";
import { apiDefinitionToDiagramSchema, diagramSchemaToApiDefinition } from "../../../api/processMapper";

function uid() {
    return crypto.randomUUID();
}

type ApiProcessLocalDraft = ApiProcessDraft & {
    __localId: string;
};

export function useProcesses() {
    const [items, setItems] = useState<ApiProcess[]>([]);
    const [selected, setSelected] = useState<ApiProcess | ApiProcessLocalDraft | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await processApi.getProcesses({ page: 1, size: 100 });

            const uniq = new Map<string, ApiProcess>();
            for (const p of res.data) uniq.set(p.setId, p);
            setItems(Array.from(uniq.values()));
        } catch (e: any) {
            setError(e?.message ?? "Failed to load processes");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const toDiagramSchema = useCallback((p: ApiProcess) => {
        return apiDefinitionToDiagramSchema(p.processDefinition);
    }, []);

    const createNew = useCallback((meta?: Partial<Pick<ApiProcessDraft, "name" | "description" | "active">>) => {
        const draft: ApiProcessLocalDraft = {
            __localId: uid(),
            name: meta?.name ?? "New process",
            description: meta?.description ?? "",
            active: meta?.active ?? true,
            processDefinition: {
                rootNodeId: uid(),
                nodes: [],
                flows: [],
            },
        };

        setSelected(draft);
        return draft;
    }, []);

    const saveFromDiagram = useCallback(
        async (schema: DiagramSchema, patchMeta?: Partial<Pick<ApiProcess, "name" | "description" | "active">>) => {
            if (!selected) throw new Error("No selected process");

            setIsSaving(true);
            setError(null);

            try {
                console.log("[saveFromDiagram] schema nodes templates", schema.nodes.map(n => ({
                    id: n.id,
                    nodeKey: n.nodeKey,
                    templateKey: n.templateKey,
                    templateProps: n.templateProps,
                    templatePropsKeys: n.templateProps ? Object.keys(n.templateProps) : null,
                })));
                const processDefinition = diagramSchemaToApiDefinition(schema, selected.processDefinition.rootNodeId);

                const patchBody = {
                    ...(patchMeta?.name !== undefined ? { name: patchMeta.name } : {}),
                    ...(patchMeta?.description !== undefined ? { description: patchMeta.description } : {}),
                    ...(patchMeta?.active !== undefined ? { active: patchMeta.active } : {}),
                    processDefinition,
                };

                const saved =
                    "setId" in selected
                        ? await processApi.patchProcess(selected.setId, patchBody)
                        : await processApi.createProcess({
                            name: patchMeta?.name ?? selected.name ?? "New process",
                            description: patchMeta?.description ?? selected.description ?? "",
                            active: patchMeta?.active ?? selected.active ?? true,
                            processDefinition,
                        });

                setSelected(saved);

                setItems((prev) => {
                    const withoutSame = prev.filter((x) => x.setId !== saved.setId);
                    return [saved, ...withoutSame];
                });

                return saved;
            } catch (e: any) {
                setError(e?.message ?? "Failed to save process");
                throw e;
            } finally {
                setIsSaving(false);
            }
        },
        [selected]
    );

    const deleteById = useCallback(
        async (setId: string) => {
            setIsDeleting(true);
            setError(null);
            try {
                await processApi.deleteProcess(setId);

                setItems((prev) => prev.filter((x) => x.setId !== setId));

                setSelected((prev) => {
                    if (prev && "setId" in prev && prev.setId === setId) return null;
                    return prev;
                });
            } catch (e: any) {
                setError(e?.message ?? "Failed to delete process");
                throw e;
            } finally {
                setIsDeleting(false);
            }
        },
        []
    );

    return {
        items,
        selected,
        setSelected,
        isLoading,
        isSaving,
        isDeleting,
        error,
        refresh,
        toDiagramSchema,
        createNew,
        saveFromDiagram,
        deleteById,
    };
}