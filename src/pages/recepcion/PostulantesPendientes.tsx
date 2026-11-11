import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, Clock, UserCheck, Wallet } from "lucide-react";
import { estudianteService } from "../../service/estudiante.service";
import { usuarioService } from "../../service/usuario.service";
import { pagoService } from "../../service/pagos.service";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Button } from "../../components/ui/button";
import { TableCard, Th, Td } from "../../components/ui/TableCard";
import type {
  EstudianteListado,
  EstudianteDetalle,
} from "../../types/estudiante.type";
import type { ObligacionFinanciera } from "../../types/financiero.types";

interface Fila {
  estudiante: EstudianteListado;
  detalle: EstudianteDetalle;
  matricula: ObligacionFinanciera | null;
  pagoAceptado: boolean;
}

function mensajeDeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data?.message;
    if (typeof raw === "string") return raw;
    if (typeof raw?.message === "string") return raw.message;
  }
  return fallback;
}

export function PostulantesPendientes() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [accionando, setAccionando] = useState<number | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const estudiantes = await estudianteService.listar();
      const pendientes = estudiantes.filter(
        (e) => e.usuario.estado === "PENDIENTE_APROBACION",
      );
      const detalles = await Promise.all(
        pendientes.map((e) => estudianteService.detalle(e.id_estudiante)),
      );
      setFilas(
        pendientes.map((estudiante, i) => {
          const detalle = detalles[i];
          const matricula =
            detalle.obligaciones.find((o) => o.razon === "MATRICULA") ?? null;
          const pagoAceptado = Boolean(
            matricula?.pagos.some((p) => p.estado === "ACEPTADO"),
          );
          return { estudiante, detalle, matricula, pagoAceptado };
        }),
      );
    } catch (err) {
      setError(mensajeDeError(err, "No se pudieron cargar los postulantes."));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const registrarPagoCaja = async (fila: Fila) => {
    if (!fila.matricula) {
      setError("Este postulante no tiene una obligación de matrícula.");
      return;
    }
    setAccionando(fila.estudiante.id_estudiante);
    setError(null);
    setMensaje(null);
    try {
      await pagoService.crear({
        obligacion_id: fila.matricula.id_obligacion,
        monto: Number(fila.matricula.monto),
        metodo: "CAJA",
      });
      setMensaje(
        `Pago en caja registrado para ${fila.estudiante.usuario.nombre}. Ya puedes aprobar la cuenta.`,
      );
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo registrar el pago."));
    } finally {
      setAccionando(null);
    }
  };


  const aprobar = async (fila: Fila) => {
    if (!fila.pagoAceptado) {
      setError("Primero debes registrar el pago en caja antes de aprobar.");
      return;
    }
    setAccionando(fila.estudiante.id_estudiante);
    setError(null);
    setMensaje(null);
    try {
      await usuarioService.aprobarPostulante(fila.estudiante.id_estudiante);
      setMensaje(
        `${fila.estudiante.usuario.nombre} fue aprobado. Ya puede iniciar sesión.`,
      );
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo aprobar al postulante."));
    } finally {
      setAccionando(null);
    }
  };

  if (cargando) {
    return <p className="p-6 text-slate-500">Cargando postulantes…</p>;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        kicker="Recepción"
        titulo="Postulantes pendientes"
        descripcion="Registra el pago de matrícula y aprueba las cuentas de los nuevos postulantes."
      />

      {mensaje && (
        <ErrorBanner
          variante="exito"
          mensaje={mensaje}
          onCerrar={() => setMensaje(null)}
        />
      )}
      {error && <ErrorBanner mensaje={error} onCerrar={() => setError(null)} />}

      {filas.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          titulo="No hay postulantes pendientes"
          descripcion="Todas las cuentas han sido verificadas y aprobadas."
        />
      ) : (
        <TableCard>
          <thead>
            <tr>
              <Th>Postulante</Th>
              <Th>Código</Th>
              <Th>Matrícula</Th>
              <Th>Pago</Th>
              <Th className="text-center">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => {
              const procesando = accionando === fila.estudiante.id_estudiante;
              return (
                <tr key={fila.estudiante.id_estudiante}>
                  <Td>
                    <div className="font-semibold text-slate-900">
                      {fila.estudiante.usuario.nombre}{" "}
                      {fila.estudiante.usuario.appaterno}
                    </div>
                    <div className="text-xs text-slate-500">
                      {fila.estudiante.usuario.email}
                    </div>
                  </Td>
                  <Td>{fila.estudiante.codigo_matricula}</Td>
                  <Td>
                    {fila.matricula ? (
                      <>
                        <div className="font-semibold">
                          S/. {Number(fila.matricula.monto).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Vence:{" "}
                          {new Date(
                            fila.matricula.fecha_vencimiento,
                          ).toLocaleDateString("es-PE")}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Sin obligación
                      </span>
                    )}
                  </Td>
                  <Td className="text-center">
                    {fila.pagoAceptado ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                        <Clock className="h-3.5 w-3.5" />
                        Pendiente
                      </span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex justify-center gap-2">
                      {!fila.pagoAceptado && fila.matricula && (
                        <Button
                          variant="outline"
                          onClick={() => void registrarPagoCaja(fila)}
                          disabled={procesando}
                          title="Registrar pago en efectivo recibido en recepción"
                        >
                          <Wallet className="h-4 w-4" />
                          {procesando
                            ? "Registrando…"
                            : "Registrar pago en caja"}
                        </Button>
                      )}
                      {fila.pagoAceptado && (
                        <Button
                          onClick={() => void aprobar(fila)}
                          disabled={procesando}
                        >
                          <UserCheck className="h-4 w-4" />
                          {procesando ? "Aprobando…" : "Aprobar cuenta"}
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}
    </section>
  );
}
