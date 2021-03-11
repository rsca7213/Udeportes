/*Se importa el router de express*/
const router = require('express').Router();
const creacion = require('../controllers/creacion');

router.route('/usuario').post(async(req, res) => {
  console.log('entreaqui');
  await creacion.insertar_usuarios(req.body);
});

module.exports = router;