import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthstore';
import { Icon } from '../../components/layout/icon';

export function DashboardProfesor() {
  const usuario = useAuthStore((s) => s.usuario);
  return (
    <>
      <section className="welcome">
        <div className="welcome-copy">
          <span className="eyebrow">PANEL DOCENTE</span>
          <h1>Hola, {usuario?.nombre ?? 'profesor'}</h1>
          <p>Publica asignaciones y califica las entregas de tus estudiantes.</p>
          <Link to="/profesor/asignaciones" className="text-link">
            Ir a mis asignaciones <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="welcome-image" role="img" aria-label="Docencia">
          <span>Docencia</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel schedule-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">ASIGNACIONES</span>
              <h2>Mis tareas publicadas</h2>
            </div>
            <Link to="/profesor/asignaciones" className="subtle-button">
              Ver todas <Icon name="arrow" size={16} />
            </Link>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '14px', lineHeight: 1.6 }}>
            Revisa las entregas recibidas, califícalas y da seguimiento al avance de tus estudiantes.
          </p>
        </section>

        <section className="panel tasks-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">NUEVA</span>
              <h2>Publicar asignación</h2>
            </div>
            <Link to="/profesor/asignaciones/nueva" className="subtle-button">
              Crear <Icon name="arrow" size={16} />
            </Link>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '14px', lineHeight: 1.6 }}>
            Crea una tarea con instrucciones y fecha límite para uno de tus grupos.
          </p>
        </section>
      </div>
    </>
  );
}