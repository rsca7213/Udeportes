// Instanciamos la conexión a la BD y el validador
const bd = require('../conexion');

async function crearAsignaciones (datos) {
    try {
        await bd.query(
            `INSERT INTO asignaciones (cedula_usuario, id_categoria, id_deporte) VALUES 
            ($1,$2,$3)`,
            [datos.entrenador, datos.categoria, datos.deporte]
        ); 
        let asignacion = await bd.query(
            `SELECT * FROM asignaciones WHERE cedula_usuario=$1 AND id_categoria=$2 AND id_deporte=$3`,
            [datos.entrenador, datos.categoria, datos.deporte]
        ); 
        asignacion = asignacion.rows[0];
        return { codigo: 200, texto: 'El entrenador ha sido asignado correctamente', asignacion};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function eliminarAsignacion (datos) {
    try {
        await bd.query(
             `DELETE FROM asignaciones WHERE cedula_usuario=$1 AND id_categoria=$2 AND id_deporte=$3`,
             [datos.entrenador, datos.categoria, datos.deporte]
        );

        asignacion = datos
    
        return { codigo: 200, texto: 'El entrenador ha sido destituido.', asignacion}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}


module.exports = { crearAsignaciones, eliminarAsignacion }
