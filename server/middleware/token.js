/* Importar jwt e instanciar la conexion a la bd */
const jwt = require('jsonwebtoken');
const bd = require('../conexion');

/* Verifica el token del usuario */
async function verifyToken (req, res, next) {
  /* Agarrar token de las cookies del request */
  let token = req.headers.cookie;

  /* Si no se encontró un token en las cookies */
  if (!token) return res.status(401).send('auth-no-encontrada');
    
  /* Si el token se encuentra en las cookies */
  try {
    token = token.slice(4);
    /* cerificacion de token */
    let user = jwt.verify(token, process.env.JWT_SECRET);
    /* si el usuario posee un token valido, agregamos su cedula a la solicitud */
    req.body.cedula_auth = user.cedula;
    /* Verificamos que el usuario con la cedula exista en la base de datos */
    let check = await bd.query('SELECT COUNT(u.correo) FROM usuarios u WHERE u.cedula=$1', [user.cedula]);
    check = check.rows;
    if (check.length === 0) return res.status(401).send('user-no-encontrado');
    /* Si todo esta bien, llamamos a next() */
    next();
  }
  catch {
    /* Si el token fue manipulado o no es valido */
    return res.status(401).send('auth-invalida');
  }
}

/* Exportamos el metodo que provee el middleware */
module.exports = verifyToken;