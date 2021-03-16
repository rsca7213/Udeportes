// Instanciamos la conexión a la BD y el validador
const bd = require('../conexion');
const validador = require('./validador');

async function crearCategoria (datos) {
    var hoy = new Date();
    var dd = hoy.getDate(); 
    var mm = hoy.getMonth() + 1; 
    var yyyy = hoy.getFullYear(); 
    if (dd < 10) { 
        dd = '0' + dd; 
    } 
    if (mm < 10) { 
        mm = '0' + mm; 
    } 
    hoy = dd + '/' + mm + '/' + yyyy; 
    datos.registro = hoy;
    let check = validador.validarNombre(datos.body.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarGenero(datos.body.genero);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarFechaObligatoria(datos.registro);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    try {
        await bd.query(
            `INSERT INTO categorias (id, id_deporte, nombre, fecha_registro, genero) VALUES 
            (nextval('categorias_id_seq'),$1,$2,$3,$4)`,
            [datos.params, datos.body.nombre, datos.registro, datos.body.genero]
        ); 
        let categoria = await bd.query(
            `SELECT id, id_deporte, nombre, TO_CHAR(fecha_registro, 'DD/MM/YYYY'), genero FROM categorias ORDER BY id DESC LIMIT 1`
        ); 
        categoria = categoria.rows[0];
        return { codigo: 200, texto: 'Se ha creado la categoria correctamente.', categoria};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verCategorias (id_deporte) {
    try {
        let categorias = await bd.query(
          `SELECT id AS id, id_deporte AS id_deporte, nombre As nombre, TO_CHAR(fecha_registro, 'DD/MM/YYYY') AS fecha_registro, 
          CASE WHEN genero = 'm' THEN 'Masculino' WHEN genero = 'f' THEN 'Femenino' ELSE 'Unisex' END AS genero
          FROM categorias WHERE id_deporte=$1`,
          [id_deporte]
        );
        categorias = categorias.rows;
    
        if(categorias.length){
          return { codigo: 200, categorias}
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verCategoria (datos) {
    try {
        let categoria = await bd.query(
          `SELECT id AS id, id_deporte AS id_deporte, nombre As nombre, TO_CHAR(fecha_registro, 'DD/MM/YYYY') AS fecha_registro,  
          CASE WHEN genero = 'm' THEN 'Masculino' WHEN genero = 'f' THEN 'Femenino' ELSE 'Unisex' END AS genero  
          FROM categorias WHERE id=$1 AND id_deporte=$2`,
          [datos.categoria, datos.deporte]
        );
        categoria = categoria.rows[0];
    
        return { codigo: 200, categoria}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function editarCategoria (datos) {
    let check = validador.validarNombre(datos.body.nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarGenero(datos.body.genero);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    try {
        await bd.query(
            `UPDATE categorias SET nombre=$1, genero=$2 WHERE id=$3 AND id_deporte=$4`,
            [datos.body.nombre, datos.body.genero, datos.categoria, datos.deporte]
        ); 
        let categoria = await bd.query(
            `SELECT * FROM categorias WHERE id=$1`,
            [datos.categoria]
        ); 
        categoria = categoria.rows[0];
        return { codigo: 200, texto: 'Se han guardado los cambios correctamente.', categoria};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function eliminarCategoria (datos) {
    try {
        await bd.query( `DELETE FROM asignaciones WHERE id_categoria=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM entrenamientos WHERE id_categoria=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM competencias WHERE id_categoria=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM rendimientos WHERE id_categoria=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM inscripciones WHERE id_categoria=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM participaciones WHERE id_categoria=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM participaciones WHERE id_categoria_comp=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM participaciones WHERE id_categoria_ent=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM categorias WHERE id=$1`,[datos.categoria]);

        id_categoria = datos.categoria
    
        return { codigo: 200, texto: 'La categoria se ha eliminado correctamente del sistema', id_categoria}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

module.exports = { crearCategoria, verCategorias, verCategoria, editarCategoria, eliminarCategoria }
