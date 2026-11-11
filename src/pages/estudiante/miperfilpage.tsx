import { useAuthStore } from '../../stores/useAuthstore';

const ROL_NOMBRE: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  PROFESOR: 'Profesor',
  ESTUDIANTE: 'Estudiante',
};

export function MiPerfilPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const iniciales = (usuario?.nombre ?? usuario?.email ?? '??').slice(0, 2).toUpperCase();
  const rol = usuario?.rol ? ROL_NOMBRE[usuario.rol] ?? usuario.rol : '—';

  return (
    <div className="inner-page">
      <header className="page-intro">
        <span className="section-kicker">INFORMACIÓN PERSONAL</span>
        <h1>Mi perfil</h1>
        <p>Revisa los datos asociados a tu cuenta SGAF.</p>
      </header>

      <section className="profile-panel panel">
        <div className="profile-hero">
          <span className="large-avatar">{iniciales}</span>
          <div>
            <h2>{usuario?.nombre ?? 'Usuario'}</h2>
            <p>{rol}</p>
            <span>{usuario?.email} · Cuenta activa</span>
          </div>
        </div>
        <div className="profile-data">
          <div>
            <span>Correo institucional</span>
            <strong>{usuario?.email ?? '—'}</strong>
          </div>
          <div>
            <span>Rol en el sistema</span>
            <strong>{rol}</strong>
          </div>
          <div>
            <span>Identificador</span>
            <strong>#{usuario?.id ?? '—'}</strong>
          </div>
          <div>
            <span>Estado de la cuenta</span>
            <strong>Activa</strong>
          </div>
        </div>
      </section>
    </div>
  );
}