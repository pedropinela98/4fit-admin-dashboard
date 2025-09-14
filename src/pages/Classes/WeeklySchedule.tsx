import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import type {
  EventInput,
  DateSelectArg,
  EventDropArg,
} from "@fullcalendar/core";
import { Draggable, EventResizeDoneArg } from "@fullcalendar/interaction";

const MOCK_ROOMS = [
  { id: "r1", name: "Sala 1" },
  { id: "r2", name: "Sala 2" },
  { id: "r3", name: "Sala 3" },
];

const MOCK_CLASS_TYPES = [
  { id: "ct1", title: "CrossFit", color: "#2563eb" },
  { id: "ct2", title: "Yoga", color: "#16a34a" },
  { id: "ct3", title: "Pilates", color: "#f59e0b" },
  { id: "ct4", title: "Mobility", color: "#7c3aed" },
];

const MOCK_COACHES = [
  { id: "co1", name: "João Silva" },
  { id: "co2", name: "Maria Santos" },
  { id: "co3", name: "Rita Costa" },
];

// helpers
const toLocalInputValue = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};
const inputToISO = (v: string) => new Date(v).toISOString();

function generateMockEvents(roomId: string): EventInput[] {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  monday.setDate(monday.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const toISO = (d: Date) => d.toISOString();

  const makeEvent = (
    offsetDay: number,
    startHour: number,
    durationHrs: number,
    ctIndex: number
  ): EventInput => {
    const start = new Date(monday);
    start.setDate(start.getDate() + offsetDay);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + durationHrs);
    const ct = MOCK_CLASS_TYPES[ctIndex % MOCK_CLASS_TYPES.length];
    return {
      id: `${roomId}-${offsetDay}-${startHour}-${ct.id}`,
      title: ct.title,
      start: toISO(start),
      end: toISO(end),
      backgroundColor: ct.color,
      extendedProps: {
        roomId,
        classTypeId: ct.id,
        coachId: MOCK_COACHES[0].id,
      },
    };
  };

  return [
    makeEvent(1, 9, 1, 0),
    makeEvent(2, 18, 1, 1),
    makeEvent(3, 12, 1, 2),
    makeEvent(4, 19, 1, 3),
  ];
}

