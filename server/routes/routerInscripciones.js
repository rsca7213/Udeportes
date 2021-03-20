/*Se importa el router de express*/
const router = require('express').Router();
const inscripciones = require('../controllers/inscripciones');
// const mw_token = require('../middleware/token');
// const mw_rol = require('../middleware/rol');

router.route('/:id_deporte')
    //ruta encargada de obtener todas las inscripciones de un deporte
    .get(async(req, res) => {
        try{
            let result = await inscripciones.verInscripciones(req.params.id_deporte);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_deporte/:id_categoria/:id_posicion/:cedula')
    //ruta encargada de inscribir a un atleta en una categoria
    .get(async(req, res) => {
        try{
            let datos = {
                deporte: req.params.id_deporte,
                categoria: req.params.id_categoria,
                posicion: req.params.id_posicion,
                cedula: req.params.cedula
            };
            let result = await inscripciones.crearInscripcion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de editar la posicion de una inscripción
    .put(async(req, res) => {
        try{
            let datos = {
                deporte: req.params.id_deporte,
                categoria: req.params.id_categoria,
                posicion: req.params.id_posicion,
                cedula: req.params.cedula
            };
            let result = await inscripciones.editarInscripcion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de eliminar una inscripción
    .delete(async(req, res) => {
        try{
            let datos = {
                deporte: req.params.id_deporte,
                categoria: req.params.id_categoria,
                posicion: req.params.id_posicion,
                cedula: req.params.cedula
            };
            let result = await inscripciones.eliminarInscripcion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_deporte/:cedula')
    //ruta encargada obtener las categorias y posiciones de un atleta
    .get(async(req, res) => {
        try{
            let datos = {
                deporte: req.params.id_deporte,
                cedula: req.params.cedula
            };
            let result = await inscripciones.verCategoriasAtleta(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })

router.route('/categoria/:id_categoria/:cedula')
    //ruta encargada obtener las categorias y posiciones de un atleta
    .get(async(req, res) => {
        try{
            let datos = {
                categoria: req.params.id_categoria,
                cedula: req.params.cedula
            };
            let result = await inscripciones.verPosicionesCategoria(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })


module.exports = router;