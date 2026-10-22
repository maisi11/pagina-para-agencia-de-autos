-- Limpiar tablas
TRUNCATE TABLE 
  "MetricasPublicacion",
  "Multimedia",
  "HistorialPublicacion",
  "Vehiculo",
  "Publicacion",
  "Usuario",
  "Version",
  "Modelo",
  "Marca",
  "Motor",
  "Dimensiones",
  "TipoEvento",
  "Estado",
  "Traccion",
  "TipoTapizado",
  "TipoDireccion",
  "TipoCarroceria",
  "TipoMotor",
  "Condicion",
  "Combustible",
  "Caja",
  "Segmento"
CASCADE;

-- Reiniciar secuencias
ALTER SEQUENCE "Usuario_idUsuario_seq" RESTART WITH 1;
ALTER SEQUENCE "Publicacion_idPublicacion_seq" RESTART WITH 1;
ALTER SEQUENCE "Multimedia_idArchivo_seq" RESTART WITH 1;
ALTER SEQUENCE "Dimensiones_idDimensiones_seq" RESTART WITH 1;
ALTER SEQUENCE "Marca_idMarca_seq" RESTART WITH 1;
ALTER SEQUENCE "Modelo_idModelo_seq" RESTART WITH 1;
ALTER SEQUENCE "Version_idVersion_seq" RESTART WITH 1;
ALTER SEQUENCE "Motor_idMotor_seq" RESTART WITH 1;
ALTER SEQUENCE "Combustible_idCombustible_seq" RESTART WITH 1;
ALTER SEQUENCE "TipoCarroceria_idTipoCarroceria_seq" RESTART WITH 1;
ALTER SEQUENCE "Segmento_idSegmento_seq" RESTART WITH 1;
ALTER SEQUENCE "Condicion_idCondicion_seq" RESTART WITH 1;
ALTER SEQUENCE "Caja_idCaja_seq" RESTART WITH 1;
ALTER SEQUENCE "TipoTapizado_idTipoTapizado_seq" RESTART WITH 1;
ALTER SEQUENCE "TipoDireccion_idTipoDireccion_seq" RESTART WITH 1;
ALTER SEQUENCE "TipoMotor_idTipoMotor_seq" RESTART WITH 1;
ALTER SEQUENCE "Traccion_idTraccion_seq" RESTART WITH 1;
ALTER SEQUENCE "Estado_idEstado_seq" RESTART WITH 1;
ALTER SEQUENCE "TipoEvento_idTipoEvento_seq" RESTART WITH 1;

-- 1. TIPOS DE COMBUSTIBLE
INSERT INTO "Combustible" ("idCombustible", "nombreCombustible") VALUES
  (1, 'Nafta Súper'),
  (2, 'Nafta Premium'),
  (3, 'Gasoil Grado 2 (Común / Súper) Euro 3'),
  (4, 'Gasoil Grado 3 (Premium) Euro 5'),
  (5, 'Gasoil Grado 3 (Premiun) Euro 6'),
  (6, 'GNC');

-- 2. TIPOS DE CARROCERÍA
INSERT INTO "TipoCarroceria" ("idTipoCarroceria", "nombreTipoCarroceria") VALUES
  (1, 'Sedán'),
  (2, 'Hatchback'),
  (3, 'Rural'),
  (4, 'Monovolumen'),
  (5, 'SUV'),
  (6, 'CUV'),
  (7, 'SUV Coupé'),
  (8, 'Pick-up'),
  (9, 'Cabriolet'),
  (10, 'Roadster'),
  (11, 'Targa');

-- 3. TIPOS DE SEGMENTO
INSERT INTO "Segmento" ("idSegmento", "nombreSegmento") VALUES
  (1, 'Segmento A'),
  (2, 'Segmento B'),
  (3, 'Segmento C'),
  (4, 'Segmento D'),
  (5, 'Segmento E'),
  (6, 'Segmento F');

-- 4. CONDICIONES
INSERT INTO "Condicion" ("idCondicion", "nombreCondicion") VALUES
  (1, 'Usado'),
  (2, '0km'),
  (3, 'Nuevo');

-- 5. CAJAS DE TRANSMISIÓN
INSERT INTO "Caja" ("idCaja", "nombreCaja", "descripcion") VALUES
  (1, 'Manual', 'Transmisión manual de 5 y 6 velocidades'),
  (2, 'Automática', 'Transmisión automática secuencial / CVT');

