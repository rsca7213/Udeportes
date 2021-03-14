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

    /************************** */
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
      `SELECT u.cedula, u.primer_nombre, u.segundo_nombre, u.primer_apellido,
       u.segundo_apellido, u.rol, u.correo, u.fecha_nacimiento, u.telefono FROM usuarios u`
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

async function editar_usuario(datos_usuario){
  console.log('2', datos_usuario);
  try {
    let usuarios = await bd.query(
      `SELECT u.cedula, u.correo, u.telefono FROM usuarios u WHERE u.correo = $1 OR u.telefono = $2`,
      [datos_usuario.correo, datos_usuario.telefono]
    );
    usuarios = usuarios.rows;
    usuarios.forEach(usuario =>{
      if(usuario['cedula'] !== datos_usuario.cedula){
        if(usuario['correo'] == datos_usuario.correo){
          console.log('El correo indicado ya se encuentra en uso.');
          return { codigo: 401, texto: 'El correo indicado ya se encuentra en uso.'};
        }
        else{
          console.log('El teléfono indicado ya se encuentra en uso.');
          return { codigo: 401, texto: 'El teléfono indicado ya se encuentra en uso.'};
        }
      }
      else{
        console.log('se puede insertar');
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

module.exports = {
  insertar_usuario,
  listar_usuarios,
  editar_usuario
}