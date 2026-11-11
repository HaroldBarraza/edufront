import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { incripcionService } from "../../service/inscripcion.service";
import { periodoService } from "../../service/periodo.service";
import { useAuthStore } from "../../stores/useAuthstore";
import { HorarioSemanal } from "../../components/HorarioSemanal";
import type { Inscripcion } from "../../types/incripciones.type";

export function MiHorarioPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [Inscripciones, setIncripciones] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [periodo, todas] = await Promise.all([
          periodoService.listar(),
          incripcionService.listarTodos(),
        ]);
        const activo = periodo.find((p) => p.estado === "ACTIVO");
        const mias = todas.filter(
          (i) =>
            i.estudiante_id === usuario?.id &&
            i.estado === "INSCRITO" &&
            (!activo || i.grupo.periodo_id === activo.id_periodo),
        );
        setIncripciones(mias);
      } finally {
        setCargando(false);
      }
    })();
  }, [usuario?.id]);
  const creditos = useMemo(
    () => Inscripciones.reduce((acc, i) => acc + i.grupo.materia.creditos, 0),
    [Inscripciones],
  );
  if (cargando) {
    return <p>Cargando Horarios</p>;
  }
  return (
    <main>
      <h1>Mi Horario</h1>
      <p>
        {Inscripciones.length} materia - {creditos} creditos inscritos
      </p>
      {Inscripciones.length === 0 ? (
        <p>
          Aun no tiene Materias Inscritas.{" "}
          <Link to="/estudiante/grupos">Ver Grupos Disponibles</Link>
        </p>
      ) : (
        <HorarioSemanal inscripciones={Inscripciones} />
      )}
    </main>
  );
}
