import { Icon } from './icon';

export function Logo() {
  return (
    <div className="brand">
      <span className="brand-seal">
        <Icon name="graduation" size={24} />
      </span>
      <span className="brand-copy">
        <strong>SGAF</strong>
        <small>Gestión Académica</small>
      </span>
    </div>
  );
}