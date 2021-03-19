/*Se importa el router de express*/
const router = require('express').Router();
const categorias = require('../controllers/categorias');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/:id_deporte')
    //ruta encargada de crear categoría de un deporte
    .post(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {body: req.body, params: req.params.id_deporte};
            let result = await categorias.crearCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
        })
    //ruta encargada de obtener todas las categorías de un deporte
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await categorias.verCategorias(req.params.id_deporte);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_deporte/:id_categoria')
    //ruta encargada de obtener una categoría en específico segun el id
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, categoria: req.params.id_categoria}
            let result = await categorias.verCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de editar categorías
    .put(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {body: req.body, deporte: req.params.id_deporte, categoria: req.params.id_categoria};
            let result = await categorias.editarCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de eliminar categorías
    .delete(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, categoria: req.params.id_categoria}
            let result = await categorias.eliminarCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/')
    //ruta encargada de listar a todos los entrenadores del sistema
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let result = await categorias.verEntrenadores();
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_deporte/entrenador/:cedula')
    //ruta encargada de listar a todas las categorías de un entrenador
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, cedula: req.params.cedula}
            let result = await categorias.verCategoriasEntrenador(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });


module.exports = router;