/*Se importa el router de express*/
const router = require('express').Router();
const inscripciones = require('../controllers/inscripciones');
const mw_token = require('../middleware/token');
// const mw_rol = require('../middleware/rol');

router.route('/:id_deporte')
    //ruta encargada de registrar las inscripciones de un deporte
    .post(mw_token, async(req, res) => {
        try{
            let datos = {
                deporte: req.params.id_deporte,
                categoria: req.body.categoria,
                posicion: req.body.posicion,
                cedula: req.body.cedula
            };
            if (datos.posicion == null) {
                datos.deporte_pos = null;
            } else {
                datos.deporte_pos = req.params.id_deporte;
            }
            let result = await inscripciones.crearInscripcion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de editar la posicion de una inscripción
    .put(mw_token, async(req, res) => {
        try{
            let datos = {
                deporte: req.params.id_deporte,
                categoria: req.body.categoria,
                posicion: req.body.posicion,
                cedula: req.body.cedula
            };
            if (datos.posicion == null) {
                datos.deporte_pos = null;
            } else {
                datos.deporte_pos = req.params.id_deporte;
            }
            let result = await inscripciones.editarInscripcion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de obtener todas las inscripciones de un deporte
    .get(mw_token, async(req, res) => {
        try{
            let result = await inscripciones.verInscripciones(req.params.id_deporte);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

router.route('/:id_categoria/:id_posicion/:cedula')
    //ruta encargada de obtener los datos de una inscripción
    .get(mw_token, async(req, res) => {
        try{
            let datos = {
                categoria: req.params.id_categoria,
                cedula: req.params.cedula
            };
            let result = await inscripciones.verInscripcion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta encargada de eliminar una inscripción
    .delete(mw_token, async(req, res) => {
        try{
            let datos = {
                categoria: req.params.id_categoria,
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
    //ruta encargada obtener las categorias de un atleta
    .get(mw_token, async(req, res) => {
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

router.route('/:id_deporte/categoria/:id_categoria/:cedula')
    //ruta encargada obtener las posiciones de un atleta
    .get(mw_token, async(req, res) => {
        try{
            let datos = {
                deporte: req.params.id_deporte,
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