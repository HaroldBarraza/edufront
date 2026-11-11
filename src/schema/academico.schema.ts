import { z } from "zod";

export const periodoSchema = z.object({
  year: z
    .number()
    .int()
    .min(new Date().getFullYear(), "No puede ser un año anterior"),
});
export type PeriodoForm = z.infer<typeof periodoSchema>;

export const materiaSchema = z.object({
  nombre: z.string().min(1, "Requerido").max(100),
  creditos: z.number().int().positive("Debe ser positivo"),
  costo_inscripcion: z.number().min(0, "No puede ser negativo"),
  costo_mensualidad: z.number().min(0, "No puede ser negativo"),
});
export type MateriaForm = z.infer<typeof materiaSchema>;

export const grupoSchema = z.object({
  materia_id: z.number().int().positive("Selecciona materia"),
  periodo_id: z.number().int().positive("Selecciona periodo"),
  docente_id: z.number().int().positive("Selecciona docente"),
  codigo: z.string().min(1, "Requerido").max(10),
  cupo_maximo: z.number().int().positive("Debe ser positivo"),
  estado: z.enum(["ABIERTO", "CANCELADO", "CERRADO"]).optional(),
});
export type GrupoForm = z.infer<typeof grupoSchema>;

export const horarioSchema = z
  .object({
    grupo_id: z.number().int().positive("Selecciona grupo"),
    dia_semana: z.enum(["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]),
    hora_inicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:mm"),
    hora_fin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:mm"),
  })
  .refine((d) => d.hora_fin > d.hora_inicio, {
    message: "Hora fin debe ser posterior a hora inicio",
    path: ["hora_fin"],
  });
export type HorarioForm = z.infer<typeof horarioSchema>;
