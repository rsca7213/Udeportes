/* importamos el controlador de autentificación y el router de express y el middleware */
const router = require('express').Router();
const auth = require('../controllers/auth');
const mw_token = require('../middleware/token');
const mw_config = require('../middleware/config');
const mw_rol = require('../middleware/rol');

router.route('/login')
  /*
    Ruta GET utilizada para verificar si el usuario se encuentra actualmente iniciado en el sistema,
    verificado a traves del middleware de token, en caso de exito se envia un codigo 200,
    en caso contrario un codigo 401

    Inicialmente se llamara a mw_config para determinar si se requiere de configuración inicial, en caso verdadero
    se devolvera un codigo HTTP 428 (Precondicion requerida) por parte de este y no se ejecutara mas nada 
    (el front end se encargara de enviar al usuario a la pagina de config respectiva al recibir dicho codigo)
  */
  .get(mw_config, mw_token, async (req, res) => {
    let codigo = req.body.cedula_auth ? 200 : 401;
    res.sendStatus(codigo);
  })
  /*
    Ruta POST utilizada para iniciar sesión, toma las credenciales del usuario
    y retorna una cookie con el token de autentificación, en caso de datos invalidos
    o incorrectos, se devuelve un codigo HTTP junto con un mensaje
  */
  .post(async (req, res) => {
    // verificamos credenciales
    let check = await auth.login(req.body);
    // si son correctas creamos token jwt y lo colocamos en una cookie HTTP-ONLY
    if (check.codigo === 200) {
      let token = auth.crearToken(check.cedula);
      res.cookie('JWT', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 12 * 3600000),
        sameSite: true,
        path: '/'
      });
    }
    // enviamos el estatus obtenido
    res.status(check.codigo).send(check.texto);
  })

router.route('/logout')
  /*
    Ruta POST utilizada para cerrar la sesión del usuario,
    el middleware de token se encarga de verificar si el usuario esta actualmente
    iniciado sesión en el sistema, en caso de que sea asi se destruye la cookie del token,
    en caso contrario se envia un codigo 401 (si algo sale mal al destruir la cookie se devuelve un 500)
  */
  .post(mw_token, async (req, res) => {
    try {
      res.clearCookie('JWT');
      res.sendStatus(200);
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  });

router.route('/admin')
  /*
    Ruta GET utilizada para verificar que el usuario es admin, mw_token se encarga de verificar que el usuario
    ha iniciado sesión (devolviendo un 401 si no estuviera logeado) y mw_role se encarga de verificar que el usuario
    sea admin, devolviendo un 403 si no es admin. Si el usuario esta iniciado y es admin, los middlewares llamaran a 
    next() y se llegara al res.sendStatus(200) de esta ruta, por lo cual si en el cliente se recibe un 200 al llamar
    a esta ruta se sabe que el usuario es admin y ha iniciado sesión
  */
  .get(mw_token, mw_rol, async (req, res) => {
    res.sendStatus(200);
  });
  

module.exports = router;