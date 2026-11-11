export type Rol = 'ADMINISTRADOR' | 'RECEPCIONISTA' | 'PROFESOR' | 'ESTUDIANTE';
export type EstadoUsuario =
  | 'PENDIENTE_APROBACION'
  | 'ACTIVO'
  | 'SUSPENDIDO_MORA'
  | 'INACTIVO';

export interface UsuarioSesion {
  id: number;
  email: string;
  rol: Rol;
  nombre: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegistroPostulanteDTO {
  email: string;
  password: string;
  nombre: string;
  appaterno: string;
  apmaterno: string;
  telefono: string;
  tutor?: number;
}

export interface JwtPayload {
  sub: number;
  email: string;
  rol: Rol;
  estado: EstadoUsuario;
  nombre: string;
  id: number;
  iat: number;
  exp: number;
}