-- 6. TIPOS DE TAPIZADO
INSERT INTO "TipoTapizado" ("idTipoTapizado", "nombreTipoTapizado", "descripcion") VALUES
  (1, 'Pana', 'Tapizado textil de pana'),
  (2, 'Cuero natural', 'Cuero legítimo de alta gama'),
  (3, 'Cuero sintético', 'Ecocuero resistente y lavable'),
  (4, 'Alcántara', 'Microfibra deportiva de alta adherencia'),
  (5, 'Cuero con pana', 'Combinación mixta cuero y pana'),
  (6, 'Cuero con alcántara', 'Combinación deportiva cuero y alcántara');

-- 7. TIPOS DE DIRECCIÓN
INSERT INTO "TipoDireccion" ("idTipoDireccion", "nombre", "descripcion") VALUES
  (1, 'Eléctrica', 'Dirección asistida eléctricamente (EPS)'),
  (2, 'Hidráulica', 'Dirección con asistencia hidráulica'),
  (3, 'Mecánica', 'Dirección mecánica directa');

-- 8. TIPOS DE MOTOR
INSERT INTO "TipoMotor" ("idTipoMotor", "nombreTipo") VALUES
  (1, 'Combustión'),
  (2, 'Híbrido'),
  (3, 'Eléctrico');

-- 9. TIPOS DE TRACCIÓN
INSERT INTO "Traccion" ("idTraccion", "nombreTraccion") VALUES
  (1, 'Tracción delantera (FWD)'),
  (2, 'Tracción trasera (RWD)'),
  (3, 'Tracción total permanente (AWD)'),
  (4, 'Tracción 4x4 conectable (4WD)');

-- 10. ESTADOS DE PUBLICACIÓN
INSERT INTO "Estado" ("idEstado", "nombre") VALUES
  (1, 'disponible'),
  (2, 'pausada'),
  (3, 'finalizada');

-- 11. TIPOS DE EVENTOS / MÉTRICAS
INSERT INTO "TipoEvento" ("idTipoEvento", "nombre") VALUES
  (1, 'VISITA_PUBLICACION'),
  (2, 'WHATSAPP_PUBLICACION'),
  (3, 'CLICK_MAPS'),
  (4, 'WHATSAPP_GENERAL');

-- 12. MARCAS
INSERT INTO "Marca" ("idMarca", "nombreMarca") VALUES
  (1, 'Toyota'),
  (2, 'Volkswagen'),
  (3, 'Ford'),
  (4, 'Peugeot'),
  (5, 'Chevrolet');

-- 13. MODELOS
INSERT INTO "Modelo" ("idModelo", "nombreModelo", "idMarca") VALUES
  (1, 'Hilux', 1),
  (2, 'Corolla', 1),
  (3, 'Yaris', 1),
  (4, 'Corolla Cross', 1),
  (5, 'Amarok', 2),
  (6, 'Taos', 2),
  (7, 'Gol Trend', 2),
  (8, 'Vento', 2),
  (9, 'Ranger', 3),
  (10, 'Territory', 3),
  (11, '208', 4),
  (12, '3008', 4);

-- 14. VERSIONES
INSERT INTO "Version" ("idVersion", "nombreVersion", "descripcion", "idModelo") VALUES
  (1, 'SRX 4x4 2.8 TDI AT', 'Tope de gama con tracción 4x4 y caja automática', 1),
  (2, 'SRV 4x2 2.8 TDI MT', 'Versión intermedia con tracción trasera', 1),
  (3, 'SEG 2.0 CVT', 'Versión ejecutiva tope de gama con caja CVT', 2),
  (4, 'XEI 2.0 CVT', 'Versión intermedia equipamiento full', 2),
  (5, 'V6 Extreme 3.0 TDI 4Motion AT', 'Motor V6 258 CV y tracción 4Motion', 5),
  (6, 'Highline 2.0 TDI 4Motion AT', 'Biturbo 180 CV full equipo', 5),
  (7, 'Feline 1.6 Tiptronic', 'Equipamiento premium con i-Cockpit 3D', 11);

-- 15. MOTORES
INSERT INTO "Motor" ("idMotor", "idTipoMotor", "descripcion", "potencia", "torque") VALUES
  (1, 1, '2.8 Turbodiésel 16v 204 CV', 204, 500),
  (2, 1, '3.0 V6 Turbodiésel 258 CV', 258, 580),
  (3, 1, '2.0 Dynamic Force Nafta 170 CV', 170, 200),
  (4, 1, '1.6 VTi Nafta 115 CV', 115, 150);

-- 16. DIMENSIONES
INSERT INTO "Dimensiones" ("idDimensiones", "largo", "alto", "ancho") VALUES
  (1, 5325, 1815, 1855),
  (2, 4630, 1435, 1780),
  (3, 4055, 1453, 1745);

