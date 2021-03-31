/* instanciamos al router de express y al modulo de config */
const router = require('express').Router();
const config = require('../controllers/config');

/*
  Ruta POST para crear al usuario administrador del sistema (config inicial), para lo cual
  se hara uso del modulo de config, no se usa el mw_config debido a que este nunca nos permitiria
  hacer el insert debido a que retornaria un 428 al cliente, por lo cual utilizamos una función auxiliar
  en el modulo para verificar que no haya ya una configuración inicial

  check = true (hay config inicial, no se permite la creación)
  check = false (no hay config inicial, se permite el insert)
*/
router.route('/')
    .post(async (req, res) => {
        try{
            let check = await config.verifyInitAux();
            if (!check) {
                let check = await config.init(req.body);
                res.status(check.codigo).send(check.texto);
            }
            else res.status(409).send('Ya hay una configuración inicial del sistema.');
        }catch(err){
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, intente otra vez.');
        }
    });

module.exports = router;