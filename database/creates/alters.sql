/* SCRIPT donde se crean todos los alters necesarios para la base de datos*/

/*Tabla asignaciones*/
ALTER TABLE asignaciones ADD CONSTRAINT asignaciones_usuarios_fk
FOREIGN KEY (cedula_usuario)
REFERENCES usuarios (cedula);

ALTER TABLE asignaciones ADD CONSTRAINT asignaciones_categorias_fk
FOREIGN KEY (id_categoria, id_deporte)
REFERENCES categorias (id, id_deporte);

/*Tabla categorias*/
ALTER TABLE categorias ADD CONSTRAINT categorias_deportes_fk
FOREIGN KEY (id_deporte)
REFERENCES deportes (id);

/*Tabla posiciones*/
ALTER TABLE posiciones ADD CONSTRAINT posiciones_deportes_fk
FOREIGN KEY (id_deporte)
REFERENCES deportes (id);

/*Tabla estadisticas*/
ALTER TABLE estadisticas ADD CONSTRAINT estadisticas_posiciones_fk
FOREIGN KEY (id_posicion, id_deporte)
REFERENCES posiciones (id, id_deporte);

/*Tabla entrenamientos*/
ALTER TABLE entrenamientos ADD CONSTRAINT entrenamientos_categorias_fk
FOREIGN KEY (id_categoria, id_deporte)
REFERENCES categorias (id, id_deporte);

/*Tabla competencias*/
ALTER TABLE competencias ADD CONSTRAINT competencias_categorias_fk
FOREIGN KEY (id_categoria, id_deporte)
REFERENCES categorias (id, id_deporte);

/*Tabla rendimientos*/
ALTER TABLE rendimientos ADD CONSTRAINT rendimientos_competencias_fk
FOREIGN KEY (id_competencia, id_categoria, id_deporte_comp)
REFERENCES competencias (id, id_categoria, id_deporte);

ALTER TABLE rendimientos ADD CONSTRAINT rendimientos_estadisticas_fk
FOREIGN KEY (id_estadistica, id_posicion, id_deporte_est)
REFERENCES estadisticas (id, id_posicion, id_deporte);

ALTER TABLE rendimientos ADD CONSTRAINT rendimientos_atletas_fk
FOREIGN KEY (cedula_atleta)
REFERENCES atletas (cedula);

/*Tabla atletas*/
ALTER TABLE atletas ADD CONSTRAINT atletas_educaciones_fk
FOREIGN KEY (id_educacion)
REFERENCES educaciones (id);

/*Tabla inscripciones*/
ALTER TABLE inscripciones ADD CONSTRAINT inscripciones_posiciones_fk
FOREIGN KEY (id_posicion, id_deporte_pos)
REFERENCES posiciones (id, id_deporte);

ALTER TABLE inscripciones ADD CONSTRAINT inscripciones_categorias_fk
FOREIGN KEY (id_categoria, id_deporte)
REFERENCES categorias (id, id_deporte);

ALTER TABLE inscripciones ADD CONSTRAINT inscripciones_atletas_fk
FOREIGN KEY (cedula_atleta)
REFERENCES atletas (cedula);

/*Tabla participaciones*/
ALTER TABLE participaciones ADD CONSTRAINT participacion_inscripcion_fk
FOREIGN KEY (cedula_atleta, id_categoria, id_deporte)
REFERENCES inscripciones (cedula_atleta, id_categoria, id_deporte);

ALTER TABLE participaciones ADD CONSTRAINT participacion_competencia_fk
FOREIGN KEY (id_competencia, id_categoria_comp, id_deporte_comp)
REFERENCES competencias (id, id_categoria, id_deporte);

ALTER TABLE participaciones ADD CONSTRAINT participacion_entrenamiento_fk
FOREIGN KEY (id_entrenamiento, id_categoria_ent, id_deporte_ent)
REFERENCES entrenamientos (id, id_categoria, id_deporte);

/* Tabla historico atletas */
ALTER TABLE historico_atletas ADD CONSTRAINT atleta_historico_atletas_fk
FOREIGN KEY (cedula_atleta) REFERENCES atletas (cedula);

/* Tabla historico inscripciones */
ALTER TABLE historico_inscripciones ADD CONSTRAINT etapa_historico_inscripciones_fk
FOREIGN KEY (cedula_atleta, fecha_educacion) REFERENCES historico_atletas (cedula_atleta, fecha);