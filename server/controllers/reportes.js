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
      TO_CHAR(a.fecha_nacimiento, 'dd/mm/yyyy') AS fecha_nacimiento, a.correo, i.id_categoria,
      e.nombre AS educacion, CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
      THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa, a.numero_etapa
      FROM inscripciones i, atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id
      where a.cedula = i.cedula_atleta AND i.id_categoria = $1
      ORDER BY a.cedula;`,
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
        correo: atleta.correo || 'Sin correo',
        educacion: atleta.educacion || 'No especificada',
        educacion_etapa: atleta.educacion ? `${atleta.educacion} (${atleta.tipo_etapa} #${atleta.numero_etapa})` : 'No especificada' 
      }
    });
    // Devolvemos la data obtenida en forma Array[]
    return { codigo: 200, atletas: atletas }
  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  que asistieron a una competencia previamente especificada.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function nominaCompetencia (id_deporte, id_categoria, id_competencia) {
  try {
    // validamos las ids
    id_competencia = parseInt(id_competencia);
    id_categoria = parseInt(id_categoria);
    id_deporte = parseInt(id_deporte);
  
    if (!validador.validarId(id_competencia).estado) return { codigo: 422, texto: validador.validarId(id_competencia).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    
    // Buscamos los datos basicos de los atletas que hayan asistido a la competencia previamente especificada

    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido, 
      TO_CHAR(a.fecha_nacimiento, 'dd/mm/yyyy') AS fecha_nacimiento, a.correo, i.id_categoria,
      e.nombre AS educacion, CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
      THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa, a.numero_etapa
      FROM inscripciones i, participaciones p, atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id
      WHERE a.cedula = i.cedula_atleta AND p.asistencia = true AND i.cedula_atleta = p.cedula_atleta AND
      i.id_categoria = p.id_categoria AND i.id_deporte = p.id_deporte
      AND $1 = p.id_deporte_comp AND $2 = p.id_categoria_comp AND $3 = p.id_competencia
      ORDER BY a.cedula;`,
       [id_deporte, id_categoria, id_competencia] 
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
        correo: atleta.correo || 'Sin correo',
        educacion: atleta.educacion || 'No especificada',
        educacion_etapa: atleta.educacion ? `${atleta.educacion} (${atleta.tipo_etapa} #${atleta.numero_etapa})` : 'No especificada' 
      }
    });
    
    // Devolvemos la data obtenida en forma Array[]
    return { codigo: 200, atletas: atletas }
  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  que hayan participado en los entrenamientos que se encuentre en el período especificado.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function asistenciaGeneralEntrenamientos (id_deporte, id_categoria, tipo_asistencia, fecha=null) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }

    // Buscamos los entrenamientos

    let entrenamientos;

    if(tipo_asistencia === 'total'){
      entrenamientos = await bd.query(
        `SELECT e.id, TO_CHAR(e.fecha, 'dd/mm/yyyy') AS fecha, e.nombre FROM entrenamientos e 
         WHERE e.id_deporte = $1 AND e.id_categoria = $2 ORDER BY e.fecha DESC, e.nombre`,
        [id_deporte, id_categoria]
      );
    }
    else{
      entrenamientos = await bd.query(
        `SELECT e.id, TO_CHAR(e.fecha, 'dd/mm/yyyy') AS fecha, e.nombre
         FROM entrenamientos e 
         WHERE e.id_deporte = $1 AND e.id_categoria = $2 AND SUBSTR(TO_CHAR(fecha, 'YYYY/DD/MM'),1,4) = $3 AND SUBSTR(TO_CHAR(fecha, 'MM/DD/YYYY'),1,2) = $4
         ORDER BY e.fecha DESC, e.nombre`,
        [id_deporte, id_categoria, fecha[0], fecha[1]]
      );
    }

    entrenamientos = entrenamientos.rows;

    if(!entrenamientos.length) return { codigo: 200, entrenamientos: entrenamientos }

    //se obtienen los ids de todos los entrenamientos en el período seleccionado
    entrenamientos_id = entrenamientos.map(entrenamiento =>{
      return parseInt(entrenamiento.id)
    })

    /*
      Se buscan todos los atletas que estén inscritos en el equipo respectivo y que hayan
      faltado o participado en los entrenamientos del equipo
    */ 
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido
       FROM atletas a, inscripciones i, participaciones p
       WHERE a.cedula = i.cedula_atleta AND $1 = i.id_deporte AND $2 = i.id_categoria AND
       i.cedula_atleta = p.cedula_atleta AND i.id_deporte = p.id_deporte AND
       i.id_categoria = p.id_categoria AND p.asistencia IS NOT NULL AND p.id_entrenamiento= any ($3::int[])
       GROUP BY a.cedula ORDER BY a.cedula;`,
       [id_deporte, id_categoria, entrenamientos_id] 
    );

    atletas = atletas.rows;

    // Transformamos la data a la requerida
    atletas = await Promise.all(atletas.map(async (atleta) => {
      let nombres = [
        atleta.primer_nombre,
        atleta.segundo_nombre || '',
        atleta.primer_apellido,
        atleta.segundo_apellido
      ];

      //se buscan las asistencias de cada atleta para los entrenamientos del período especificado
      let asistencias = await bd.query(
        `SELECT COUNT(*) FROM participaciones p WHERE p.cedula_atleta = $1 
         AND p.id_deporte_ent = $2 AND p.id_categoria_ent = $3 AND p.asistencia = TRUE
         AND p.id_entrenamiento = any ($4::int[])`,
        [atleta.cedula, id_deporte, id_categoria, entrenamientos_id ]
      );
      asistencias = parseInt(asistencias.rows[0].count);

      //se buscan las faltas de cada atleta para los entrenamientos del período especificado
      let faltas = await bd.query(
        `SELECT COUNT(*) FROM participaciones p WHERE p.cedula_atleta = $1 
         AND p.id_deporte_ent = $2 AND p.id_categoria_ent = $3 AND p.asistencia = FALSE
         AND p.id_entrenamiento = any ($4::int[])`,
        [atleta.cedula, id_deporte, id_categoria, entrenamientos_id]
      );
      faltas = parseInt(faltas.rows[0].count);
      
      return {
        cedula: atleta.cedula,
        nombre_completo: nombres.join(' ').replace(/ +/g, " "),
        asistencias: `${asistencias} ${asistencias === 1 ? 'Asistencia' : 'Asistencias'}`,
        faltas: `${faltas} ${faltas === 1 ? 'Falta' : 'Faltas'}`,
        porcentaje: 
          parseFloat(
            (asistencias / (asistencias + faltas)) * 100 || 0
          ).toFixed(2) + " %"
      }
    }));
  
    // Si todo sale bien
    return { codigo: 200, atletas, entrenamientos }
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'}; 
  }
}

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  que hayan participado en las competencias que se encuentre en el período especificado.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function asistenciaGeneralCompetencias (id_deporte, id_categoria, tipo_asistencia, fecha=null) {
  try {
    // validamos las ids
    id_deporte = parseInt(id_deporte);
    id_categoria = parseInt(id_categoria);
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }

    // Buscamos las competencias

    let competencias;

    if(tipo_asistencia === 'total'){
      competencias = await bd.query(
        `SELECT c.id, c.nombre FROM competencias c 
         WHERE c.id_deporte = $1 AND c.id_categoria = $2 ORDER BY c.nombre`,
        [id_deporte, id_categoria]
      );
    }
    else{
      competencias = await bd.query(
        `SELECT c.id, c.nombre
         FROM competencias c 
         WHERE c.id_deporte = $1 AND c.id_categoria = $2 AND
         (
          (SUBSTR(TO_CHAR(c.fecha_inicio, 'YYYY/DD/MM'),1,4) = $3 AND 
          CAST(SUBSTR(TO_CHAR(c.fecha_inicio, 'MM/DD/YYYY'),1,2) AS INTEGER) <= $4) AND 
          (c.fecha_fin IS NULL OR (SUBSTR(TO_CHAR(c.fecha_fin, 'YYYY/DD/MM'),1,4) = $3 AND 
          CAST(SUBSTR(TO_CHAR(c.fecha_fin, 'MM/DD/YYYY'),1,2) AS INTEGER) >= $4))
         )
         ORDER BY c.nombre`,
        [id_deporte, id_categoria, fecha[0], parseInt(fecha[1])]
      );
    }
    
    competencias = competencias.rows

    if(!competencias.length) return { codigo: 200, competencias: competencias }

    //se obtienen los ids de todos los entrenamientos en el período seleccionado
    competencias_id = competencias.map(competencia =>{
      return parseInt(competencia.id)
    })

    /*
      Se buscan todos los atletas que estén inscritos en el equipo respectivo y que hayan
      faltado o participado a las competencias del equipo
    */ 
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido
       FROM atletas a, inscripciones i, participaciones p
       WHERE a.cedula = i.cedula_atleta AND $1 = i.id_deporte AND $2 = i.id_categoria AND
       i.cedula_atleta = p.cedula_atleta AND i.id_deporte = p.id_deporte AND
       i.id_categoria = p.id_categoria AND p.asistencia IS NOT NULL AND p.id_competencia= any ($3::int[])
       GROUP BY a.cedula ORDER BY a.cedula;`,
       [id_deporte, id_categoria, competencias_id] 
    );

    atletas = atletas.rows;

    // Transformamos la data a la requerida
    atletas = await Promise.all(atletas.map(async (atleta) => {
      let nombres = [
        atleta.primer_nombre,
        atleta.segundo_nombre || '',
        atleta.primer_apellido,
        atleta.segundo_apellido
      ];

      //se buscan las asistencias de cada atleta para las competencias del período especificado
      let asistencias = await bd.query(
        `SELECT COUNT(*) FROM participaciones p WHERE p.cedula_atleta = $1 
         AND p.id_deporte_comp = $2 AND p.id_categoria_comp = $3 AND p.asistencia = TRUE
         AND p.id_competencia = any ($4::int[])`,
        [atleta.cedula, id_deporte, id_categoria, competencias_id]
      );
      asistencias = parseInt(asistencias.rows[0].count);

      //se buscan las faltas de cada atleta para las competencias del período especificado
      let faltas = await bd.query(
        `SELECT COUNT(*) FROM participaciones p WHERE p.cedula_atleta = $1 
         AND p.id_deporte_comp = $2 AND p.id_categoria_comp = $3 AND p.asistencia = FALSE
         AND p.id_competencia = any ($4::int[])`,
        [atleta.cedula, id_deporte, id_categoria, competencias_id]
      );
      faltas = parseInt(faltas.rows[0].count);
      

      return {
        cedula: atleta.cedula,
        nombre_completo: nombres.join(' ').replace(/ +/g, " "),
        asistencias: `${asistencias} ${asistencias === 1 ? 'Asistencia' : 'Asistencias'}`,
        faltas: `${faltas} ${faltas === 1 ? 'Falta' : 'Faltas'}`,
        porcentaje: 
          parseFloat(
            (asistencias / (asistencias + faltas)) * 100 || 0
          ).toFixed(2) + " %"
      }
    }));
  
    // Si todo sale bien
    return { codigo: 200, atletas, competencias }
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'}; 
  }
}

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  que con su respectiva asistencia (asistencias o faltas) en en el entrenamiento que se encuentre previamente especificada.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function asistenciaDetalladaEntrenamientos (id_deporte, id_categoria, id_entrenamiento) {
  try {
    // validamos las ids
    id_entrenamiento = parseInt(id_entrenamiento);
    id_categoria = parseInt(id_categoria);
    id_deporte = parseInt(id_deporte);
 
    if (!validador.validarId(id_entrenamiento).estado) return { codigo: 422, texto: validador.validarId(id_entrenamiento).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
   
    /*
      Se buscan todos los atletas que estén inscritos en el equipo respectivo y que hayan
      faltado o participado en el entrenamiento especificado
    */ 
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido, a.correo, p.asistencia
       FROM atletas a, inscripciones i, participaciones p
       WHERE a.cedula = i.cedula_atleta AND $1 = i.id_deporte AND $2 = i.id_categoria AND
       i.cedula_atleta = p.cedula_atleta AND i.id_deporte = p.id_deporte AND
       i.id_categoria = p.id_categoria AND p.asistencia IS NOT NULL AND p.id_entrenamiento = $3
       ORDER BY a.cedula;`,
       [id_deporte, id_categoria, id_entrenamiento] 
    );

    atletas = atletas.rows;
    // Transformamos la data a la requerida
    atletas = await Promise.all(atletas.map(async (atleta) => {
      let nombres = [
        atleta.primer_nombre,
        atleta.segundo_nombre || '',
        atleta.primer_apellido,
        atleta.segundo_apellido
      ];
      
      return {
        cedula: atleta.cedula,
        nombre_completo: nombres.join(' ').replace(/ +/g, " "),
        correo: `${atleta.correo? atleta.correo :'Sin correo'}`,
        asistencia: `${atleta.asistencia === true? 'Sí':'No'}`,
      }
    }));
    // Si todo sale bien
    return { codigo: 200, atletas}
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'}; 
  }
}

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  con su respectiva asistencia (asistencia o falta) en la competencia que se encuentre previamente especificada.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function asistenciaDetalladaCompetencias (id_deporte, id_categoria, id_competencia) {
  try {
    // validamos las ids
    id_competencia = parseInt(id_competencia);
    id_categoria = parseInt(id_categoria);
    id_deporte = parseInt(id_deporte);
 
    if (!validador.validarId(id_competencia).estado) return { codigo: 422, texto: validador.validarId(id_competencia).texto }
    if (!validador.validarId(id_categoria).estado) return { codigo: 422, texto: validador.validarId(id_categoria).texto }
    if (!validador.validarId(id_deporte).estado) return { codigo: 422, texto: validador.validarId(id_deporte).texto }
   
    /*
      Se buscan todos los atletas que estén inscritos en el equipo respectivo y que hayan
      faltado o participado en la competencia especificado
    */ 
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido, a.correo, p.asistencia
       FROM atletas a, inscripciones i, participaciones p
       WHERE a.cedula = i.cedula_atleta AND $1 = i.id_deporte AND $2 = i.id_categoria AND
       i.cedula_atleta = p.cedula_atleta AND i.id_deporte = p.id_deporte AND
       i.id_categoria = p.id_categoria AND p.asistencia IS NOT NULL AND p.id_competencia = $3
       ORDER BY a.cedula;`,
       [id_deporte, id_categoria, id_competencia] 
    );

    atletas = atletas.rows;
    // Transformamos la data a la requerida
    atletas = await Promise.all(atletas.map(async (atleta) => {
      let nombres = [
        atleta.primer_nombre,
        atleta.segundo_nombre || '',
        atleta.primer_apellido,
        atleta.segundo_apellido
      ];
      
      return {
        cedula: atleta.cedula,
        nombre_completo: nombres.join(' ').replace(/ +/g, " "),
        correo: `${atleta.correo? atleta.correo :'Sin correo'}`,
        asistencia: `${atleta.asistencia === true? 'Sí':'No'}`,
      }
    }));
    // Si todo sale bien
    return { codigo: 200, atletas}
  }
  // Error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'}; 
  }
}

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  que tengan una beca.
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function atletasBeca () {
  try {
    // Se buscan los atletas que poseen una beca
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido,
       a.nombre_beca, a.porcentaje_beca, e.nombre AS educacion, 
       CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
       THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa, a.numero_etapa
       FROM atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id
       WHERE nombre_beca IS NOT NULL
       ORDER BY a.cedula`, 
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
        beca: `${atleta.nombre_beca} (${atleta.porcentaje_beca} %)`,
        educacion: atleta.educacion || 'No especificada',
        educacion_etapa: atleta.educacion ? `${atleta.educacion} (${atleta.tipo_etapa} #${atleta.numero_etapa})` : 'No especificada' 
      }
    });

    // si existen los atletas se retornan en forma de array con un HTTP 200
    return { codigo: 200, atletas }
    

  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

