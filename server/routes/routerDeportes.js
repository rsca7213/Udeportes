/*Se importa el router de express*/
const router = require('express').Router();
const deportes = require('../controllers/deportes');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/')
    //ruta encargada de crear deportes
    .post(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await deportes.crearDeporte(req.body);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de obtener todos los deportes
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await deportes.verDeportes(req.body);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id')
    //ruta encargada de obtener un deporte en específico segun el id
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await deportes.verDeporte(req.params.id);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de editar deportes
    .put(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {datos: req.body, params: req.params};
            let result = await deportes.editarDeporte(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de eliminar deportes
    .delete(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await deportes.eliminarDeporte(req.params.id);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

module.exports = router;