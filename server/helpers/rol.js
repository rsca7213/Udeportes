/* Importar jwt e instanciar la conexion a la bd */
const bd = require('../conexion');

/*
  Funcion que toma una cedula y retorna el rol del usuario
*/
async function obtenerRol (cedula) {
  // si no hay cedula
  if (!cedula) return false;
  else {
    try {
      // intentamos buscar el rol del usuario
      let rol = await bd.query(
        `SELECT u.rol FROM usuarios u WHERE u.cedula = $1`,
        [cedula]
      );
      rol = rol.rows;
      // si el usuario no se encuentra
      if (!rol.length) return false;
      // si se consiguio el rol del usuario
      else {
        rol = rol[0].rol;
        // si el usuario existe retornamos el rol
        return rol;
      }
    }
    // En caso de error inesperado
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      return false;
    }
  }
}

module.exports = obtenerRol;