async function obtenerAtletas () {
  try {
    // Se buscan los atletas que poseen una beca
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido, e.nombre AS educacion, 
       CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
       THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa, a.numero_etapa
       FROM atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id
       ORDER BY a.cedula`, 
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
        educacion: atleta.educacion || 'No especificada',
        educacion_etapa: atleta.educacion ? `${atleta.educacion} (${atleta.tipo_etapa} #${atleta.numero_etapa})` : 'No especificada' 
      }
    });

    // si existen los atletas se retornan en forma de array con un HTTP 200
    return { codigo: 200, atletas }
    

  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

async function obtenerAtletasConDeporte () {
  try {
    // Se buscan los atletas que poseen una beca
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido, e.nombre AS educacion, 
       CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
       THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa, a.numero_etapa
       FROM atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id
       INNER JOIN historico_inscripciones h ON a.cedula = h.cedula_atleta
       GROUP BY a.cedula, e.id
       ORDER BY a.cedula`, 
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
        educacion: atleta.educacion || 'No especificada',
        educacion_etapa: atleta.educacion ? `${atleta.educacion} (${atleta.tipo_etapa} #${atleta.numero_etapa})` : 'No especificada' 
      }
    });

    // si existen los atletas se retornan en forma de array con un HTTP 200
    return { codigo: 200, atletas }
    

  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}


