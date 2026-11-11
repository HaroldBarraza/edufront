import { estaVencida, textoFechaLimite } from "../libs/asignaciones";

export function BadgeFechaAsignacion({
  fecha_limite,
}: {
  fecha_limite: string;
}) {
  const vencida = estaVencida(fecha_limite);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        vencida
          ? "bg-red-50 text-red-700 ring-red-200"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
      }`}
      title={textoFechaLimite(fecha_limite)}
    >
      {vencida ? "⛔ Vencida" : "✅ Aceptando entregas"}
    </span>
  );
}
