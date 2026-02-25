import type { NodeType } from "../../../types/schema";
import { useTranslation } from "react-i18next";
import { PALETTE } from "./paletteConfig";
import { NodeIcon } from "../ui/NodeIcon";
import "./palette.css";

type Props = {
    onAdd: (type: NodeType) => void;
};

export default function Palette({ onAdd }: Props) {
    const { t } = useTranslation();

    return (
        <div className="cm-palette">
            {PALETTE.map((group) => (
                <div key={group.i18nKey} className="cm-palette-group">
                    <div className="cm-palette-title">{t(group.i18nKey)}</div>

                    <div className="cm-palette-items">
                        {group.items.map((it) => (
                            <button
                                key={it.type}
                                type="button"
                                className="cm-palette-item"
                                onClick={() => onAdd(it.type)}
                            >
                <span className="cm-palette-icon">
                  <NodeIcon type={it.type} size={18} />
                </span>
                                <span className="cm-palette-label">{t(it.i18nKey)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}