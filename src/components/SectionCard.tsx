import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COLOR_PRESETS } from "../consts";
import { Association, DaySection, ResultType, WorkoutType } from "../types";
import { Modal } from "../components/ui/modal"; // ajusta o path se preciso
import { AssociateResults } from "../components/AssociateResults"; // ajusta o path

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
      className="w-full rounded-xl border px-3 py-3 sm:py-2 bg-white text-sm sm:text-base min-h-[160px] max-h-[400px] overflow-y-auto resize-none"
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
        className="text-xs sm:text-sm px-2 py-1 rounded-full border bg-white"
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
        className={`w-4 h-4 rounded-full border ${
          COLOR_PRESETS.find((p) => p.id === value)?.classes ||
          "bg-white border-slate-300"
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
  const [athlete, setAthlete] = React.useState("");
  const [workoutType, setWorkoutType] =
    React.useState<WorkoutType>("Individual");
  const [resultType, setResultType] = React.useState<ResultType>("time");
  const [value, setValue] = React.useState("");
  const [coachNotes, setCoachNotes] = React.useState(section.coachNotes || "");
  const [editList, setEditList] = React.useState<Association[]>(
    section.associations ?? []
  );

  React.useEffect(() => {
    if (assocOpen) {
      setCoachNotes(section.coachNotes || "");
      setEditList(section.associations ?? []);
    }
  }, [assocOpen, section.associations, section.coachNotes]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border shadow-sm p-4 ${section.color} ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-between mb-3 cursor-pointer select-none"
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "Expandir" : "Recolher"}
      >
        <div className="flex items-center gap-2">
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab select-none text-slate-500 px-6 py-2 rounded-lg hover:bg-white active:cursor-grabbing touch-none"
            title="Arrastar secção"
            aria-label="Arrastar secção"
          >
            ↕
          </button>
          <input
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent outline-none font-semibold text-sm sm:text-base"
            value={section.label}
            placeholder={section.isCustom ? "Nome da secção..." : ""}
            autoFocus={section.isCustom && !section.label}
            onChange={(e) => onChange({ ...section, label: e.target.value })}
          />
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={`inline-block transition-transform duration-300 ${
              collapsed ? "" : "rotate-90"
            }`}
            aria-hidden
          >
            ▸
          </span>
          <ColorSelect
            value={
              COLOR_PRESETS.find((c) => c.classes === section.color)?.id || ""
            }
            onChange={handleColorChange}
          />
          <button
            onClick={onSave}
            className="text-xs sm:text-sm px-2 py-1 rounded-full border hover:bg-white"
          >
            {buttonLabel}
          </button>
          <button
            onClick={onDelete}
            className="text-xs sm:text-sm px-2 py-1 rounded-full border hover:bg-white"
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
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-white"
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
            <span className="text-xs text-slate-600">
              {section.associations.length} associado(s)
            </span>
          ) : null}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={assocOpen}
        onClose={() => setAssocOpen(false)}
        className="max-w-3xl p-4 sm:p-6"
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
