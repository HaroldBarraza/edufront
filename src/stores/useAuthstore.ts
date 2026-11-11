import { create } from "zustand";
import axios from "axios";
import { authService } from "../service/auth.service";
import { decodeJwt } from "../libs/jwt";
import type { LoginDTO, Rol, UsuarioSesion } from "../types/auth.types";

const HOME_POR_ROLE: Record<Rol, string> = {
  ADMINISTRADOR: "/admin",
  RECEPCIONISTA: "/recepcion",
  PROFESOR: "/profesor",
  ESTUDIANTE: "/estudiante",
};

export class CuentaNoHabilidtadaError extends Error {
  constructor(public estado: string) {
    super(`Cuenta en estado ${estado}`);
    this.name = "CuantaNoHabilidataError";
  }
}
interface AuthState {
  usuario: UsuarioSesion | null;
  token: string | null;
  verificandoSesion: boolean;
  cargandoLogin: boolean;

  login: (dto: LoginDTO) => Promise<void>;
  logout: () => void;
  verificarSesion: () => Promise<void>;

  estaAutenticado: () => boolean;
  rolHome: () => string | null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  usuario: null,
  token: null,
  verificandoSesion: true,
  cargandoLogin: false,

  login: async (dto) => {
    set({ cargandoLogin: true });
    try {
      const token = await authService.login(dto);
      const payload = decodeJwt(token);

      if (!payload) {
        throw new Error("token invalido");
      }
      if (payload.estado !== "ACTIVO") {
        throw new CuentaNoHabilidtadaError(payload.estado);
      }
      localStorage.setItem("token", token);
      try {
        await authService.perfil();
      } catch {
        localStorage.removeItem("token");
        throw new CuentaNoHabilidtadaError("SUSPENDIDO_MORA");
      }
      set({
        token,
        usuario: {
          id: payload.sub,
          email: payload.email,
          rol: payload.rol,
          nombre: payload.nombre,
        },
      });
    } finally {
      set({ cargandoLogin: false });
    }
  },
  logout: () => {
    authService.logout();
    set({
      usuario: null,
      token: null,
    });
  },
  verificarSesion: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ verificandoSesion: false });
      return;
    }
    try {
      const payload = await authService.perfil();
      set({
        token,
        usuario: {
          id: payload.sub,
          email: payload.email,
          rol: payload.rol,
          nombre: payload.nombre,
        },
        verificandoSesion: false,
      });
    } catch {
      localStorage.removeItem("token");
      set({
        usuario: null,
        token: null,
        verificandoSesion: false,
      });
    }
  },
  estaAutenticado: () => get().usuario !== null,
  rolHome: () => {
    const u = get().usuario;
    return u ? HOME_POR_ROLE[u.rol] : null;
  },
}));
