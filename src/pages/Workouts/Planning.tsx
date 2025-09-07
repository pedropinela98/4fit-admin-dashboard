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

const SECTION_TEMPLATES = [
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
  {
    id: "tpl-custom",
    label: "Secção Personalizada",
    color: "bg-white border-slate-300",
    placeholder: "Escreve aqui o conteúdo...",
    custom: true,
  },
];

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

export default function WorkoutPlannerDnD() {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 8 },
    })
  );
  const [sections, setSections] = useState<
    Array<{
      id: string;
      label: string;
      color: string;
      text: string;
      placeholder?: string;
      isCustom?: boolean;
    }>
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"template" | "section" | null>(
    null
  );
  const allSectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

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
          if (String(e.active.id).startsWith("tpl-")) setActiveType("template");
          else if (String(e.active.id).startsWith("sec-"))
            setActiveType("section");
        }}
        onDragEnd={(e) => {
          const { active, over } = e;
          setActiveId(null);
          setActiveType(null);
          if (!over) return;
          if (String(active.id).startsWith("tpl-") && over.id === "day-drop") {
            const tpl = SECTION_TEMPLATES.find((t) => t.id === active.id);
            if (!tpl) return;
            if (tpl.custom) {
              setSections((prev) => [
                ...prev,
                {
                  id: `sec-${uuid().slice(0, 8)}`,
                  label: "",
                  color: tpl.color,
                  text: "",
                  placeholder: tpl.placeholder,
                  isCustom: true,
                },
              ]);
            } else {
              setSections((prev) => [
                ...prev,
                {
                  id: `sec-${uuid().slice(0, 8)}`,
                  label: tpl.label,
                  color: tpl.color,
                  text: "",
                  placeholder: tpl.placeholder,
                },
              ]);
            }
            return;
          }
          if (
            String(active.id).startsWith("sec-") &&
            String(over.id).startsWith("sec-")
          ) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex)
              setSections((prev) => arrayMove(prev, oldIndex, newIndex));
          }
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <aside className="lg:col-span-1 order-1 lg:order-none">
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
                      <span className="text-xs text-slate-500">arraste →</span>
                    </div>
                  </SortableCard>
                ))}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-2 order-2 lg:order-none">
            <div className="rounded-2xl border bg-white p-4 shadow-sm min-h-[320px] sm:min-h-[420px] overflow-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="font-medium text-lg sm:text-xl">Dia</h2>
                <button
                  className="text-xs sm:text-sm px-3 py-2 rounded-full border hover:bg-slate-50"
                  onClick={() => setSections([])}
                >
                  Limpar dia
                </button>
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
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </DropZone>
            </div>
          </main>
        </div>
        <DragOverlay>
          {activeId && activeType === "template" && (
            <div className="rounded-xl border bg-white px-3 py-2 shadow-sm">
              {(SECTION_TEMPLATES.find((t) => t.id === activeId) ?? {}).label}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SectionCard({
  section,
  onChange,
  onDelete,
}: {
  section: {
    id: string;
    label: string;
    color: string;
    text: string;
    placeholder?: string;
    isCustom?: boolean;
  };
  onChange: (s: {
    id: string;
    label: string;
    color: string;
    text: string;
    placeholder?: string;
    isCustom?: boolean;
  }) => void;
  onDelete: () => void;
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
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border shadow-sm p-4 ${section.color} ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            className="cursor-grab select-none text-slate-500 p-2 rounded-lg hover:bg-white active:cursor-grabbing touch-none"
            title="Arrastar secção"
          >
            ↕
          </button>
          <input
            className="bg-transparent outline-none font-semibold text-sm sm:text-base"
            value={section.label}
            placeholder={section.isCustom ? "Nome da secção..." : ""}
            autoFocus={section.isCustom && !section.label}
            onChange={(e) => onChange({ ...section, label: e.target.value })}
          />
        </div>
        <button
          onClick={onDelete}
          className="text-xs sm:text-sm px-2 py-1 rounded-full border hover:bg-white"
        >
          Remover
        </button>
      </div>
      <AutoResizingTextarea
        value={section.text}
        placeholder={section.placeholder}
        onChange={(val) => onChange({ ...section, text: val })}
      />
    </div>
  );
}
