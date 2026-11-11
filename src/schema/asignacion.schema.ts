import { z } from 'zod';

export const nuevaAsignacionSchema = z.object({
  grupo_id: z.number().int().positive('Selecciona un grupo'),
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(150),
  instrucciones: z.string().min(1, 'Requerido'),
  fecha_limite: z
    .string()
    .min(1, 'Fecha requerida')
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: 'La fecha límite debe ser futura',
    }),
});
export type NuevaAsignacionForm = z.infer<typeof nuevaAsignacionSchema>;