/* instanciamos al router de express, al modulo de atletas y middleware */
const router = require('express').Router();
const atletas = require('../controllers/atletas');
const historicos = require('../controllers/historico_atletas')
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/')
  /*
    Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
    y los retorna con un codigo 200 en formato Array[] o retorna un error con un codigo 500
  */
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await atletas.obtenerAtletas();
    res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
  })
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

router.route('/:cedula')
  /*
    Ruta GET que tiene dos opciones, data = basica (retornando los datos del atleta)
    o data = completa (retornando los datos del atleta, numero de competencias, torneos, equipos y entrenamientos)
  */
  .get(mw_token, mw_rol, async (req, res) => {
    if (req.query.data === 'basica') {
      let data = await atletas.obtenerDatosBasicosAtleta(req.params.cedula);
      res.status(data.codigo).send(data.codigo === 200 ? data.atleta : data.texto);
    }
    else if (req.query.data === 'completa') {
      let data = await atletas.obtenerDatosCompletosAtleta(req.params.cedula);
      res.status(data.codigo).send(data.codigo === 200 ? data.atleta : data.texto);
    }
    else {
      res.status(400).send('Data debe ser basica o completa');
    }
  })
  /*
    Ruta PUT que actualiza los datos de un atleta con la cedula especificada en los params
    siempre y cuando no hay otro usuario con datos UNIQUE iguales y los datos sean validos
  */
  .put(mw_token, mw_rol, async (req, res) => {
    let data = await atletas.editarAtleta(req.params.cedula, req.body);
    res.status(data.codigo).send(data.codigo === 200 ? 'Atleta editado correctamente' : data.texto);
  })
  /*
    Ruta DELETE que elimina a un atleta del sistema con la cedula especificada junto con los registros
    en tablas que contengan datos del atleta, siempre y cuando exista el atleta y la cedula sea valida
  */
 .delete(mw_token, mw_rol, async (req, res) => {
    let data = await atletas.eliminarAtleta(req.params.cedula);
    res.status(data.codigo).send(data.texto);
  });

router.route('/:cedula/historico')
  /*
    Ruta GET que tiene dos opciones, data = academico (retornando el historial académico del atleta)
    o data = deportivo (retornando el historial deportivo del atleta)
  */
  .get(mw_token, mw_rol, async (req, res) => {
    if (req.query.data === 'academico') {
      let result = await historicos.obtenerHistorialAcademico(req.params.cedula);
      res.send(result);
    }
    else if (req.query.data === 'deportivo') {
      let result = await historicos.obtenerHistorialDeportivo(req.params.cedula);
      res.send(result);
    }
    else {
      res.status(400).send('Data debe ser academico o deportivo');
    }
  })

module.exports = router;