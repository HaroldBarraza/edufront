import { api } from '../libs/axios';

export const usuarioService = {
  aprobarPostulante: async (id: number) => {
    const { data } = await api.patch(`/usuario/${id}/aprobar`);
    return data;
  },
};