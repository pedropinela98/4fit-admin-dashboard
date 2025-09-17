import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COLOR_PRESETS } from "../consts";
import { DaySection } from "../types";
import { Modal } from "../components/ui/modal";
import { AssociateResults } from "../components/AssociateResults";

function AutoResizingTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 400)}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 sm:py-2 bg-white dark:bg-gray-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 min-h-[160px] max-h-[400px] overflow-y-auto resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ColorSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="text-xs sm:text-sm px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title="Mudar cor da secção"
      >
        <option value="" disabled>
          Cor
        </option>
        {COLOR_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div
        className={`w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 ${
          COLOR_PRESETS.find((p) => p.id === value)?.classes ||
          "bg-white dark:bg-gray-700"
        }`}
        title="Pré-visualização da cor"
      />
    </div>
  );
}

export default function SectionCard({
  section,
  onChange,
  onDelete,
  onSave,
}: {
  section: DaySection;
  onChange: (s: DaySection) => void;
  onDelete: () => void;
  onSave: () => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const [collapsed, setCollapsed] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = React.useState<number>(0);

  React.useEffect(() => {
    if (contentRef.current) setMaxH(contentRef.current.scrollHeight);
  }, [
    section.text,
    section.placeholder,
    collapsed,
    section.associations?.length,
    section.coachNotes,
  ]);

  const [buttonLabel] = React.useState<"Guardar">("Guardar");

  function handleColorChange(presetId: string) {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({ ...section, color: preset.classes });
  }

  // Modal (associações)
  const [assocOpen, setAssocOpen] = React.useState(false);

  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains("dark")
  );

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  // Determinar classes de cor (light + dark)
  const preset = COLOR_PRESETS.find((p) => p.classes === section.color);
  const colorClasses = isDark
    ? preset?.darkClasses ?? ""
    : preset?.classes ?? "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border shadow-sm p-4 ${colorClasses} ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      {/* HEADER */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 mb-3 cursor-pointer select-none"
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "Expandir" : "Recolher"}
      >
        {/* ESQUERDA - Arrastar + Input + Seta */}
        <div className="flex items-center gap-2 min-w-fit max-w-fit flex-1">
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab select-none text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:cursor-grabbing touch-none"
            title="Arrastar secção"
            aria-label="Arrastar secção"
          >
            ↕
          </button>

          <input
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent outline-none font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-w-fit max-w-fit w-fit"
            value={section.label}
            placeholder={section.isCustom ? "Nome da secção..." : ""}
            autoFocus={section.isCustom && !section.label}
            onChange={(e) => onChange({ ...section, label: e.target.value })}
          />

          <span
            className={`inline-block transition-transform duration-300 ${
              collapsed ? "" : "rotate-90"
            } text-slate-600 dark:text-slate-400`}
            aria-hidden
          >
            ▸
          </span>
        </div>

        {/* DIREITA - Seletor de cor + Botões (quebra para baixo se faltar espaço) */}
        <div
          className="flex flex-wrap gap-2 items-center justify-end w-full sm:w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <ColorSelect
            value={
              COLOR_PRESETS.find((c) => c.classes === section.color)?.id || ""
            }
            onChange={handleColorChange}
          />
          <button
            onClick={onSave}
            className="text-xs sm:text-sm px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-slate-200"
          >
            {buttonLabel}
          </button>
          <button
            onClick={onDelete}
            className="text-xs sm:text-sm px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-slate-200"
          >
            Remover
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: collapsed ? 0 : maxH }}
      >
        <AutoResizingTextarea
          value={section.text}
          placeholder={section.placeholder}
          onChange={(val) => onChange({ ...section, text: val })}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAssocOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-700 dark:text-slate-200"
            title={
              section.associations?.length
                ? "Editar resultados associados"
                : "Associar resultados"
            }
          >
            {section.associations?.length
              ? "Editar resultados associados"
              : "Associar resultados"}
          </button>
          {section.associations?.length ? (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {section.associations.length} associado(s)
            </span>
          ) : null}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={assocOpen}
        onClose={() => setAssocOpen(false)}
        className="max-w-3xl p-4 sm:p-6 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100"
      >
        <AssociateResults
          section={section}
          onChange={onChange}
          onClose={() => setAssocOpen(false)}
        />
      </Modal>
    </div>
  );
}
