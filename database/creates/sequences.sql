/* SCRIPT donde se crean todos las secuencias necesarias para la base de datos*/

/*TABLA categorias*/
CREATE SEQUENCE categorias_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 99999;

/*TABLA deportes*/
CREATE SEQUENCE deportes_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 9999;

/*TABLA posiciones*/
CREATE SEQUENCE posiciones_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 99999;

/*TABLA estadisticas*/
CREATE SEQUENCE estadisticas_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 999999;

/*TABLA entrenamientos*/
CREATE SEQUENCE entrenamientos_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 99999999;

/*TABLA competencias*/
CREATE SEQUENCE competencias_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 99999;

/*TABLA participaciones*/
CREATE SEQUENCE participaciones_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 999999;

/*TABLA educaciones*/
CREATE SEQUENCE educaciones_id_seq INCREMENT BY 1 START WITH 1 MAXVALUE 9999;

/*TABLA historico_etapas*/
CREATE SEQUENCE historico_etapas_educativas_id_seq INCREMENT BY 1 START WITH 1;

/*TABLA historico_inscripciones*/
CREATE SEQUENCE historico_inscripciones_id_seq INCREMENT BY 1 START WITH 1;