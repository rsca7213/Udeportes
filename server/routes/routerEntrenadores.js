/*Se importa el router de express*/
const router = require('express').Router();
const usuarios = require('../controllers/entrenadores');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');


router.route('/')
/*
  Ruta POST que registrara un usuario haciendo uso del modulo de entrenadores siempre
  y cuando los datos sean validos, no haya problemas UNIQUE, el usuario este iniciado
  sesión y sea administrador.
  Retornara el codigo HTTP correspondiente junto con un texto explicativo de error o éxito
  Ruta protegida por MW_TOKEN y MW_ROL
*/
.post(mw_token, mw_rol, async(req, res) => {
  try{
    let result = await usuarios.insertarUsuario(req.body);
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
})

/*
    Ruta GET que obtiene los datos basicos de todos los usuarios registrados en el sistema
    y los retorna con un codigo 200 en formato Array[] o retorna un error con un codigo 500
  */
.get(mw_token, mw_rol, async(req, res) => {
  try{
    let result = await usuarios.listarUsuarios();
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
});

//ruta encargada de actualizar un usuario
router.route('/:cedula')
.put(mw_token, mw_rol, async(req, res) => {
  try{
    let result = await usuarios.editarUsuario(req.params.cedula, req.body);
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
})
/*
  Ruta DELETE que elimina a un usuario del sistema con la cédula especificada junto con los registros
  en tablas que contengan datos del usuario, siempre y cuando exista el usuario y la cédula sea válida
*/
.delete(mw_token, mw_rol, async (req, res) => {
  try{
    let result = await usuarios.eliminarUsuario(req.params.cedula);
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
    res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
});

//ruta encargada de actualizar la clave de un usuario
router.route('/clave/:cedula')
.put(mw_token, mw_rol, async(req, res) => {
  try{
    let result = await usuarios.editarClaveUsuario(req.params.cedula, req.body.clave);
    res.send(result);
  }
  catch(error){
    if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  } 
});

module.exports = router;