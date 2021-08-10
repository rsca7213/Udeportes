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
        `INSERT INTO historico_etapas_educativas VALUES (nextval('historico_etapas_educativas_id_seq'), now(), $1)`,
        [cedula]
      )

      // Registramos inscripciones activas del atleta
      await registrarInscripcionesActivas(cedula)

      return
    }
    
    // Si tiene educacion
    educacion = educacion.rows[0]
    // Insertamos al historico de educaciones del atleta
    await bd.query(
      `INSERT INTO historico_etapas_educativas VALUES (nextval('historico_etapas_educativas_id_seq'), now(), $1, $2, $3, $4)`,
      [cedula, educacion.numero, educacion.tipo, educacion.nombre]
    )

    // Registramos inscripciones activas del atleta
    await registrarInscripcionesActivas(cedula)

    return true
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
  }
}

async function registrarInscripcionesActivas(cedula) {
  try {
    let inscripciones = await bd.query(
      `SELECT d.nombre AS nombre_deporte, c.nombre AS nombre_categoria, c.genero AS genero_categoria,
       p.nombre AS nombre_posicion, i.fecha_registro AS fecha_registro
       FROM inscripciones i INNER JOIN categorias c ON c.id = i.id_categoria
       LEFT JOIN posiciones p ON p.id = i.id_posicion INNER JOIN deportes d ON d.id = c.id_deporte
       WHERE i.cedula_atleta = $1 ORDER BY i.fecha_registro DESC`,
       [cedula]
    )
    
    // Si hay alguna inscripción activa
    if (inscripciones.rowCount) {
      // Obtenemos el periodo educativo mas reciente
      let periodo_educativo = await bd.query(
         `SELECT h.fecha, h.cedula_atleta, h.id FROM historico_etapas_educativas h 
          WHERE h.id = (SELECT MAX(id) FROM historico_etapas_educativas WHERE cedula_atleta = $1)`,
         [cedula]
      )
      if (!periodo_educativo.rowCount) return
      periodo_educativo = periodo_educativo.rows[0]


      for (const inscripcion of inscripciones.rows) {
        await bd.query(
          `INSERT INTO historico_inscripciones VALUES (nextval('historico_inscripciones_id_seq'), $1, now(), $2, $3, $4, $5, $6, $7)`,
          [periodo_educativo.id, cedula, inscripcion.nombre_deporte, inscripcion.nombre_categoria,
           inscripcion.genero_categoria, inscripcion.nombre_posicion, inscripcion.fecha_registro]
        )
      }
    }
  
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
  }
}

async function registrarNuevaInscripcion(inscripcion) {
  try {
    // Obtenemos los datos de la inscripción
    let datos = await bd.query(
      `SELECT d.nombre AS nombre_deporte, c.nombre AS nombre_categoria, c.genero AS genero_categoria,
       p.nombre AS nombre_posicion, i.fecha_registro AS fecha_registro, i.cedula_atleta AS cedula
       FROM inscripciones i INNER JOIN categorias c ON c.id = i.id_categoria
       LEFT JOIN posiciones p ON p.id = i.id_posicion INNER JOIN deportes d ON d.id = c.id_deporte
       WHERE i.cedula_atleta = $1 AND i.id_deporte = $2 AND i.id_categoria = $3`,
      [inscripcion.cedula, inscripcion.deporte, inscripcion.categoria]
    )
    if (!datos.rowCount) return
    datos = datos.rows[0]

    // Obtenemos el periodo educativo mas reciente
    let periodo_educativo = await bd.query(
      `SELECT h.fecha, h.cedula_atleta, h.id FROM historico_etapas_educativas h 
       WHERE h.id = (SELECT MAX(id) FROM historico_etapas_educativas WHERE cedula_atleta = $1)`,
      [inscripcion.cedula]
    )
    if (!periodo_educativo.rowCount) return
    periodo_educativo = periodo_educativo.rows[0]

    await bd.query(
      `INSERT INTO historico_inscripciones VALUES 
       (nextval('historico_inscripciones_id_seq'), $1, now(), $2, $3, $4, $5, $6, $7)`,
      [
        periodo_educativo.id, 
        datos.cedula, 
        datos.nombre_deporte, 
        datos.nombre_categoria, 
        datos.genero_categoria, 
        datos.nombre_posicion, 
        datos.fecha_registro
      ]
    )
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error)
  }
}

module.exports = {
  registrarNuevaEducacionAtleta,
  registrarNuevaInscripcion
}