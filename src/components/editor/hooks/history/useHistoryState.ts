import { useCallback, useMemo, useRef, useState } from "react";

type Updater<T> = T | ((prev: T) => T);

type Options<T> = {
    limit?: number;
    // опционально: кастомная проверка "ничего не изменилось"
    isEqual?: (a: T, b: T) => boolean;
};

export function useHistoryState<T>(initial: T, options: Options<T> = {}) {
    const { limit = 100, isEqual } = options;

    const [present, setPresent] = useState<T>(initial);
    const pastRef = useRef<T[]>([]);
    const futureRef = useRef<T[]>([]);

    // const canUndo = pastRef.current.length > 0;
    // const canRedo = futureRef.current.length > 0;

    const set = useCallback(
        (next: Updater<T>) => {
            setPresent((prev) => {
                const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;

                const same = isEqual ? isEqual(prev, resolved) : Object.is(prev, resolved);
                if (same) return prev;

                pastRef.current.push(prev);
                if (pastRef.current.length > limit) pastRef.current.shift();
                futureRef.current = [];

                return resolved;
            });
        },
        [isEqual, limit]
    );

    const replace = useCallback((next: Updater<T>) => {
        setPresent((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next));
    }, []);

    const undo = useCallback(() => {
        setPresent((cur) => {
            const past = pastRef.current;
            if (past.length === 0) return cur;

            const prev = past.pop() as T;
            futureRef.current.push(cur);
            return prev;
        });
    }, []);

    const redo = useCallback(() => {
        setPresent((cur) => {
            const future = futureRef.current;
            if (future.length === 0) return cur;

            const next = future.pop() as T;
            pastRef.current.push(cur);
            return next;
        });
    }, []);

    const reset = useCallback((next?: T) => {
        pastRef.current = [];
        futureRef.current = [];
        setPresent(next ?? initial);
    }, [initial]);

    // memo, чтобы не пересоздавать объект без нужды
    return useMemo(
        () => ({
            present,
            set,
            replace,
            undo,
            redo,
            reset,
            get canUndo() {
                return pastRef.current.length > 0;
            },
            get canRedo() {
                return futureRef.current.length > 0;
            },
        }),
        [present, redo, replace, reset, set, undo]
    );
}