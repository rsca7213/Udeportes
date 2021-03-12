/*Se importa el router de express*/
const router = require('express').Router();
const creacion = require('../controllers/creacion');

router.route('/usuario').post(async(req, res) => {
  try{
    await creacion.insertar_usuarios(req.body);
    res.sendStatus(200);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  }
  
});

module.exports = router;