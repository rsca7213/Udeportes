/* instanciamos la conexión a la bd */
const bd = require('../conexion');

/*
  Funcion que obtiene las educaciones actualmente registradas en el sistema,
  Retornara un HTTP 200 con "Vacio" en caso de que no haya educaciones,
  HTTP 200 con data en caso de que hayan educaciones y
  HTTP 500 en caso de error inesperado
*/
async function obtenerEducaciones () {
  try {
    // Buscamos las educaciones en la bd
    let educaciones = await bd.query(
      `SELECT e.id, CASE WHEN e.tipo_etapa = 's' THEN 'Semestre' WHEN e.tipo_etapa = 'm' THEN 'Mes'
       WHEN e.tipo_etapa = 't' THEN 'Trimestre' ELSE 'Año' END AS etapa, e.nombre FROM educaciones e`
    );
    educaciones = educaciones.rows;

    // Si no existen educaciones en el sistema
    if (!educaciones.length) return { codigo: 200, texto: 'Vacio' }
    // Si hay educaciones en el sistema
    else {
      return { 
        codigo: 200,
        educaciones: educaciones
      }
    }
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

module.exports = {
  obtenerEducaciones
}