/* instanciamos la conexión a la bd */
const bd = require('../conexion');
const validador = require('./validador');
const helper_fechas = require('../helpers/fechas');

/*
  Funcion que devuelve todas las competencias de la categoria de un deporte
  de la siguiente manera 
  competencias = [
    {
      id: Number,
      nombre: String,
      estatus: Number,
      fecha_inicio: Date (String 'dd/mm/yyyy'),
      fecha_fin: Date (String 'dd/mm/yyyy'),
      faltas: Number
    }
  ]
*/
async function obtenerCompetencias (id_deporte, id_categoria) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    /* 
      No es necesario verificar la existencia de la categoria, ya que la unica forma de llegar a esta funcion es que esta exista 
      y el usuario tenga acceso a ella (routerCompetencias)
    */
    // Buscamos las competencias
    let competencias = await bd.query(
      `SELECT c.id, c.nombre, c.estatus, TO_CHAR(c.fecha_inicio,'dd/mm/yyyy') AS fecha_inicio, 
       TO_CHAR(c.fecha_fin, 'dd/mm/yyyy') AS fecha_fin FROM competencias c
       WHERE c.id_deporte = $1 AND c.id_categoria = $2 ORDER BY c.fecha_inicio DESC, c.fecha_fin DESC, c.nombre`,
      [id_deporte, id_categoria]
    );
    competencias = competencias.rows;

    competencias = await Promise.all(competencias.map(async function (item) {
      
      return {
        id: item.id,
        nombre: item.nombre,
        estatus: item.estatus,
        fecha_inicio: item.fecha_inicio,
        fecha_fin: item.fecha_fin || 'No especificada'
      }
    }));
    // Si todo sale bien
    return { codigo: 200, competencias: competencias }
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
  Funcion que crea una competencia para una categoria siempre y
  cuando todos los datos sean validos
