import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SavedSection } from "../../types";

/** Card arrastável para uma secção guardada */
function SortableSavedCard({
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
      className={`rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none p-2 bg-white dark:bg-gray-800 cursor-grab ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      {children}
    </div>
  );
}

type Props = {
  items: SavedSection[];
  onDeleteOne: (id: string) => void;
};

export default function SavedSectionsCombobox({ items, onDeleteOne }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((s) => {
      const label = (s.label || "Sem título").toLowerCase();
      const text = (s.text || "").toLowerCase();
      return label.includes(term) || text.includes(term);
    });
  }, [items, q]);

  // fechar ao clicar fora
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
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2"
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
        <div className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow dark:shadow-none p-2 space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className="relative group">
              <SortableSavedCard id={s.id}>
                <div
                  className={`flex items-center justify-between ${s.color} px-3 py-2 rounded-xl border dark:border-slate-700`}
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate text-black">
                      {s.label || "Sem título"}
                    </div>
                    {s.text ? (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {s.text}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(s.associations?.length ?? 0) > 0 && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">
                        {s.associations!.length} res.
                      </span>
                    )}
                    <button
                      className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-gray-700 text-slate-700 dark:text-slate-200"
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
              </SortableSavedCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
