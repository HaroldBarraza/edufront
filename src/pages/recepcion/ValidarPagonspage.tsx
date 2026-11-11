import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { financieroService } from "../../service/financiero.service";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Button } from "../../components/ui/button";
import type { ObligacionFinanciera } from "../../types/financiero.types";

function formatearFecha(f: string) {
  return new Date(f).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ValidarPagosPage() {
  const [obligaciones, setObligaciones] = useState<ObligacionFinanciera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [accionando, setAccionando] = useState<number | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await financieroService.obligacionesConPagoPendiente();
      setObligaciones(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(
          typeof msg === "string" ? msg : "No se pudieron cargar los pagos.",
        );
      } else {
        setError("Error inesperado.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const aprobar = async (idPago: number) => {
    setAccionando(idPago);
    setError(null);
    setExito(null);
    try {
      await financieroService.aprobarPago(idPago);
      setExito(`Pago #${idPago} aprobado correctamente.`);
      await cargar();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === "string" ? msg : "No se pudo aprobar.");
      }
    } finally {
      setAccionando(null);
    }
  };

  const rechazar = async (idPago: number) => {
    setAccionando(idPago);
    setError(null);
    setExito(null);
    try {
      await financieroService.rechazarPago(idPago);
      setExito(`Pago #${idPago} rechazado.`);
      await cargar();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === "string" ? msg : "No se pudo rechazar.");
      }
    } finally {
      setAccionando(null);
    }
  };

  if (cargando) return <p className="p-6 text-slate-500">Cargando pagos…</p>;

  return (
    <section className="space-y-6">
      <PageHeader
        kicker="Recepción"
        titulo="Validar pagos"
        descripcion="Aprueba o rechaza los pagos registrados por estudiantes."
      />

      {exito && (
        <ErrorBanner
          variante="exito"
          mensaje={exito}
          onCerrar={() => setExito(null)}
        />
      )}
      {error && <ErrorBanner mensaje={error} onCerrar={() => setError(null)} />}

      {obligaciones.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          titulo="No hay pagos pendientes"
          descripcion="Cuando un estudiante registre un pago, aparecerá aquí para tu validación."
        />
      ) : (
        <div className="space-y-3">
          {obligaciones.map((o) => {
            const pagosPendientes = o.pagos.filter(
              (p) => p.estado === "PENDIENTE",
            );
            return (
              <article
                key={o.id_obligacion}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <header className="mb-3">
                  <h3 className="text-lg font-bold text-slate-950">
                    {o.razon} · S/. {Number(o.monto).toFixed(2)}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {o.estudiante?.usuario.nombre}{" "}
                    {o.estudiante?.usuario.appaterno} —{" "}
                    {o.estudiante?.usuario.email}
                  </p>
                  <p className="text-xs text-slate-400">
                    Vence: {formatearFecha(o.fecha_vencimiento)}
                  </p>
                </header>

                <div className="space-y-2">
                  {pagosPendientes.map((p) => (
                    <div
                      key={p.id_pago}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Pago #{p.id_pago} · {p.metodo}
                        </p>
                        <p className="text-xs text-slate-600">
                          S/. {Number(p.monto).toFixed(2)} ·{" "}
                          {formatearFecha(p.fecha_pago)}
                          {p.referencia_pasarela &&
                            ` · Ref: ${p.referencia_pasarela}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => void rechazar(p.id_pago)}
                          disabled={accionando === p.id_pago}
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </Button>
                        <Button
                          onClick={() => void aprobar(p.id_pago)}
                          disabled={accionando === p.id_pago}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Aprobar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
