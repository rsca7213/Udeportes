/* importamos el controlador de perfiles y el router de express y el middleware */
const router = require('express').Router();
const perfil = require('../controllers/perfil.js');
const mw_token = require('../middleware/token');

/*
  Ruta GET que posee parametros query, data = nombre, data = completa y data = cedula
  indicando si se desea solo el nombre del usuario, si se desea la data completa o si se desea la cedula del usuario.
  La ruta llamará al controlador perfil pidiendole los datos a partir del query y devolvera
  los resultados obtenidos. RUTA PROTEGIDA POR TOKEN
*/
router.route('/')
  .get(mw_token, async (req, res) => {
    /* 
      Si solo se desea el nombre del usuario se llama a la funcion respectiva,
      en caso de codigo 200 se devuelve la data, en caso contrario se devuelve el error
      la cedula del usuario la provee al req.body el mw_token al leer el token JWT
    */
    if (req.query.data === 'nombre') {
      let data = await perfil.nombrePerfil(req.body.cedula_auth);
      if (data.codigo === 200) 
        res.send(data);
      else
        res.status(data.codigo).send(data.texto);
    }
    else if(req.query.data === 'completa'){
      let data = await perfil.datosPerfil(req.body.cedula_auth);
      if (data.codigo === 200) 
        res.send(data);
      else
        res.status(data.codigo).send(data.texto);
    }
    else if (req.query.data === 'cedula') {
      let data = req.body.cedula_auth;
      res.send(data);
    }

  });

router.route('/:cedula')
  .get(async (req, res) => {
    let data = req.params.cedula;
    let result = await perfil.verDeportes(data); 
    res.send(result);
  });

module.exports = router;