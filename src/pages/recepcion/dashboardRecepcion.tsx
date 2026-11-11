import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthstore';
import { Icon } from '../../components/layout/icon';

export function DashboardRecepcion() {
  const usuario = useAuthStore((s) => s.usuario);
  return (
    <>
      <section className="welcome">
        <div className="welcome-copy">
          <span className="eyebrow">PANEL DE RECEPCIÓN</span>
          <h1>Hola, {usuario?.nombre ?? 'recepción'}</h1>
          <p>Atención al público. Verifica pagos y aprueba postulantes.</p>
        </div>
        <div className="welcome-image" role="img" aria-label="Recepción">
          <span>Recepción</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel schedule-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">POSTULANTES</span>
              <h2>Aprobación de cuentas</h2>
            </div>
            <Link to="/recepcion/postulantes" className="subtle-button">
              Ver pendientes <Icon name="arrow" size={16} />
            </Link>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '14px', lineHeight: 1.6 }}>
            Verifica el pago de matrícula de cada postulante antes de aprobar su cuenta.
          </p>
        </section>

        <section className="panel tasks-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">PAGOS</span>
              <h2>Validación manual</h2>
            </div>
            <Link to="/recepcion/pagos" className="subtle-button">
              Ver pagos <Icon name="arrow" size={16} />
            </Link>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '14px', lineHeight: 1.6 }}>
            Aprueba o rechaza los pagos registrados por estudiantes (efectivo, transferencia, pasarela).
          </p>
        </section>
      </div>
    </>
  );
}