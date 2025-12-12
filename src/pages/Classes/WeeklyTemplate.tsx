import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import { supabase } from "../../lib/supabase";
import { Modal } from "../../components/ui/modal/index";
import { useParams } from "react-router-dom";

type ClassTemplate = {
  id: string;
  weekday: number; // 0-6
  start_time: string; // "HH:mm:ss"
  duration: number;
  max_capacity: number;
  class_type_id: string;
  coach_id: string | null;
  Class_Type?: { name: string; color: string | null };
  User_detail?: { name: string };
};

export default function TemplateSchedule() {
  const { boxId } = useParams();
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [classTypes, setClassTypes] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (!boxId) return;

    async function fetchData() {
      // Tipos de aula
      const { data: types } = await supabase
        .from("Class_Type")
        .select("id, name, color")
        .eq("box_id", boxId ?? "")
        .eq("active", true);
      setClassTypes(types || []);

      // Coaches
      const { data: staff } = await supabase
        .from("Box_Staff")
        .select("user_id, User_detail ( id, name )")
        .eq("box_id", boxId ?? "")
        .eq("is_active", true);
      setCoaches(
        (staff || []).map((s) => ({
          id: s.User_detail.id,
          name: s.User_detail.name,
        }))
      );

      // Templates
      const { data: tmpl } = await supabase
        .from("ClassTemplate")
        .select(
          `
          id,
          weekday,
          start_time,
          duration,
          max_capacity,
          class_type_id,
          coach_id,
          Class_Type ( name, color ),
          User_detail ( name )
        `
        )
        .eq("box_id", boxId ?? "")
        .eq("active", true);

      setTemplates(tmpl || []);
    }

    fetchData();
  }, [boxId]);

  // Converter templates em eventos semanais
  function mapTemplatesToEvents(): any[] {
    const monday = new Date();
    const day = monday.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    monday.setDate(monday.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    return templates.map((t) => {
      const start = new Date(monday);
      start.setDate(monday.getDate() + t.weekday);
      const [h, m] = t.start_time.split(":");
      start.setHours(Number(h), Number(m), 0, 0);

      const end = new Date(start.getTime() + t.duration * 60000);

      return {
        id: t.id,
        title: t.Class_Type?.name ?? "Aula",
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: t.Class_Type?.color ?? "#2563eb",
        extendedProps: {
          classTypeId: t.class_type_id,
          coachId: t.coach_id,
          coachName: t.User_detail?.name,
        },
      };
    });
  }

  const events = mapTemplatesToEvents();
  // Estado para criar/editar
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [edit, setEdit] = useState<any>({
    open: false,
    templateId: null,
    weekday: 1,
    start_time: "18:00:00",
    duration: 60,
    max_capacity: 20,
    class_type_id: "",
    coach_id: "",
  });

  // Criar template
  async function handleCreateTemplate(classTypeId: string, coachId: string) {
    if (!selectedSlot) return;

    const weekday = selectedSlot.start.getDay();
    const start_time = selectedSlot.start.toTimeString().slice(0, 8);

    const { data, error } = await supabase
      .from("ClassTemplate")
      .insert([
        {
          box_id: boxId,
          weekday,
          start_time,
          duration: 60,
          max_capacity: 20,
          class_type_id: classTypeId,
          coach_id: coachId,
        },
      ])
      .select(
        `
        id, weekday, start_time, duration, max_capacity,
        class_type_id, coach_id,
        Class_Type ( name, color ),
        User_detail ( name )
      `
      )
      .single();

    if (error) console.error(error);
    else setTemplates((prev) => [...prev, data]);

    setIsCreateOpen(false);
    setSelectedSlot(null);
  }

  // Editar template
  async function saveEdit() {
    if (!edit.templateId) return;

    const { error } = await supabase
      .from("ClassTemplate")
      .update({
        weekday: edit.weekday,
        start_time: edit.start_time,
        duration: edit.duration,
        max_capacity: edit.max_capacity,
        class_type_id: edit.class_type_id,
        coach_id: edit.coach_id,
      })
      .eq("id", edit.templateId);

    if (error) console.error(error);

    setTemplates((prev) =>
      prev.map((t) => (t.id === edit.templateId ? { ...t, ...edit } : t))
    );
    setEdit((e) => ({ ...e, open: false }));
  }

  // Apagar template
  async function deleteTemplate(id: string) {
    const { error } = await supabase
      .from("ClassTemplate")
      .delete()
      .eq("id", id);
    if (error) console.error(error);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setEdit((e) => ({ ...e, open: false }));
  }

  // Click no evento → abrir modal de edição
  function onEventClick(info: any) {
    const evt = info.event;
    const ext = evt.extendedProps;
    setEdit({
      open: true,
      templateId: evt.id,
      weekday: evt.start.getDay(),
      start_time: evt.start.toTimeString().slice(0, 8),
      duration:
        (new Date(evt.end).getTime() - new Date(evt.start).getTime()) / 60000,
      max_capacity: 20,
      class_type_id: ext.classTypeId,
      coach_id: ext.coachId,
    });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Templates de Aulas</h2>
      <FullCalendar
        ref={calendarRef}
        locale={ptLocale}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        selectable
        editable={false}
        events={events}
        select={(slot) => {
          setSelectedSlot(slot);
          setIsCreateOpen(true);
        }}
        eventClick={onEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
      />

      {/* Modal Criar */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <h3>Seleciona tipo de aula e coach</h3>
        <div className="grid grid-cols-2 gap-3">
          {classTypes.map((ct) => (
            <button
              key={ct.id}
              onClick={() => handleCreateTemplate(ct.id, coaches[0]?.id)}
              className="rounded-md px-3 py-2 text-white"
              style={{ backgroundColor: ct.color || "#2563eb" }}
            >
              {ct.name}
            </button>
          ))}
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={edit.open}
        onClose={() => setEdit((e) => ({ ...e, open: false }))}
      >
        <h3>Editar Template</h3>
        <div className="space-y-4">
          <label>Hora início</label>
          <input
            type="time"
            value={edit.start_time}
            onChange={(e) =>
              setEdit((s) => ({ ...s, start_time: e.target.value }))
            }
          />
          <label>Duração (min)</label>
          <input
            type="number"
            value={edit.duration}
            onChange={(e) =>
              setEdit((s) => ({ ...s, duration: Number(e.target.value) }))
            }
          />
          <label>Coach</label>
          <select
            value={edit.coach_id}
            onChange={(e) =>
              setEdit((s) => ({ ...s, coach_id: e.target.value }))
            }
          >
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => deleteTemplate(edit.templateId)}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Eliminar
          </button>
          <button
            onClick={saveEdit}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            Guardar
          </button>
        </div>
      </Modal>
    </div>
  );
}
