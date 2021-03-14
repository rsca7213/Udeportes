/* instanciamos la conexión a la bd y el validador */
const bd = require('../conexion');
const validador = require('../controllers/validador');
const helper_edad = require('../helpers/edad');

/*
  Función que obtiene todos los datos basicos de atletas registrados en el sistema
  Datos = { cedula. mombre_completo, genero, fecha_nacimiento, correo, educacion (etapa) }
  Retornará un arreglo con los datos de los atletas registrados en el sistema y un HTTP 200
  En caso de error retornará un HTTP 500
*/
async function obtenerAtletas () {
  try {
    // Buscamos los datos basicos de los atletas en la base de datos
    let atletas = await bd.query(
      `SELECT a.cedula, a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido,
       CASE WHEN a.genero = 'm' THEN 'Masculino' ELSE 'Femenino' END AS genero, 
       TO_CHAR(a.fecha_nacimiento, 'dd/mm/yyyy') AS fecha_nacimiento, a.correo,
       e.nombre AS educacion, CASE WHEN e.tipo_etapa = 'm' THEN 'Mes' WHEN e.tipo_etapa = 't'
       THEN 'Trimestre' WHEN e.tipo_etapa = 's' THEN 'Semestre' ELSE 'Año' END AS tipo_etapa,
       a.numero_etapa FROM atletas a LEFT OUTER JOIN educaciones e ON a.id_educacion =  e.id;` 
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
  Funcion que obtiene todos los datos basicos de un atleta con la cedula especificada
*/
async function obtenerDatosBasicosAtleta (cedula) {
  try {
    // validamos la cedula
    let check = validador.validarCedula(cedula);
    if (!check.estado) return { codigo: 422, texto: check.texto }

    // buscamos al atleta con dicha cedula en la bd
    let atleta = await bd.query(
      `SELECT cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, genero,
       TO_CHAR(fecha_nacimiento, 'dd/mm/yyyy') AS fecha_nacimiento, id_educacion, correo, telefono,
       nombre_beca, porcentaje_beca, numero_etapa FROM atletas WHERE cedula=$1`, 
      [cedula]
    );

    // si el atleta existe, retornamos sus datos y un HTTP 200
    if (atleta.rowCount > 0) return { codigo: 200, atleta: atleta.rows[0] }
    // si el atleta no existe, retornamos un codigo 400
    else return { codigo: 400, texto: 'Atleta no existe' }
  }
  // En caso de error inesperado
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

/*
  Funcion que registra un atleta en caso de que los datos sean validos y
  no haya problemas de UNIQUE 
*/
async function registrarAtleta (atleta) {
  // Try para agarrar cualquier error inesperado
  try {
    // Hacemos trim de los datos String para eliminar espacios innecesarios,
    // si el atributo es NULLABLE entonces se devuelve "" si esta vacio el input
    atleta = {
      cedula: atleta.cedula,
      primer_nombre: atleta.primer_nombre.trim(),
      segundo_nombre: atleta.segundo_nombre ? atleta.segundo_nombre.trim() : "",
      primer_apellido: atleta.primer_apellido.trim(),
      segundo_apellido: atleta.segundo_apellido.trim(),
      genero: atleta.genero,
      fecha_nacimiento: atleta.fecha_nacimiento,
      id_educacion: atleta.id_educacion,
      correo: atleta.correo ? atleta.correo.trim().toLowerCase() : "",
      telefono: atleta.telefono,
      nombre_beca: atleta.nombre_beca ? atleta.nombre_beca.trim() : "",
      porcentaje_beca: atleta.porcentaje_beca,
      numero_etapa: atleta.numero_etapa
    };
  
    // Validamos todos los inputs haciendo uso del modulo validador y colocamos los resultados en el arreglo
    let validar = [];
    validar.push(validador.validarCedula(atleta.cedula));
    validar.push(validador.validarNombre(atleta.primer_nombre));
    validar.push(validador.validarSegundoNombre(atleta.segundo_nombre));
    validar.push(validador.validarNombre(atleta.primer_apellido));
    validar.push(validador.validarNombre(atleta.segundo_apellido));
    validar.push(validador.validarGenero(atleta.genero));
    validar.push(validador.validarFechaObligatoria(atleta.fecha_nacimiento));
    validar.push(validador.validarEducacionAtleta({ id: atleta.id_educacion, etapa: atleta.numero_etapa }));
    validar.push(validador.validarCorreoOpcional(atleta.correo));
    validar.push(validador.validarTelefono(atleta.telefono));
    validar.push(validador.validarBeca({ nombre: atleta.nombre_beca, porcentaje: atleta.porcentaje_beca }));
    // Si hay algun error de validacion
    if(validar.filter(item => !item.estado).length > 0) return {
      codigo: 422,
      texto: validar.filter(item => !item.estado)[0].texto
    }
    // Si los datos son validos
    else {
      // Chequeamos si existen atletas con valores unicos iguales a los inputs
      let check_uniques = {
        cedula: await bd.query(`SELECT EXISTS (SELECT 1 FROM atletas WHERE cedula = $1) AS "existe"`, [atleta.cedula]),
        correo: await bd.query(`SELECT EXISTS (SELECT 1 FROM atletas WHERE correo = $1) AS "existe"`, [atleta.correo]),
        telefono: await bd.query(`SELECT EXISTS (SELECT 1 FROM atletas WHERE telefono = $1) AS "existe"`, [atleta.telefono]),
      }

      // En caso de que ya exista un atleta con algun dato unico
      if (check_uniques.cedula.rows[0].existe) return { codigo: 400, texto: 'Ya existe un atleta con la cedula introducida' }
      if (check_uniques.correo.rows[0].existe) return { codigo: 400, texto: 'Ya existe un atleta con el correo electrónico introducido' }
      if (check_uniques.telefono.rows[0].existe) return { codigo: 400, texto: 'Ya existe un atleta con el teléfono introducido' }

      // Si no hay ningun atleta con datos unicos ya tomados, realizamos el INSERT de los datos
      // para los valores NULLABLE se insertara el valor (si existe) o NULL en caso de que no se hayan colocado
      await bd.query(
        `INSERT INTO atletas VALUES ($1, $2, $3, $4, $5, TO_DATE($6, 'dd/mm/yyyy'), $7, $8, $9, $10, $11, $12, $13)`,
        [
          atleta.cedula,
          atleta.primer_nombre,
          atleta.primer_apellido,
          atleta.segundo_apellido,
          atleta.genero,
          atleta.fecha_nacimiento,
          atleta.id_educacion || null,
          atleta.segundo_nombre || null,
          atleta.correo || null,
          atleta.telefono || null,
          atleta.nombre_beca || null,
          atleta.porcentaje_beca || null,
          atleta.numero_etapa || null
        ]
      );

      // Luego del insert retornamos un codigo de exito 200
      return { codigo: 200 }
    }
  }
  // Error inesperado, retornamos HTTP 500
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

/*
  Funcion que actualiza un atleta en caso de que los datos sean validos y
  no haya problemas de UNIQUE con otros atletas
*/
async function editarAtleta (cedula, atleta) {
  // Try para agarrar cualquier error inesperado
  try {
    // Hacemos trim de los datos String para eliminar espacios innecesarios,
    // si el atributo es NULLABLE entonces se devuelve "" si esta vacio el input
    atleta = {
      cedula: atleta.cedula,
      primer_nombre: atleta.primer_nombre.trim(),
      segundo_nombre: atleta.segundo_nombre ? atleta.segundo_nombre.trim() : "",
      primer_apellido: atleta.primer_apellido.trim(),
      segundo_apellido: atleta.segundo_apellido.trim(),
      genero: atleta.genero,
      fecha_nacimiento: atleta.fecha_nacimiento,
      id_educacion: atleta.id_educacion,
      correo: atleta.correo ? atleta.correo.trim().toLowerCase() : "",
      telefono: atleta.telefono,
      nombre_beca: atleta.nombre_beca ? atleta.nombre_beca.trim() : "",
      porcentaje_beca: atleta.porcentaje_beca,
      numero_etapa: atleta.numero_etapa
    };
  
    // Validamos todos los inputs haciendo uso del modulo validador y colocamos los resultados en el arreglo
    let validar = [];
    validar.push(validador.validarCedula(cedula));
    validar.push(validador.validarCedula(atleta.cedula));
    validar.push(validador.validarNombre(atleta.primer_nombre));
    validar.push(validador.validarSegundoNombre(atleta.segundo_nombre));
    validar.push(validador.validarNombre(atleta.primer_apellido));
    validar.push(validador.validarNombre(atleta.segundo_apellido));
    validar.push(validador.validarGenero(atleta.genero));
    validar.push(validador.validarFechaObligatoria(atleta.fecha_nacimiento));
    validar.push(validador.validarEducacionAtleta({ id: atleta.id_educacion, etapa: atleta.numero_etapa }));
    validar.push(validador.validarCorreoOpcional(atleta.correo));
    validar.push(validador.validarTelefono(atleta.telefono));
    validar.push(validador.validarBeca({ nombre: atleta.nombre_beca, porcentaje: atleta.porcentaje_beca }));
    // Si hay algun error de validacion
    if(validar.filter(item => !item.estado).length > 0) return {
      codigo: 422,
      texto: validar.filter(item => !item.estado)[0].texto
    }
    // Si los datos son validos
    else {
      // Chequeamos si existen atletas con valores unicos iguales a los inputs
      let check_uniques = {
        cedula: await bd.query(`SELECT EXISTS (SELECT 1 FROM atletas WHERE cedula = $1 AND cedula != $2) AS "existe"`, [atleta.cedula, cedula]),
        correo: await bd.query(`SELECT EXISTS (SELECT 1 FROM atletas WHERE correo = $1 AND cedula != $2) AS "existe"`, [atleta.correo, cedula]),
        telefono: await bd.query(`SELECT EXISTS (SELECT 1 FROM atletas WHERE telefono = $1 AND cedula != $2) AS "existe"`, [atleta.telefono, cedula]),
      }

      // En caso de que ya exista un atleta con algun dato unico
      if (check_uniques.cedula.rows[0].existe) return { codigo: 400, texto: 'Ya existe un atleta con la cedula introducida' }
      if (check_uniques.correo.rows[0].existe) return { codigo: 400, texto: 'Ya existe un atleta con el correo electrónico introducido' }
      if (check_uniques.telefono.rows[0].existe) return { codigo: 400, texto: 'Ya existe un atleta con el teléfono introducido' }

      // Si no hay ningun atleta con datos unicos ya tomados, realizamos el UPDATE de los datos
      // para los valores NULLABLE se insertara el valor (si existe) o NULL en caso de que no se hayan colocado
      await bd.query(
        `UPDATE atletas SET cedula = $1, primer_nombre = $2, primer_apellido = $3, segundo_apellido = $4, genero = $5,
         fecha_nacimiento = TO_DATE($6, 'dd/mm/yyyy'), id_educacion = $7, segundo_nombre = $8, correo = $9,
         telefono = $10, nombre_beca = $11, porcentaje_beca = $12, numero_etapa = $13 WHERE cedula = $14`, 
        [
          atleta.cedula,
          atleta.primer_nombre,
          atleta.primer_apellido,
          atleta.segundo_apellido,
          atleta.genero,
          atleta.fecha_nacimiento,
          atleta.id_educacion || null,
          atleta.segundo_nombre || null,
          atleta.correo || null,
          atleta.telefono || null,
          atleta.nombre_beca || null,
          atleta.porcentaje_beca || null,
          atleta.numero_etapa || null,
          cedula
        ]
      );

      // Luego del insert retornamos un codigo de exito 200
      return { codigo: 200 }
    }
  }
  // Error inesperado, retornamos HTTP 500
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

module.exports = {
  obtenerAtletas,
  registrarAtleta,
  obtenerDatosBasicosAtleta,
  editarAtleta
}