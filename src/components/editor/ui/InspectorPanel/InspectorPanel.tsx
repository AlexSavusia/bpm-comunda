import { useMemo } from "react";
import type { ChangeEvent } from "react";
import type { DiagramEdge, DiagramNode, ValidationIssue } from "../../../../types/schema";
import type { MetadataTemplate } from "../../../../api/metadataTypes";
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

    templates: MetadataTemplate[];

    onSetNodeTemplate: (nodeId: string, templateKey: string) => void;
    onSetNodeTemplateProp: (nodeId: string, propKey: string, value: any) => void;

    onSetEdgeMainFlow: (edgeId: string, value: boolean) => void;
    onSetEdgeCondition: (edgeId: string, value: string) => void;

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

                                           templates,
                                           onSetNodeTemplate,
                                           onSetNodeTemplateProp,
                                           onSetEdgeMainFlow,
                                           onSetEdgeCondition,
                                           issues,
                                       }: Props) {
    const problemsRight = (
        <span className={issues.length ? "insp__pill insp__pill--red" : "insp__pill insp__pill--green"}>
      {issues.length ? String(issues.length) : "OK"}
    </span>
    );



    function matchesNodeKey(templateNodeKeyRegex: string, nodeKey: string) {
        try {
            return new RegExp(templateNodeKeyRegex).test(nodeKey);
        } catch {
            return false;
        }
    }

    const nodeKey = selectedNode?.nodeKey ?? "";
    const allowedTemplates = selectedNode
        ? templates.filter((tpl) => matchesNodeKey(tpl.nodeKey, nodeKey))
        : [];

    const selectedTemplateKey = selectedNode?.templateKey ?? "template_noop";
    const selectedTemplate = allowedTemplates.find((t) => t.key === selectedTemplateKey) ?? null;

    const templateProps = selectedNode?.templateProps ?? {};

    const availableProps = selectedTemplate?.properties ?? [];


    const enabledPropKeys = useMemo(() => new Set(Object.keys(templateProps)), [templateProps]);


    const requiredPropKeys = useMemo(() => {
        return new Set(availableProps.filter((p) => p.required).map((p) => p.key));
    }, [availableProps]);


    const addableProps = useMemo(() => {
        return availableProps.filter((p) => !enabledPropKeys.has(p.key));
    }, [availableProps, enabledPropKeys]);

    const renderedProps = useMemo(() => {
        const keys = new Set<string>();
        for (const k of enabledPropKeys) keys.add(k);
        for (const k of requiredPropKeys) keys.add(k);


        return availableProps.filter((p) => keys.has(p.key));
    }, [availableProps, enabledPropKeys, requiredPropKeys]);

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

                    {/* MAIN FLOW */}
                    <label className="insp__field">
                        <div className="insp__label">Main flow</div>
                        <input
                            type="checkbox"
                            checked={selectedEdge.mainFlow}
                            onChange={(e) =>
                                onSetEdgeMainFlow(selectedEdge.id, e.target.checked)
                            }
                        />
                    </label>

                    {/* CONDITION — ВСЕГДА */}
                    <label className="insp__field">
                        <div className="insp__label">
                            Condition <span className="insp__req">*</span>
                        </div>
                        <input
                            className="insp__input"
                            placeholder="e.g. amount > 1000"
                            value={selectedEdge.condition}
                            onChange={(e) =>
                                onSetEdgeCondition(selectedEdge.id, e.target.value)
                            }
                        />
                    </label>

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
            )  : selectedNode ? (
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
                    {/* Template selector */}
                    {selectedNode.nodeKey ? (
                        <label className="insp__field">
                            <div className="insp__label">Template</div>
                            <select
                                className="insp__input"
                                value={selectedTemplateKey}
                                onChange={(e) => onSetNodeTemplate(selectedNode.id, e.target.value)}
                            >
                                {allowedTemplates.map((tpl) => (
                                    <option key={tpl.key} value={tpl.key}>
                                        {tpl.name}
                                    </option>
                                ))}
                            </select>
                            {selectedTemplate?.description ? (
                                <div className="insp__hint">{selectedTemplate.description}</div>
                            ) : null}
                        </label>
                    ) : (
                        <div className="insp__hint">No nodeKey for this node</div>
                    )}

                    {/* Template properties */}
                    {selectedTemplate && availableProps.length > 0 ? (
                        <Section
                            title="Properties"
                            right={
                                addableProps.length > 0 ? (
                                    <select
                                        className="insp__input"
                                        value=""
                                        onChange={(e) => {
                                            const k = e.target.value;
                                            if (!k) return;


                                            onSetNodeTemplateProp(selectedNode.id, k, "");


                                            e.currentTarget.value = "";
                                        }}
                                    >
                                        <option value="" disabled>
                                            + Add property
                                        </option>
                                        {addableProps.map((p) => (
                                            <option key={p.key} value={p.key}>
                                                {p.key}
                                            </option>
                                        ))}
                                    </select>
                                ) : null
                            }
                        >
                            {renderedProps.length === 0 ? (
                                <div className="insp__hint">No properties enabled</div>
                            ) : (
                                <>
                                    {/* Chips row (что включено) */}
                                    <div className="insp__chips">
                                        {renderedProps.map((p) => {
                                            const isReq = p.required;

                                            return (
                                                <span key={p.key} className="insp__chip">
                {p.key}
                                                    {isReq ? <span className="insp__req"> *</span> : null}

                                                    {/* required не даём отключать */}
                                                    {!isReq ? (
                                                        <button
                                                            type="button"
                                                            className="insp__chipX"
                                                            title="Remove"
                                                            onClick={() => {
                                                                onSetNodeTemplateProp(selectedNode.id, p.key, undefined);
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    ) : null}
              </span>
                                            );
                                        })}
                                    </div>

                                    {/* Inputs только для enabled */}
                                    <div style={{ marginTop: 10 }}>
                                        {renderedProps.map((p) => {
                                            const v = (selectedNode.templateProps ?? {})[p.key] ?? "";
                                            const isTextArea = p.key === "body";

                                            return (
                                                <label className="insp__field" key={p.key}>
                                                    <div className="insp__label">
                                                        {p.key}
                                                        {p.required ? <span className="insp__req">*</span> : null}
                                                        {p.secret ? (
                                                            <span className="insp__pill insp__pill--amber" style={{ marginLeft: 8 }}>
                      secret
                    </span>
                                                        ) : null}
                                                    </div>

                                                    {isTextArea ? (
                                                        <textarea
                                                            className="insp__input"
                                                            rows={4}
                                                            value={String(v)}
                                                            placeholder={p.description}
                                                            onChange={(e) => onSetNodeTemplateProp(selectedNode.id, p.key, e.target.value)}
                                                        />
                                                    ) : (
                                                        <input
                                                            className="insp__input"
                                                            value={String(v)}
                                                            placeholder={p.description}
                                                            onChange={(e) => onSetNodeTemplateProp(selectedNode.id, p.key, e.target.value)}
                                                        />
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </Section>
                    ) : null}

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