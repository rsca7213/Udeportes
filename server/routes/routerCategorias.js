/*Se importa el router de express*/
const router = require('express').Router();
const categorias = require('../controllers/categorias');
// const mw_token = require('../middleware/token');
// const mw_rol = require('../middleware/rol');

//ruta encargada de crear categoria de un deporte

router.route('/:id/crear')
    .post(async(req, res) => {
        try{
            let datos = {body: req.body, params: req.params.id};
            let result = await categorias.crearCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
        });

//ruta encargada de obtener todas las categorias de un deporte

router.route('/:id')
    .get(async(req, res) => {
        try{
            let result = await categorias.verCategorias(req.params.id);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

//ruta encargada de obtener una categoria en específico segun el id

router.route('/:id_deporte/categoria/:id_categoria')
    .get(async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, categoria: req.params.id_categoria}
            let result = await categorias.verCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

//ruta encargada de editar categorias

router.route('/:id_deporte/categoria/:id_categoria/editar')
    .put(async(req, res) => {
        try{
            let datos = {body: req.body, deporte: req.params.id_deporte, categoria: req.params.id_categoria};
            let result = await categorias.editarCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

//ruta encargada de eliminar categorias

router.route('/:id_deporte/categoria/:id_categoria/eliminar')
    .delete(async(req, res) => {
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

module.exports = router;