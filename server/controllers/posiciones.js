// Instanciamos la conexión a la BD y el validador
const bd = require('../conexion');
const validador = require('./validador');

async function crearPosicion (datos) {
    let check = validador.validarNombre(datos.body.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    try {
        await bd.query(
            `INSERT INTO posiciones (id, id_deporte, nombre) VALUES 
            (nextval('posiciones_id_seq'),$1,$2)`,
            [datos.params,datos.body.nombre]
        ); 
        let posicion = await bd.query(
            `SELECT * FROM posiciones ORDER BY id DESC LIMIT 1`
        ); 
        posicion = posicion.rows[0];
        return { codigo: 200, texto: 'Se ha creado la posición correctamente.', posicion};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verPosiciones (id_deporte) {
    try {
        let posiciones = await bd.query(
          `SELECT * FROM posiciones p WHERE p.id_deporte=$1`,
          [id_deporte]
        );
        posiciones = posiciones.rows;
    
        if(posiciones.length){
          return { codigo: 200, posiciones}
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verPosicion (datos) {
    try {
        let posicion = await bd.query(
          `SELECT * FROM posiciones p WHERE id=$1 AND id_deporte=$2`,
          [datos.posicion, datos.deporte]
        );
        posicion = posicion.rows[0];
    
        return { codigo: 200, posicion}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function editarPosicion (datos) {
    let check = validador.validarNombre(datos.body.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    try {
        await bd.query(
            `UPDATE posiciones SET nombre=$1 WHERE id=$2 AND id_deporte=$3`,
            [datos.body.nombre, datos.posicion, datos.deporte]
        ); 
        let posicion = await bd.query(
            `SELECT * FROM posiciones WHERE id=$1`,
            [datos.posicion]
        ); 
        posicion = posicion.rows[0];
        return { codigo: 200, texto: 'Se han guardado los cambios correctamente.', posicion};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function eliminarPosicion (datos) {
    try {
        await bd.query(`DELETE FROM estadisticas WHERE id_posicion=$1`,[datos.posicion]);
        await bd.query(`DELETE FROM rendimientos WHERE id_posicion=$1`,[datos.posicion]);
        await bd.query(`DELETE FROM inscripciones WHERE id_posicion=$1`,[datos.posicion]);
        await bd.query(`DELETE FROM posiciones WHERE id=$1`,[datos.posicion]);

        id_posicion = datos.posicion
    
        return { codigo: 200, texto: 'La posición se ha eliminado correctamente del sistema', id_posicion}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

module.exports = { crearPosicion, verPosiciones, verPosicion, editarPosicion, eliminarPosicion }
