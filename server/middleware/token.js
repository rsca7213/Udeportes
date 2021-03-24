/* Importar jwt e instanciar la conexion a la bd */
const jwt = require('jsonwebtoken');
const bd = require('../conexion');
const auth = require('../controllers/auth');

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
    if (check.length === 0) { 
      res.clearCookie('JWT');
      return res.status(401).send('user-no-encontrado');
    }
    /* si el usuario posee un token valido, pero este esta a punto de expirar, creamos uno nuevo */
    // Verifica el tiempo restante en horas, si es menor o igual a 1 hora
    if ((user.exp - (Date.now() / 1000)) / 3600 <= 1) {
      // Creamos un nuevo token y refrescamos la cookie con 12 h extra con el nuevo token
      new_token = auth.crearToken(user.cedula);
      res.cookie('JWT', new_token, {
        httpOnly: true,
        expires: new Date(Date.now() + 12 * 3600000),
        sameSite: true,
        path: '/'
      });
    }
    /* Si todo esta bien, llamamos a next() */
    next();
  }
  catch {
    /* Si el token fue manipulado o no es valido */
    res.clearCookie('JWT');
    return res.status(401).send('auth-invalida');
  }
}

/* Exportamos el metodo que provee el middleware */
module.exports = verifyToken;