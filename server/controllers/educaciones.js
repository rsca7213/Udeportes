/* instanciamos la conexión a la bd */
const bd = require('../conexion');

async function obtenerEducaciones () {
  try {
    let educaciones = await bd.query(
      `SELECT e.id, CASE WHEN e.tipo_etapa = 's' THEN 'Semestre' WHEN e.tipo_etapa = 'm' THEN 'Mes'
       WHEN e.tipo_etapa = 't' THEN 'Trimestre' ELSE 'Año' END AS etapa, e.nombre FROM educaciones e`
    );
    educaciones = educaciones.rows;

    if (!educaciones.length) return { codigo: 200, texto: 'Vacio' }
    else {
      return { 
        codigo: 200,
        educaciones: educaciones
      }
    }
  }
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

module.exports = {
  obtenerEducaciones
}