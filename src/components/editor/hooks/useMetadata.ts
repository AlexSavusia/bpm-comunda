import { useCallback, useEffect, useMemo, useState } from "react";
import { metadataApi } from "../../../api";
import type { MetadataResponse, MetadataDescriptor, MetadataTemplate } from "../../../api/metadataTypes";

export type PaletteGroupVM = {
    key: string;        // "Event" | "Task" | ...
    title: string;      // можно позже i18n
    items: MetadataDescriptor[];
};

function groupDescriptors(descriptors: MetadataDescriptor[]): PaletteGroupVM[] {
    const map = new Map<string, MetadataDescriptor[]>();
    for (const d of descriptors) {
        const k = d.type ?? "Other";
        map.set(k, [...(map.get(k) ?? []), d]);
    }

    return Array.from(map.entries()).map(([k, items]) => ({
        key: k,
        title: k,
        items: items.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function useMetadata() {
    const [data, setData] = useState<MetadataResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await metadataApi.getMetadata();
            setData(res);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load metadata");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const paletteGroups = useMemo(() => {
        return data ? groupDescriptors(data.descriptors) : [];
    }, [data]);

    const templates = useMemo<MetadataTemplate[]>(() => data?.templates ?? [], [data]);

    return {
        data,
        paletteGroups,
        templates,
        isLoading,
        error,
        refresh,
    };
}