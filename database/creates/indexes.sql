/*SCRIPT donde se crean todos los indices necesarios para la base de datos*/

/*TABLA atletas*/
CREATE INDEX atletas_educaciones_index ON atletas(id_educacion);

/*TABLA inscripciones*/
CREATE INDEX inscripciones_posiciones_index ON inscripciones(id_posicion, id_deporte_pos);

/*TABLA participaciones*/
CREATE INDEX participacion_competencia_ind ON participaciones(id_competencia, id_categoria_comp, id_deporte_comp);
CREATE INDEX participacion_entrenamiento_in ON participaciones(id_entrenamiento, id_categoria_ent, id_deporte_ent);

