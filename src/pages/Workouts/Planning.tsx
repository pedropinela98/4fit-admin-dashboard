import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuid } from "uuid";

import DayBoard from "../../components/DayBoard";
import { DaySection, SavedSection } from "../../types";
import { SECTION_TEMPLATES, COLOR_PRESETS } from "../../consts";
import SavedSectionsCombobox from "../../components/dnd/SavedSectionsCombobox";

/** Card arrastável da paleta (com suporte a tema) */
function PaletteCard({
  id,
  label,
  color,
}: {
  id: string;
  label: string;
  color: string;
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

  // detectar tema dark
  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains("dark")
  );
  React.useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const preset = COLOR_PRESETS.find((p) => p.classes === color);
  const colorClasses = isDark
    ? preset?.darkClasses ?? ""
    : preset?.classes ?? "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none p-3 bg-white dark:bg-gray-800 cursor-grab ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div
        className={`flex items-center justify-between ${colorClasses} px-3 py-2 rounded-xl border dark:border-slate-700`}
      >
        <span className="font-medium text-sm text-black dark:text-white">
          {label}
        </span>
        <span className="text-xs text-slate-500 dark:text-white">
          arrasta →
        </span>
      </div>
    </div>
  );
}

export default function Planning() {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 8 },
    })
  );

  const [sections, setSections] = useState<DaySection[]>([]);
  const [savedSections, setSavedSections] = useState<SavedSection[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isDirty = useMemo(() => sections.length > 0, [sections]);

  /** ---------- helpers para Guardadas ---------- */
  const normalize = (s: string) => (s || "Sem título").trim().toLowerCase();

  function upsertSavedByLabel(from: DaySection) {
    const key = normalize(from.label);
    const idx = savedSections.findIndex((s) => normalize(s.label) === key);

    const item: Omit<SavedSection, "id"> = {
      label: from.label || "Sem título",
      color: from.color,
      placeholder: from.placeholder,
      text: from.text || "",
      associations: from.associations ? [...from.associations] : [],
      coachNotes: from.coachNotes || "",
    };

    if (idx === -1) {
      setSavedSections((prev) => [
        ...prev,
        { id: `sav-${uuid().slice(0, 8)}`, ...item },
      ]);
    } else {
      setSavedSections((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...item };
        return copy;
      });
    }
  }

  /** ---------- DnD handlers ---------- */
  function handleDragEnd(e: any) {
    const { active, over } = e;
    if (!over) return;
    const aid = String(active.id);

    // a) Paleta -> Dia
    if (aid.startsWith("tpl-") && over.id === "day-drop") {
      const tpl = SECTION_TEMPLATES.find((t) => t.id === aid);
      if (!tpl) return;
      setSections((prev) => [
        ...prev,
        {
          id: `sec-${uuid().slice(0, 8)}`,
          label: tpl.id === "tpl-custom" ? "" : tpl.label,
          color: tpl.color,
          text: "",
          placeholder: tpl.placeholder,
          isCustom: tpl.id === "tpl-custom",
          associations: [],
          coachNotes: "",
        },
      ]);
      return;
    }

    // b) Guardadas -> Dia
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

    // c) Reordenar dentro do Dia
    if (aid.startsWith("sec-") && String(over.id).startsWith("sec-")) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === aid);
        const newIndex = prev.findIndex((s) => s.id === String(over.id));
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
          return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // Mock data para tipos de aula
  const CLASS_TYPES = [
    { id: "cf", name: "CrossFit" },
    { id: "wl", name: "Halterofilismo" },
  ];

  // Estado para o tipo de aula selecionado
  const [selectedClassType, setSelectedClassType] = useState(CLASS_TYPES[0].id);

  return (
    <div className="min-h-screen w-full dark:bg-gray-900">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Planeador de treinos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Arrasta uma secção de forma a criares uma parte do teu treino
          </p>
        </div>

        {/* Dropdown de Tipo de Aula */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Aula:
          </label>
          <select
            value={selectedClassType}
            onChange={(e) => setSelectedClassType(e.target.value)}
            className="rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {CLASS_TYPES.map((ct) => (
              <option
                key={ct.id}
                value={ct.id}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
              >
                {ct.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
      >
        {/* MOBILE → scroll horizontal / DESKTOP → normal */}
        <div className="flex flex-row overflow-x-auto md:overflow-visible md:flex-row gap-6">
          {/* ESQUERDA - Paletas */}
          <aside className="space-y-4 w-[280px] md:w-[300px] md:flex-none shrink-0">
            {/* Paleta de Secções */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-4 shadow-sm dark:shadow-none">
              <h2 className="font-medium mb-3 text-slate-800 dark:text-slate-100">
                Paleta de Secções
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {SECTION_TEMPLATES.map((tpl) => (
                  <PaletteCard
                    key={tpl.id}
                    id={tpl.id}
                    label={tpl.label}
                    color={tpl.color}
                  />
                ))}
              </div>
            </div>

            {/* Secções Guardadas */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium text-slate-800 dark:text-slate-100">
                  Secções Guardadas
                </h2>
                {savedSections.length > 0 && (
                  <button
                    className="text-xs px-2 py-1 rounded-full border hover:bg-slate-50 dark:hover:bg-gray-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                    onClick={() => setSavedSections([])}
                  >
                    Limpar tudo
                  </button>
                )}
              </div>
              <SavedSectionsCombobox
                items={savedSections}
                onDeleteOne={(id) =>
                  setSavedSections((prev) => prev.filter((s) => s.id !== id))
                }
              />
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Dica: arrasta diretamente para o “Dia” ou elimina com 🗑️.
              </p>
            </div>
          </aside>

          {/* DIREITA - Dia */}
          <main className="flex-1 min-w-[400px] md:min-w-0">
            <DayBoard
              sections={sections}
              onSectionsChange={setSections}
              onClear={() => setSections([])}
              isDirty={isDirty}
              onSaveDay={() =>
                console.log("Guardar treino do dia", {
                  date: selectedDate,
                  sections,
                })
              }
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onSaveSection={upsertSavedByLabel}
            />
          </main>
        </div>

        <DragOverlay />
      </DndContext>
    </div>
  );
}
