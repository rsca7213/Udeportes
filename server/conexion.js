// Libreria requerida para postgres
const pg = require('pg');

/* Crea la conexión con la base de datos, con los valores especificados en el .env */
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

/* Normaliza la manera en la que se retornan las fechas con la libreria */
pg.types.setTypeParser(1114, (val) => {
  return val
});

module.exports = {
  /* el archivo exportara el metodo query que toma el query como tal y se pasan los parametros a parte para evitar SQL Injection */
  query: (text, params) => pool.query(text, params)
}

/* Ejemplo llamada pg */
/*
  const db = require('../database/connection'); para instanciar el archivo conexion.js como un objeto
  let query = await db.query("SELECT w.id FROM works w WHERE w.client_id=$1", [clients[i].id]); // param1 = $1, param2 = $2...
  query = query.rows; genera un arreglo en el que arreglo[i] es un objeto que contiene cada columna de la fila
  ejemplo: console.log(query[0].id);
*/