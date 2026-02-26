import type { ChangeEvent } from "react";
import type { DiagramEdge, DiagramNode, ValidationIssue } from "../../../../types/schema";
import "./InspectorPanel.css";

type SelectedWaypoint = { edgeId: string; index: number } | null;

type Props = {
    t: (key: string, params?: any) => string;

    selectedNode: DiagramNode | null;
    selectedEdge: DiagramEdge | null;
    selectedWaypoint: SelectedWaypoint;

    onSelectNode: (id: string | null) => void;
    onSelectEdge: (id: string | null) => void;
    onSelectWaypoint: (edgeId: string, index: number) => void;
    onClearWaypoint: () => void;

    onRenameNode: (nodeId: string, name: string) => void;
    onDeleteNode: (nodeId: string) => void;

    onDeleteEdge: (edgeId: string) => void;

    onDeleteWaypoint: (edgeId: string, index: number) => void;

    issues: ValidationIssue[];
};

function Section(props: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="insp__section">
            <div className="insp__sectionHeader">
                <div className="insp__sectionTitle">{props.title}</div>
                {props.right ? <div className="insp__sectionRight">{props.right}</div> : null}
            </div>
            <div className="insp__sectionBody">{props.children}</div>
        </div>
    );
}

function MonoRow(props: { label: string; value: string }) {
    return (
        <div className="insp__row">
            <div className="insp__label">{props.label}</div>
            <div className="insp__mono">{props.value}</div>
        </div>
    );
}

export default function InspectorPanel({
                                           t,
                                           selectedNode,
                                           selectedEdge,
                                           selectedWaypoint,

                                           onSelectNode,
                                           onSelectEdge,
                                           onClearWaypoint,

                                           onRenameNode,
                                           onDeleteNode,

                                           onDeleteEdge,

                                           onDeleteWaypoint,

                                           issues,
                                       }: Props) {
    const problemsRight = (
        <span className={issues.length ? "insp__pill insp__pill--red" : "insp__pill insp__pill--green"}>
      {issues.length ? String(issues.length) : "OK"}
    </span>
    );

    return (
        <div className="insp">
            <div className="insp__header">
                <div className="insp__title">{t("editor.inspector")}</div>

                {/* quick clear selection */}
                <button
                    className="insp__ghostBtn"
                    onClick={() => {
                        onClearWaypoint();
                        onSelectEdge(null);
                        onSelectNode(null);
                    }}
                    disabled={!selectedNode && !selectedEdge && !selectedWaypoint}
                    title={t("editor.clearSelection")}
                >
                    {t("editor.clear")}
                </button>
            </div>

            {/* === INSPECTOR BODY === */}
            {selectedWaypoint ? (
                <Section title={t("editor.waypoint")}>
                    <MonoRow label={t("editor.edge")} value={selectedWaypoint.edgeId} />
                    <div className="insp__row">
                        <div className="insp__label">{t("editor.index")}</div>
                        <div className="insp__value">{selectedWaypoint.index}</div>
                    </div>

                    <div className="insp__btnRow">
                        <button
                            className="insp__btn insp__btn--danger"
                            onClick={() => {
                                onDeleteWaypoint(selectedWaypoint.edgeId, selectedWaypoint.index);
                                onClearWaypoint();
                            }}
                        >
                            {t("editor.deleteWaypoint")}
                        </button>

                        <button className="insp__btn" onClick={onClearWaypoint}>
                            {t("editor.close")}
                        </button>
                    </div>
                </Section>
            ) : selectedEdge ? (
                <Section title={t("editor.edge")}>
                    <MonoRow label="ID" value={selectedEdge.id} />
                    <MonoRow label={t("editor.from")} value={selectedEdge.from} />
                    <MonoRow label={t("editor.to")} value={selectedEdge.to} />

                    <div className="insp__btnRow">
                        <button
                            className="insp__btn insp__btn--danger"
                            onClick={() => {
                                onDeleteEdge(selectedEdge.id);
                                onSelectEdge(null);
                            }}
                        >
                            {t("editor.deleteEdge")}
                        </button>

                        <button className="insp__btn" onClick={() => onSelectEdge(null)}>
                            {t("editor.close")}
                        </button>
                    </div>
                </Section>
            ) : selectedNode ? (
                <Section title={t("editor.node")}>
                    <MonoRow label="ID" value={selectedNode.id} />
                    <div className="insp__row">
                        <div className="insp__label">{t("editor.type")}</div>
                        <div className="insp__value">{selectedNode.type}</div>
                    </div>

                    <label className="insp__field">
                        <div className="insp__label">{t("editor.name")}</div>
                        <input
                            className="insp__input"
                            value={selectedNode.name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onRenameNode(selectedNode.id, e.target.value)}
                            placeholder={t("editor.namePlaceholder")}
                        />
                    </label>

                    <div className="insp__btnRow">
                        <button
                            className="insp__btn insp__btn--danger"
                            onClick={() => {
                                onDeleteNode(selectedNode.id);
                                onSelectNode(null);
                            }}
                        >
                            {t("editor.deleteNode")}
                        </button>
                    </div>
                </Section>
            ) : (
                <Section title={t("editor.selectElement")}>
                    <div className="insp__empty">
                        <div className="insp__emptyTitle">{t("editor.nothingSelected")}</div>
                        <div className="insp__emptyText">{t("editor.nothingSelectedHint")}</div>
                    </div>
                </Section>
            )}

            {/* === PROBLEMS === */}
            <Section title={t("editor.problems")} right={problemsRight}>
                {issues.length === 0 ? (
                    <div className="insp__ok">{t("editor.noIssues")}</div>
                ) : (
                    <div className="insp__problems">
                        {issues.map((it) => (
                            <button
                                key={it.id}
                                className="insp__problem"
                                onClick={() => {
                                    onClearWaypoint();

                                    if (it.nodeId) {
                                        onSelectEdge(null);
                                        onSelectNode(it.nodeId);
                                        return;
                                    }
                                    if (it.edgeId) {
                                        onSelectNode(null);
                                        onSelectEdge(it.edgeId);
                                        return;
                                    }
                                }}
                                disabled={!it.nodeId && !it.edgeId}
                                data-level={it.level}
                            >
                                <div className="insp__problemTop">
                  <span className={it.level === "error" ? "insp__badge insp__badge--red" : "insp__badge insp__badge--amber"}>
                    {it.level.toUpperCase()}
                  </span>
                                </div>
                                <div className="insp__problemText">{t(it.i18nKey, it.i18nParams)}</div>
                            </button>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );
}