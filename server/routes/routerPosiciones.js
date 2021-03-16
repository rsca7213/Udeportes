/*Se importa el router de express*/
const router = require('express').Router();
const posiciones = require('../controllers/posiciones');
// const mw_token = require('../middleware/token');
// const mw_rol = require('../middleware/rol');

//ruta encargada de crear posiciones en un deporte

router.route('/:id/crear')
    .post(async(req, res) => {
        try{
            let datos = {body: req.body, params: req.params.id};
            let result = await posiciones.crearPosicion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
        });

//ruta encargada de obtener todas las posiciones de un deporte

router.route('/:id')
    .get(async(req, res) => {
        try{
            let result = await posiciones.verPosiciones(req.params.id);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

//ruta encargada de obtener una posicion en específico segun el id

router.route('/:id_deporte/posicion/:id_posicion')
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
    });

//ruta encargada de editar posiciones

router.route('/:id_deporte/posicion/:id_posicion/editar')
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
    });

//ruta encargada de eliminar posiciones

router.route('/:id_deporte/posicion/:id_posicion/eliminar')
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