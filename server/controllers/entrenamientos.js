/* instanciamos la conexión a la bd */
const bd = require('../conexion');
const validador = require('./validador');

/*
  Funcion que devuelve todos los entrenamientos de la categoria de un deporte
  de la siguiente manera 
  entrenamientos = [
    {
      id: Number,
      fecha: Date (String 'dd/mm/yyyy'),
      nombre: String (Opcional),
      asistencias: Number,
      faltas: Number,
      % asistencia: Number
    }
  ]
*/
async function obtenerEntrenamientos (id_deporte, id_categoria) {
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

/* 
  Funcion que devuelve todas las categorias ordenadas por deporte
  a las cuales se encuentra asignado un entrenador,
  en caso de admin se retornan absolutamente todas las categorias
*/
async function obtenerCategorias (cedula, rol = 'e') {
  try {
    // validamos la cedula del usuario (no deberia fallar nunca ya que la provee el mw_token)
    if (!validador.validarCedula(cedula).estado) return { codigo: 422, texto: validador.validarCedula(cedula).texto }
    // buscamos las categorias para el caso entrenador y el caso admin
    let data = rol === 'e' 
      ? await bd.query(
        `SELECT d.nombre AS deporte, d.id AS id_deporte, c.nombre || CASE WHEN c.genero ='m' THEN ' (Masculino)' 
         WHEN c.genero = 'f' THEN ' (Femenino)' ELSE ' (Unisex)' END AS categoria, c.id AS id_categoria
         FROM asignaciones a INNER JOIN categorias c ON a.id_categoria = c.id INNER JOIN deportes d
         ON a.id_deporte = d.id WHERE a.cedula_usuario = $1`,
        [cedula]
      )
      : await bd.query(
        `SELECT d.nombre AS deporte, d.id AS id_deporte, c.nombre || CASE WHEN c.genero ='m' THEN ' (Masculino)' 
         WHEN c.genero = 'f' THEN ' (Femenino)' ELSE ' (Unisex)' END AS categoria, c.id AS id_categoria
         FROM categorias c INNER JOIN deportes d ON d.id = c.id_deporte`
      );
    data = data.rows;
    // obtenemos los deportes de los datos
    let asignaciones = data.map(item => item.deporte);
    // quitamos deportes duplicados
    asignaciones = [...new Set(asignaciones)];
    /* 
      transformamos el arreglo de deportes a un arreglo de objetos con todas sus caracteristicas
      logrando el resultado final 
      asignaciones = { 
        deporte: String, 
        id_Deporte: Number, 
        categorias = [
          {
            categoria: String, 
            id_categoria: Number
          }
        ]
      }
    */
    asignaciones = 
      asignaciones.map(item => new Object(
        { 
          deporte: item, 
          id_deporte: data.filter(i => i.deporte === item)[0].id_deporte, 
          categorias: data.filter(i => i.deporte === item).map(i => new Object({ categoria: i.categoria, id_categoria: i.id_categoria })) 
        }
      ));

    // Retornamos un codigo 200 con los datos
    return { codigo: 200, data: asignaciones }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que crea un entrenamiento para una categoria siempre y
  cuando todos los datos sean validos
*/
async function crearEntrenamiento (id_deporte, id_categoria, entrenamiento) {
  try {
    // validamos las ids y los datos del entrenamiento
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    entrenamiento = {
      fecha:  entrenamiento.fecha.trim(),
      nombre: entrenamiento.nombre ? entrenamiento.nombre.trim() : ''
    };
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    if (!validador.validarFechaObligatoria(entrenamiento.fecha).estado) 
      return { codigo: 422, texto: validador.validarFechaObligatoria(entrenamiento.fecha).texto }
    if (!validador.validarNombreEntrenamiento(entrenamiento.nombre).estado)
      return { codigo: 422, texto: validador.validarNombreEntrenamiento(entrenamiento.nombre).texto }
    
    // Insertamos los datos del entrenamiento
    await bd.query(
      `INSERT INTO entrenamientos VALUES (nextval('entrenamientos_id_seq'), $1, $2, TO_DATE($3, 'dd/mm/yyyy'), $4)`,
      [id_categoria, id_deporte, entrenamiento.fecha, entrenamiento.nombre || '']
    );

    // Retornamos un codigo 200 con los datos
    return { codigo: 200, texto: 'Entrenamiento registrado con éxito.' }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que editar un entrenamiento para una categoria siempre y
  cuando todos los datos sean validos y este exista
*/
async function editarEntrenamiento (id_deporte, id_categoria, id, entrenamiento) {
  try {
    // validamos las ids y los datos del entrenamiento
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    id = parseInt(id);
    entrenamiento = {
      fecha:  entrenamiento.fecha.trim(),
      nombre: entrenamiento.nombre ? entrenamiento.nombre.trim() : ''
    };
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    if (!validador.validarFechaObligatoria(entrenamiento.fecha).estado) 
      return { codigo: 422, texto: validador.validarFechaObligatoria(entrenamiento.fecha).texto }
    if (!validador.validarNombreEntrenamiento(entrenamiento.nombre).estado)
      return { codigo: 422, texto: validador.validarNombreEntrenamiento(entrenamiento.nombre).texto }
    
    // Verificamos que el entrenamiento exista
    let verify = await bd.query(
      `SELECT EXISTS (SELECT e.fecha FROM entrenamientos e WHERE e.id = $1 AND e.id_categoria = $2 AND e.id_deporte = $3) AS existe`,
      [id, id_categoria, id_deporte]
    );
    if (!verify.rows[0].existe) return { codigo: 400, texto: 'Este entrenamiento no existe.' }

    // Actualizamos los datos del entrenamiento
    await bd.query(
      `UPDATE entrenamientos SET fecha = TO_DATE($1, 'dd/mm/yyyy'), nombre = $2 WHERE id = $3 
       AND id_categoria = $4 AND id_deporte = $5`,
      [entrenamiento.fecha, entrenamiento.nombre || '', id, id_categoria, id_deporte]
    );

    // Retornamos un codigo 200
    return { codigo: 200, texto: 'Entrenamiento editado con éxito.' }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que elimina un entrenamiento con las ids dadas
  siempre y cuando este exista y las ids sean validas
*/
async function eliminarEntrenamiento(id_deporte, id_categoria, id) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    id = parseInt(id);
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    
    // Verificamos que el entrenamiento exista
    let verify = await bd.query(
      `SELECT EXISTS (SELECT e.fecha FROM entrenamientos e WHERE e.id = $1 AND e.id_categoria = $2 AND e.id_deporte = $3) AS existe`,
      [id, id_categoria, id_deporte]
    );
    if (!verify.rows[0].existe) return { codigo: 400, texto: 'Este entrenamiento no existe.' }

    // Eliminamos los datos del entrenamiento y tambien las participaciones de este entrenamiento
    await bd.query(
      `DELETE FROM participaciones WHERE id_entrenamiento = $1 AND id_categoria_ent = $2 AND id_deporte_ent = $3`,
      [id, id_categoria, id_deporte]
    );
    await bd.query(
      `DELETE FROM entrenamientos WHERE id = $1 AND id_categoria = $2 AND id_deporte = $3`,
      [id, id_categoria, id_deporte]
    )

    // Retornamos un codigo 200
    return { codigo: 200, texto: 'Entrenamiento eliminado con éxito.' }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

module.exports = { 
  obtenerCategorias,
  obtenerEntrenamientos,
  crearEntrenamiento,
  editarEntrenamiento,
  eliminarEntrenamiento
}