// src/components/editor/utils/geometry.ts
export type Point = { x: number; y: number };

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const dist2 = (a: Point, b: Point) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
};

export const projectToSegment = (p: Point, a: Point, b: Point): Point => {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const apx = p.x - a.x;
    const apy = p.y - a.y;

    const abLen2 = abx * abx + aby * aby;
    if (abLen2 < 1e-9) return a;

    const t = clamp((apx * abx + apy * aby) / abLen2, 0, 1);
    return { x: a.x + abx * t, y: a.y + aby * t };
};

export const snap = (value: number, step: number) => Math.round(value / step) * step;

export const snapPoint = (x: number, y: number, step: number) => ({ x: snap(x, step), y: snap(y, step) });

export const polylineToPath = (pts: Point[]) =>
    pts.length ? pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ") : "";