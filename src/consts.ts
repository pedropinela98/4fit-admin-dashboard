export const COLOR_PRESETS = [
  { id: "amber", name: "Âmbar", classes: "bg-amber-50 border-amber-300" },
  { id: "blue", name: "Azul", classes: "bg-blue-50 border-blue-300" },
  { id: "purple", name: "Roxo", classes: "bg-purple-50 border-purple-300" },
  { id: "emerald", name: "Verde", classes: "bg-emerald-50 border-emerald-300" },
  { id: "slate", name: "Cinza", classes: "bg-white border-slate-300" },
];

export const SECTION_TEMPLATES = [
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
] as const;