*/
async function crearCompetencia (id_deporte, id_categoria, competencia) {
  try {
    // validamos las ids y los datos de la competencia
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    competencia = {
      nombre: competencia.nombre ? competencia.nombre.trim() : '',
      fecha_inicio: competencia.fecha_inicio ? competencia.fecha_inicio.trim() :  '',
      fecha_fin: competencia.fecha_fin ? competencia.fecha_fin.trim() : '',
      estatus: competencia.estatus ? competencia.estatus.trim() : ''
    };
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    if (!validador.validarNombreCompetencia(competencia.nombre).estado)
      return { codigo: 422, texto: validador.validarNombreCompetencia(competencia.nombre).texto }
    if (!validador.validarFechaObligatoria(competencia.fecha_inicio).estado) 
      return { codigo: 422, texto: validador.validarFechaObligatoria(competencia.fecha_inicio).texto }
    if (!validador.validarFecha(competencia.fecha_fin).estado) 
      return { codigo: 422, texto: validador.validarFecha(competencia.fecha_fin).texto }
    if (!validador.validarEstatusCompetencia(competencia.estatus).estado) 
      return { codigo: 422, texto: validador.validarEstatusCompetencia(competencia.estatus).texto }
    if (competencia.fecha_fin && !helper_fechas(competencia.fecha_inicio, competencia.fecha_fin))
      return { codigo: 422, texto: 'La fecha fin debe ser mayor o igual a la fecha inicio.' }
    
    // Insertamos los datos de la competencia
    await bd.query(
      `INSERT INTO competencias VALUES (nextval('competencias_id_seq'), $1, $2, $3, $4, 
       TO_DATE($5, 'dd/mm/yyyy'), TO_DATE($6, 'dd/mm/yyyy'))`,
      [id_categoria, id_deporte, competencia.nombre, competencia.estatus, competencia.fecha_inicio, competencia.fecha_fin || null]
    );

    // Retornamos un codigo 200 con los datos
    return { codigo: 200, texto: 'Competencia registrada con éxito.' }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que editar ua competencia para una categoria siempre y
  cuando todos los datos sean validos y esta exista
*/
async function editarCompetencia (id_deporte, id_categoria, id, competencia) {
  try {
    // validamos las ids y los datos de la competencia
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    id = parseInt(id);
    competencia = {
      nombre: competencia.nombre ? competencia.nombre.trim() : '',
      fecha_inicio: competencia.fecha_inicio ? competencia.fecha_inicio.trim() :  '',
      fecha_fin: competencia.fecha_fin ? competencia.fecha_fin.trim() : '',
      estatus: competencia.estatus ? competencia.estatus.trim() : ''
    };
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    if (!validador.validarNombreCompetencia(competencia.nombre).estado)
      return { codigo: 422, texto: validador.validarNombreCompetencia(competencia.nombre).texto }
    if (!validador.validarFechaObligatoria(competencia.fecha_inicio).estado) 
      return { codigo: 422, texto: validador.validarFechaObligatoria(competencia.fecha_inicio).texto }
    if (!validador.validarFecha(competencia.fecha_fin).estado) 
      return { codigo: 422, texto: validador.validarFecha(competencia.fecha_fin).texto }
    if (!validador.validarEstatusCompetencia(competencia.estatus).estado) 
      return { codigo: 422, texto: validador.validarEstatusCompetencia(competencia.estatus).texto }
    if (competencia.fecha_fin && !helper_fechas(competencia.fecha_inicio, competencia.fecha_fin))
      return { codigo: 422, texto: 'La fecha fin debe ser mayor o igual a la fecha inicio.' }
    
    // Verificamos que la competencia exista
    let verify = await bd.query(
      `SELECT EXISTS (SELECT c.nombre FROM competencias c WHERE c.id = $1 AND c.id_categoria = $2 AND c.id_deporte = $3) AS existe`,
      [id, id_categoria, id_deporte]
    );
    if (!verify.rows[0].existe) return { codigo: 400, texto: 'Esta competencia no existe.' }

    // Actualizamos los datos de la competencia
    await bd.query(
      `UPDATE competencias SET nombre = $1, estatus = $2, fecha_inicio = TO_DATE($3, 'dd/mm/yyyy'), 
       fecha_fin = TO_DATE($4, 'dd/mm/yyyy') WHERE id = $5 AND id_categoria = $6 AND id_deporte = $7`,
      [competencia.nombre, competencia.estatus, competencia.fecha_inicio, competencia.fecha_fin || null, id, id_categoria, id_deporte]
    );

    // Retornamos un codigo 200
    return { codigo: 200, texto: 'Competencia editada con éxito.' }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que elimina un competencia con las ids dadas
  siempre y cuando este exista y las ids sean validas
*/
async function eliminarCompetencia(id_deporte, id_categoria, id) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    id = parseInt(id);
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    
    // Verificamos que la competencia exista
    let verify = await bd.query(
      `SELECT EXISTS (SELECT c.nombre FROM competencias c WHERE c.id = $1 AND c.id_categoria = $2 AND c.id_deporte = $3) AS existe`,
      [id, id_categoria, id_deporte]
    );
    if (!verify.rows[0].existe) return { codigo: 400, texto: 'Esta competencia no existe.' }

    // Eliminamos los datos de la competencia, participaciones de la competencia y rendimientos
    await bd.query(
      `DELETE FROM participaciones WHERE id_competencia = $1 AND id_categoria_comp = $2 AND id_deporte_comp = $3`,
      [id, id_categoria, id_deporte]
    );
    await bd.query(
      `DELETE FROM rendimientos WHERE id_competencia = $1 AND id_categoria = $2 AND id_deporte_comp = $3`,
      [id, id_categoria, id_deporte]
    );
    await bd.query(
      `DELETE FROM competencias WHERE id = $1 AND id_categoria = $2 AND id_deporte = $3`,
      [id, id_categoria, id_deporte]
    );

    // Retornamos un codigo 200
    return { codigo: 200, texto: 'Competencia eliminada con éxito.' }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que obbtiene las participaciones de una competencia siempre y cuando
  esta xista
  Los datos a retornar son los siguientes
  participaciones = [
    {
      cedula: String,
      nombre_completo: String,
      asistencia: Boolean or Null
    }
  ]
  Esta funcion retornara basicamente todos los atletas inscritos en la categoria junto
  con su atributo de asistencia en la tabla participaciones, en caso de que no tenga dicho
  atributo la funcion sencillamente retornara null en dicho atributo
*/
async function obtenerParticipaciones (id_deporte, id_categoria, id) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    id = parseInt(id);
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    
    let participaciones = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido,
      (SELECT p.asistencia FROM participaciones p WHERE p.cedula_atleta = a.cedula
      AND p.id_competencia = $1 AND p.id_deporte_comp = $2 AND p.id_categoria_comp = $3 ) AS asistencia
      FROM atletas a INNER JOIN inscripciones i on a.cedula = i.cedula_atleta`,
      [id, id_deporte, id_categoria]
    );

    participaciones = participaciones.rows;

    participaciones = participaciones.map(participacion => {
      let nombres = [
        participacion.primer_nombre,
        participacion.segundo_nombre || '',
        participacion.primer_apellido,
        participacion.segundo_apellido
      ];
      return {
        cedula: participacion.cedula,
        nombre_completo: nombres.join(' ').replace(/ +/g, " "),
        asistencia: participacion.asistencia
      }
    });

    // Retornamos un codigo 200 y la data
    return { codigo: 200, participaciones }
  } 
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que guarda el registro de asistencia de una competencia siempre y cuando
  la data sea valida y dicha exista
*/
async function guardarParticipaciones (id_deporte, id_categoria, id, data) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    id = parseInt(id);
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }

    // Validamos la data
    let validar = data.map(item => {
      if (!validador.validarCedula(item.cedula).estado) return {
        codigo: 422, 
        texto: validador.validarCedula(item.cedula).texto
      }
      else if (![true, false, null].includes(item.asistencia)) return {
        codigo: 422,
        texto: 'Valor de asistencia invalido.'
      }
      else return null;
    }).filter(item => item != null);
    if (validar.length) return validar[0];

    // Verificamos que la competencia exista
    let verify = await bd.query(
      `SELECT EXISTS (SELECT c.nombre FROM competencias c WHERE c.id = $1 AND c.id_categoria = $2 AND c.id_deporte = $3) AS existe`,
      [id, id_categoria, id_deporte]
    );
    if (!verify.rows[0].existe) return { codigo: 400, texto: 'Esta competencia no existe.' }
    // Si la competencia existe y la data es valida
    await data.forEach(async item => {
      // Si la asistencia no esta determinada, se borra si exite el registro
      if (item.asistencia === null) 
        await bd.query(
          `DELETE FROM participaciones WHERE cedula_atleta = $1 AND id_competencia = $2
           AND id_categoria_comp = $3 AND id_deporte_comp = $4`,
           [item.cedula, id, id_categoria, id_deporte]
        );
      else {
        // Si la asistencia es falsa o verdadera, verificamos si existe ya un registro
        let check = await bd.query(
          `SELECT EXISTS (SELECT p.id FROM participaciones p WHERE p.cedula_atleta = $1 AND p.id_competencia = $2
           AND p.id_categoria_comp = $3 AND p.id_deporte_comp = $4) AS existe`,
          [item.cedula, id, id_categoria, id_deporte]
        );
        check = check.rows[0].existe;
        // Si existe el registro actualizamos
        if (check) {
          await bd.query(
            `UPDATE participaciones SET asistencia = $1 WHERE cedula_atleta = $2 AND id_competencia = $3
            AND id_categoria_comp = $4 AND id_deporte_comp = $5`,
            [item.asistencia, item.cedula, id, id_categoria, id_deporte]
          );
        }
        // Si no existe insertamos
        else {
          await bd.query(
            `INSERT INTO participaciones VALUES (nextval('participaciones_id_seq'), $1, $2, $3, $4, 
             $5, $6, $7, NULL, NULL, NULL )`,
            [item.cedula, id_categoria, id_deporte, item.asistencia, id, id_categoria, id_deporte]
          );
        }

      }  
      
    });
    return { codigo: 200, texto: 'Registro de asistencia guardado con éxito.' }

  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}

/*
  Funcion que retorna los rendimientos de una categoria (no es necesario verificar que exista ya que
  se verifica en el routerCompetencias) con el siguiente formato:
      competencia: {
        categoria: String,
        deporte: String,
        nombre: String,
        fecha_inicio: Date (String 'dd/mm/yyyy'),
        fecha_fin: Date (String 'dd/mm/yyyy') || Null,
        posiciones:  [
          {
            id: Number,
            nombre: String,
            atletas: [
              {
                cedula: String,
                nombre: String,
                estadisticas: [
                  {
                    id: Number,
                    nombre: String,
                    maximo: Number || Null,
                    minimo: Number || Null,
                    valor: Number || Null
                  }
                ]
              }
            ]
          }
        ]
      }
*/
async function obtenerRendimientos (id_deporte, id_categoria, id) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    id = parseInt(id);
    if (!validador.validarId(id).estado) return { codigo: 422, texto: validador.validarId(id).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    
    let competencia = {};
    // Buscamos los datos basicos de la competencia
    let query = await bd.query(
      `SELECT ca.nombre AS categoria, d.nombre AS deporte, co.nombre, TO_CHAR(co.fecha_inicio, 'dd/mm/yyyy') AS fecha_inicio,
       TO_CHAR(co.fecha_fin, 'dd/mm/yyyy') AS fecha_fin, co.estatus FROM competencias co INNER JOIN categorias ca ON
       ca.id = co.id_categoria AND ca.id_deporte = co.id_deporte INNER JOIN deportes d ON co.id_deporte = d.id
       WHERE co.id = $1 AND co.id_deporte = $2 AND co.id_categoria = $3`,
       [id, id_deporte, id_categoria]
    );
    query = query.rows[0];
    
    // Buscamos las posiciones del deporte y los atletas libres (sin posición)
    competencia = {
      categoria: query.categoria,
      deporte: query.deporte,
      nombre: query.nombre,
      fecha_inicio: query.fecha_inicio,
      fecha_fin: query.fecha_fin || null,
      estatus: query.estatus,
      atletas_libres: await bd.query(
        `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido FROM atletas a
        INNER JOIN inscripciones i ON i.cedula_atleta = a.cedula WHERE i.id_categoria = $1 AND i.id_deporte = $2
        AND i.id_posicion IS NULL AND i.id_deporte_pos = $3 ORDER BY a.cedula`,
        [id_categoria, id_deporte, id_deporte]
      ),
      posiciones: await bd.query(`SELECT p.id, p.nombre FROM posiciones p WHERE p.id_deporte = $1`, [id_deporte])
    };
    competencia.posiciones = competencia.posiciones.rows;
    
    // Para cada posicion vamos a buscar a los atletas que esten inscritos en la categoria con dicha posicion
    competencia.posiciones = await Promise.all(competencia.posiciones.map(async posicion => {
      let atletas = await bd.query(
        `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido FROM atletas a
         INNER JOIN inscripciones i ON i.cedula_atleta = a.cedula WHERE i.id_categoria = $1 AND i.id_deporte = $2
         AND i.id_posicion = $3 AND i.id_deporte_pos = $4 ORDER BY a.cedula`,
         [id_categoria, id_deporte, posicion.id, id_deporte]
      );
      // Para cada atleta buscaremos las estadisticas que tiene su posicion, en caso de que tenga
      // registrado un rendimiento se coloca su valor, sino se coloca un NULL
      return {
        id: posicion.id,
        nombre: posicion.nombre,
        atletas: await Promise.all(atletas.rows.map(async atleta => {
          let nombres = [
            atleta.primer_nombre,
            atleta.segundo_nombre || '',
            atleta.primer_apellido,
            atleta.segundo_apellido
          ];
          let estadisticas = await bd.query(
            `SELECT e.id, e.nombre, e.maximo, e.minimo FROM estadisticas e
             WHERE e.id_posicion = $1 AND e.id_deporte = $2 ORDER BY e.nombre`,
            [posicion.id, id_deporte]
          );
          return {
            cedula: atleta.cedula,
            nombre: nombres.join(' ').replace(/ +/g, " "),
            estadisticas: await Promise.all(estadisticas.rows.map(async estadistica => {
              let valor = await bd.query(
                `SELECT r.valor FROM rendimientos r WHERE r.cedula_atleta = $1 AND r.id_estadistica = $2
                 AND r.id_posicion = $3 AND r.id_deporte_est = $4 AND r.id_competencia = $5
                 AND r.id_categoria = $6 AND r.id_deporte_comp = $7`,
                [atleta.cedula, estadistica.id, posicion.id, id_deporte, id, id_categoria, id_deporte]
              );
              return {
                id: estadistica.id,
                nombre: estadistica.nombre,
                maximo: estadistica.maximo,
                minimo: estadistica.minimo,
                valor: valor.rowCount ? parseInt(valor.rows[0].valor) : null
              }
            }))
          };
        }))
      }
      
    }));

    // Juntamos los nombres de los atletas sin posicion
    competencia.atletas_libres = competencia.atletas_libres.rows.map(atleta => {
      let nombres = [
        atleta.primer_nombre,
        atleta.segundo_nombre || '',
        atleta.primer_apellido,
        atleta.segundo_apellido
      ];
      return {
        cedula: atleta.cedula,
        nombre: nombres.join(' ').replace(/ + /g, " ")
      }
    });


    return { codigo: 200, competencia }
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'}; 
  }
}





module.exports = { 
  obtenerCategorias,
  obtenerCompetencias,
  crearCompetencia,
  editarCompetencia,
  eliminarCompetencia,
  obtenerParticipaciones,
  guardarParticipaciones,
  obtenerRendimientos
}