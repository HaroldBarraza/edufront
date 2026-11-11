import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthstore';
import { Icon, type IconName } from '../../components/layout/icon';

const accesos: { title: string; desc: string; to: string; icon: IconName; tone: string }[] = [
  { title: 'Periodos', desc: 'Semestres académicos', to: '/admin/periodos', icon: 'calendar', tone: 'blue' },
  { title: 'Materias', desc: 'Catálogo y costos', to: '/admin/materias', icon: 'book', tone: 'green' },
  { title: 'Grupos', desc: 'Grupos por periodo', to: '/admin/grupos', icon: 'task', tone: 'amber' },
  { title: 'Horarios', desc: 'Horarios por grupo', to: '/admin/horarios', icon: 'clock', tone: 'plum' },
];

export function DashboardAdmin() {
  const usuario = useAuthStore((s) => s.usuario);
  return (
    <>
      <section className="welcome">
        <div className="welcome-copy">
          <span className="eyebrow">PANEL DE ADMINISTRACIÓN</span>
          <h1>Hola, {usuario?.nombre ?? 'admin'}</h1>
          <p>Gestiona la estructura académica del SGAF: periodos, materias, grupos y horarios.</p>
          <Link to="/admin/periodos" className="text-link">
            Ir a estructura académica <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="welcome-image" role="img" aria-label="Campus SGAF">
          <span>Administración</span>
        </div>
      </section>

      <section className="courses-section">
        <div className="panel-header">
          <div>
            <span className="section-kicker">ACCESOS RÁPIDOS</span>
            <h2>Gestión académica</h2>
          </div>
        </div>
        <div className="course-grid">
          {accesos.map((a) => (
            <Link key={a.to} to={a.to} className="course-card navy" style={{ textDecoration: 'none' }}>
              <div className="course-code">
                <span style={{ background: 'var(--course-soft)', color: 'var(--course-color)' }}>
                  <Icon name={a.icon} size={18} />
                </span>
                <small>{a.title.toUpperCase()}</small>
              </div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--course-color)', fontSize: '10px', fontWeight: 700 }}>
                Ir <Icon name="arrow" size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}