-- 17. USUARIO VENDEDOR TEST
INSERT INTO "Usuario" ("idUsuario", "nombre", "email", "contraseña") VALUES
  (1, 'Martín Benítez', 'vendedor@concesionaria.com', 'Probandofuncionamiento123@');

-- 18. PUBLICACIONES DE PRUEBA
-- Publicación 1: Toyota Hilux
INSERT INTO "Publicacion" ("idPublicacion", "titulo", "descripcion", "precio", "idUsuario") VALUES
  (1, 'Toyota Hilux SRX 4x4 2.8 TDI 2023', 'Unidad única mano en estado inmaculado. Servicios oficiales al día en concesionario oficial Toyota. Tratamiento cerámico recién aplicado y peritaje computarizado de 150 puntos aprobado sin observaciones. Lista para transferir con entrega inmediata.', 42500, 1);

INSERT INTO "Vehiculo" (
  "patente", "codigoVehiculo", "idPublicacion", "anio", "kilometros", "cantidadPuertas",
  "color", "cantidadAsientos", "capacidadRemolque", "capacidadBaul", "capacidadTanque",
  "cantidadAirbags", "idTraccion", "idSegmento", "idModelo", "idTipoCarroceria",
  "idCondicion", "idTipoTapizado", "idDimensiones", "idCaja", "idMotor", "idCombustible", "idTipoDireccion"
) VALUES (
  'AF123CD', 'APX-HLX-001', 1, 2023, 34000, 4,
  'Blanco Perlado', 5, 3500, 1000, 80,
  7, 4, 4, 1, 8,
  1, 2, 1, 2, 1, 4, 1
);

