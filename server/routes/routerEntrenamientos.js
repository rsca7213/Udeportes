/* instanciamos al router de express y al modulo de atletas */
const router = require('express').Router();
const entrenamientos = require('../controllers/entrenamientos');
const mw_token = require('../middleware/token');
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
        ? await entrenamientos.obtenerCategorias(req.body.cedula_auth, 'a')
        : await entrenamientos.obtenerCategorias(req.body.cedula_auth);
      res.status(data.codigo).send(data.data);
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  });

router.route('/:id_deporte/:id_categoria')
  /*
    Ruta GET que devolvera todos los entrenamientos de una categoria con los siguientes datos:
    { id, fecha, nombre, cantidad_asistencias, cantidad_faltadas, % asistencia }
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
        : await entrenamientos.obtenerCategorias(req.body.cedula_auth);

      if (check_permiso != true) {
        // verificamos que tenga acceso a la categoria
        check_permiso = check_permiso.data.filter(item => item.id_deporte === req.params.id_deporte);
        check_permiso = check_permiso.filter(item => item.categorias.map(i => i.id_categoria).includes(req.params.id_categoria)).length;
      }
      
      // Si tiene acceso a la categoria
      if (check_permiso) {
        let data = await entrenamientos.obtenerEntrenamientos(req.params.id_deporte, req.params.id_categoria);
        res.status(data.codigo).send(data.codigo === 200 ? data.entrenamientos : data.texto);
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
    Ruta POST que crea un entrenamiento para una categoria,
    los datos recibidos en el body son = { fecha, nombre }
    Este entrenamiento se crea siempre y cuando el usuario tenga acceso a la categoria.
    Ruta protegida por MW_TOKEN
  */
  .post(mw_token, async (req, res) => {
    try {
      // Verificamos si este usuario tiene permiso para acceder a esta categoria
      let check_permiso = await helper_rol(req.body.cedula_auth) === 'a'
        // Usuario admin? Entonces tiene permiso
        ? true
        // Usuario no admin? entonces debemos verificar las categorias que posee
        : await entrenamientos.obtenerCategorias(req.body.cedula_auth);

      if (check_permiso != true) {
        // verificamos que tenga acceso a la categoria
        check_permiso = check_permiso.data.filter(item => item.id_deporte === req.params.id_deporte);
        check_permiso = check_permiso.filter(item => item.categorias.map(i => i.id_categoria).includes(req.params.id_categoria)).length;
      }
      
      // Si tiene acceso a la categoria
      if (check_permiso) {
        let data = await entrenamientos.crearEntrenamiento(req.params.id_deporte, req.params.id_categoria, req.body);
        res.status(data.codigo).send(data.texto);
      }
      // Si no tiene acceso a la categoria
      else res.status(423).send('No posee una asignación con esta categoria.');
      
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  });

router.route('/:id_deporte/:id_categoria/:id')
  /*
    Ruta PUT que edita un entrenamiento para una categoria,
    los datos recibidos en el body son = { fecha, nombre }
    Este entrenamiento se edita siempre y cuando el usuario tenga acceso a la categoria y exista el entrenamiento.
    Ruta protegida por MW_TOKEN
  */
  .put(mw_token, async (req, res) => {
    try {
      // Verificamos si este usuario tiene permiso para acceder a esta categoria
      let check_permiso = await helper_rol(req.body.cedula_auth) === 'a'
        // Usuario admin? Entonces tiene permiso
        ? true
        // Usuario no admin? entonces debemos verificar las categorias que posee
        : await entrenamientos.obtenerCategorias(req.body.cedula_auth);

      if (check_permiso != true) {
        // verificamos que tenga acceso a la categoria
        check_permiso = check_permiso.data.filter(item => item.id_deporte === req.params.id_deporte);
        check_permiso = check_permiso.filter(item => item.categorias.map(i => i.id_categoria).includes(req.params.id_categoria)).length;
      }
      
      // Si tiene acceso a la categoria
      if (check_permiso) {
        let data = await entrenamientos.editarEntrenamiento(req.params.id_deporte, req.params.id_categoria, req.params.id, req.body);
        res.status(data.codigo).send(data.texto);
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
    Ruta DELETE que elimina un entrenamiento para una categoria,
    Este entrenamiento se elimina siempre y cuando el usuario tenga acceso a la categoria y exista el entrenamiento.
    Ruta protegida por MW_TOKEN
  */
  .delete(mw_token, async (req, res) => {
    try {
      // Verificamos si este usuario tiene permiso para acceder a esta categoria
      let check_permiso = await helper_rol(req.body.cedula_auth) === 'a'
        // Usuario admin? Entonces tiene permiso
        ? true
        // Usuario no admin? entonces debemos verificar las categorias que posee
        : await entrenamientos.obtenerCategorias(req.body.cedula_auth);

      if (check_permiso != true) {
        // verificamos que tenga acceso a la categoria
        check_permiso = check_permiso.data.filter(item => item.id_deporte === req.params.id_deporte);
        check_permiso = check_permiso.filter(item => item.categorias.map(i => i.id_categoria).includes(req.params.id_categoria)).length;
      }
      
      // Si tiene acceso a la categoria
      if (check_permiso) {
        let data = await entrenamientos.eliminarEntrenamiento(req.params.id_deporte, req.params.id_categoria, req.params.id);
        res.status(data.codigo).send(data.texto);
      }
      // Si no tiene acceso a la categoria
      else res.status(423).send('No posee una asignación con esta categoria.');
      
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
    }
  });

module.exports = router;