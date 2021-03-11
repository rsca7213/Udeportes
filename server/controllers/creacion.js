// Importamos Bcrypt, Instanciamos la conexión a la BD 
const bcrypt = require('bcrypt');
const bd = require('../conexion');

//funcion para insertar usuarios
async function insertar_usuarios(datos_usuario){

  console.log(datos_usuario);
  try {
    // buscamos en la base de datos al usuario con el correo introducido
    let usuario = await bd.query(
      'SELECT u.correo FROM usuarios u WHERE u.correo = $1',
      [datos_usuario.correo]
    );
    usuario = usuario.rows;

    // si el usuario no existe, se crea el usuario
    if (!usuario.length) {
      let salt = bcrypt.genSaltSync(10);
      let hash_clave = bcrypt.hashSync(datos_usuario.clave, salt);
      await bd.query('INSERT INTO usuarios VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [datos_usuario.cedula, datos_usuario.rol, datos_usuario.primer_nombre, datos_usuario.primer_apellido,
      datos_usuario.segundo_apellido, datos_usuario.correo, hash_clave, datos_usuario.segundo_nombre,
      datos_usuario.telefono, datos_usuario.fecha_nacimiento]
      );
      return { codigo: 200, texto: 'Usuario creado exitosamente'}
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

module.exports = {
  insertar_usuarios
}