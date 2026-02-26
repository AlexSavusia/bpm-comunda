import { useCallback, useEffect, useState } from "react";
import type { ApiProcess } from "../../../api/types";
import { processApi } from "../../../api";
import type { DiagramSchema } from "../../../types/schema";
import { apiDefinitionToDiagramSchema, diagramSchemaToApiDefinition } from "../../../api/processMapper";

function nowIso() {
    return new Date().toISOString();
}

function uid() {
    return crypto.randomUUID();
}

export function useProcesses() {
    const [items, setItems] = useState<ApiProcess[]>([]);
    const [selected, setSelected] = useState<ApiProcess | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await processApi.getProcesses({ page: 20, size: 50 });
            setItems(res.data);
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

    /** ✅ Создаём локально “черновик” нового процесса (ещё не на бэке) */
    const createNew = useCallback((meta?: Partial<Pick<ApiProcess, "name" | "description" | "active">>) => {
        const process: ApiProcess = {
            setId: uid(),
            version: 0,
            name: meta?.name ?? "New process",
            description: meta?.description ?? "",
            active: meta?.active ?? true,
            createdAt: nowIso(),
            processDefinition: {
                rootNodeId: uid(),
                nodes: [],
                flows: [],
            },
        };

        setSelected(process);
        return process;
    }, []);

    /**
     * ✅ Сейвим:
     * - если selected=null → бросаем (нечего сохранять)
     * - если selected есть → PUT full object (как Swagger)
     */
    const saveFromDiagram = useCallback(
        async (
            schema: DiagramSchema,
            patchMeta?: Partial<Pick<ApiProcess, "name" | "description" | "active">>
        ) => {
            if (!selected) throw new Error("No selected process");

            setIsSaving(true);
            setError(null);

            try {
                const next: ApiProcess = {
                    ...selected,
                    ...patchMeta,
                    processDefinition: diagramSchemaToApiDefinition(schema, selected.processDefinition.rootNodeId),
                };

                const saved = await processApi.putProcess(next);

                setSelected(saved);
                setItems((prev) => {
                    const exists = prev.some((x) => x.setId === saved.setId);
                    return exists ? prev.map((x) => (x.setId === saved.setId ? saved : x)) : [saved, ...prev];
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

    return {
        items,
        selected,
        setSelected,
        isLoading,
        isSaving,
        error,
        refresh,
        toDiagramSchema,
        createNew,
        saveFromDiagram,
    };
}