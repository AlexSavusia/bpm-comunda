import {  useMemo, useRef, useState, useCallback } from "react";
import type { Point } from "../utils/geometry";

type ViewportOptions = {
    zoomMin?: number;
    zoomMax?: number;
    zoomStep?: number;
};

export function useViewport(opts: ViewportOptions = {}) {
    const ZOOM_MIN = opts.zoomMin ?? 0.3;
    const ZOOM_MAX = opts.zoomMax ?? 2.5;
    const ZOOM_STEP = opts.zoomStep ?? 0.1;

    const canvasRef = useRef<HTMLDivElement | null>(null);

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

    const [panMode] = useState(false);
    const [panStart, setPanStart] = useState<Point | null>(null);


    const getWorldPoint = useCallback(
        (e: React.MouseEvent<Element> | React.WheelEvent<Element>): Point => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return { x: 0, y: 0 };
            const x = (("clientX" in e ? e.clientX : 0) - rect.left - pan.x) / zoom;
            const y = (("clientY" in e ? e.clientY : 0) - rect.top - pan.y) / zoom;
            return { x, y };
        },
        [pan.x, pan.y, zoom]
    );

    const onWheel = useCallback(
        (e: React.WheelEvent<HTMLDivElement>) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();

            const direction = e.deltaY > 0 ? -1 : 1;
            const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + direction * ZOOM_STEP));

            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;

            const scale = nextZoom / zoom;
            setPan((p) => ({
                x: cx - scale * (cx - p.x),
                y: cy - scale * (cy - p.y),
            }));

            setZoom(nextZoom);
        },
        [ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, zoom]
    );

    const onCanvasMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!panMode) return;
            e.preventDefault();
            setPanStart({ x: e.clientX, y: e.clientY });
        },
        [panMode]
    );

    const onCanvasMouseMovePan = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!panStart) return;
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
            setPanStart({ x: e.clientX, y: e.clientY });
        },
        [panStart]
    );

    const endPan = useCallback(() => setPanStart(null), []);

    const canvasInnerStyle = useMemo(
        () => ({
            position: "absolute" as const,
            left: 0,
            top: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
        }),
        [pan.x, pan.y, zoom]
    );

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    const resetViewport = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const zoomAtClientPoint = (nextZoom: number, clientX: number, clientY: number) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cx = clientX - rect.left;
        const cy = clientY - rect.top;

        const scale = nextZoom / zoom;

        setPan((p) => ({
            x: cx - scale * (cx - p.x),
            y: cy - scale * (cy - p.y),
        }));
        setZoom(nextZoom);
    };

    const zoomIn = (clientX?: number, clientY?: number) => {
        const next = clamp(zoom + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);
        if (clientX != null && clientY != null) zoomAtClientPoint(next, clientX, clientY);
        else setZoom(next);
    };

    const zoomOut = (clientX?: number, clientY?: number) => {
        const next = clamp(zoom - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);
        if (clientX != null && clientY != null) zoomAtClientPoint(next, clientX, clientY);
        else setZoom(next);
    };

    return {
        canvasRef,
        zoom,
        pan,
        panMode,
        canvasInnerStyle,
        setZoom,
        setPan,
        getWorldPoint,
        onWheel,
        onCanvasMouseDown,
        onCanvasMouseMovePan,
        endPan,
        resetViewport,
        zoomIn,
        zoomOut,
    };
}