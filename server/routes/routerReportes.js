/* instanciamos al router de express, al modulo de atletas y middleware */
const router = require('express').Router();
const reportes = require('../controllers/reportes');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/nomina/equipo/:categoria')
  /*
    Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
    pertenecientes a la categoría solicitada y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .get(mw_token, async (req, res) => {
    let data = await reportes.nominaEquipo(req.params.categoria);
    res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
  })

router.route('/asistencia/entrenamientos/:deporte/:categoria')
  /*
    Ruta POST que obtiene los datos basicos de todos los atletas registrados en el sistema
    con su respectiva asistencia en los entrenamientos del período especificado
    pertenecientes a la categoría solicitada y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .post(mw_token, async (req, res) => {

    let data;

    if(req.body.periodo === 'total') data = await reportes.asistenciaGeneralEntrenamientos(req.params.deporte,req.params.categoria, req.body.periodo);
    else data = await reportes.asistenciaGeneralEntrenamientos(req.params.deporte,req.params.categoria, req.body.periodo, req.body.fecha);
    
    if(data.atletas && data.atletas.length){
      res.status(data.codigo).send({atletas:data.atletas, entrenamientos: data.entrenamientos})
    }
    else{
      res.status(data.codigo).send(data.codigo === 200 ? {entrenamientos: data.entrenamientos} : data.texto);
    }
})

router.route('/asistencia/entrenamiento/:deporte/:categoria/:entrenamiento')
  /*
    Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
    pertenecientes a la categoría solicitada con su respectiva asistencia en el entrenamiento
    previamente especificado y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .get(mw_token, async (req, res) => {

    let data = await reportes.asistenciaDetalladaEntrenamientos(req.params.deporte,req.params.categoria, req.params.entrenamiento);
    res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
})

router.route('/nomina/competencia/:deporte/:categoria/:competencia')
/*
  Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
  participantes que hayan asistido a la competencia solicitada y los retorna con un codigo 200 en formato
  Array[] o retorna un error con un codigo 500
*/
.get(mw_token, async (req, res) => {
  let data = await reportes.nominaCompetencia(req.params.deporte, req.params.categoria, req.params.competencia);
  res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
})

router.route('/asistencia/competencias/:deporte/:categoria')
  /*
    Ruta POST que obtiene los datos basicos de todos los atletas registrados en el sistema
    pertenecientes a la categoría solicitada con su respectiva asistencia en las competencias en el
    periodo especificado y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .post(mw_token, async (req, res) => {

    let data;

    if(req.body.periodo === 'total') data = await reportes.asistenciaGeneralCompetencias(req.params.deporte,req.params.categoria, req.body.periodo);
    else data = await reportes.asistenciaGeneralCompetencias(req.params.deporte,req.params.categoria, req.body.periodo, req.body.fecha);
    
    if(data.atletas && data.atletas.length){
      res.status(data.codigo).send({atletas:data.atletas, competencias: data.competencias})
    }
    else{
      res.status(data.codigo).send(data.codigo === 200 ? {competencias: data.competencias} : data.texto);
    }
})

router.route('/asistencia/competencia/:deporte/:categoria/:competencia')
  /*
    Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
    pertenecientes a la categoría solicitada con su respectiva asistencia en la competencia
    previamente especificada y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .get(mw_token, async (req, res) => {

    let data = await reportes.asistenciaDetalladaCompetencias(req.params.deporte,req.params.categoria, req.params.competencia);
    res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
})

router.route('/atletas/beca')
  /*
    Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
    que poseen una beca y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await reportes.atletasBeca();
    res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
  })

  router.route('/atletas')
  /*
    Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
    y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await reportes.obtenerAtletas();
    res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
  })

  router.route('/atletas/deporte')
  /*
    Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
    y los retorna con un codigo 200 en formato
    Array[] o retorna un error con un codigo 500
  */
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await reportes.obtenerAtletasConDeporte();
    res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
  })

  router.route('/atletas/historico/academico/:cedula')
  /*
    Ruta GET que obtiene los datos del historico academico del atleta con la cedula especificada
  */
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await reportes.atletasHistoricoAcademico(req.params.cedula);
    res.status(data.codigo).send(data.codigo === 200 ? data.historico : data.texto);
  })

  router.route('/atletas/historico/deportivo/:cedula')
  /*
    Ruta GET que obtiene los datos del historico deportivo del atleta con la cedula especificada
  */
  .get(mw_token, mw_rol, async (req, res) => {
    let data = await reportes.atletasHistoricoDeportivo(req.params.cedula);
    res.status(data.codigo).send(data.codigo === 200 ? data.historico : data.texto);
  })

module.exports = router;