/*Se importa el router de express*/
const router = require('express').Router();
const estadisticas = require('../controllers/estadisticas');
const { route } = require('./routerAuth');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/:id_deporte')
    //ruta encargada de obtener todas las estadísticas de un deporte
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await estadisticas.verEstadisticas(req.params.id_deporte);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_deporte/:id_posicion')
    //ruta encargada de crear estadísticas de una posición
    .post(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {
                body: req.body, 
                deporte: req.params.id_deporte,
                posicion: req.params.id_posicion,
            };
            let result = await estadisticas.crearEstadisticas(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_deporte/estadistica/:id_estadistica')
    //ruta encargada de obtener una estadístca en específico segun el id
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {
                id_deporte: req.params.id_deporte,
                id_estadistica: req.params.id_estadistica
            };
            let result = await estadisticas.verEstadistica(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de editar estadísticas de una posición
    .put(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {
                body: req.body, 
                estadistica: req.params.id_estadistica
            };
            let result = await estadisticas.editarEstadistica(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de eliminar estadísticas de una posición
    .delete(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await estadisticas.eliminarEstadistica(req.params.id_estadistica);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

module.exports = router;