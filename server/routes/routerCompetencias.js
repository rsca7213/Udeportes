/* instanciamos al router de express y al modulo de competencias */
const router = require('express').Router();
const competencias = require('../controllers/competencias');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');
const helper_rol = require('../helpers/rol');

/*
  Ruta GET que devolvera todas las categorias ordenadas
  por deporte a las que tiene acceso un entrenador,
  en caso de que el usuario sea admin se retornan todas
  las categorias.
  Ruta protegida por MW_TOKEN
*/
router.route('/categorias')
  .get(mw_token, async (req, res) => {
    try {
      let data = await helper_rol(req.body.cedula_auth) === 'a' 
        ? await competencias.obtenerCategorias(req.body.cedula_auth, 'a')
        : await competencias.obtenerCategorias(req.body.cedula_auth);
      res.status(data.codigo).send(data.data);
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  });

router.route('/:id_deporte/:id_categoria')
  /*
    Ruta GET que devolvera todas las competencias de una categoria con los siguientes datos:
    { id, nombre, estatus, fecha_inicio, fecha_fin }
    siempre y cuando el usuario tenga acceso al contenido.
    Ruta protegida por MW_TOKEN
  */
  .get(mw_token, async (req, res) => {
    try {
      // Verificamos si este usuario tiene permiso para acceder a esta categoria
      let check_permiso = await helper_rol(req.body.cedula_auth) === 'a'
        // Usuario admin? Entonces tiene permiso
        ? true
        // Usuario no admin? entonces debemos verificar las categorias que posee
        : await competencias.obtenerCategorias(req.body.cedula_auth);

      if (check_permiso != true) {
        // verificamos que tenga acceso a la categoria
        check_permiso = check_permiso.data.filter(item => item.id_deporte === req.params.id_deporte);
        check_permiso = check_permiso.filter(item => item.categorias.map(i => i.id_categoria).includes(req.params.id_categoria)).length;
      }
      
      // Si tiene acceso a la categoria
      if (check_permiso) {
        let data = await competencias.obtenerCompetencias(req.params.id_deporte, req.params.id_categoria);
        res.status(data.codigo).send(data.codigo === 200 ? data.competencias : data.texto);
      }
      // Si no tiene acceso a la categoria
      else res.status(423).send('No posee una asignación con esta categoria.');
      
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  })
  /*
    Ruta POST que crea una competencia para una categoria,
    los datos recibidos en el body son = { nombre, fecha_inicio, fecha_fin, estatus }
    Esta competencia se crea siempre y cuando el usuario sea admin.
    Ruta protegida por MW_TOKEN, MW_ROL
  */
  .post(mw_token, mw_rol, async (req, res) => {
    try {
      let data = await competencias.crearCompetencia(req.params.id_deporte, req.params.id_categoria, req.body);
      res.status(data.codigo).send(data.texto); 
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  });

router.route('/:id_deporte/:id_categoria/:id')
  /*
    Ruta PUT que edita una competencia para una categoria,
    los datos recibidos en el body son = { nombre, fecha_inicio, fecha_fin, estatus }
    Esta competencia se edita siempre y cuando exista.
    Ruta protegida por MW_TOKEN y MW_ROL
  */
  .put(mw_token, mw_rol, async (req, res) => {
    try {
      let data = await competencias.editarCompetencia(req.params.id_deporte, req.params.id_categoria, req.params.id, req.body);
      res.status(data.codigo).send(data.texto);
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  })
  /*
    Ruta DELETE que elimina una competencia para una categoria,
    Esta competencia se elimina siempre y cuando exista.
    Ruta protegida por MW_TOKEN y MW_ROL
  */
  .delete(mw_token, mw_rol, async (req, res) => {
    try {
      let data = await competencias.eliminarCompetencia(req.params.id_deporte, req.params.id_categoria, req.params.id);
      res.status(data.codigo).send(data.texto);
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  });

module.exports = router;