export default function HorarioSemanalPorSalaMock() {
  const [rooms] = useState(MOCK_ROOMS);
  const [classTypes] = useState(MOCK_CLASS_TYPES);
  const [coaches] = useState(MOCK_COACHES);
  const [selectedRoom, setSelectedRoom] = useState<string>(MOCK_ROOMS[0].id);

  const [eventsByRoom, setEventsByRoom] = useState<
    Record<string, EventInput[]>
  >({
    r1: generateMockEvents("r1"),
    r2: generateMockEvents("r2"),
    r3: generateMockEvents("r3"),
  });

  const events = useMemo(
    () => eventsByRoom[selectedRoom] ?? [],
    [eventsByRoom, selectedRoom]
  );

  // Draggable externo
  const paletteRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!paletteRef.current) return;
    const draggable = new Draggable(paletteRef.current, {
      itemSelector: ".fc-draggable-item",
      eventData: (el) => {
        const payload = el.getAttribute("data-event");
        return payload ? JSON.parse(payload) : {};
      },
    });
    return () => draggable.destroy();
  }, []);

  // Criar
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  function handleSelect(info: DateSelectArg) {
    setSelectedSlot(info);
    setIsCreateOpen(true);
  }

  // helpers estado
  function upsertEventInRoom(roomId: string, newEvent: EventInput) {
    setEventsByRoom((prev) => {
      const list = prev[roomId] ?? [];
      const idx = list.findIndex((e) => e.id === newEvent.id);
      const nextList =
        idx >= 0
          ? list.map((e, i) => (i === idx ? newEvent : e))
          : [...list, newEvent];
      return { ...prev, [roomId]: nextList };
    });
  }
  function updateEventTimes(
    roomId: string,
    eventId: string,
    startStr: string,
    endStr: string
  ) {
    setEventsByRoom((prev) => {
      const list = prev[roomId] ?? [];
      const next = list.map((e) =>
        e.id === eventId ? { ...e, start: startStr, end: endStr } : e
      );
      return { ...prev, [roomId]: next };
    });
  }

  async function handleCreateFromModal(classTypeId: string) {
    if (!selectedSlot) return;
    const ct = classTypes.find((c) => c.id === classTypeId)!;
    const newEvent: EventInput = {
      id: `${selectedRoom}-${Date.now()}`,
      title: ct.title,
      start: selectedSlot.startStr,
      end: selectedSlot.endStr,
      backgroundColor: ct.color,
      extendedProps: {
        roomId: selectedRoom,
        classTypeId: ct.id,
        coachId: coaches[0].id,
      },
    };
    upsertEventInRoom(selectedRoom, newEvent);
    setIsCreateOpen(false);
    setSelectedSlot(null);
  }

  // Calendar callbacks
  async function onEventReceive(info: any) {
    const payload = info.draggedEl.getAttribute("data-event");
    const parsed = payload ? JSON.parse(payload) : {};
    const { title, backgroundColor, classTypeId } = parsed;
    const newEvent: EventInput = {
      id: `${selectedRoom}-${Date.now()}`,
      title: title || info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      backgroundColor,
      extendedProps: {
        roomId: selectedRoom,
        classTypeId,
        coachId: coaches[0].id,
      },
    };
    upsertEventInRoom(selectedRoom, newEvent);
    info.event.remove();
  }
  async function onEventDrop(info: EventDropArg) {
    try {
      updateEventTimes(
        selectedRoom,
        info.event.id,
        info.event.startStr!,
        info.event.endStr!
      );
    } catch (e) {
      console.error(e);
      info.revert();
    }
  }
  async function onEventResize(info: EventResizeDoneArg) {
    try {
      updateEventTimes(
        selectedRoom,
        info.event.id,
        info.event.startStr!,
        info.event.endStr!
      );
    } catch (e) {
      console.error(e);
      info.revert();
    }
  }

  // Editar
  type EditState = {
    open: boolean;
    eventId: string | null;
    originalRoomId: string | null;
    roomId: string;
    coachId: string;
    startLocal: string;
    endLocal: string;
    title: string;
    color?: string;
    classTypeId?: string;
  };
  const [edit, setEdit] = useState<EditState>({
    open: false,
    eventId: null,
    originalRoomId: null,
    roomId: "",
    coachId: "",
    startLocal: "",
    endLocal: "",
    title: "",
    color: "#2563eb",
    classTypeId: undefined,
  });

  function onEventClick(info: any) {
    const evt = info.event;
    const ext = evt.extendedProps || {};
    const originalRoomId = ext.roomId as string;
    const coachId = (ext.coachId as string) ?? coaches[0].id;
    setEdit({
      open: true,
      eventId: evt.id,
      originalRoomId,
      roomId: originalRoomId,
      coachId,
      startLocal: toLocalInputValue(evt.start!),
      endLocal: toLocalInputValue(
        evt.end! ?? new Date(evt.start!.getTime() + 60 * 60 * 1000)
      ),
      title: evt.title,
      color: (evt.backgroundColor as string) || "#2563eb",
      classTypeId: ext.classTypeId as string | undefined,
    });
  }
  function closeEdit() {
    setEdit((e) => ({ ...e, open: false }));
  }
  function deleteFromRoom(roomId: string, eventId: string) {
    setEventsByRoom((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).filter((e) => e.id !== eventId),
    }));
  }
  function saveEdit() {
    if (!edit.eventId || !edit.originalRoomId) return;
    const updated: EventInput = {
      id: edit.eventId,
      title: edit.title,
      start: inputToISO(edit.startLocal),
      end: inputToISO(edit.endLocal),
      backgroundColor: edit.color,
      extendedProps: {
        roomId: edit.roomId,
        coachId: edit.coachId,
        classTypeId: edit.classTypeId,
      },
    };
    if (edit.roomId !== edit.originalRoomId) {
      setEventsByRoom((prev) => {
        const oldList = (prev[edit.originalRoomId!] ?? []).filter(
          (e) => e.id !== edit.eventId
        );
        const newList = [...(prev[edit.roomId] ?? []), updated];
        return {
          ...prev,
          [edit.originalRoomId!]: oldList,
          [edit.roomId]: newList,
        };
      });
    } else {
      upsertEventInRoom(edit.roomId, updated);
    }
    closeEdit();
  }
  function deleteEdit() {
    if (!edit.eventId || !edit.originalRoomId) return;
    deleteFromRoom(edit.originalRoomId, edit.eventId);
    closeEdit();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Horário Semanal por Sala
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Arrasta um tipo de aula para o calendário, clica/arrasta num slot
            para criar, e clica num evento para editar.
          </p>
        </div>

        {/* DROPDOWN (dark-ready: fundo transparente + borda clara) */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sala:
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="rounded-md bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {rooms.map((r) => (
              <option
                key={r.id}
                value={r.id}
                className="bg-white dark:bg-gray-900"
              >
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Painel Tipos de Aula */}
        <div className="col-span-12 xl:col-span-2">
          <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm transition-colors">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Tipos de Aula
            </h4>
            <div
              ref={paletteRef}
              id="classTypePalette"
              className="grid sm:grid-cols-2 xl:grid-cols-1 gap-2 text-center"
            >
              {classTypes.map((ct) => (
                <div
                  key={ct.id}
                  className="fc-draggable-item px-3 py-2 rounded-md text-white cursor-grab select-none shadow-sm"
                  style={{ backgroundColor: ct.color }}
                  data-event={JSON.stringify({
                    title: ct.title,
                    backgroundColor: ct.color,
                    classTypeId: ct.id,
                  })}
                >
                  {ct.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="col-span-12 xl:col-span-9">
          <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm transition-colors">
            <FullCalendar
              locale={ptLocale}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              allDaySlot={false}
              slotMinTime="05:00:00"
              slotMaxTime="24:00:00"
              height="auto"
              selectable
              editable
              droppable
              events={events}
              select={handleSelect}
              eventReceive={onEventReceive}
              eventDrop={onEventDrop}
              eventResize={onEventResize}
              eventClick={onEventClick}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridWeek,timeGridDay",
              }}
              nowIndicator
              slotEventOverlap={false}
            />
          </div>
        </div>
      </div>

      {/* MODAL CRIAR (dark-ready: fundo transparente + borda) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg w-full max-w-md p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Seleciona o tipo de aula
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {classTypes.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => handleCreateFromModal(ct.id)}
                  className="rounded-md px-3 py-2 text-white"
                  style={{ backgroundColor: ct.color }}
                >
                  {ct.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsCreateOpen(false);
                setSelectedSlot(null);
              }}
              className="mt-5 w-full rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR (dark-ready) */}
      {edit.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg w-full max-w-lg p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Editar aula
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={edit.title}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, title: e.target.value }))
                  }
                  className="w-full rounded-md bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    value={edit.startLocal}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, startLocal: e.target.value }))
                    }
                    className="w-full rounded-md bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={edit.endLocal}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, endLocal: e.target.value }))
                    }
                    className="w-full rounded-md bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coach
                  </label>
                  <select
                    value={edit.coachId}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, coachId: e.target.value }))
                    }
                    className="w-full rounded-md bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {coaches.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-white dark:bg-gray-900"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sala
                  </label>
                  <select
                    value={edit.roomId}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, roomId: e.target.value }))
                    }
                    className="w-full rounded-md bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {rooms.map((r) => (
                      <option
                        key={r.id}
                        value={r.id}
                        className="bg-white dark:bg-gray-900"
                      >
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3">
              <button
                onClick={deleteEdit}
                className="rounded-md px-4 py-2 border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Eliminar
              </button>

              <div className="flex gap-3">
                <button
                  onClick={closeEdit}
                  className="rounded-md px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Guardar alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
