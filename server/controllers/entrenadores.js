// Importamos Bcrypt, Instanciamos la conexión a la BD , e importamos el validador de los datos del usuario
const bcrypt = require('bcrypt');
const bd = require('../conexion');
const validador = require('./validador');

//funcion para insertar usuarios
async function insertar_usuario(datos_usuario){

  try {

    datos_usuario.correo = datos_usuario.correo.toLowerCase();
    // Validamos la informacion del usuario
    let check = validador.validarCedula(datos_usuario.cedula);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarNombre(datos_usuario.primer_nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarNombre(datos_usuario.primer_apellido);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarNombre(datos_usuario.segundo_apellido);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarSegundoNombre(datos_usuario.segundo_nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarClave(datos_usuario.clave);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarCorreo(datos_usuario.correo);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarFecha(datos_usuario.fecha_nacimiento);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarRol(datos_usuario.rol);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarTelefono(datos_usuario.telefono);
    if (!check.estado) return { codigo: 422, texto: check.texto }

    // Chequeamos si existen usuarios con valores únicos iguales a los inputs
    let check_uniques = {
      cedula: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE cedula = $1) AS "existe"`, [datos_usuario.cedula]),
      correo: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE correo = $1) AS "existe"`, [datos_usuario.correo]),
      telefono: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE telefono = $1) AS "existe"`, [datos_usuario.telefono]),
    }

    // En caso de que ya exista un usuario con algun dato unico
    if (check_uniques.cedula.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con la cédula introducida' }
    if (check_uniques.correo.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con el correo electrónico introducido' }
    if (check_uniques.telefono.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con el teléfono introducido' }

    return insertar(datos_usuario);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}


//funcion encargada de insertar los datos del usuario, es llamada luego de realizar todas
//las validaciones y verificaciones respectivas
async function insertar(datos_usuario){
  try{
    let salt = bcrypt.genSaltSync(10);
    let hash_clave = bcrypt.hashSync(datos_usuario.clave, salt);
    await bd.query(`INSERT INTO usuarios VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TO_DATE($10, 'dd/mm/yyyy'))`,
      [
        datos_usuario.cedula,
        datos_usuario.rol,
        datos_usuario.primer_nombre,
        datos_usuario.primer_apellido,
        datos_usuario.segundo_apellido,
        datos_usuario.correo,
        hash_clave,
        datos_usuario.segundo_nombre || null,
        datos_usuario.telefono || null,
        datos_usuario.fecha_nacimiento || null
      ]
    );
    return { codigo: 200, texto: 'Usuario creado exitosamente'}
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

//funcion que obtiene todos los usuarios registrados en la base de datos
async function listar_usuarios(){
  try {
    let usuarios = await bd.query(
      `SELECT u.cedula, u.primer_nombre, COALESCE(u.segundo_nombre, '') segundo_nombre, u.primer_apellido,
       u.segundo_apellido, CASE WHEN u.rol = 'a' THEN 'Administrador' ELSE 'Entrenador' END AS rol, u.correo,
       COALESCE(TO_CHAR(u.fecha_nacimiento, 'dd/mm/yyyy'), '') AS fecha_nacimiento, COALESCE(u.telefono, '') AS telefono FROM usuarios u
       ORDER BY u.cedula`
    );
    usuarios = usuarios.rows;

    if(usuarios.length){
      return { codigo: 200, usuarios}
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

async function editar_usuario(cedula_usuario, datos_usuario){
  try {

    // Chequeamos si existen usuarios con valores únicos iguales a los inputs    
    let check_uniques = {
      cedula: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE cedula = $1 AND cedula != $2) AS "existe"`, [datos_usuario.cedula, cedula_usuario]),
      correo: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE correo = $1 AND cedula != $2) AS "existe"`, [datos_usuario.correo, cedula_usuario]),
      telefono: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE telefono = $1 AND cedula != $2) AS "existe"`, [datos_usuario.telefono, cedula_usuario]),
    }
    // En caso de que ya exista un usuario con algun dato único
    if (check_uniques.cedula.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con la cédula introducida' }
    if (check_uniques.correo.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con el correo electrónico introducido' }
    if (check_uniques.telefono.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con el teléfono introducido' }

    //actualizar
    // Si no hay ningun usuario con datos únicos ya tomados, realizamos el UPDATE de los datos
    // para los valores NULLABLE se insertara el valor (si existe) o NULL en caso de que no se hayan colocado
    await bd.query(
      `UPDATE usuarios SET cedula = $1, primer_nombre = $2, primer_apellido = $3, segundo_apellido = $4,
        fecha_nacimiento = TO_DATE($5, 'dd/mm/yyyy'),segundo_nombre = $6, correo = $7,
        telefono = $8, rol = $9 WHERE cedula = $10`, 
      [
        datos_usuario.cedula,
        datos_usuario.primer_nombre,
        datos_usuario.primer_apellido,
        datos_usuario.segundo_apellido,
        datos_usuario.fecha_nacimiento || null,
        datos_usuario.segundo_nombre || null,
        datos_usuario.correo.toLowerCase(),
        datos_usuario.telefono || null,
        datos_usuario.rol,
        cedula_usuario
      ]
    );

    // Luego del update retornamos un codigo de exito 200
    return { codigo: 200, texto: 'Usuario editado exitosamente' };

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

async function editar_clave_usuario(cedula_usuario, clave_usuario){
  try {
    let salt = bcrypt.genSaltSync(10);
    let hash_clave = bcrypt.hashSync(clave_usuario, salt);

    //se actualiza la contraseña del usuario
    await bd.query(
      `UPDATE usuarios SET clave = $1 WHERE cedula = $2`, 
      [
        hash_clave,
        cedula_usuario
      ]
    );
    // Luego del update retornamos un codigo de exito 200
    return { codigo: 200, texto: 'Contraseña actualizada exitosamente' };

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

module.exports = {
  insertar_usuario,
  listar_usuarios,
  editar_usuario,
  editar_clave_usuario
}