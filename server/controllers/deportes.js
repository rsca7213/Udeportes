// Importamos Bcrypt, Instanciamos la conexión a la BD y el validador
const bd = require('../conexion');
const validador = require('./validador');

async function crearDeporte (datos) {
    let check = validador.validarNombre(datos.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    let check_uniques = await bd.query(`SELECT EXISTS (SELECT 1 FROM deportes WHERE nombre = $1) AS "existe"`, [datos.nombre])
    if (check_uniques.rows[0].existe) return { codigo: 400, texto: 'Ya existe un deporte con el nombre intorducido' }
    try {
        await bd.query(
            `INSERT INTO deportes (id, nombre) VALUES (nextval('deportes_id_seq'),$1)`,
            [datos.nombre]
        ); 
        let deporte = await bd.query(
            `SELECT * FROM deportes WHERE nombre=$1`,
            [datos.nombre]
        ); 
        deporte = deporte.rows[0];
        return { codigo: 200, texto: 'Se ha creado el deporte correctamente.', deporte};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verDeportes () {
    try {
        let deportes = await bd.query(
          `SELECT d.id, d.nombre FROM deportes d ORDER BY d.id`
        );
        deportes = deportes.rows;
    
        if(deportes.length){
          return { codigo: 200, deportes}
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verDeporte (deporte_id) {
    try {
        let deporte = await bd.query(
          `SELECT d.id, d.nombre FROM deportes d WHERE id=$1`,
          [deporte_id]
        );
        deporte = deporte.rows[0];
    
        return { codigo: 200, deporte}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function editarDeporte (edit) {
    let check = validador.validarNombre(edit.datos.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    let check_uniques = await bd.query(`SELECT EXISTS (SELECT 1 FROM deportes WHERE nombre = $1) AS "existe"`, [edit.datos.nombre])
    if (check_uniques.rows[0].existe) return { codigo: 400, texto: 'Ya existe un deporte con el nombre intorducido' }
    const id = edit.params.id
    try {
        await bd.query(
            `UPDATE deportes SET nombre=$1 WHERE id=$2`,
            [edit.datos.nombre, id]
        ); 
        let deporte = await bd.query(
            `SELECT * FROM deportes WHERE nombre=$1`,
            [edit.datos.nombre]
        ); 
        deporte = deporte.rows[0];
        return { codigo: 200, texto: 'Se han guardado los cambios correctamente.', deporte};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function eliminarDeporte (deporte_id) {
    try {
        await bd.query(
          `DELETE FROM deportes WHERE id=$1`,
          [deporte_id]
        );
    
        return { codigo: 200, texto: 'El deporte se ha eliminado correctamente del sistema', deporte_id}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

module.exports = { crearDeporte, verDeportes, verDeporte, editarDeporte, eliminarDeporte }
