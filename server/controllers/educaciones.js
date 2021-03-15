/* instanciamos la conexión a la bd */
const bd = require('../conexion');
const validador = require('./validador');
const helper_edad = require('../helpers/edad');

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

/*
  Funcion que crea una educacion en la base de datos a partir de los datos especificados
  siempre y cuando estos sean validos
*/
async function crearEducacion (educacion) {
  try {
    educacion = {
      nombre: educacion.nombre.trim(),
      etapa: educacion.etapa.trim()
    }

    // validamos los datos introducidos por el usuario
    let validar = [];
    validar.push(validador.validarNombreEducacion(educacion.nombre));
    validar.push(validador.validarEtapaEducacion(educacion.etapa));
    // Si hay algun error de validacion
    if(validar.filter(item => !item.estado).length > 0) return {
      codigo: 422,
      texto: validar.filter(item => !item.estado)[0].texto
    }
    // Hacemos el insert de la educacion si los datos son validos y retornamos 200
    await bd.query(
      `INSERT INTO educaciones VALUES (nextval('educaciones_id_seq'), $1, $2)`,
      [educacion.etapa, educacion.nombre]
    );

    return { codigo: 200, texto: 'Educación agregada satisfactoriamente.'}
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

/*
  Funcion que edita una educacion siempre y cuando los datos sean validos y esta exista
*/
async function editarEducacion (id, educacion) {
  try {
    id = parseInt(id);
    educacion = {
      nombre: educacion.nombre.trim(),
      etapa: educacion.etapa.trim()
    };

    let validar = [];
    // validamos los datos introducidos por el usuario
    validar.push(validador.validarId(id));
    validar.push(validador.validarNombreEducacion(educacion.nombre));
    validar.push(validador.validarEtapaEducacion(educacion.etapa));
    // Si hay algun error de validacion
    if(validar.filter(item => !item.estado).length > 0) return {
      codigo: 422,
      texto: validar.filter(item => !item.estado)[0].texto
    }

    // Verificamos si la educacion existe
    let verify = await bd.query(`SELECT EXISTS (SELECT id FROM educaciones WHERE id = $1) AS "existe"`, [id]);
    if (!verify.rows[0].existe) return { codigo: 404, texto: 'Esta educación no existe.' };

    // Si los datos son validos y la educacion existe
    await bd.query(
      `UPDATE educaciones SET nombre = $1, tipo_etapa = $2 WHERE id = $3`,
      [educacion.nombre, educacion.etapa, id]
    );

    return { codigo: 200, texto: 'Educación editada con exito.' };
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

/*
  Funcion que elimina una educacion siempre y cuando la id es valida y esta exista
  En caso de que haya estudiantes con la educacion, se les quita antes de eliminarla haciendo un UPDATE
  sobre la tabla atletas
*/
async function eliminarEducacion (id) {
  try {
    // Validamos la id de la educacion
    id = parseInt(id);
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }

    // Verificamos si la educacion existe
    let verify = await bd.query(`SELECT EXISTS (SELECT id FROM educaciones WHERE id = $1) AS "existe"`, [id]);
    if (!verify.rows[0].existe) return { codigo: 404, texto: 'Esta educación no existe.' };

    // Si los datos son validos y la educacion existe (quitamos la educacion de los atletas que la tengan y la eliminamos)
    await bd.query(`UPDATE atletas SET id_educacion = NULL, numero_etapa = NULL WHERE id_educacion = $1`, [id]);
    await bd.query(`DELETE FROM educaciones WHERE id = $1`, [id]);

    return { codigo: 200, texto: 'Educación eliminada con exito.' };

  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

/*
  Funcion que genera una lista de atletas por educacion en el sistema
*/
async function atletasPorEducacion () {
  try {
    // Buscamos la id y nombre de todas las educaciones del sistema
    let educaciones = await bd.query(`SELECT e.id, e.nombre FROM educaciones e`);
    educaciones = educaciones.rows;

    // Para cada una de las educaciones
    educaciones = await Promise.all(educaciones.map(async (educacion) => {
      try {
        // Buscamos los atletas de la educacion
        let atletas = await bd.query(
          `SELECT a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido, 
          a.genero, TO_CHAR(a.fecha_nacimiento, 'dd/mm/yyyy') AS fecha_nacimiento
          FROM atletas a WHERE a.id_educacion = $1`,
          [educacion.id]
        );
        // Para cada atleta extraemos su nombre completo, genero y edad
        atletas = atletas.rows.map(atleta => {
          let nombres = [
            atleta.primer_nombre,
            atleta.segundo_nombre || '',
            atleta.primer_apellido,
            atleta.segundo_apellido
          ];
          return {
            nombre_completo: nombres.join(' ').replace(/ +/g, " "),
            genero: atleta.genero === 'm' ? 'Masculino' : 'Femenino',
            edad: `${helper_edad(atleta.fecha_nacimiento)} ${helper_edad(atleta.fecha_nacimiento) === 1 ? 'Año' : 'Años'}`
          }
        });

        // Devolvemos la educacion con su nombre y atletas
        return {
          nombre: educacion.nombre,
          atletas: atletas
        }
      }
      catch (error) { 
        if (process.env.NODE_ENV === 'development') console.error(error);
      }
    }));

    // Si todo sale bien enviamos los datos
    return {
      codigo: 200,
      data: educaciones
    }
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

module.exports = {
  obtenerEducaciones,
  crearEducacion,
  editarEducacion,
  eliminarEducacion,
  atletasPorEducacion
}