INSERT INTO "Multimedia" ("urlArchMultimedia", "idPublicacion") VALUES
  ('https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80', 1),
  ('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 1);

INSERT INTO "HistorialPublicacion" ("idPublicacion", "fechaHoraInicio", "idEstado") VALUES
  (1, NOW(), 1);

-- Publicación 2: Volkswagen Amarok V6
INSERT INTO "Publicacion" ("idPublicacion", "titulo", "descripcion", "precio", "idUsuario") VALUES
  (2, 'Volkswagen Amarok V6 Extreme 3.0 TDI 4Motion 2022', 'Versión Extreme tope de gama con tracción integral permanente 4Motion y caja automática ZF de 8 velocidades. Llantas de aleación de 20 pulgadas, tapizados en cuero Nappa y barra San Antonio original. Garantía oficial vigente.', 45900, 1);

INSERT INTO "Vehiculo" (
  "patente", "codigoVehiculo", "idPublicacion", "anio", "kilometros", "cantidadPuertas",
  "color", "cantidadAsientos", "capacidadRemolque", "capacidadBaul", "capacidadTanque",
  "cantidadAirbags", "idTraccion", "idSegmento", "idModelo", "idTipoCarroceria",
  "idCondicion", "idTipoTapizado", "idDimensiones", "idCaja", "idMotor", "idCombustible", "idTipoDireccion"
) VALUES (
  'AF456EF', 'APX-AMK-002', 2, 2022, 48000, 4,
  'Gris Indium', 5, 3500, 1150, 80,
  6, 3, 4, 5, 8,
  1, 2, 1, 2, 2, 4, 1
);

INSERT INTO "Multimedia" ("urlArchMultimedia", "idPublicacion") VALUES
  ('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', 2);

INSERT INTO "HistorialPublicacion" ("idPublicacion", "fechaHoraInicio", "idEstado") VALUES
  (2, NOW(), 1);

-- Publicación 3: Toyota Corolla SEG
INSERT INTO "Publicacion" ("idPublicacion", "titulo", "descripcion", "precio", "idUsuario") VALUES
  (3, 'Toyota Corolla SEG 2.0 Dynamic Force CVT 2023', 'Sedán premium con paquete de seguridad activa Toyota Safety Sense (frenado autónomo, control crucero adaptativo y mantenimiento de carril). Excelente confort de marcha y consumo sumamente eficiente.', 27800, 1);

INSERT INTO "Vehiculo" (
  "patente", "codigoVehiculo", "idPublicacion", "anio", "kilometros", "cantidadPuertas",
  "color", "cantidadAsientos", "capacidadRemolque", "capacidadBaul", "capacidadTanque",
  "cantidadAirbags", "idTraccion", "idSegmento", "idModelo", "idTipoCarroceria",
  "idCondicion", "idTipoTapizado", "idDimensiones", "idCaja", "idMotor", "idCombustible", "idTipoDireccion"
) VALUES (
  'AF789GH', 'APX-COR-003', 3, 2023, 22000, 4,
  'Negro Mica', 5, 1200, 470, 50,
  7, 1, 3, 2, 1,
  1, 2, 2, 2, 3, 1, 1
);

INSERT INTO "Multimedia" ("urlArchMultimedia", "idPublicacion") VALUES
  ('https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80', 3);

INSERT INTO "HistorialPublicacion" ("idPublicacion", "fechaHoraInicio", "idEstado") VALUES
  (3, NOW(), 1);

-- Publicación 4: Peugeot 208 Feline
INSERT INTO "Publicacion" ("idPublicacion", "titulo", "descripcion", "precio", "idUsuario") VALUES
  (4, 'Peugeot 208 Feline 1.6 Tiptronic 2022', 'Hatchback compacto de diseño vanguardista. Techo panorámico vidriado, tablero digital 3D i-Cockpit, faros Full LED y cámara de visión trasera 180°. Cubiertas nuevas y services recién hechos.', 19500, 1);

INSERT INTO "Vehiculo" (
  "patente", "codigoVehiculo", "idPublicacion", "anio", "kilometros", "cantidadPuertas",
  "color", "cantidadAsientos", "capacidadRemolque", "capacidadBaul", "capacidadTanque",
  "cantidadAirbags", "idTraccion", "idSegmento", "idModelo", "idTipoCarroceria",
  "idCondicion", "idTipoTapizado", "idDimensiones", "idCaja", "idMotor", "idCombustible", "idTipoDireccion"
) VALUES (
  'AE345JK', 'APX-208-004', 4, 2022, 31000, 5,
  'Azul Quasar', 5, 800, 311, 47,
  6, 1, 2, 11, 2,
  1, 6, 3, 2, 4, 1, 1
);

INSERT INTO "Multimedia" ("urlArchMultimedia", "idPublicacion") VALUES
  ('https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80', 4);

INSERT INTO "HistorialPublicacion" ("idPublicacion", "fechaHoraInicio", "idEstado") VALUES
  (4, NOW(), 1);

-- Ajustar secuencias al final
SELECT setval('"Usuario_idUsuario_seq"', (SELECT MAX("idUsuario") FROM "Usuario"));
SELECT setval('"Publicacion_idPublicacion_seq"', (SELECT MAX("idPublicacion") FROM "Publicacion"));
SELECT setval('"Multimedia_idArchivo_seq"', (SELECT MAX("idArchivo") FROM "Multimedia"));
SELECT setval('"Dimensiones_idDimensiones_seq"', (SELECT MAX("idDimensiones") FROM "Dimensiones"));
SELECT setval('"Marca_idMarca_seq"', (SELECT MAX("idMarca") FROM "Marca"));
SELECT setval('"Modelo_idModelo_seq"', (SELECT MAX("idModelo") FROM "Modelo"));
SELECT setval('"Version_idVersion_seq"', (SELECT MAX("idVersion") FROM "Version"));
SELECT setval('"Motor_idMotor_seq"', (SELECT MAX("idMotor") FROM "Motor"));
SELECT setval('"Combustible_idCombustible_seq"', (SELECT MAX("idCombustible") FROM "Combustible"));
SELECT setval('"TipoCarroceria_idTipoCarroceria_seq"', (SELECT MAX("idTipoCarroceria") FROM "TipoCarroceria"));
SELECT setval('"Segmento_idSegmento_seq"', (SELECT MAX("idSegmento") FROM "Segmento"));
SELECT setval('"Condicion_idCondicion_seq"', (SELECT MAX("idCondicion") FROM "Condicion"));
SELECT setval('"Caja_idCaja_seq"', (SELECT MAX("idCaja") FROM "Caja"));
SELECT setval('"TipoTapizado_idTipoTapizado_seq"', (SELECT MAX("idTipoTapizado") FROM "TipoTapizado"));
SELECT setval('"TipoDireccion_idTipoDireccion_seq"', (SELECT MAX("idTipoDireccion") FROM "TipoDireccion"));
SELECT setval('"TipoMotor_idTipoMotor_seq"', (SELECT MAX("idTipoMotor") FROM "TipoMotor"));
SELECT setval('"Traccion_idTraccion_seq"', (SELECT MAX("idTraccion") FROM "Traccion"));
SELECT setval('"Estado_idEstado_seq"', (SELECT MAX("idEstado") FROM "Estado"));
SELECT setval('"TipoEvento_idTipoEvento_seq"', (SELECT MAX("idTipoEvento") FROM "TipoEvento"));
