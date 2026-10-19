import { z } from "zod";

export const RegistrarEventoSchema = z.object({
    tipoEvento: z   
        .string()
        .trim()
        .min(2, "El nombre del tipo de evento es obligatorio"),

    idPublicacion: z
        .number()
        .int()
        .positive()
        .optional(),
})

export type RegistrarEventoDto = z.infer<typeof RegistrarEventoSchema>;

export const FiltroFechasMetricasSchema = z.object({
    desde: z.string().optional(),
    hasta: z.string().optional()
})

export type FiltroFechasMetricasDto = z.infer <typeof FiltroFechasMetricasSchema>

export const TopVehiculosQuerySchema = z.object({
    limite: z.coerce.number().int().positive().default(5)
})
export type TopVehiculosQueryDto = z.infer <typeof TopVehiculosQuerySchema>
