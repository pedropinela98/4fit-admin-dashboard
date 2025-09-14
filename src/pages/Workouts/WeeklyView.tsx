import React, { useState, useMemo, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";

type Section = {
  label: string;
  text: string;
  coachNotes?: string;
  hasResults?: boolean;
};

type Workout = {
  id: string;
  date: string;
  title: string;
  type: string;
  sections: Section[];
};

export default function WeeklyView() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);

  // 🔑 Referência para o calendário
  const calendarRef = useRef<FullCalendar>(null);

  // Detecta se está em mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 🔑 Usa ResizeObserver para recalcular o layout quando o container mudar de tamanho
  useEffect(() => {
    const container = document.querySelector("#calendar-container");
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const api = calendarRef.current?.getApi();
      if (api) {
        api.updateSize(); // força o calendário a ajustar-se à nova largura
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: "1",
      date: `${yyyy}-${mm}-${dd}`,
      title: "Treino A",
      type: "CrossFit",
      sections: [
        { label: "Aquecimento", text: "3 rondas: 10 air squats, 10 push-ups" },
        {
          label: "Strength",
          text: "Back Squat 5x5 @ 75%",
          coachNotes: "Manter técnica, não passar de 80%",
          hasResults: true,
        },
        {
          label: "Metcon",
          text: "12 min AMRAP: 10 pull-ups, 15 push-ups, 20 air squats",
        },
      ],
    },
    {
      id: "2",
      date: `${yyyy}-${mm}-${dd}`,
      title: "Treino B",
      type: "Halterofilismo",
      sections: [
        { label: "Skill", text: "Snatch technique drills" },
        { label: "Strength", text: "Snatch Pull 5x3 @ 100%" },
      ],
    },
    {
      id: "3",
      date: `${yyyy}-${mm}-${String(Number(dd) + 2).padStart(2, "0")}`,
      title: "Treino C",
      type: "CrossFit",
      sections: [
        { label: "Skill", text: "Handstand Walk practice" },
        {
          label: "EMOM",
          text: "10 min: 1 clean & jerk + 10 DU",
          hasResults: true,
        },
      ],
    },
  ]);

  const workoutTypes = useMemo(() => {
    const types = Array.from(new Set(workouts.map((w) => w.type)));
    return ["Todos", ...types];
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    if (selectedType === "Todos") return workouts;
    return workouts.filter((w) => w.type === selectedType);
  }, [workouts, selectedType]);

  const events = filteredWorkouts.map((w) => ({
    id: w.id,
    title: w.title,
    start: w.date,
    extendedProps: { sections: w.sections, type: w.type },
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Vista Semanal de Workouts
      </h1>

      {/* Dropdown responsiva */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tipo de Aula
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        >
          {workoutTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Calendário com container observado */}
      <div id="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          locale={ptLocale}
          initialView={isMobile ? "dayGridDay" : "dayGridWeek"}
          initialDate={today.toISOString().slice(0, 10)}
          firstDay={1}
          events={events}
          eventContent={(arg) => {
            const { sections, type } = arg.event.extendedProps as {
              sections: Section[];
              type: string;
            };
            return (
              <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow border border-gray-200 dark:border-gray-700 max-h-[600px] sm:max-h-[1000px] overflow-y-auto">
                <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase mb-1">
                  {type}
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">
                  {arg.event.title}
                </div>
                <div className="space-y-1">
                  {sections.length > 0 ? (
                    sections.map((s, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-medium text-gray-700 dark:text-gray-200">
                            {s.label}
                          </span>
                          {s.hasResults && (
                            <span className="text-[10px] bg-blue-200 text-blue-800 px-1 rounded">
                              Resultados
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 break-words">
                          {s.text}
                        </p>
                        {s.coachNotes && (
                          <p className="italic text-[11px] text-yellow-700 dark:text-yellow-400">
                            Nota: {s.coachNotes}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sem secções
                    </p>
                  )}
                </div>
              </div>
            );
          }}
          eventDisplay="block"
          editable
          eventDrop={(info) => {
            setWorkouts((prev) =>
              prev.map((w) =>
                w.id === info.event.id ? { ...w, date: info.event.startStr } : w
              )
            );
          }}
          height="auto"
        />
      </div>

      <style>
        {`
          .fc-event {
            overflow: hidden !important;
          }
          .fc-daygrid-event {
            white-space: normal !important;
          }
          @media (max-width: 640px) {
            .fc-toolbar-title {
              font-size: 1rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}