async function atletasHistoricoAcademico (cedula_atleta) {
  try {
    // Se busca el historico academico del atleta especificado
    let historico = await bd.query(
      `SELECT h.numero_etapa, h.nombre_educacion,
       TO_CHAR(h.fecha, 'DD/MM/YYYY') as fecha,
       CASE WHEN h.tipo_etapa = 'm' THEN 'Mensual' WHEN h.tipo_etapa = 't'
       THEN 'Trimestral' WHEN h.tipo_etapa = 's' THEN 'Semestral' ELSE 'Anual' END AS tipo_etapa
       FROM historico_etapas_educativas h
       WHERE h.cedula_atleta = $1
       ORDER BY fecha DESC, id DESC`, [cedula_atleta] 
    );

    historico = historico.rows;

    // Transformamos la data a la requerida
    historico = historico.map((hist) => {

      return {
        fecha: hist.fecha,
        tipo_etapa: hist.nombre_educacion? `${hist.tipo_etapa}` : 'No especificada',
        nombre_educacion: hist.nombre_educacion || 'No especificada',
        numero_etapa: hist.nombre_educacion ? `${hist.numero_etapa}` : 'No especificada' 
      }
    });

    // si existen los atletas se retornan en forma de array con un HTTP 200
    return { codigo: 200, historico }
    

  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

async function atletasHistoricoDeportivo (cedula_atleta) {
  try {

    let historicoAcademico = await bd.query(
      `SELECT h.numero_etapa, h.nombre_educacion, h.id,
       CASE WHEN h.tipo_etapa = 'm' THEN 'Mes' WHEN h.tipo_etapa = 't'
       THEN 'Trimestre' WHEN h.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa
       FROM historico_etapas_educativas h
       WHERE h.cedula_atleta = $1
       ORDER BY fecha DESC, id DESC`, [cedula_atleta] 
    );

    historicoAcademico = historicoAcademico.rows;

    // Transformamos la data a la requerida
    historicoAcademico = historicoAcademico.map((hist) => {

      return {
        id : hist.id,
        educacion: hist.nombre_educacion? `${hist.nombre_educacion} - ${hist.tipo_etapa} #${hist.numero_etapa}`: 'No especificada'
      }
    });

    // Se busca el historico deportivo del atleta especificado
    let historicoDeportivo = await bd.query(
      `SELECT h.nombre_deporte, h.nombre_categoria, h.nombre_posicion, h.id_etapa,
       TO_CHAR(h.fecha, 'DD/MM/YYYY') as fecha,
       CASE WHEN h.genero_categoria = 'm' THEN 'Masculino' WHEN h.genero_categoria = 'f'
       THEN 'Femenino' ELSE 'Unisex' END AS genero_categoria
       FROM historico_inscripciones h
       WHERE h.cedula_atleta = $1
       ORDER BY h.fecha DESC, h.id DESC`, [cedula_atleta] 
    );

    historicoDeportivo = historicoDeportivo.rows;

    // Transformamos la data a la requerida
    historicoDeportivo = historicoDeportivo.map((hist) => {

      return {
        id_etapa: hist.id_etapa,
        fecha: hist.fecha,
        posicion: hist.nombre_posicion? `${hist.nombre_posicion}` : 'No especificada',
        nombre_deporte: hist.nombre_deporte,
        nombre_categoria: hist.nombre_categoria,
        genero_categoria: hist.genero_categoria
      }
    });

    historico = {
      historicoAcademico,
      historicoDeportivo
    }
  
    // si existen los atletas se retornan en forma de array con un HTTP 200
    return { codigo: 200, historico }
    

  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}



module.exports = {
  nominaEquipo,
  nominaCompetencia,
  asistenciaGeneralEntrenamientos,
  asistenciaGeneralCompetencias,
  asistenciaDetalladaEntrenamientos,
  asistenciaDetalladaCompetencias,
  atletasBeca,
  atletasHistoricoAcademico,
  atletasHistoricoDeportivo,
  obtenerAtletas,
  obtenerAtletasConDeporte,
}