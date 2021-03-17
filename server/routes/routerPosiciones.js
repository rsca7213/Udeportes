/*Se importa el router de express*/
const router = require('express').Router();
const posiciones = require('../controllers/posiciones');
// const mw_token = require('../middleware/token');
// const mw_rol = require('../middleware/rol');

router.route('/:id_deporte')
    //ruta encargada de crear posiciones en un deporte
    .post(async(req, res) => {
        try{
            let datos = {body: req.body, params: req.params.id_deporte};
            let result = await posiciones.crearPosicion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
        })
    //ruta encargada de obtener todas las posiciones de un deporte
    .get(async(req, res) => {
        try{
            let result = await posiciones.verPosiciones(req.params.id_deporte);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_deporte/:id_posicion')
    //ruta encargada de obtener una posicion en específico segun el id
    .get(async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, posicion: req.params.id_posicion}
            let result = await posiciones.verPosicion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de editar posiciones
    .put(async(req, res) => {
        try{
            let datos = {body: req.body, deporte: req.params.id_deporte, posicion: req.params.id_posicion};
            let result = await posiciones.editarPosicion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de eliminar posiciones
    .delete(async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, posicion: req.params.id_posicion}
            let result = await posiciones.eliminarPosicion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

module.exports = router;