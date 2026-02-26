import { useEffect, useRef } from "react";

export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
    const ref = useRef(handler);

    useEffect(() => {
        ref.current = handler;
    }, [handler]);

    return ((...args: any[]) => ref.current(...args)) as T;
}