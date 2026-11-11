
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthstore';
import { Icon } from '../components/layout/icon';

const HOME_POR_ROL: Record<string, string> = {
  ADMINISTRADOR: '/admin',
  RECEPCIONISTA: '/recepcion',
  PROFESOR: '/profesor',
  ESTUDIANTE: '/estudiante',
};

export function NoEcontrado() {
  const usuario = useAuthStore((s) => s.usuario);
  const destino = usuario ? HOME_POR_ROL[usuario.rol] ?? '/' : '/';

  return (
    <div className="inner-page" style={{ padding: '60px 24px', textAlign: 'center' }}>
      <span className="section-kicker">ERROR 404</span>
      <h1
        style={{
          fontFamily: 'Libre Caslon Display, Georgia, serif',
          fontSize: '38px',
          margin: '12px 0 8px',
        }}
      >
        La página no se encontró
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
        La dirección que buscas no existe o fue movida.
      </p>
      <Link to={destino} className="primary-button">
        {usuario ? 'Volver a mi panel' : 'Ir al inicio'}
      </Link>
    </div>
  );
}