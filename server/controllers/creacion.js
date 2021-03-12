// Importamos Bcrypt, Instanciamos la conexión a la BD 
const bcrypt = require('bcrypt');
const bd = require('../conexion');
const validador = require('./validador');

//funcion para insertar usuarios
async function insertar_usuarios(datos_usuario){

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

  //si la fecha es vacia se guarda null para que no haya error debido al formato
  if(datos_usuario.fecha_nacimiento == '') {datos_usuario.fecha_nacimiento = null};
  //si el telefono es vacio se guarda null para que no haya error debido a que el telefono es unico
  if(datos_usuario.telefono == '') {datos_usuario.telefono = null};

  try {
    // buscamos en la base de datos al usuario con el correo introducido
    let usuario = await bd.query(
      'SELECT u.correo FROM usuarios u WHERE u.correo = $1',
      [datos_usuario.correo]
    );
    usuario = usuario.rows;

    // si el usuario no existe, se verifica que no exista ese telefono
    if (!usuario.length) {

      // buscamos en la base de datos la cedula del usuario para verificar que no exista un usuario
      //con la misma cedula
      let usuario_cedula = await bd.query(
        'SELECT u.cedula FROM usuarios u WHERE u.cedula = $1',
        [datos_usuario.cedula]
      );
      usuario_cedula = usuario_cedula.rows;

      // si no hay ningun usuario con esa cedula
      if (!usuario_cedula.length) {

        //si el telefono no es nulo se busca en la base de datos para verificar que ya no exista ese telefono
        if(datos_usuario.telefono != null){
          let telefono_usuario = await bd.query(
            'SELECT u.telefono FROM usuarios u WHERE u.telefono = $1',
            [datos_usuario.telefono]
          );
          telefono_usuario = telefono_usuario.rows;

          //si no hay ningún usuario con ese télefono se procede a insertar al usuario
          if(!telefono_usuario.length){
            return insertar(datos_usuario);
          }
          else{
            return { codigo: 401, texto: 'El teléfono ya existe.'};
          }
        }
        else{
          return insertar(datos_usuario);
        }
      }
      // en caso contraio, se envia un mensaje de error
      else{
        return { codigo: 401, texto: 'La cédula ya se encuentra registrada.'};
      }
    }
    // en caso contrario, se envia un mensaje de error
    else {
      return { codigo: 401, texto: 'El correo ya existe.'};
    }

  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

async function insertar(datos_usuario){
  try{
    let salt = bcrypt.genSaltSync(10);
      let hash_clave = bcrypt.hashSync(datos_usuario.clave, salt);
      await bd.query(`INSERT INTO usuarios VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TO_DATE($10, 'dd/mm/yyyy'))`,
      [datos_usuario.cedula, datos_usuario.rol, datos_usuario.primer_nombre, datos_usuario.primer_apellido,
      datos_usuario.segundo_apellido, datos_usuario.correo, hash_clave, datos_usuario.segundo_nombre,
      datos_usuario.telefono, datos_usuario.fecha_nacimiento]
    );
    return { codigo: 200, texto: 'Usuario creado exitosamente'}
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

module.exports = {
  insertar_usuarios
}