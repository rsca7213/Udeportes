// Instanciamos la conexión a la BD y el validador
const bd = require('../conexion');
const validador = require('./validador');

async function crearEstadisticas (datos) {
    let check = validador.validarNombre(datos.body.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    if (datos.body.minimo != null) {
        check = validador.validarEstadistica(datos.body.minimo);
        if (!check.estado) return { codigo: 422, texto: check.texto }
    }
    if (datos.body.maximo != null) {
        check = validador.validarEstadistica(datos.body.maximo);
        if (!check.estado) return { codigo: 422, texto: check.texto }
    }
    if (datos.body.minimo > datos.body.maximo && datos.body.maximo != null) {
        return { codigo: 422, texto: 'El valor mínimo debe ser menor que el valor máximo' }
    }
    try {
        await bd.query(
            `INSERT INTO estadisticas (id, id_posicion, id_deporte, nombre, minimo, maximo) VALUES 
            (nextval('estadisticas_id_seq'),$1,$2,$3,$4,$5)`,
            [datos.posicion, datos.deporte, datos.body.nombre, datos.body.minimo, datos.body.maximo]
        ); 
        let estadistica = await bd.query(
            `SELECT * FROM estadisticas ORDER BY id DESC LIMIT 1`
        ); 
        estadistica = estadistica.rows[0];
        return { codigo: 200, texto: 'Se ha creado la estadística correctamente.', estadistica};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verEstadisticas (id_deporte) {
    try {
        let estadisticas = await bd.query(
            `SELECT e.id AS id, e.nombre AS nombre, p.nombre AS posicion, e.minimo AS minimo, e.maximo AS maximo
            FROM estadisticas e 
            JOIN posiciones p ON p.id= e.id_posicion
            WHERE e.id_deporte=$1 
            ORDER BY e.id`,
            [id_deporte]
        );

        let posiciones = await bd.query(
            `SELECT * FROM posiciones WHERE id_deporte=$1 ORDER BY id`,
            [id_deporte]
        );

        estadisticas = estadisticas.rows;
        posiciones = posiciones.rows;
    
        return { codigo: 200, estadisticas, posiciones}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verEstadistica (datos) {
    try {
        let estadistica = await bd.query(
            `SELECT e.id AS id, e.nombre AS nombre, p.id AS id_posicion, p.nombre AS posicion, e.minimo AS minimo, e.maximo AS maximo
            FROM estadisticas e 
            JOIN posiciones p ON p.id= e.id_posicion
            WHERE e.id=$1`,
            [datos.id_estadistica]
        );
        let posiciones = await bd.query(
            `SELECT * 
            FROM posiciones p
            WHERE p.id_deporte=$1 AND p.id NOT IN (
                SELECT p.id 
                FROM posiciones p
                JOIN estadisticas e ON e.id_posicion=p.id
                WHERE e.id=$2
            )
            ORDER BY p.id`,
            [datos.id_deporte, datos.id_estadistica]
        );

        estadistica = estadistica.rows[0];
        posiciones = posiciones.rows;
    
        return { codigo: 200, estadistica, posiciones}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function editarEstadistica (datos) {
    let check = validador.validarNombre(datos.body.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    if (datos.body.minimo != null) {
        check = validador.validarEstadistica(datos.body.minimo);
        if (!check.estado) return { codigo: 422, texto: check.texto }
    }
    if (datos.body.maximo != null) {
        check = validador.validarEstadistica(datos.body.maximo);
        if (!check.estado) return { codigo: 422, texto: check.texto }
    }
    if (datos.body.minimo > datos.body.maximo && datos.body.maximo != null) {
        return { codigo: 422, texto: 'El valor mínimo debe ser menor que el valor máximo' }
    }
    try {
        await bd.query(
            `UPDATE estadisticas SET nombre=$1, minimo=$2, maximo=$3, id_posicion=$4 WHERE id=$5`,
            [datos.body.nombre, datos.body.minimo, datos.body.maximo, datos.body.id_posicion, datos.estadistica]
        ); 
        let estadistica = await bd.query(
            `SELECT * FROM posiciones WHERE id=$1`,
            [datos.estadistica]
        ); 
        estadistica = estadistica.rows[0];

        return { codigo: 200, texto: 'Se han guardado los cambios correctamente.', estadistica};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function eliminarEstadistica (id_estadistica) {
    try {
        //Tabla Rendimientos
        await bd.query(`DELETE FROM rendimientos WHERE id_estadistica=$1`,[id_estadistica]);
        //Tabla Estadisticas
        await bd.query(`DELETE FROM estadisticas WHERE id=$1`,[id_estadistica]);
    
        return { codigo: 200, texto: 'La estadística se ha eliminado correctamente del sistema'}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

module.exports = { crearEstadisticas, verEstadisticas, verEstadistica, editarEstadistica, eliminarEstadistica }
