import { api } from "../libs/axios";
import type {
  JwtPayload,
  LoginDTO,
  RegistroPostulanteDTO,
} from "../types/auth.types";

export const authService = {
  login: async (dto: LoginDTO) => {
    const { data } = await api.post<{ access_token: string }>(
      "/auth/login",
      dto,
    );
    return data.access_token;
  },
  perfil: async () => {
    const { data } = await api.get<JwtPayload>("/auth/perfil");
    return data;
  },
  registrarPostulante: async (dto: RegistroPostulanteDTO) => {
    const { data } = await api.post("/registro-estudiante/postulante", dto);;
    return data;
  },
  logout: async () => {
    localStorage.removeItem("token");
  },
};
