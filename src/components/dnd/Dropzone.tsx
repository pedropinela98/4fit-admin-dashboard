import { useDroppable } from "@dnd-kit/core";

export default function DropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "day-drop" });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed px-3 py-3 transition-colors ${
        isOver ? "border-blue-400 bg-blue-50" : "border-slate-300"
      }`}
    >
      {children}
    </div>
  );
}
