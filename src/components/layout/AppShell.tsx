import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthstore';
import { Icon, type IconName } from './icon';
import { Logo } from './Logo';
import type { Rol } from '../../types/auth.types';

interface NavEntry {
  id: string;
  label: string;
  icon: IconName;
  to: string;
  badge?: number;
}

const NAV_POR_ROL: Record<Rol, NavEntry[]> = {
  ADMINISTRADOR: [
    { id: 'inicio',     label: 'Inicio',     icon: 'home',     to: '/admin' },
    { id: 'periodos',   label: 'Periodos',   icon: 'calendar', to: '/admin/periodos' },
    { id: 'materias',   label: 'Materias',   icon: 'book',     to: '/admin/materias' },
    { id: 'grupos',     label: 'Grupos',     icon: 'task',     to: '/admin/grupos' },
    { id: 'horarios',   label: 'Horarios',   icon: 'clock',    to: '/admin/horarios' },
    { id: 'perfil',     label: 'Mi perfil',  icon: 'user',     to: '/admin/perfil' },
  ],
  RECEPCIONISTA: [
    { id: 'inicio',      label: 'Inicio',      icon: 'home',   to: '/recepcion' },
    { id: 'postulantes', label: 'Postulantes', icon: 'user',   to: '/recepcion/postulantes' },
    { id: 'pagos',       label: 'Pagos',       icon: 'wallet', to: '/recepcion/pagos' },
    { id: 'perfil',      label: 'Mi perfil',   icon: 'user',   to: '/recepcion/perfil' },
  ],
  PROFESOR: [
    { id: 'inicio',       label: 'Inicio',       icon: 'home', to: '/profesor' },
    { id: 'asignaciones', label: 'Asignaciones', icon: 'file', to: '/profesor/asignaciones' },
    { id: 'perfil',       label: 'Mi perfil',    icon: 'user', to: '/profesor/perfil' },
  ],
  ESTUDIANTE: [
    { id: 'inicio',   label: 'Inicio',       icon: 'home',   to: '/estudiante' },
    { id: 'cursos',   label: 'Mis cursos',   icon: 'book',   to: '/estudiante/grupos' },
    { id: 'tareas',   label: 'Tareas',       icon: 'task',   to: '/estudiante/asignaciones' },
    { id: 'finanzas', label: 'Finanzas',     icon: 'wallet', to: '/estudiante/pagos' },
    { id: 'perfil',   label: 'Mi perfil',    icon: 'user',   to: '/estudiante/perfil' },
  ],
};

const PORTAL_LABEL: Record<Rol, string> = {
  ADMINISTRADOR: 'PORTAL ADMINISTRATIVO',
  RECEPCIONISTA: 'PORTAL DE RECEPCIÓN',
  PROFESOR:      'PORTAL DOCENTE',
  ESTUDIANTE:    'PORTAL ESTUDIANTIL',
};

const ROL_NOMBRE: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  PROFESOR:      'Profesor',
  ESTUDIANTE:    'Estudiante',
};

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = usuario ? NAV_POR_ROL[usuario.rol] : [];
  const portalLabel = usuario ? PORTAL_LABEL[usuario.rol] : '';
  const rolNombre = usuario ? ROL_NOMBRE[usuario.rol] : '';
  const iniciales = (usuario?.nombre ?? usuario?.email ?? '??').slice(0, 2).toUpperCase();
  const perfilPath = usuario ? `/${usuario.rol === 'ADMINISTRADOR' ? 'admin' : usuario.rol === 'RECEPCIONISTA' ? 'recepcion' : usuario.rol === 'PROFESOR' ? 'profesor' : 'estudiante'}/perfil` : '/';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          <span className="nav-caption">{portalLabel}</span>
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === '/admin' || item.to === '/recepcion' || item.to === '/profesor' || item.to === '/estudiante'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.badge && <b>{item.badge}</b>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-image" />
          <div>
            <span>Ciclo académico</span>
            <strong>2026 — I</strong>
            <small>Semestre en curso</small>
          </div>
          <div className="cycle-progress">
            <span />
          </div>
        </div>

        <button type="button" className="logout" onClick={handleLogout}>
          <Icon name="logout" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-title">
            <button
              type="button"
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Icon name="menu" />
            </button>
            <div>
              <span>{portalLabel}</span>
              <strong>{usuario?.nombre ?? 'Usuario'}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search">
              <Icon name="search" size={18} />
              <input placeholder="Buscar en el portal" aria-label="Buscar" />
            </label>
            <button type="button" className="icon-button notification" aria-label="Notificaciones">
              <Icon name="bell" />
              <i />
            </button>
            <NavLink to={perfilPath} className="profile-button" aria-label="Abrir perfil">
              <span className="avatar">{iniciales}</span>
              <span className="profile-name">
                <strong>{usuario?.nombre ?? 'Usuario'}</strong>
                <small>{rolNombre}</small>
              </span>
              <span className="chevron">⌄</span>
            </NavLink>
          </div>
        </header>

        <main className="content">{children}</main>

        <footer className="footer">
          <span>© 2026 SGAF · Sistema de Gestión Académica y Financiera</span>
          <span>Soporte · Reglamento · Privacidad</span>
        </footer>
      </div>
    </div>
  );
}