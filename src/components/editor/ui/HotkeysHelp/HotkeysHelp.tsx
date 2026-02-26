import React from "react";
import type { TFunction } from "i18next";
import "./HotkeysHelp.css";

type Props = { t: TFunction };

function Kbd({ children }: { children: React.ReactNode }) {
    return <kbd className="kbd">{children}</kbd>;
}

function normalizeKeysText(
    raw: string,
    {
        modText,
        dragText,
        clickText,
    }: { modText: string; dragText: string; clickText: string }
) {
    return raw
        .replaceAll("Ctrl/Cmd", modText)
        .replaceAll("Drag", dragText)
        .replaceAll("Click", clickText);
}

function renderKeys(keysText: string) {
    const tokens = keysText
        .split(/(\+|\/)/g)
        .map((s) => s.trim())
        .filter(Boolean);

    return (
        <div className="hk__keys">
            {tokens.map((tok, idx) => {
                if (tok === "+") return <span key={idx} className="hk__sep">+</span>;
                if (tok === "/") return <span key={idx} className="hk__or">/</span>;
                return <Kbd key={idx}>{tok}</Kbd>;
            })}
        </div>
    );
}

export default function HotkeysHelp({ t }: Props) {
    const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac");

    const modText = isMac ? "Cmd" : "Ctrl";

    const rows = [
        "undo",
        "redo",
        "reset",
        "zoom",
        "clearSelection",
        "delete",
        "altBypassSnap",
        "addWaypoint",
    ] as const;

    return (
        <section className="hk" aria-label={t("editor.hotkeys.title")}>
            <div className="hk__title">{t("editor.hotkeys.title")}</div>

            <div className="hk__list" role="list">
                {rows.map((id) => {
                    const rawKeys = t(`editor.hotkeys.${id}.keys`);
                    const keys = normalizeKeysText(rawKeys, {
                        modText,
                        dragText: t("editor.mouseDrag"),
                        clickText: t("editor.mouseClick"),
                    });

                    return (
                        <div key={id} className="hk__row" role="listitem">
                            {renderKeys(keys)}
                            <div className="hk__desc">{t(`editor.hotkeys.${id}.desc`)}</div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}