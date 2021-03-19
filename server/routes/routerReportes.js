/* instanciamos al router de express, al modulo de atletas y middleware */
const router = require('express').Router();
const reportes = require('../controllers/reportes');
const mw_token = require('../middleware/token');

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

router.route('/nomina/equipo/:competencia')
/*
  Ruta GET que obtiene los datos basicos de todos los atletas registrados en el sistema
  participantes en la competencia solicitada y los retorna con un codigo 200 en formato
  Array[] o retorna un error con un codigo 500
*/
.get(mw_token, async (req, res) => {
  let data = await reportes.nominaCompetencia(req.params.competencia);
  res.status(data.codigo).send(data.codigo === 200 ? data.atletas : data.texto);
})

module.exports = router;