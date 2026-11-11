import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
export type LoginForm = z.infer<typeof loginSchema>;

const soloLetras = /^[a-zA-Z áéíóúÁÉÍÓÚñÑ\s]+$/;
const soloTel = /^[+\-\d]+$/;

export const registroSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  nombre: z.string().min(3, 'Mínimo 3 caracteres').regex(soloLetras, 'Solo letras'),
  appaterno: z.string().min(3, 'Mínimo 3 caracteres').regex(soloLetras, 'Solo letras'),
  apmaterno: z.string().min(3, 'Mínimo 3 caracteres').regex(soloLetras, 'Solo letras'),
  telefono: z.string().min(6, 'Mínimo 6 caracteres').regex(soloTel, 'Solo dígitos, + y -'),
});
export type RegistroForm = z.infer<typeof registroSchema>;