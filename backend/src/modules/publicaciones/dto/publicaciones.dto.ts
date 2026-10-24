import { z } from "zod";

export const CreatePublicacionSchema = z.object({
    titulo: z
        .string()
        .trim()
        .min(1, "El titulo de la publicacion no debe estar vacio")
        .max(120, "El titulo no debe superar los 120 carcteres"),

    descripcion: z
        .string()
        .trim()
        .min(1, "La descripcion no debe estar vacia"),

    precio: z
        .number()
        .positive("El precio debe ser mayor que 0"),
    idUsuario: z
        .number()
        .int("El id debe ser un entero")
        .positive("El id debe existir"),

    videoUrl: z.string().trim().optional().or(z.literal("")),
    multimedia: z
        .array(z.string().trim().min(1, "URL de imagen no válida"))
        .min(1, "Debe cargar al menos una fotografía de portada para el vehículo")
        .max(15, "No se pueden cargar más de 15 fotografías por vehículo")
        .optional(),

    vehiculo: z.object({
        codigoVehiculo: z
            .string()
            .trim()
            .min(1,"El codigo es obligatorio"),
        patente: z
            .string()
            .trim()
            .min(1,"La panetnte es obligatoria")
            .max(8, "La cantidad de carcteres de, la patente no puede ser superior a 8"),
        anio: z
            .number()
            .int("El año debe ser un numero entero")
            .positive("El año debe ser mayor que 0"),
        kilometros: z
            .number()
            .int("La cantidad de kilometros debe ser un numero entero")
            .min(0, "La cantidad de kilometros no puede ser negativa"),
        cantidadPuertas:z
            .number()
            .int("La cantidad de puertas debe ser un numero entero")
            .positive("La cantidad de puertas debe ser mayor que 0"),
        color: z
            .string()
            .trim()
            .min(1,"El color es obligatorio"),
        cantidadAsientos: z
            .number()
            .int("La cantidad de asientos debe ser un numero entero")
            .positive("La cantidad de asientos debe ser mayor que 0"),
        capacidadRemolque: z
            .number()
            .int("La capacidad de remolque debe ser un numero entero")
            .positive("La capacidad de remolque debe ser mayor que 0")
            .optional(),
        capacidadBaul: z
            .number()
            .int("La capacidad del baul debe ser un numero entero")
            .positive("La capacidad del baul debe ser mayor que 0")
            .optional(),
        capacidadTanque: z
            .number()
            .int("La capacidad del tanque debe ser un numero entero")
            .positive("La capacidad del tanque debe ser mayor que 0")
            .optional(),
        cantidadAirbags: z
            .number()
            .int("La cantidad de airbags debe ser un numero entero")
            .positive("La cantidad de airbags debe ser mayor que 0"),

        idMarca: z.number().int().positive(),
        idModelo: z.number().int().positive(),
        version: z.string().trim().optional(),
        idSegmento: z.number().int().positive(),
        idTipoCarroceria: z.number().int().positive(),
        idCondicion: z.number().int().positive(),
        idCaja: z.number().int().positive(),
        idTraccion: z.number().int().positive(),
        idCombustible: z.number().int().positive(),
        idTipoDireccion: z.number().int().positive(),
        idTipoTapizado: z.number().int().positive(),
        idMotor: z.number().int().positive().optional(),
        motor: z
            .object({
                idTipoMotor: z.number().int().positive("Debe indicar un tipo de motor válido"),
                descripcion: z.string().trim().optional(),
                potencia: z.number().positive("La potencia debe ser mayor a 0").optional(),
                torque: z.number().positive("El torque debe ser mayor a 0").optional(),
            })
            .optional(),

        dimensiones: z.object({
            largo: z.number().positive("El largo debe ser mayor que 0"),
            alto: z.number().positive("El alto debe ser mayor que 0"),
            ancho: z.number().positive("El ancho debe ser mayor que 0")
        }), 
    }),
});

export type CreatePublicacionDto = z.infer<typeof CreatePublicacionSchema>

