/*Se importa el router de express*/
const router = require('express').Router();
const creacion = require('../controllers/creacion');

router.route('/usuario').post(async(req, res) => {
  try{
    let result = await creacion.insertar_usuarios(req.body);
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  }
  
});

module.exports = router;