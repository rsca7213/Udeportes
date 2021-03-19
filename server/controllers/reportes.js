/* instanciamos la conexión a la bd y el validador */
const bd = require('../conexion');
const helper_edad = require('../helpers/edad');
const validador = require('./validador');

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  pertenecientes a un equipo(categoría) en concreto.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function nominaEquipo (id_categoria) {
  try {
    // validamos la id
    id_categoria = parseInt(id_categoria);
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    // Buscamos los datos basicos de los atletas del equipo en la base de datos
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido,
      CASE WHEN a.genero = 'm' THEN 'Masculino' ELSE 'Femenino' END AS genero, 
      TO_CHAR(a.fecha_nacimiento, 'dd/mm/yyyy') AS fecha_nacimiento, a.correo, i.id_categoria,
      e.nombre AS educacion, CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
      THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa,
      a.numero_etapa FROM inscripciones i, atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id
      where a.cedula = i.cedula_atleta AND i.id_categoria = $1;`,
       [id_categoria] 
    );

    atletas = atletas.rows;

    // Transformamos la data a la requerida
    atletas = atletas.map((atleta) => {
      let nombres = [
        atleta.primer_nombre,
        atleta.segundo_nombre || '',
        atleta.primer_apellido,
        atleta.segundo_apellido
      ];
      return {
        cedula: atleta.cedula,
        nombre_completo: nombres.join(' ').replace(/ +/g, " "),
        genero: atleta.genero,
        edad: `${helper_edad(atleta.fecha_nacimiento)} ${helper_edad(atleta.fecha_nacimiento) === 1 ? 'Año' : 'Años'}`,
        correo: atleta.correo || 'Sin correo',
        educacion: atleta.educacion ? `${atleta.educacion} (${atleta.tipo_etapa} #${atleta.numero_etapa})` : 'No especificada'
      }
    });
    
    // Devolvemos la data obtenida en forma Array[]
    return { codigo: 200, atletas: atletas }
  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  pertenecientes a una competencia previamente identificada.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function nominaCompetencia (id_competencia) {
  try {
    // Buscamos los datos basicos de los atletas del equipo en la base de datos

    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido,
      CASE WHEN a.genero = 'm' THEN 'Masculino' ELSE 'Femenino' END AS genero, 
      TO_CHAR(a.fecha_nacimiento, 'dd/mm/yyyy') AS fecha_nacimiento, a.correo, i.id_categoria,
      e.nombre AS educacion, CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
      THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa,
      a.numero_etapa FROM inscripciones i, participaciones p, atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id
      where a.cedula = i.cedula_atleta AND p.id_inscripcion = i.id AND p.id_competencia = $1;`,
       [id_competencia] 
    );

    atletas = atletas.rows;

    // Transformamos la data a la requerida
    atletas = atletas.map((atleta) => {
      let nombres = [
        atleta.primer_nombre,
        atleta.segundo_nombre || '',
        atleta.primer_apellido,
        atleta.segundo_apellido
      ];
      return {
        cedula: atleta.cedula,
        nombre_completo: nombres.join(' ').replace(/ +/g, " "),
        genero: atleta.genero,
        edad: `${helper_edad(atleta.fecha_nacimiento)} ${helper_edad(atleta.fecha_nacimiento) === 1 ? 'Año' : 'Años'}`,
        correo: atleta.correo || 'Sin correo',
        educacion: atleta.educacion ? `${atleta.educacion} (${atleta.tipo_etapa} #${atleta.numero_etapa})` : 'No especificada'
      }
    });
    
    // Devolvemos la data obtenida en forma Array[]
    return { codigo: 200, atletas: atletas }
  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

async function asistenciaGeneralEntrenamientos (id_deporte, id_categoria) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    /* 
      No es necesario verificar la existencia de la categoria, ya que la unica forma de llegar a esta funcion es que esta exista 
      y el usuario tenga acceso a ella (routerEntrenamientos)
    */
    // Buscamos los entrenamientos
    let entrenamientos = await bd.query(
      `SELECT e.id, TO_CHAR(e.fecha, 'dd/mm/yyyy') AS fecha, e.nombre FROM entrenamientos e 
       WHERE e.id_deporte = $1 AND e.id_categoria = $2 ORDER BY e.fecha DESC, e.nombre`,
      [id_deporte, id_categoria]
    );
    entrenamientos = entrenamientos.rows;

    entrenamientos = await Promise.all(entrenamientos.map(async function (item) {
      let asistencias = await bd.query(
        `SELECT COUNT(*) FROM participaciones p WHERE p.id_entrenamiento = $1 
         AND p.id_deporte_ent = $2 AND p.id_categoria_ent = $3 AND p.asistencia = TRUE`,
        [item.id, id_deporte, id_categoria]
      );
      asistencias = parseInt(asistencias.rows[0].count);
      let faltas = await bd.query(
        `SELECT COUNT(*) FROM participaciones p WHERE p.id_entrenamiento = $1 
         AND p.id_deporte_ent = $2 AND p.id_categoria_ent = $3 AND p.asistencia = FALSE`,
        [item.id, id_deporte, id_categoria]
      );
      faltas = parseInt(faltas.rows[0].count);
      return {
        id: item.id,
        fecha: item.fecha,
        nombre: item.nombre || 'Sin nombre',
        asistencias: `${asistencias} ${asistencias === 1 ? 'Atleta' : 'Atletas'}`,
        faltas: `${faltas} ${faltas === 1 ? 'Atleta' : 'Atletas'}`,
        porcentaje: 
          parseFloat(
            (asistencias / (asistencias + faltas)) * 100 || 0
          ).toFixed(2) + " %"
      }
    }));
    // Si todo sale bien
    return { codigo: 200, entrenamientos: entrenamientos }
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}



module.exports = {
  nominaEquipo,
  nominaCompetencia
}