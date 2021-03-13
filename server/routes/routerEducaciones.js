/* instanciamos al router de express y al modulo de atletas */
const router = require('express').Router();
const educaciones = require('../controllers/educaciones');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/')
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await educaciones.obtenerEducaciones();
    if (data.codigo === 200) {
      if (data.texto) res.send(data.texto);
      else res.send(data.educaciones);
    }
    else res.sendStatus(data.codigo);
  });

module.exports = router;