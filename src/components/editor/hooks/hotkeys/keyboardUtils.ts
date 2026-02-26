export function isTypingTarget(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;

    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;

    return false;
}

export function isModKey(e: KeyboardEvent) {
    return e.ctrlKey || e.metaKey;
}