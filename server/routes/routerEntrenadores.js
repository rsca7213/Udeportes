/*Se importa el router de express*/
const router = require('express').Router();
const usuarios = require('../controllers/entrenadores');

//ruta encargada de insertar entrenadores
router.route('/insertar').post(async(req, res) => {
  try{
    let result = await usuarios.insertar_usuario(req.body);
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
});

//ruta encargada de obtener todos los usuarios registrados en el sistema
router.route('/list').get(async(req, res) => {
  try{
    let result = await usuarios.listar_usuarios();
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
});

//ruta encargada de actualizar un usuario
router.route('/editar').post(async(req, res) => {
  console.log('1');
  try{
    let result = await usuarios.editar_usuario(req.body);
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
});

module.exports = router;