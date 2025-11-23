import { useMemo, useRef, useState, useEffect } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import DropZone from "../components/dnd/Dropzone";
import SectionCard from "./SectionCard";
import { DaySection } from "../types";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { pt } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

type Props = {
  sections: DaySection[];
  onSectionsChange: React.Dispatch<React.SetStateAction<DaySection[]>>;
  onClear: () => void;
  isDirty: boolean;
  onSaveDay: () => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  /** novo: guardar/atualizar esta secção nas "Secções Guardadas" do Planning */
  onSaveSection: (s: DaySection) => void;
};

export default function DayBoard({
  sections,
  onSectionsChange,
  onClear,
  isDirty,
  onSaveDay,
  selectedDate,
  setSelectedDate,
  onSaveSection,
}: Props) {
  const dateBtnRef = useRef<HTMLButtonElement | null>(null);
  const datePopRef = useRef<HTMLDivElement | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const dayLabel = useMemo(
    () =>
      formatInTimeZone(selectedDate, "Europe/Lisbon", "EEE, dd LLL yyyy", {
        locale: pt,
      }),
    [selectedDate]
  );

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

  const allSectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="font-medium text-lg sm:text-xl text-slate-800 dark:text-slate-100">
              Dia
            </h2>
            <button
              ref={dateBtnRef}
              onClick={() => setDateOpen((v) => !v)}
              className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-gray-600"
            >
              {dayLabel}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="text-xs sm:text-sm px-3 py-2 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-100"
            >
              Limpar dia
            </button>
            {isDirty && (
              <button
                onClick={onSaveDay}
                className="text-xs sm:text-sm px-3 py-2 rounded-full border bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar treino
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DatePicker popover (fixed, não corta em overflow) */}
      {dateOpen && (
        <div
          ref={datePopRef}
          className="fixed z-50 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow p-3 dark:shadow-none"
          style={{
            top: dateBtnRef.current?.getBoundingClientRect().bottom
              ? dateBtnRef.current!.getBoundingClientRect().bottom + 8
              : 100,
            left: dateBtnRef.current?.getBoundingClientRect().left ?? 100,
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
          />
        </div>
      )}

      {/* Conteúdo do dia */}
      <div className="p-4 overflow-auto flex-1">
        <DropZone>
          {sections.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-12 sm:py-16">
              Arraste uma secção da esquerda para começar.
            </div>
          ) : (
            <SortableContext
              items={allSectionIds}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-6 sm:gap-4">
                {sections.map((sec) => (
                  <div className="mt-3 mb-3">
                    <SectionCard
                      key={sec.id}
                      section={sec}
                      onChange={(updated) =>
                        onSectionsChange((prev) =>
                          prev.map((s) => (s.id === updated.id ? updated : s))
                        )
                      }
                      onDelete={() =>
                        onSectionsChange((prev) =>
                          prev.filter((s) => s.id !== sec.id)
                        )
                      }
                      onSave={() => onSaveSection(sec)}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          )}
        </DropZone>
      </div>
    </section>
  );
}
