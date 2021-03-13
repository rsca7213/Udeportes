/* instanciamos al router de express, al modulo de atletas y middleware */
const router = require('express').Router();
const atletas = require('../controllers/atletas');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/')
  /*
    Ruta POST que registrara un atleta haciendo uso del modulo de atletas siempre
    y cuando los datos sean validos, no haya problemas UNIQUE, el usuario este iniciado
    sesión y sea administrador.
    Retornara el codigo HTTP correspondiente junto con un texto explicativo de error o exito
    Ruta protegida por MW_TOKEN y MW_ROL
  */
  .post(mw_token, mw_rol, async (req, res) => {
    let data = await atletas.registrarAtleta(req.body);
    res.status(data.codigo).send(data.texto || 'Atleta registrado');
  });

module.exports = router;