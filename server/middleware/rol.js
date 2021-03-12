/* Importar jwt e instanciar la conexion a la bd */
const bd = require('../conexion');

/* 
  Middlewate que busca el rol del usuario en la base de datos, devuelve next() si el usuario es admin,
  403 si el usuario no es admin y 500 en caso de error inesperado
  Utiliza la cedula_auth colocada por el mw_token en el body para buscar al usuario
*/
async function verifyRol (req, res, next) {
  // si por alguna razón no hay cedula_auth en el body (no deberia pasar a menos que se ejecute mw_rol antes que mw_token)
  if (!req.body.cedula_auth) res.status(401).send('El usuario no ha iniciado sesión.');
  else {
    try {
      // intentamos buscar el rol del usuario
      let rol = await bd.query(
        `SELECT u.rol FROM usuarios u WHERE u.cedula = $1`,
        [req.body.cedula_auth]
      );
      rol = rol.rows;
      // si el usuario no se encuentra
      if (!rol.length) res.status(401).send('Usuario no encontrado.');
      // si se consiguio el rol del usuario
      else {
        rol = rol[0].rol;
        // si el usuario es admin, se permite y se llama next()
        if (rol === 'a') next();
        // si no es admin, se devuelve un HTTP 403 Forbidden
        else res.status(403).send('Usuario no autorizado.');
      }
    }
    // En caso de error inesperado
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
  }
}

/* Exportamos el metodo que provee el middleware */
module.exports = verifyRol;