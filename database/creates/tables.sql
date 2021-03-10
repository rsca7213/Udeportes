/* SCRIPT donde se crean todas las tablas necesarias para la base de datos*/

CREATE TABLE usuarios(
  cedula NUMERIC(8, 0) NOT NULL,
  rol CHAR(1) NOT NULL,
  primer_nombre VARCHAR(50) NOT NULL,
  primer_apellido VARCHAR(50) NOT NULL,
  segundo_apellido VARCHAR(50) NOT NULL,
  correo VARCHAR(200) NOT NULL UNIQUE,
  clave VARCHAR(1024) NOT NULL,
  segundo_nombre VARCHAR(50),
  telefono VARCHAR(11) UNIQUE,
  fecha_nacimiento DATE,

  CONSTRAINT usuarios_pk PRIMARY KEY(cedula),
  CONSTRAINT usuarios_rol_check CHECK(rol in ('a', 'e'))
);

CREATE TABLE asignaciones(
  cedula_usuario NUMERIC(8, 0) NOT NULL,
  id_categoria NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,

  CONSTRAINT asignaciones_pk PRIMARY KEY(cedula_usuario, id_categoria, id_deporte)
);

CREATE TABLE categorias(
  id NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  fecha_registro DATE NOT NULL,
  genero CHAR(1) NOT NULL,

  CONSTRAINT categorias_pk PRIMARY KEY(id, id_deporte),
  CONSTRAINT categorias_genero_check CHECK(genero in ('f', 'm', 'u'))
);

CREATE TABLE deportes(
  id NUMERIC(4, 0) NOT NULL,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  
  CONSTRAINT deportes_pk PRIMARY KEY(id)
);

CREATE TABLE posiciones(
  id NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,
  nombre VARCHAR(50) NOT NULL,

  CONSTRAINT posiciones_pk PRIMARY KEY(id, id_deporte)
);

CREATE TABLE estadisticas(
  id NUMERIC(6, 0) NOT NULL,
  id_posicion NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  minimo NUMERIC(3, 0),
  maximo NUMERIC(3, 0),

  CONSTRAINT estadisticas_pk PRIMARY KEY(id, id_posicion, id_deporte)
);

CREATE TABLE entrenamientos(
  id NUMERIC(8, 0) NOT NULL,
  id_categoria NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,
  fecha DATE NOT NULL,
  nombre VARCHAR(50),

  CONSTRAINT entrenamientos_pk PRIMARY KEY(id, id_categoria, id_deporte)
);

CREATE TABLE competencias(
  id NUMERIC(5, 0) NOT NULL,
  id_categoria NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  estatus CHAR(1),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,

  CONSTRAINT competencias_pk PRIMARY KEY(id, id_categoria, id_deporte),
  CONSTRAINT competencias_estatus_check CHECK(estatus IN ('n', 'e', 'd', 'v'))
);

CREATE TABLE rendimientos(
  cedula_atleta NUMERIC(8, 0) NOT NULL,
  id_estadistica NUMERIC(6, 0) NOT NULL,
  id_posicion NUMERIC(5, 0) NOT NULL,
  id_deporte_est NUMERIC(4, 0) NOT NULL,
  id_competencia NUMERIC(5, 0) NOT NULL,
  id_categoria NUMERIC(5, 0) NOT NULL,
  id_deporte_comp NUMERIC(4, 0) NOT NULL,
  valor NUMERIC(4,0),

  CONSTRAINT rendimientos_pk PRIMARY KEY(
  cedula_atleta,
  id_estadistica,
  id_posicion,
  id_deporte_est,
  id_competencia,
  id_categoria,
  id_deporte_comp)
);

CREATE TABLE atletas(
  cedula NUMERIC(8, 0) NOT NULL,
  primer_nombre VARCHAR(50) NOT NULL,
  primer_apellido VARCHAR(50) NOT NULL,
  segundo_apellido VARCHAR(50) NOT NULL,
  genero CHAR(1) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  id_educacion NUMERIC(4, 0),
  segundo_nombre VARCHAR(50) NOT NULL,
  correo VARCHAR(200) UNIQUE,
  telefono VARCHAR(11) UNIQUE,
  nombre_beca VARCHAR(200),
  porcentaje_beca NUMERIC(3, 0),
  numero_etapa NUMERIC(2, 0),

  CONSTRAINT atletas_pk PRIMARY KEY(cedula),
  CONSTRAINT atletas_genero_check CHECK(genero IN ('m', 'f'))
);

CREATE TABLE educaciones(
  id NUMERIC(4, 0) NOT NULL,
  tipo_etapa CHAR(1) NOT NULL,
  nombre VARCHAR(200) NOT NULL,

  CONSTRAINT educaciones_pk PRIMARY KEY(id),
  CONSTRAINT educaciones_tipo_etapa_check CHECK(tipo_etapa IN ('m', 't', 's', 'a'))
);

CREATE TABLE inscripciones(
  cedula_atleta NUMERIC(8, 0) NOT NULL,
  id_categoria NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,
  fecha_registro DATE NOT NULL,
  id_posicion NUMERIC(5, 0),
  id_deporte_pos NUMERIC(4, 0),

  CONSTRAINT inscripciones_pk PRIMARY KEY(cedula_atleta, id_categoria, id_deporte)
);

CREATE TABLE participaciones(
  id NUMERIC(6, 0) NOT NULL,
  cedula_atleta NUMERIC(8, 0) NOT NULL,
  id_categoria NUMERIC(5, 0) NOT NULL,
  id_deporte NUMERIC(4, 0) NOT NULL,
  asistencia BOOLEAN NOT NULL,
  id_competencia NUMERIC(5, 0),
  id_categoria_comp NUMERIC(5, 0),
  id_deporte_comp NUMERIC(4, 0),
  id_entrenamiento NUMERIC(8, 0),
  id_categoria_ent NUMERIC(5, 0),
  id_deporte_ent NUMERIC(4, 0),

  CONSTRAINT participaciones_pk PRIMARY KEY(id, cedula_atleta, id_categoria, id_deporte)
);