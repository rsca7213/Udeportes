/* instanciamos la conexión a la bd */
const bd = require('../conexion');

async function registrarNuevaEducacionAtleta(cedula) {
  try {
    // Obtenemos los datos de educación del atleta
    let educacion = await bd.query(
      `SELECT e.tipo_etapa AS tipo, e.nombre AS nombre, a.numero_etapa AS numero
       FROM atletas a RIGHT JOIN educaciones e ON e.id = a.id_educacion
       WHERE a.cedula = $1`, [cedula]
    )

    // Si no tiene educacion el atleta
    if (!educacion.rowCount) {
      await bd.query(
        `INSERT INTO historico_atletas VALUES (now(), $1)`,
        [cedula]
      )
      return
    }
    
    // Si tiene educacion
    educacion = educacion.rows[0]
    // Insertamos al historico de educaciones del atleta
    await bd.query(
      `INSERT INTO historico_atletas VALUES (now(), $1, $2, $3, $4)`,
      [cedula, educacion.numero, educacion.tipo, educacion.nombre]
    )

    return true
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
  }
}

module.exports = {
  registrarNuevaEducacionAtleta
}