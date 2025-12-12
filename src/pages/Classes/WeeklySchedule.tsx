import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { supabase } from "../../lib/supabase";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  Draggable,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import { Modal } from "../../components/ui/modal/index";
import type {
  EventInput,
  DateSelectArg,
  EventDropArg,
} from "@fullcalendar/core";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "../../components/ui/Toast";

type ClassType = {
  id: string;
  name: string;
  color: string | null;
  duration_default: number | null;
  capacity_default: number | null;
};

type RoomsData = {
  id: string;
  name: string;
};

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
  capacity: number;
  notIsEditable: boolean;
};

const toLocalInputValue = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};
const inputToISO = (v: string) => new Date(v).toISOString();

export default function WeeklySchedule() {
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const { boxId } = useParams();
  const { addToast } = useToast();
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [rooms, setRooms] = useState<RoomsData[]>([]);
  const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([]);
  const [eventsByRoom, setEventsByRoom] = useState<
    Record<string, EventInput[]>
  >({});
  const [changedEvents, setChangedEvents] = useState<EventInput[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<string[]>([]);
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
    capacity: 0,
    notIsEditable: false,
  });

  async function fetchData() {
    if (!boxId) return;

    // Tipos de aula
    const { data: types } = await supabase
      .from("Class_Type")
      .select("id, name, color, duration_default, capacity_default")
      .eq("box_id", boxId ?? "")
      .eq("active", true);
    setClassTypes(types || []);

    // Salas
    const { data: roomsData } = await supabase
      .from("Room")
      .select("id, name")
      .eq("box_id", boxId ?? "")
      .eq("active", true);
    setRooms(roomsData || []);

    // Coaches
    const { data: staff } = await supabase
      .from("Box_Staff")
      .select("user_id, role, User_detail ( id, name )")
      .eq("box_id", boxId ?? "")
      .eq("role", "coach")
      .eq("is_active", true);
    const mappedCoaches = (staff || []).map((s) => ({
      id: s.User_detail.id,
      name: s.User_detail.name,
    }));
    setCoaches(mappedCoaches);

    // Aulas da semana
    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    monday.setDate(monday.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const { data: classes } = await supabase
      .from("Class")
      .select(
        `
      id,
      datetime,
      duration,
      room_id,
      class_type_id,
      coach_id,
      max_capacity,
      Class_Type ( name, color, duration_default ),
      Room ( name ),
      User_detail ( name )
    `
      )
      .eq("box_id", boxId ?? "")
      .gte("datetime", monday.toISOString())
      .lte("datetime", sunday.toISOString());

    function isSameOrFuture(date: Date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // início do dia atual
      const d = new Date(date);
      d.setHours(0, 0, 0, 0); // início do dia do evento
      return d >= today;
    }

    const events = (classes || []).map((c) => {
      const start = new Date(c.datetime);
      const end = new Date(start.getTime() + c.duration * 60000);
      const isPast = !isSameOrFuture(start);
      return {
        id: c.id,
        title: c.Class_Type?.name ?? "Aula",
        start: start.toISOString(),
        end: end.toISOString(),
        editable: !isPast,
        backgroundColor: c.Class_Type?.color ?? "#2563eb",
        extendedProps: {
          roomId: c.room_id,
          classTypeId: c.class_type_id,
          coachId: c.coach_id,
          coachName: c.User_detail?.name,
          roomName: c.Room?.name,
          duration_default: c.Class_Type?.duration_default,
          capacity: c.max_capacity,
          notisEditable: isPast,
        },
      };
    });

    const grouped = events.reduce((acc, ev) => {
      const roomId = ev.extendedProps.roomId;
      if (!acc[roomId]) acc[roomId] = [];
      acc[roomId].push(ev);
      return acc;
    }, {} as Record<string, EventInput[]>);

    setEventsByRoom(grouped);
  }

  useEffect(() => {
    fetchData();
  }, [boxId, selectedRoom]);

  // detectar mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function markDirty(ev?: EventInput) {
    console.log("dirty");
    setIsDirty(true);
    if (ev) {
      setChangedEvents((prev) => {
        const idx = prev.findIndex((e) => e.id === ev.id);
        return idx >= 0
          ? prev.map((e, i) => (i === idx ? ev : e))
          : [...prev, ev];
      });
    }
  }

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

  // Calendar Ref + ResizeObserver
  const calendarRef = useRef<FullCalendar>(null);
  useEffect(() => {
    const container = document.querySelector("#calendar-container");
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const api = calendarRef.current?.getApi();
      if (api) {
        const currentDate = api.getDate();
        const currentView = api.view.type;
        api.updateSize();
        api.changeView(currentView, currentDate);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Criar
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  function handleSelect(info: DateSelectArg) {
    setSelectedSlot(info);
    setIsCreateOpen(true);
  }

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
    markDirty(newEvent);
  }

  function updateEventTimes(
    roomId: string,
    eventId: string,
    startStr: string,
    endStr: string
  ) {
    setEventsByRoom((prev) => {
      const list = prev[roomId] ?? [];
      const next = list.map((e) => {
        if (e.id === eventId) {
          const updated = { ...e, start: startStr, end: endStr };
          // 👇 regista também nos changedEvents
          markDirty(updated);
          return updated;
        }
        return e;
      });
      return { ...prev, [roomId]: next };
    });
  }

  async function handleCreateFromModal(classTypeId: string) {
    if (!selectedSlot) return;
    const ct = classTypes.find((c) => c.id === classTypeId)!;
    console.log("classtypes", classTypes);
    const newEvent: EventInput = {
      id: uuidv4(),
      title: ct.name,
      start: selectedSlot.startStr,
      end: selectedSlot.endStr,
      backgroundColor: ct.color ?? "#2563eb",
      extendedProps: {
        roomId: selectedRoom,
        classTypeId: ct.id,
        coachId: coaches[0]?.id,
        capacity: ct.capacity_default,
      },
    };
    upsertEventInRoom(selectedRoom, newEvent);
    setIsCreateOpen(false);
    setSelectedSlot(null);
  }
  async function onEventReceive(info: any) {
    const payload = info.draggedEl.getAttribute("data-event");
    const parsed = payload ? JSON.parse(payload) : {};
    const { title, backgroundColor, classTypeId, duration_default, capacity } =
      parsed;
    let endDate = null;

    if (duration_default) {
      const start = new Date(info.event.start);
      endDate = new Date(start.getTime() + duration_default * 60000);
    }

    const roomId = selectedRoom || rooms[0]?.id || "Sala";
    const newEvent: EventInput = {
      id: uuidv4(),
      title: title || info.event.title,
      start: info.event.startStr,
      end: endDate ? endDate.toISOString() : info.event.endStr,
      backgroundColor,
      extendedProps: {
        roomId: roomId,
        classTypeId,
        coachId: coaches[0]?.id,
        capacity: capacity,
      },
    };
    upsertEventInRoom(roomId, newEvent);
    info.event.remove();
  }

  async function onEventDrop(info: EventDropArg) {
    try {
      const roomId = info.event.extendedProps.roomId;
      updateEventTimes(
        roomId,
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
      const roomId = info.event.extendedProps.roomId;
      updateEventTimes(
        roomId,
        info.event.id,
        info.event.startStr!,
        info.event.endStr!
      );
    } catch (e) {
      console.error(e);
      info.revert();
    }
  }

  function onEventClick(info: any) {
    const evt = info.event;
    const ext = evt.extendedProps || {};
    const originalRoomId = ext.roomId as string;
    const coachId = (ext.coachId as string) ?? coaches[0]?.id;
    console.log(evt, evt.id, ext.isEditable);
    setEdit({
      open: true,
      eventId: evt.id,
      originalRoomId,
      roomId: originalRoomId,
      coachId,
      notIsEditable: ext.notisEditable,
      startLocal: toLocalInputValue(evt.start!),
      endLocal: toLocalInputValue(
        evt.end! ?? new Date(evt.start!.getTime() + 60 * 60 * 1000)
      ),
      title: evt.title,
      color: (evt.backgroundColor as string) || "#2563eb",
      classTypeId: ext.classTypeId as string | undefined,
      capacity: ext.capacity,
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
    markDirty();
    setDeletedEvents((prev) => [...prev, eventId]);
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
        capacity: edit.capacity,
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
      markDirty(updated);
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
  // Guardar BD
  async function handleSaveToDB() {
    setIsLoading(true);
    try {
      console.log(changedEvents);
      console.log(deletedEvents);

      // 1. Guardar eventos alterados/adicionados
      for (const ev of changedEvents) {
        const startDate = new Date(ev.start as string | Date);
        const endDate = new Date(ev.end as string | Date);
        const durationMinutes =
          (endDate.getTime() - startDate.getTime()) / 60000;

        const { error } = await supabase.from("Class").upsert({
          id: ev.id,
          box_id: boxId,
          room_id: ev.extendedProps?.roomId,
          class_type_id: ev.extendedProps?.classTypeId,
          coach_id: ev.extendedProps?.coachId,
          datetime: ev.start,
          duration: durationMinutes,
          max_capacity: ev.extendedProps?.capacity,
        });

        if (error) throw error; // 👈 força o catch
      }

      // 2. Apagar eventos removidos
      for (const id of deletedEvents) {
        const { error } = await supabase.from("Class").delete().eq("id", id);
        if (error) throw error;
      }

      await fetchData();

      // 3. Reset flags
      setChangedEvents([]);
      setDeletedEvents([]);
      setIsDirty(false);
      setIsLoading(false);

      addToast("Alterações guardadas com sucesso!", "success");
    } catch (error) {
      setIsLoading(false);
      addToast("Não foi possível guardar alterações!", "error");
      await fetchData();
    }
  }

  const events = selectedRoom
    ? eventsByRoom[selectedRoom] ?? []
    : Object.values(eventsByRoom).flat();

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

        {/* Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sala:
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="rounded-md bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {/* Placeholder */}
            <option className="bg-white dark:bg-gray-900" value="">
              Todas as salas
            </option>
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

      {/* Botão Guardar se houver alterações */}
      {isDirty && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveToDB}
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Guardar alterações
          </button>
        </div>
      )}

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
                  style={{ backgroundColor: ct.color ?? "#2563eb" }}
                  data-event={JSON.stringify({
                    title: ct.name,
                    backgroundColor: ct.color ?? "#2563eb",
                    classTypeId: ct.id,
                    duration_default: ct.duration_default,
                    capacity: ct.capacity_default,
                  })}
                >
                  {ct.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="col-span-12 xl:col-span-9">
          <div
            id="calendar-container"
            className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm transition-colors"
          >
            <FullCalendar
              ref={calendarRef}
              locale={ptLocale}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
              allDaySlot={false}
              slotMinTime="05:00:00"
              slotMaxTime="24:00:00"
              height="auto"
              selectable
              editable
              eventAllow={(dropInfo) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // início do dia atual
                return dropInfo.end >= today; // só permite se a nova data >= hoje
              }}
              selectAllow={(selectInfo) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // início do dia atual
                return selectInfo.start >= today; // só permite selecionar se >= hoje
              }}
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
                right: isMobile ? "timeGridDay" : "timeGridWeek,timeGridDay",
              }}
              nowIndicator
              slotEventOverlap={false}
            />
          </div>
        </div>
      </div>
      {/* Modal Criar */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-8">
          Seleciona o tipo de aula
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {classTypes.map((ct) => (
            <button
              key={ct.id}
              onClick={() => handleCreateFromModal(ct.id)}
              className="rounded-md px-3 py-2 text-white"
              style={{ backgroundColor: ct.color ?? "#2563eb" }}
            >
              {ct.name}
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
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={edit.open} onClose={closeEdit} className="max-w-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Editar aula
        </h3>
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={edit.title}
              disabled
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-2"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início</label>
              <input
                type="datetime-local"
                value={edit.startLocal}
                disabled={edit.notIsEditable}
                onChange={(e) =>
                  setEdit((s) => ({ ...s, startLocal: e.target.value }))
                }
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim</label>
              <input
                type="datetime-local"
                disabled={edit.notIsEditable}
                value={edit.endLocal}
                onChange={(e) =>
                  setEdit((s) => ({ ...s, endLocal: e.target.value }))
                }
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-2"
              />
            </div>
          </div>

          {/*  Sala */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Sala</label>
              <select
                value={edit.roomId}
                disabled={edit.notIsEditable}
                onChange={(e) =>
                  setEdit((s) => ({ ...s, roomId: e.target.value }))
                }
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-2"
              >
                {rooms.map((r) => (
                  <option
                    className="bg-white dark:bg-gray-900"
                    key={r.id}
                    value={r.id}
                  >
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Coach e capacidade */}
            <div>
              <label className="block text-sm font-medium mb-1">Coach</label>
              <select
                disabled={edit.notIsEditable}
                value={edit.coachId}
                onChange={(e) =>
                  setEdit((s) => ({ ...s, coachId: e.target.value }))
                }
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-2"
              >
                {coaches.map((c) => (
                  <option
                    className="bg-white dark:bg-gray-900"
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacidade */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Capacidade
              </label>
              <input
                type="number"
                min={1}
                disabled={edit.notIsEditable}
                value={edit.capacity}
                onChange={(e) =>
                  setEdit((s) => ({ ...s, capacity: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-2"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3">
          <button
            onClick={deleteEdit}
            disabled={edit.notIsEditable}
            className="rounded-md px-4 py-2 border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Eliminar
          </button>
          <div className="flex gap-3">
            <button
              disabled={edit.notIsEditable}
              onClick={closeEdit}
              className="rounded-md px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveEdit}
              disabled={edit.notIsEditable}
              className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Prosseguir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
