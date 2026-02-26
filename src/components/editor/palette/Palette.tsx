import "./palette.css";
import type { PaletteGroupVM } from "../hooks/useMetadata";

type Props = {
    groups: PaletteGroupVM[];
    isLoading: boolean;
    error: string | null;
    onAdd: (descriptorKey: string) => void;
};

function Icon({ kind }: { kind: string }) {
    const k = kind.toLowerCase();
    if (k === "event") {
        return (
            <svg viewBox="0 0 24 24" className="pal__svg" aria-hidden="true">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
        );
    }
    if (k === "task") {
        return (
            <svg viewBox="0 0 24 24" className="pal__svg" aria-hidden="true">
                <rect x="5" y="7" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M8 10h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }
    if (k === "gateway") {
        return (
            <svg viewBox="0 0 24 24" className="pal__svg" aria-hidden="true">
                <path
                    d="M12 4 20 12 12 20 4 12 12 4Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path d="M9.5 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className="pal__svg" aria-hidden="true">
            <path d="M6 6h12v12H6z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function typeClass(t: string) {
    const k = t.toLowerCase();
    if (k === "event") return "pal__card--event";
    if (k === "task") return "pal__card--task";
    if (k === "gateway") return "pal__card--gateway";
    return "pal__card--other";
}

export default function Palette({ groups, isLoading, error, onAdd }: Props) {
    return (
        <div className="pal">
            <div className="pal__header">
                <div className="pal__title">Palette</div>
            </div>

            {isLoading ? <div className="pal__hint">Loading...</div> : null}
            {error ? <div className="pal__error">{error}</div> : null}

            {groups.map((g) => (
                <div key={g.key} className="pal__group">
                    <div className="pal__groupTitle">{g.title}</div>

                    <div className="pal__grid">
                        {g.items.map((it) => (
                            <button
                                key={it.key}
                                className={`pal__card ${typeClass(it.type)}`}
                                onClick={() => onAdd(it.key)}
                                title={it.description ?? ""}
                                type="button"
                            >
                                <div className="pal__cardTop">
                  <span className="pal__icon" aria-hidden="true">
                    <Icon kind={it.type} />
                  </span>

                                    <div className="pal__main">
                                        <div className="pal__name">{it.name}</div>
                                        <div className="pal__meta">
                                            <span className="pal__badge">{it.type}</span>
                                            <span className="pal__key">{it.key}</span>
                                        </div>
                                    </div>
                                </div>

                                {it.description ? <div className="pal__desc">{it.description}</div> : null}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}