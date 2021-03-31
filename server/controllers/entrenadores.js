// Importamos Bcrypt, Instanciamos la conexión a la BD , e importamos el validador de los datos del usuario
const bcrypt = require('bcrypt');
const bd = require('../conexion');
const validador = require('./validador');

/*
  función para insertar usuarios en la base de datos
  con los datos previamente especificados
*/
async function insertarUsuario(datos_usuario){

  try {
    // Hacemos trim de los datos String para eliminar espacios innecesarios,
    // si el atributo es NULLABLE entonces se devuelve "" si esta vacio el input
    datos_usuario = {
      cedula: datos_usuario.cedula,
      primer_nombre: datos_usuario.primer_nombre.trim(),
      segundo_nombre: datos_usuario.segundo_nombre ? datos_usuario.segundo_nombre.trim() : "",
      primer_apellido: datos_usuario.primer_apellido.trim(),
      segundo_apellido: datos_usuario.segundo_apellido.trim(),
      fecha_nacimiento: datos_usuario.fecha_nacimiento,
      correo: datos_usuario.correo.trim().toLowerCase(),
      telefono: datos_usuario.telefono || null,
      clave: datos_usuario.clave,
      rol: datos_usuario.rol
    };
    
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
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}


/*
  función encargada de insertar los datos del usuario, es llamada luego de realizar todas
  las validaciones y verificaciones respectivas
*/
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
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

//funcion que obtiene todos los usuarios registrados en la base de datos
async function listarUsuarios(){
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
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

/*
  Función encargada de editar un usuario en la base de datos con la cédula especificada
*/
async function editarUsuario(datos_usuario, perfil=null){
  try {

    // Hacemos trim de los datos String para eliminar espacios innecesarios,
    // si el atributo es NULLABLE entonces se devuelve "" si esta vacio el input
    datos_usuario = {
      cedula: datos_usuario.cedula,
      primer_nombre: datos_usuario.primer_nombre.trim(),
      segundo_nombre: datos_usuario.segundo_nombre ? datos_usuario.segundo_nombre.trim() : "",
      primer_apellido: datos_usuario.primer_apellido.trim(),
      segundo_apellido: datos_usuario.segundo_apellido.trim(),
      fecha_nacimiento: datos_usuario.fecha_nacimiento,
      correo: datos_usuario.correo.trim().toLowerCase(),
      telefono: datos_usuario.telefono || null,
      rol: datos_usuario.rol
    };
    // Validamos la información del usuario
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
    check = validador.validarCorreo(datos_usuario.correo);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarFecha(datos_usuario.fecha_nacimiento);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    //si el usuario no esta editando su perfil sino que está siendo editado por un administrador
    if(!perfil){
      check = validador.validarRol(datos_usuario.rol);
      if (!check.estado) return { codigo: 422, texto: check.texto }
    }
    check = validador.validarTelefono(datos_usuario.telefono);
    if (!check.estado) return { codigo: 422, texto: check.texto }

    // Chequeamos si existen usuarios con valores únicos iguales a los inputs    
    let check_uniques = {
      correo: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE correo = $1 AND cedula != $2) AS "existe"`, [datos_usuario.correo, datos_usuario.cedula]),
      telefono: await bd.query(`SELECT EXISTS (SELECT 1 FROM usuarios WHERE telefono = $1 AND cedula != $2) AS "existe"`, [datos_usuario.telefono, datos_usuario.cedula]),
    }
    // En caso de que ya exista un usuario con algun dato único
    if (check_uniques.correo.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con el correo electrónico introducido' }
    if (check_uniques.telefono.rows[0].existe) return { codigo: 400, texto: 'Ya existe un usuario con el teléfono introducido' }

    //actualizar
    // Si no hay ningun usuario con datos únicos ya tomados, realizamos el UPDATE de los datos
    // para los valores NULLABLE se insertara el valor (si existe) o NULL en caso de que no se hayan colocado
    //si se va a editar el perfil del usuario no se agrega el rol al update
    if(perfil){
      await bd.query(
        `UPDATE usuarios SET primer_nombre = $1, primer_apellido = $2, segundo_apellido = $3,
          fecha_nacimiento = TO_DATE($4, 'dd/mm/yyyy'), segundo_nombre = $5, correo = $6,
          telefono = $7 WHERE cedula = $8`, 
        [
          datos_usuario.primer_nombre,
          datos_usuario.primer_apellido,
          datos_usuario.segundo_apellido,
          datos_usuario.fecha_nacimiento || null,
          datos_usuario.segundo_nombre || null,
          datos_usuario.correo.toLowerCase(),
          datos_usuario.telefono || null,
          datos_usuario.cedula
        ]
      );
    }
    else{
      await bd.query(
        `UPDATE usuarios SET primer_nombre = $1, primer_apellido = $2, segundo_apellido = $3,
          fecha_nacimiento = TO_DATE($4, 'dd/mm/yyyy'),segundo_nombre = $5, correo = $6,
          telefono = $7, rol = $8 WHERE cedula = $9`, 
        [
          datos_usuario.primer_nombre,
          datos_usuario.primer_apellido,
          datos_usuario.segundo_apellido,
          datos_usuario.fecha_nacimiento || null,
          datos_usuario.segundo_nombre || null,
          datos_usuario.correo.toLowerCase(),
          datos_usuario.telefono || null,
          datos_usuario.rol,
          datos_usuario.cedula
        ]
      );
    }

    // Luego del update retornamos un codigo de exito 200
    return { codigo: 200, texto: 'Usuario editado exitosamente' };

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

/*
  Funcion para editar la clave de un usuario de la base de datos con la cédula especificada.
*/
async function editarClaveUsuario(cedula_usuario, clave_usuario){
  try {

    // Validamos la clave del usuario
    let check = validador.validarClave(clave_usuario);
    if (!check.estado) return { codigo: 422, texto: check.texto }

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
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
  }
}

/*
  Funcion que eliminará a un usuario de la base de datos con la cédula especificada,
  Adicionalmente la función tambien eliminar los registros del usuario en todas las tablas
  que le hagan referencia. Las tablas de las que se eliminará son las siguientes:
  Usuarios y Asignaciones
  La funcion retornará los siguientes codigos: 200 Exito, 404 Usuario no existe, 500 Error inesperado
*/
async function eliminarUsuario (cedula) {
  try {
    // validamos la cedula
    let check = validador.validarCedula(cedula);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    
    // validamos la existencia del usuario en el sistema
    let query = await bd.query(`SELECT EXISTS (SELECT u.cedula FROM usuarios u WHERE u.cedula = $1) AS "existe"`, [cedula]);
    if (!query.rowCount) return { codigo: 404, texto: 'Este usuario no está registrado en el sistema.' }
    
    // Si la cédula es válida y el usuario existe
    else {
      // Eliminamos de las tablas correspondientes y retornamos un código 200 de éxito
      await bd.query(`DELETE FROM asignaciones WHERE cedula_usuario = $1`, [cedula]);
      await bd.query(`DELETE FROM usuarios WHERE cedula = $1`, [cedula]);

      return { codigo: 200, texto: 'Usuario eliminado satisfactoriamente.' }
    }
  }
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtelo de nuevo.'}; 
  }
}

module.exports = {
  insertarUsuario,
  listarUsuarios,
  editarUsuario,
  editarClaveUsuario,
  eliminarUsuario
}