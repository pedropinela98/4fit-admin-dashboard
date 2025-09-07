import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuid } from "uuid";
import { Modal } from "../../components/ui/modal/index";
import { AssociateResults } from "../../components/AssociateResults";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { pt } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

/** Paleta de cores disponíveis para as secções */
const COLOR_PRESETS = [
  { id: "amber", name: "Âmbar", classes: "bg-amber-50 border-amber-300" },
  { id: "blue", name: "Azul", classes: "bg-blue-50 border-blue-300" },
  { id: "purple", name: "Roxo", classes: "bg-purple-50 border-purple-300" },
  { id: "emerald", name: "Verde", classes: "bg-emerald-50 border-emerald-300" },
  { id: "slate", name: "Cinza", classes: "bg-white border-slate-300" },
];

const SECTION_TEMPLATES = [
  {
    id: "tpl-custom",
    label: "Secção Personalizada",
    color: "bg-white border-slate-300",
    placeholder: "Escreve aqui o conteúdo...",
    custom: true,
  },
  {
    id: "tpl-aquecimento",
    label: "Aquecimento",
    color: "bg-amber-50 border-amber-300",
    placeholder: "Ex.: 10’ Bike + Mobilidade de Ombro",
  },
  {
    id: "tpl-forca",
    label: "Força",
    color: "bg-blue-50 border-blue-300",
    placeholder: "Ex.: 5×5 Back Squat @ 75%",
  },
  {
    id: "tpl-tecnica",
    label: "Técnica",
    color: "bg-purple-50 border-purple-300",
    placeholder: "Ex.: Snatch Balance + OHS leve",
  },
  {
    id: "tpl-metcon",
    label: "Metcon",
    color: "bg-emerald-50 border-emerald-300",
    placeholder: "Ex.: AMRAP 10’ – 10 Pull-ups, 15 Push-ups, 20 Air Squats",
  },
];

const WORKOUT_TYPES = ["Individual", "Partner", "Team Wod"] as const;

const RESULT_TYPES = [
  { id: "time", label: "time", placeholder: "mm:ss (ex.: 12:34)" },
  { id: "reps", label: "reps", placeholder: "nº reps (ex.: 75)" },
  { id: "weight", label: "weight", placeholder: "peso (ex.: 100 kg)" },
  { id: "distance", label: "distance", placeholder: "distância (ex.: 5 km)" },
  {
    id: "rounds_plus_reps",
    label: "rounds_plus_reps",
    placeholder: "rondas+reps (ex.: 5+12)",
  },
  { id: "calories", label: "calories", placeholder: "calorias (ex.: 210)" },
  {
    id: "time(max. time)",
    label: "time(max. time)",
    placeholder: "mm:ss / cap (ex.: 20:00 cap)",
  },
] as const;

type WorkoutType = (typeof WORKOUT_TYPES)[number];
type ResultType = (typeof RESULT_TYPES)[number]["id"];

type Association = {
  athlete: string;
  workoutType: WorkoutType;
  resultType: ResultType;
  value: string;
  notes?: string;
};

/** Tipos das secções (Dia e Guardadas) */
type DaySection = {
  id: string;
  label: string;
  color: string;
  text: string;
  placeholder?: string;
  isCustom?: boolean;
  associations?: Association[];
  coachNotes?: string;
};

type SavedSection = {
  id: string; // sav-xxxx
  label: string;
  color: string;
  placeholder?: string;
  text: string;
  associations?: Association[];
  coachNotes?: string;
};

/** Item “genérico” arrastável (usa useSortable) */
function SortableCard({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-2xl border shadow-sm p-3 bg-white cursor-grab ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      {children}
    </div>
  );
}

function DropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "day-drop" });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-3 transition-colors ${
        isOver ? "border-blue-400 bg-blue-50" : "border-slate-300"
      }`}
    >
      {children}
    </div>
  );
}

function AutoResizingTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
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

/** Utils */
const normalizeLabel = (s: string) => (s || "").trim().toLowerCase();

/** ---------- Combobox com resultados arrastáveis + eliminar ---------- */
function SavedSectionsCombobox({
  items,
  onDeleteOne,
}: {
  items: SavedSection[];
  onDeleteOne: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((s) => {
      const label = (s.label || "Sem título").toLowerCase();
      const body = (s.text || "").toLowerCase();
      return label.includes(t) || body.includes(t);
    });
  }, [items, q]);

  // fechar dropdown ao clicar fora
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!inputRef.current) return;
      const root = inputRef.current.closest("[data-combobox-root]");
      if (!root) return;
      if (!(e.target instanceof Node)) return;
      if (!root.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div data-combobox-root className="relative">
      <input
        ref={inputRef}
        type="text"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder={
          items.length === 0
            ? "Sem secções guardadas"
            : "Pesquisar por título ou conteúdo…"
        }
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-xl border bg-white shadow p-2 space-y-2">
          {/* Cada resultado é arrastável diretamente; tem botão eliminar */}
          {filtered.map((s) => (
            <div key={s.id} className="relative group">
              <SortableCard id={s.id}>
                <div
                  className={`flex items-center justify-between ${s.color} px-3 py-2 rounded-xl border`}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {s.label || "Sem título"}
                    </div>
                    {s.text ? (
                      <div className="text-[11px] text-slate-500 truncate">
                        {s.text}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Indicador opcional de associações */}
                    {(s.associations?.length ?? 0) > 0 && (
                      <span className="text-[10px] text-blue-600">
                        {s.associations!.length} res.
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      arraste →
                    </span>
                    <button
                      className="text-xs px-2 py-1 rounded border hover:bg-white"
                      title="Eliminar guardada"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOne(s.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </SortableCard>
            </div>
          ))}
          <p className="px-1 pb-1 text-[11px] text-slate-500">
            Dica: arrasta diretamente para o “Dia” ou elimina com 🗑️.
          </p>
        </div>
      )}
    </div>
  );
}
/** ---------- fim combobox ---------- */

export default function WorkoutPlannerDnD() {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 8 },
    })
  );
  const [sections, setSections] = useState<DaySection[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const dateBtnRef = useRef<HTMLButtonElement | null>(null);
  const datePopRef = useRef<HTMLDivElement | null>(null);

  const dayLabel = useMemo(() => {
    // ex.: "seg., 08 set. 2025" em Europe/Lisbon
    return formatInTimeZone(selectedDate, "Europe/Lisbon", "EEE, dd LLL yyyy", {
      locale: pt,
    });
  }, [selectedDate]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dateOpen) return;
      if (!(e.target instanceof Node)) return;
      const insideBtn = dateBtnRef.current?.contains(e.target);
      const insidePop = datePopRef.current?.contains(e.target);
      if (!insideBtn && !insidePop) setDateOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDateOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [dateOpen]);

  // Guardadas incluem conteúdo (text), associações e notas
  const [savedSections, setSavedSections] = useState<SavedSection[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<
    "template" | "section" | "saved" | null
  >(null);

  const allSectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  // Helpers de guardar/substituir/eliminar
  function upsertSavedByLabel(newItem: {
    label: string;
    color: string;
    placeholder?: string;
    text: string;
    associations?: Association[];
    coachNotes?: string;
  }) {
    const key = normalizeLabel(newItem.label || "Sem título");
    const idx = savedSections.findIndex(
      (s) => normalizeLabel(s.label || "Sem título") === key
    );

    // Deep-ish copy para evitar partilhar referência de arrays
    const safeItem: Omit<SavedSection, "id"> = {
      label: newItem.label,
      color: newItem.color,
      placeholder: newItem.placeholder,
      text: newItem.text,
      associations: newItem.associations ? [...newItem.associations] : [],
      coachNotes: newItem.coachNotes ?? "",
    };

    if (idx === -1) {
      // Guardar novo
      setSavedSections((prev) => [
        ...prev,
        {
          id: `sav-${uuid().slice(0, 8)}`,
          ...safeItem,
        },
      ]);
    } else {
      // Substituir mantendo o mesmo id
      setSavedSections((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...safeItem };
        return copy;
      });
    }
  }

  function deleteSaved(id: string) {
    setSavedSections((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4">
        Planeador de Treinos – Drag & Drop
      </h1>
      <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
        Arraste uma secção da paleta para o Dia e escreva o treino diretamente.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => {
          setActiveId(e.active.id as string);
          const idStr = String(e.active.id);
          if (idStr.startsWith("tpl-")) setActiveType("template");
          else if (idStr.startsWith("sec-")) setActiveType("section");
          else if (idStr.startsWith("sav-")) setActiveType("saved");
        }}
        onDragEnd={(e) => {
          const { active, over } = e;
          setActiveId(null);
          setActiveType(null);
          if (!over) return;

          const aid = String(active.id);

          // a) da paleta de templates para o Dia
          if (aid.startsWith("tpl-") && over.id === "day-drop") {
            const tpl = SECTION_TEMPLATES.find((t) => t.id === aid);
            if (!tpl) return;
            setSections((prev) => [
              ...prev,
              {
                id: `sec-${uuid().slice(0, 8)}`,
                label: tpl.custom ? "" : tpl.label,
                color: tpl.color,
                text: "",
                placeholder: tpl.placeholder,
                isCustom: !!tpl.custom,
                associations: [],
                coachNotes: "",
              },
            ]);
            return;
          }

          // b) de “Guardadas” para o Dia (mantendo conteúdo + associações + notas)
          if (aid.startsWith("sav-") && over.id === "day-drop") {
            const saved = savedSections.find((s) => s.id === aid);
            if (!saved) return;
            setSections((prev) => [
              ...prev,
              {
                id: `sec-${uuid().slice(0, 8)}`,
                label: saved.label,
                color: saved.color,
                text: saved.text || "",
                placeholder: saved.placeholder,
                associations: saved.associations ? [...saved.associations] : [],
                coachNotes: saved.coachNotes || "",
              },
            ]);
            return;
          }

          // c) reordenar dentro do Dia
          if (aid.startsWith("sec-") && String(over.id).startsWith("sec-")) {
            const oldIndex = sections.findIndex((s) => s.id === aid);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex)
              setSections((prev) => arrayMove(prev, oldIndex, newIndex));
          }
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* SIDEBAR */}
          <aside className="lg:col-span-1 order-1 lg:order-none">
            <div className="space-y-4 sticky top-4">
              {/* Paleta de Secções */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <h2 className="font-medium mb-3">Paleta de Secções</h2>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                  {SECTION_TEMPLATES.map((tpl) => (
                    <SortableCard key={tpl.id} id={tpl.id}>
                      <div
                        className={`flex items-center justify-between ${tpl.color} px-3 py-3 sm:py-2 rounded-xl border`}
                      >
                        <span className="font-medium text-sm sm:text-base">
                          {tpl.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          arraste →
                        </span>
                      </div>
                    </SortableCard>
                  ))}
                </div>
              </div>

              {/* Secções Guardadas (dropdown search com resultados arrastáveis + apagar) */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium">Secções Guardadas</h2>
                  {savedSections.length > 0 && (
                    <button
                      className="text-xs px-2 py-1 rounded-full border hover:bg-slate-50"
                      onClick={() => {
                        setSavedSections([]);
                      }}
                    >
                      Limpar tudo
                    </button>
                  )}
                </div>

                <SavedSectionsCombobox
                  items={savedSections}
                  onDeleteOne={deleteSaved}
                />
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="lg:col-span-2 order-2 lg:order-none">
            <div className="rounded-2xl border bg-white p-4 shadow-sm min-h-[320px] sm:min-h-[420px] overflow-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 relative">
                <div className="flex items-center gap-3">
                  <h2 className="font-medium text-lg sm:text-xl">Dia</h2>

                  {/* Botão que abre o datepicker */}
                  <button
                    ref={dateBtnRef}
                    type="button"
                    onClick={() => setDateOpen((v) => !v)}
                    className="inline-flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm bg-white text-slate-700 hover:bg-slate-50"
                    aria-haspopup="dialog"
                    aria-expanded={dateOpen}
                    title="Escolher data"
                  >
                    {dayLabel}
                  </button>
                </div>

                <button
                  className="text-xs sm:text-sm px-3 py-2 rounded-full border hover:bg-slate-50"
                  onClick={() => setSections([])}
                >
                  Limpar dia
                </button>

                {/* Popover com DayPicker */}
                {dateOpen && (
                  <div
                    ref={datePopRef}
                    role="dialog"
                    aria-label="Selecionar data"
                    className="fixed z-50 rounded-xl border bg-white shadow p-3"
                    style={{
                      top: dateBtnRef.current
                        ? dateBtnRef.current.getBoundingClientRect().bottom + 8
                        : 100,
                      left: dateBtnRef.current
                        ? dateBtnRef.current.getBoundingClientRect().left
                        : 100,
                    }}
                  >
                    <DayPicker
                      mode="single"
                      locale={pt}
                      weekStartsOn={1}
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) setSelectedDate(date);
                        setDateOpen(false);
                      }}
                      className="rdp-root"
                      classNames={{
                        caption_label: "font-medium",
                        day: "rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                        day_selected:
                          "bg-blue-600 text-white hover:bg-blue-600",
                        head_cell: "text-xs text-slate-500 font-normal",
                        nav_button: "rounded-md hover:bg-slate-100",
                        table: "mt-2",
                      }}
                    />
                  </div>
                )}
              </div>

              <DropZone>
                {sections.length === 0 ? (
                  <div className="text-center text-slate-500 py-12 sm:py-16">
                    Arraste uma secção da esquerda para começar.
                  </div>
                ) : (
                  <SortableContext
                    items={allSectionIds}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {sections.map((sec) => (
                        <SectionCard
                          key={sec.id}
                          section={sec}
                          onChange={(updated) =>
                            setSections((prev) =>
                              prev.map((s) =>
                                s.id === updated.id ? updated : s
                              )
                            )
                          }
                          onDelete={() =>
                            setSections((prev) =>
                              prev.filter((s) => s.id !== sec.id)
                            )
                          }
                          onSave={() =>
                            upsertSavedByLabel({
                              label: sec.label || "Sem título",
                              color: sec.color,
                              placeholder: sec.placeholder,
                              text: sec.text || "",
                              // passam também associações e notas
                              associations: sec.associations ?? [],
                              coachNotes: sec.coachNotes || "",
                            })
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </DropZone>
            </div>
          </main>
        </div>

        {/* Overlays para o “ghost” do drag */}
        <DragOverlay>
          {activeId && activeType === "template" && (
            <div className="rounded-xl border bg-white px-3 py-2 shadow-sm">
              {(SECTION_TEMPLATES.find((t) => t.id === activeId) ?? {}).label}
            </div>
          )}
          {activeId && activeType === "saved" && (
            <div className="rounded-xl border bg-white px-3 py-2 shadow-sm">
              {(savedSections.find((s) => s.id === activeId) ?? {}).label}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/** ---------- Card da secção no Dia ---------- */
function SectionCard({
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

  // Accordion
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

  // Guardar/Substituir (UX)
  const [buttonLabel] = React.useState<"Guardar">("Guardar");
  // mudar cor
  function handleColorChange(presetId: string) {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({ ...section, color: preset.classes });
  }

  // --- MODAL TailAdmin (Associar/Editar resultados) ---
  const [assocOpen, setAssocOpen] = React.useState(false);

  // form para NOVA associação
  const [athlete, setAthlete] = React.useState("");
  const [workoutType, setWorkoutType] =
    React.useState<WorkoutType>("Individual");
  const [resultType, setResultType] = React.useState<ResultType>("time");
  const [value, setValue] = React.useState("");
  const [coachNotes, setCoachNotes] = React.useState(section.coachNotes || "");

  // estado editável para associações existentes (clona para editar sem side effects)
  const [editList, setEditList] = React.useState<Association[]>(
    section.associations ?? []
  );

  // sincroniza quando abre modal
  React.useEffect(() => {
    if (assocOpen) {
      setCoachNotes(section.coachNotes || "");
      setEditList(section.associations ?? []);
    }
  }, [assocOpen, section.associations, section.coachNotes]);

  function resetNewForm() {
    setAthlete("");
    setWorkoutType("Individual");
    setResultType("time");
    setValue("");
  }

  function handleAddAssociation() {
    const trimmed: Association = {
      athlete: athlete.trim(),
      workoutType,
      resultType,
      value: value.trim(),
    };

    if (!trimmed.athlete || !trimmed.value) return; // validação simples
    const next = [...(section.associations ?? []), trimmed];
    onChange({ ...section, associations: next, coachNotes });
    resetNewForm();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border shadow-sm p-4 ${section.color} ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      {/* HEADER (accordion) */}
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

        {/* Botão abrir modal */}
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

          {/* indicador simples quando existem associações */}
          {section.associations?.length ? (
            <span className="text-xs text-slate-600">
              {section.associations.length} associado(s)
            </span>
          ) : null}
        </div>
      </div>

      {/* MODAL TailAdmin */}
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

/** seletor de cor simples */
function ColorSelect({
  value,
  onChange,
}: {
  value: string; // id do preset
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
      {/* preview bolinha */}
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
