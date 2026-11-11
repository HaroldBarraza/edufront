import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthstore";
import { Icon } from "../../components/layout/icon";
import { AsginacionesService } from "../../service/asignaciones.service";
import { entregaService } from "../../service/entrega.service";
import { incripcionService } from "../../service/inscripcion.service";
import { financieroService } from "../../service/financiero.service";
import type { Asginacion } from "../../types/asignaciones.types";
import type { Entrega } from "../../types/entrega.types";
import type { Inscripcion } from "../../types/incripciones.type";
import type { ObligacionFinanciera } from "../../types/financiero.types";
import {
  estadoEntrega,
  estaVencida,
  textoFechaLimite,
} from "../../libs/asignaciones";

function fechaHoy(): string {
  return new Date()
    .toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();
}

function horaDe(f: string | undefined): string {
  if (!f) return "—";
  if (/^\d{2}:\d{2}/.test(f)) return f.slice(0, 5);
  try {
    return new Date(f).toISOString().slice(11, 16);
  } catch {
    return "—";
  }
}

export function DashboardEstudiante() {
  const usuario = useAuthStore((s) => s.usuario);

  const [asignaciones, setAsignaciones] = useState<Asginacion[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [obligaciones, setObligaciones] = useState<ObligacionFinanciera[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    let cancelado = false;

    (async () => {
      setCargando(true);
      try {
        const [asigsR, entsR, inscrR, finR] = await Promise.allSettled([
          AsginacionesService.listar(),
          entregaService.listar(),
          incripcionService.listarTodos(),
          financieroService.historialEstudiante(usuario.id),
        ]);

        if (cancelado) return;

        const asigs = asigsR.status === "fulfilled" ? asigsR.value : [];
        const ents = entsR.status === "fulfilled" ? entsR.value : [];
        const inscr = inscrR.status === "fulfilled" ? inscrR.value : [];
        const fin =
          finR.status === "fulfilled" ? finR.value : { obligaciones: [] };

        const misInscr = inscr.filter(
          (i) => i.estudiante_id === usuario.id && i.estado === "INSCRITO",
        );
        const misGrupos = new Set(misInscr.map((i) => i.grupo_id));

        setInscripciones(misInscr);
        setAsignaciones(asigs.filter((a) => misGrupos.has(a.grupo_id)));
        setEntregas(ents.filter((e) => e.estudiante_id === usuario.id));
        setObligaciones(fin.obligaciones ?? []);
      } catch (err) {
        console.error("[DashboardEstudiante] error:", err);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [usuario]);

  const entregaPorAsignacion = useMemo(() => {
    const map: Record<number, Entrega> = {};
    for (const e of entregas) map[e.asignacion_id] = e;
    return map;
  }, [entregas]);

  const tareasPendientes = useMemo(
    () =>
      asignaciones.filter(
        (a) =>
          estadoEntrega(entregaPorAsignacion[a.id_asignacion]) ===
            "SIN_ENTREGAR" && !estaVencida(a.fecha_limite),
      ),
    [asignaciones, entregaPorAsignacion],
  );

  const vencidas = useMemo(
    () => obligaciones.filter((o) => o.estado === "VENCIDO").length,
    [obligaciones],
  );

  const deudaTotal = useMemo(
    () =>
      obligaciones
        .filter((o) => o.estado === "PENDIENTE" || o.estado === "VENCIDO")
        .reduce((acc, o) => acc + Number(o.monto), 0),
    [obligaciones],
  );

  const creditosTotales = useMemo(
    () =>
      inscripciones.reduce(
        (acc, i) => acc + (i.grupo?.materia?.creditos ?? 0),
        0,
      ),
    [inscripciones],
  );

  if (!usuario) {
    return (
      <p style={{ padding: "24px", color: "var(--muted)" }}>Cargando sesión…</p>
    );
  }

  return (
    <>
      <section className="welcome">
        <div className="welcome-copy">
          <span className="eyebrow">{fechaHoy()}</span>
          <h1>Hola, {usuario.nombre ?? "estudiante"}</h1>
          <p>
            {cargando
              ? "Cargando tu resumen…"
              : tareasPendientes.length > 0
                ? `Tienes ${tareasPendientes.length} tarea${
                    tareasPendientes.length > 1 ? "s" : ""
                  } pendiente${tareasPendientes.length > 1 ? "s" : ""} esta semana.`
                : "Estás al día con tus tareas. ¡Buen trabajo!"}
            {!cargando && vencidas > 0 && (
              <>
                {" "}
                También tienes {vencidas} obligación
                {vencidas > 1 ? "es" : ""} vencida{vencidas > 1 ? "s" : ""}.
              </>
            )}
          </p>
          <Link to="/estudiante/asignaciones" className="text-link">
            Revisar mis pendientes <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="welcome-image" role="img" aria-label="Campus SGAF">
          <span>Campus principal</span>
        </div>
      </section>

      {!cargando && vencidas > 0 && (
        <aside className="notice">
          <span className="notice-icon">
            <Icon name="wallet" />
          </span>
          <div>
            <strong>
              Atención: {vencidas} obligación{vencidas > 1 ? "es" : ""} vencida
              {vencidas > 1 ? "s" : ""}
            </strong>
            <p>
              Regulariza tu situación antes de que tu cuenta sea suspendida por
              mora.
            </p>
          </div>
          <Link to="/estudiante/pagos" className="notice-action">
            Ver detalles
          </Link>
        </aside>
      )}

      <section className="stats-grid" aria-label="Resumen">
        <article className="stat-card">
          <span className="stat-icon blue">
            <Icon name="book" />
          </span>
          <div>
            <span>Cursos activos</span>
            <strong>{inscripciones.length}</strong>
            <small>{creditosTotales} créditos inscritos</small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon amber">
            <Icon name="task" />
          </span>
          <div>
            <span>Tareas pendientes</span>
            <strong>{tareasPendientes.length}</strong>
            <small>
              {tareasPendientes.length === 0
                ? "Sin pendientes"
                : "Revisa tu lista"}
            </small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">
            <Icon name="check" />
          </span>
          <div>
            <span>Entregas enviadas</span>
            <strong>{entregas.length}</strong>
            <small>
              {entregas.filter((e) => e.calificacion !== null).length}{" "}
              calificadas
            </small>
          </div>
        </article>

        <article className="stat-card">
          <span className={`stat-icon ${vencidas > 0 ? "amber" : "plum"}`}>
            <Icon name="wallet" />
          </span>
          <div>
            <span>Estado financiero</span>
            <strong>{vencidas > 0 ? "Con deuda" : "Al día"}</strong>
            <small>S/. {deudaTotal.toFixed(2)} pendientes</small>
          </div>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="panel schedule-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">HOY</span>
              <h2>Mis clases</h2>
            </div>
            <Link to="/estudiante/horario" className="subtle-button">
              <Icon name="calendar" size={17} /> Ver horario
            </Link>
          </div>

          <div className="timeline">
            {inscripciones.length === 0 ? (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "13px",
                  marginTop: "12px",
                }}
              >
                Aún no tienes materias inscritas.{" "}
                <Link
                  to="/estudiante/grupos"
                  style={{ color: "var(--blue-700)" }}
                >
                  Ver grupos →
                </Link>
              </p>
            ) : (
              inscripciones.slice(0, 3).map((ins, idx) => {
                const horario = ins.grupo?.horarios?.[0];
                const materiaNombre = ins.grupo?.materia?.nombre ?? "Materia";
                const grupoCodigo = ins.grupo?.codigo ?? "—";
                const docenteNombre =
                  ins.grupo?.docente?.usuario?.nombre ?? "Docente";

                return (
                  <div className="timeline-row" key={ins.id_inscripcion}>
                    <div className="time">
                      <strong>{horaDe(horario?.hora_inicio)}</strong>
                      <span>{horaDe(horario?.hora_fin)}</span>
                    </div>
                    <div
                      className={`timeline-line ${
                        idx % 3 === 0 ? "navy" : idx % 3 === 1 ? "teal" : "gold"
                      }`}
                    >
                      <i />
                      {idx < 2 && idx < inscripciones.length - 1 && <span />}
                    </div>
                    <div className="class-info">
                      <strong>{materiaNombre}</strong>
                      <span>
                        Grupo {grupoCodigo} · {docenteNombre}
                      </span>
                    </div>
                    {idx === 0 && <span className="live-pill">Próxima</span>}
                    <Link
                      to="/estudiante/horario"
                      className="row-arrow"
                      aria-label="Ver horario"
                    >
                      <Icon name="arrow" size={18} />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="panel tasks-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">PRÓXIMAMENTE</span>
              <h2>Entregas pendientes</h2>
            </div>
            <Link to="/estudiante/asignaciones" className="text-link compact">
              Ver todas <Icon name="arrow" size={16} />
            </Link>
          </div>

          <div className="task-list">
            {tareasPendientes.length === 0 ? (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "13px",
                  marginTop: "12px",
                }}
              >
                No hay tareas pendientes. Buen trabajo.
              </p>
            ) : (
              tareasPendientes.slice(0, 4).map((t) => (
                <Link
                  to={`/estudiante/asignaciones/${t.id_asignacion}`}
                  className="task-row"
                  key={t.id_asignacion}
                >
                  <span className="due-marker">
                    <Icon name="file" size={18} />
                  </span>
                  <span className="task-copy">
                    <small>{t.grupo?.materia?.nombre ?? "Tarea"}</small>
                    <strong>{t.titulo}</strong>
                    <span>
                      <Icon name="clock" size={14} />{" "}
                      {textoFechaLimite(t.fecha_limite)}
                    </span>
                  </span>
                  <Icon name="arrow" size={18} />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {inscripciones.length > 0 && (
        <section className="courses-section">
          <div className="panel-header">
            <div>
              <span className="section-kicker">CICLO ACTUAL</span>
              <h2>Mis cursos</h2>
            </div>
            <Link to="/estudiante/horario" className="text-link compact">
              Ver horario <Icon name="arrow" size={16} />
            </Link>
          </div>

          <div className="course-grid">
            {inscripciones.slice(0, 4).map((ins, idx) => {
              const colors = ["navy", "gold", "teal", "plum"] as const;
              const materiaNombre = ins.grupo?.materia?.nombre ?? "Materia";
              const grupoCodigo = ins.grupo?.codigo ?? "—";
              const creditos = ins.grupo?.materia?.creditos ?? 0;
              const docenteNombre =
                ins.grupo?.docente?.usuario?.nombre ?? "Docente";
              const docenteApellido =
                ins.grupo?.docente?.usuario?.appaterno ?? "";

              return (
                <article
                  className={`course-card ${colors[idx % 4]}`}
                  key={ins.id_inscripcion}
                >
                  <div className="course-code">
                    <span>{materiaNombre.slice(0, 3).toUpperCase()}</span>
                    <small>{grupoCodigo}</small>
                  </div>
                  <h3>{materiaNombre}</h3>
                  <p>
                    {docenteNombre} {docenteApellido}
                  </p>
                  <div className="course-progress-label">
                    <span>{creditos} créditos</span>
                    <strong>Activo</strong>
                  </div>
                  <div className="course-progress">
                    <span style={{ width: "100%" }} />
                  </div>
                  <Link to="/estudiante/horario">
                    Ir al curso <Icon name="arrow" size={17} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
