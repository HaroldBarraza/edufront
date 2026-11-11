import type { Entrega } from "../types/entrega.types";

export function estaVencida(fechaLimiteIso: string): boolean {
  return new Date(fechaLimiteIso).getTime() < Date.now();
}

export function textoFechaLimite(fechaLimiteIso: string): string {
  const fecha = new Date(fechaLimiteIso);
  const diffMs = fecha.getTime() - Date.now();
  const diffDias = Math.round(Math.abs(diffMs) / (1000 * 60 * 60 * 24));

  const fechaStr = fecha.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMs < 0) {
    return diffDias === 0
      ? `Venció hoy (${fechaStr})`
      : `Venció hace ${diffDias} día${diffDias === 1 ? "" : "s"} (${fechaStr})`;
  }
  if (diffDias === 0) return `Vence hoy (${fechaStr})`;
  if (diffDias === 1) return `Vence mañana (${fechaStr})`;
  return `Vence el ${fechaStr}`;
}

export type EstadoEntregaEstudiante =
  | "SIN_ENTREGAR"
  | "ENTREGADO_SIN_CALIFICAR"
  | "CALIFICADO";

export function estadoEntrega(
  entrega: Entrega | null | undefined,
): EstadoEntregaEstudiante {
  if (!entrega) return "SIN_ENTREGAR";
  if (entrega.calificacion !== null) return "CALIFICADO";
  return "ENTREGADO_SIN_CALIFICAR";
}