export const UpdatePublicacionSchema = z.object({
    titulo: z
        .string()
        .trim()
        .min(1, "El titulo de la publicacion no debe estar vacio")
        .max(120, "El titulo no debe superar los 120 caracteres")
        .optional(),

    descripcion: z
        .string()
        .trim()
        .min(1, "La descripcion no debe estar vacia")
        .optional(),

    precio: z
        .number()
        .positive("El precio debe ser mayor que 0")
        .optional(),

    idUsuario: z
        .number()
        .int("El id debe ser un entero")
        .positive("El id debe existir")
        .optional(),

    videoUrl: z.string().trim().optional().or(z.literal("")),
    estado: z.enum(["disponible", "pausada", "finalizada", "eliminada"]).optional(),
    multimedia: z
        .array(z.string().trim().min(1, "URL de imagen no válida"))
        .max(15, "No se pueden cargar más de 15 fotografías por vehículo")
        .optional(),

    vehiculo: z.object({
        codigoVehiculo: z.string().trim().min(1).optional(),
        patente: z.string().trim().min(1).max(8).optional(),
        anio: z.number().int().positive().optional(),
        kilometros: z.number().int().min(0).optional(),
        cantidadPuertas: z.number().int().positive().optional(),
        color: z.string().trim().min(1).optional(),
        cantidadAsientos: z.number().int().positive().optional(),
        capacidadRemolque: z.number().int().positive().optional().nullable(),
        capacidadBaul: z.number().int().positive().optional().nullable(),
        capacidadTanque: z.number().int().positive().optional().nullable(),
        cantidadAirbags: z.number().int().positive().optional(),

        idMarca: z.number().int().positive().optional(),
        idModelo: z.number().int().positive().optional(),
        version: z.string().trim().optional(),
        idSegmento: z.number().int().positive().optional(),
        idTipoCarroceria: z.number().int().positive().optional(),
        idCondicion: z.number().int().positive().optional(),
        idCaja: z.number().int().positive().optional(),
        idTraccion: z.number().int().positive().optional(),
        idCombustible: z.number().int().positive().optional(),
        idTipoDireccion: z.number().int().positive().optional(),
        idTipoTapizado: z.number().int().positive().optional(),
        idMotor: z.number().int().positive().optional(),
        motor: z
            .object({
                idTipoMotor: z.number().int().positive().optional(),
                descripcion: z.string().trim().optional().nullable(),
                potencia: z.number().positive().optional().nullable(),
                torque: z.number().positive().optional().nullable(),
            })
            .optional(),

        dimensiones: z.object({
            largo: z.number().positive().optional(),
            alto: z.number().positive().optional(),
            ancho: z.number().positive().optional()
        }).optional(), 
    }).optional(),
});

export type UpdatePublicacionDto = z.infer<typeof UpdatePublicacionSchema>;

export const FilterPublicacionesSchema = z.object({
  marcaId: z.coerce.number().int().positive().optional(),
  modeloId: z.coerce.number().int().positive().optional(),
  segmentoId: z.coerce.number().int().positive().optional(),
  anioMin: z.coerce.number().int().optional(),
  anioMax: z.coerce.number().int().optional(),
  precioMin: z.coerce.number().positive().optional(),
  precioMax: z.coerce.number().positive().optional(),
  
  // Ordenamiento 
  orden: z.enum(["relevantes", "precio_asc", "precio_desc"]).default("relevantes"),
  
  // Para filtrar por estado (exclusivo vendedores)
  estado: z.string().optional(),
});
export type FilterPublicacionesDto = z.infer<typeof FilterPublicacionesSchema>

// maquina de estados

export const CambiarEstadoSchema = z.object({
  nuevoEstado: z
    .enum(["disponible", "pausada", "finalizada", "eliminada"])
    .refine(() => true, {
      // Nota: refine evalúa el valor, pero como z.enum ya filtra las opciones,
      // solo usamos esto para inyectar tu mensaje personalizado si falla.
      message: "Estado inválido. Opciones: disponible, pausada, finalizada, eliminada",
    }),
});

export type CambiarEstadoDto = z.infer<typeof CambiarEstadoSchema>;