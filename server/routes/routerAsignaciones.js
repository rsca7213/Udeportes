/*Se importa el router de express*/
const router = require('express').Router();
const asignaciones = require('../controllers/asignaciones');
const mw_token = require('../middleware/token');
const mw_rol = require('../middleware/rol');

router.route('/:id_deporte/:id_categoria/:cedula_entrenador')
    //ruta registrar la asignación
    .get(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, entrenador: req.params.cedula_entrenador, categoria: req.params.id_categoria}
            let result = await asignaciones.crearAsignaciones(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    })
    //ruta eliminar la asignación 
    .delete(mw_token, mw_rol, async(req, res) => {
        try{
            let datos = {deporte: req.params.id_deporte, entrenador: req.params.cedula_entrenador, categoria: req.params.id_categoria}
            let result = await asignaciones.eliminarAsignacion(datos);
            res.send(result);
        }
        catch(error){
            if (process.env.NODE_ENV === 'development') console.error(error);
            res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
        } 
    });

module.exports = router;