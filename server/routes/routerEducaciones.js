/* instanciamos al router de express y al modulo de atletas */
const router = require('express').Router();
const educaciones = require('../controllers/educaciones');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/')
  /*
    Ruta GET que obtendra las educaciones del sistema registradas en la bd
    siempre y cuando el usuario este iniciado sesión y sea administrador.
    Retornara la data obtenida o un codigo de error.
    Ruta protegida por MW_TOKEN y MW_ROL.
  */
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await educaciones.obtenerEducaciones();
    if (data.codigo === 200) {
      if (data.texto) res.send(data.texto);
      else res.send(data.educaciones);
    }
    else res.sendStatus(data.codigo);
  })
  /*
    Ruta POST que creara una educacion en el sistema siempre y cuando los datos
    sean validos
    Ruta protegida por MW_TOKEN y MW_ROL
  */
  .post(mw_token, mw_rol, async (req, res) => {
    let data = await educaciones.crearEducacion(req.body);
    res.status(data.codigo).send(data.texto);
  });

router.route('/:id')
  /*
    Ruta PUT que editara los datos de una educacion del sistema siempre
    y cuando esta exista y los datos sean validos
    Ruta protegida por MW_TOKEN y MW_ROL
  */
  .put(mw_token, mw_rol, async (req, res) => {
    let data = await educaciones.editarEducacion(req.params.id, req.body);
    res.status(data.codigo).send(data.texto);
  })
  /*
    Ruta DELETE que eliminara los datos de una educacion del sistema siempre
    y cuando esta exista
    Ruta protegida por MW_TOKEN y MW_ROL
  */
  .delete(mw_token, mw_rol, async (req, res) => {
    let data = await educaciones.eliminarEducacion(req.params.id);
    res.status(data.codigo).send(data.texto);
  });

module.exports = router;