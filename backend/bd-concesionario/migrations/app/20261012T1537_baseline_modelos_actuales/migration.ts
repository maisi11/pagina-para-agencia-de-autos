#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/55ce18ce221a5f8c0aa5d900f984a50ab8d5d692a3b1f5cde3a7ff8ccb186683/contract';
import endContract from '../../snapshots/55ce18ce221a5f8c0aa5d900f984a50ab8d5d692a3b1f5cde3a7ff8ccb186683/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Caja',
        columns: [
          col('descripcion', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('idCaja', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreCaja', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idCaja'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Combustible',
        columns: [
          col('idCombustible', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreCombustible', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idCombustible'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Condicion',
        columns: [
          col('idCondicion', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreCondicion', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idCondicion'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Dimensiones',
        columns: [
          col('alto', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('ancho', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('idDimensiones', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('largo', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
        ],
        constraints: [primaryKey(['idDimensiones'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Estado',
        columns: [
          col('idEstado', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombre', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idEstado'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'HistorialPublicacion',
        columns: [
          col('fechaHoraFinalizacion', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fechaHoraInicio', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('idEstado', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idPublicacion', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['idPublicacion', 'fechaHoraInicio'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Marca',
        columns: [
          col('idMarca', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreMarca', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idMarca'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'MetricasPublicacion',
        columns: [
          col('fechaHora', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('idMetrica', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idPublicacion', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idTipoEvento', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['idMetrica'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Modelo',
        columns: [
          col('idMarca', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idModelo', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreModelo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idModelo'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Motor',
        columns: [
          col('descripcion', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('idMotor', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idTipoMotor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('potencia', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('torque', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
        ],
        constraints: [primaryKey(['idMotor'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Multimedia',
        columns: [
          col('idArchivo', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idPublicacion', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('urlArchMultimedia', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idArchivo'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Publicacion',
        columns: [
          col('descripcion', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idPublicacion', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idUsuario', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('precio', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('titulo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idPublicacion'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Segmento',
        columns: [
          col('idSegmento', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreSegmento', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idSegmento'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TipoCarroceria',
        columns: [
          col('idTipoCarroceria', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreTipoCarroceria', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['idTipoCarroceria'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TipoDireccion',
        columns: [
          col('descripcion', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('idTipoDireccion', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombre', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idTipoDireccion'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TipoEvento',
        columns: [
          col('idTipoEvento', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombre', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idTipoEvento'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TipoMotor',
        columns: [
          col('idTipoMotor', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreTipo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idTipoMotor'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'TipoTapizado',
        columns: [
          col('descripcion', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('idTipoTapizado', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreTipoTapizado', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idTipoTapizado'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Traccion',
        columns: [
          col('idTraccion', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreTraccion', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idTraccion'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Usuario',
        columns: [
          col('contraseña', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idUsuario', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombre', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idUsuario'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Vehiculo',
        columns: [
          col('anio', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('cantidadAirbags', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('cantidadAsientos', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('cantidadPuertas', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('capacidadBaul', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('capacidadRemolque', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('capacidadTanque', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('codigoVehiculo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('color', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idCaja', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idCombustible', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idCondicion', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idDimensiones', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idModelo', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idMotor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idPublicacion', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idSegmento', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idTipoCarroceria', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idTipoDireccion', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idTipoTapizado', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idTraccion', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('kilometros', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('patente', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['patente'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Version',
        columns: [
          col('descripcion', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('idModelo', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('idVersion', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('nombreVersion', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['idVersion'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Usuario',
        constraint: 'Usuario_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Vehiculo',
        constraint: 'Vehiculo_codigoVehiculo_key',
        columns: ['codigoVehiculo'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Vehiculo',
        constraint: 'Vehiculo_idPublicacion_key',
        columns: ['idPublicacion'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'HistorialPublicacion',
        index: 'HistorialPublicacion_idEstado_idx_770bb368',
        columns: ['idEstado'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'HistorialPublicacion',
        index: 'HistorialPublicacion_idPublicacion_idx_4d7c111e',
        columns: ['idPublicacion'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MetricasPublicacion',
        index: 'MetricasPublicacion_idPublicacion_idx_4d7c111e',
        columns: ['idPublicacion'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MetricasPublicacion',
        index: 'MetricasPublicacion_idTipoEvento_idx_40c15a99',
        columns: ['idTipoEvento'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Modelo',
        index: 'Modelo_idMarca_idx_b71fc0a3',
        columns: ['idMarca'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Motor',
        index: 'Motor_idTipoMotor_idx_df316074',
        columns: ['idTipoMotor'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Multimedia',
        index: 'Multimedia_idPublicacion_idx_4d7c111e',
        columns: ['idPublicacion'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Publicacion',
        index: 'Publicacion_idUsuario_idx_2255b915',
        columns: ['idUsuario'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idCaja_idx_4a9438f6',
        columns: ['idCaja'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idCombustible_idx_30d66389',
        columns: ['idCombustible'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idCondicion_idx_246be109',
        columns: ['idCondicion'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idDimensiones_idx_ef7e1922',
        columns: ['idDimensiones'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idModelo_idx_073eb2ad',
        columns: ['idModelo'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idMotor_idx_90c9a8a1',
        columns: ['idMotor'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idSegmento_idx_42bc43c8',
        columns: ['idSegmento'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idTipoCarroceria_idx_f29b7c0e',
        columns: ['idTipoCarroceria'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idTipoDireccion_idx_84a99da7',
        columns: ['idTipoDireccion'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idTipoTapizado_idx_fcb18722',
        columns: ['idTipoTapizado'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Vehiculo',
        index: 'Vehiculo_idTraccion_idx_332480f9',
        columns: ['idTraccion'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Version',
        index: 'Version_idModelo_idx_073eb2ad',
        columns: ['idModelo'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'HistorialPublicacion',
        foreignKey: {
          name: 'HistorialPublicacion_idEstado_fkey',
          columns: ['idEstado'],
          references: { schema: 'public', table: 'Estado', columns: ['idEstado'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'HistorialPublicacion',
        foreignKey: {
          name: 'HistorialPublicacion_idPublicacion_fkey',
          columns: ['idPublicacion'],
          references: { schema: 'public', table: 'Publicacion', columns: ['idPublicacion'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MetricasPublicacion',
        foreignKey: {
          name: 'MetricasPublicacion_idTipoEvento_fkey',
          columns: ['idTipoEvento'],
          references: { schema: 'public', table: 'TipoEvento', columns: ['idTipoEvento'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MetricasPublicacion',
        foreignKey: {
          name: 'MetricasPublicacion_idPublicacion_fkey',
          columns: ['idPublicacion'],
          references: { schema: 'public', table: 'Publicacion', columns: ['idPublicacion'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Modelo',
        foreignKey: {
          name: 'Modelo_idMarca_fkey',
          columns: ['idMarca'],
          references: { schema: 'public', table: 'Marca', columns: ['idMarca'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Motor',
        foreignKey: {
          name: 'Motor_idTipoMotor_fkey',
          columns: ['idTipoMotor'],
          references: { schema: 'public', table: 'TipoMotor', columns: ['idTipoMotor'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Multimedia',
        foreignKey: {
          name: 'Multimedia_idPublicacion_fkey',
          columns: ['idPublicacion'],
          references: { schema: 'public', table: 'Publicacion', columns: ['idPublicacion'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Publicacion',
        foreignKey: {
          name: 'Publicacion_idUsuario_fkey',
          columns: ['idUsuario'],
          references: { schema: 'public', table: 'Usuario', columns: ['idUsuario'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idPublicacion_fkey',
          columns: ['idPublicacion'],
          references: { schema: 'public', table: 'Publicacion', columns: ['idPublicacion'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idTraccion_fkey',
          columns: ['idTraccion'],
          references: { schema: 'public', table: 'Traccion', columns: ['idTraccion'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idSegmento_fkey',
          columns: ['idSegmento'],
          references: { schema: 'public', table: 'Segmento', columns: ['idSegmento'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idModelo_fkey',
          columns: ['idModelo'],
          references: { schema: 'public', table: 'Modelo', columns: ['idModelo'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idTipoCarroceria_fkey',
          columns: ['idTipoCarroceria'],
          references: { schema: 'public', table: 'TipoCarroceria', columns: ['idTipoCarroceria'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idCondicion_fkey',
          columns: ['idCondicion'],
          references: { schema: 'public', table: 'Condicion', columns: ['idCondicion'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idTipoTapizado_fkey',
          columns: ['idTipoTapizado'],
          references: { schema: 'public', table: 'TipoTapizado', columns: ['idTipoTapizado'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idDimensiones_fkey',
          columns: ['idDimensiones'],
          references: { schema: 'public', table: 'Dimensiones', columns: ['idDimensiones'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idCaja_fkey',
          columns: ['idCaja'],
          references: { schema: 'public', table: 'Caja', columns: ['idCaja'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idMotor_fkey',
          columns: ['idMotor'],
          references: { schema: 'public', table: 'Motor', columns: ['idMotor'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idCombustible_fkey',
          columns: ['idCombustible'],
          references: { schema: 'public', table: 'Combustible', columns: ['idCombustible'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehiculo',
        foreignKey: {
          name: 'Vehiculo_idTipoDireccion_fkey',
          columns: ['idTipoDireccion'],
          references: { schema: 'public', table: 'TipoDireccion', columns: ['idTipoDireccion'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Version',
        foreignKey: {
          name: 'Version_idModelo_fkey',
          columns: ['idModelo'],
          references: { schema: 'public', table: 'Modelo', columns: ['idModelo'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
