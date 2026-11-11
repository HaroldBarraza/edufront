import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthstore";
import { useHistorialFinanciero } from "../../hooks/useHistorialFinanciero";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { EstadoDeuda, RazonPago } from "../../types/financiero.types";

const ESTILOS_ESTADO: Record<
  EstadoDeuda,
  { label: string; clase: string; icono: typeof CheckCircle2 }
> = {
  PENDIENTE: {
    label: "Pendiente",
    clase: "bg-amber-50 text-amber-700 ring-amber-200",
    icono: Clock,
  },
  PAGADO: {
    label: "Pagado",
    clase: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icono: CheckCircle2,
  },
  VENCIDO: {
    label: "Vencido",
    clase: "bg-red-50 text-red-700 ring-red-200",
    icono: AlertTriangle,
  },
  CANCELADA: {
    label: "Cancelada",
    clase: "bg-slate-100 text-slate-600 ring-slate-200",
    icono: XCircle,
  },
};

const LABEL_RAZON: Record<RazonPago, string> = {
  MATRICULA: "Matrícula",
  MENSUALIDAD: "Mensualidad",
  OTRO: "Otro concepto",
};

function formatearFecha(f: string) {
  return new Date(f).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function MisPagosPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const { obligaciones, cargando, error, stats } = useHistorialFinanciero(
    usuario?.id,
  );

  if (cargando) {
    return <p className="p-6 text-slate-500">Cargando tu historial…</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorBanner mensaje={error} />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        kicker="Mis finanzas"
        titulo="Mis pagos"
        descripcion="Consulta tus obligaciones y el estado de tus pagos."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Deuda pendiente
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            S/. {stats.pendiente.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total pagado
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            S/. {stats.pagado.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Obligaciones vencidas
          </p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {stats.vencidas}
          </p>
        </div>
      </div>

      {/* Alerta proactiva si hay vencidas */}
      {stats.vencidas > 0 && (
        <ErrorBanner
          variante="advertencia"
          mensaje={`Tienes ${stats.vencidas} obligación${
            stats.vencidas > 1 ? "es" : ""
          } vencida${
            stats.vencidas > 1 ? "s" : ""
          }. Regulariza tu situación antes de que tu cuenta sea suspendida por mora.`}
        />
      )}

      {/* Lista */}
      {obligaciones.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          titulo="Sin obligaciones registradas"
          descripcion="Cuando la administración te asigne una obligación, aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          {obligaciones.map((o) => {
            const estilo = ESTILOS_ESTADO[o.estado];
            const Icono = estilo.icono;
            return (
              <article
                key={o.id_obligacion}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {LABEL_RAZON[o.razon]}
                    </h3>
                    {o.periodo && (
                      <p className="text-sm text-slate-500">
                        Periodo: {o.periodo.nombre}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estilo.clase}`}
                  >
                    <Icono className="h-3.5 w-3.5" />
                    {estilo.label}
                  </span>
                </header>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">Monto</p>
                    <p className="font-semibold text-slate-900">
                      S/. {Number(o.monto).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Emisión</p>
                    <p className="text-slate-700">
                      {formatearFecha(o.fecha_emision)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Vencimiento</p>
                    <p className="text-slate-700">
                      {formatearFecha(o.fecha_vencimiento)}
                    </p>
                  </div>
                </div>

                {/* Pagos asociados */}
                {o.pagos.length > 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Pagos registrados
                    </p>
                    <ul className="space-y-1.5">
                      {o.pagos.map((p) => (
                        <li
                          key={p.id_pago}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-slate-600">
                            {p.metodo} · {formatearFecha(p.fecha_pago)}
                          </span>
                          <span
                            className={
                              p.estado === "ACEPTADO"
                                ? "font-semibold text-emerald-600"
                                : p.estado === "RECHAZADO"
                                  ? "font-semibold text-red-600"
                                  : "font-semibold text-amber-600"
                            }
                          >
                            S/. {Number(p.monto).toFixed(2)} · {p.estado}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
