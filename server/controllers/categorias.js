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
    check = validador.validarFechaObligatoria(datos.registro);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    try {
        await bd.query(
            `INSERT INTO categorias (id, id_deporte, nombre, fecha_registro, genero) VALUES 
            (nextval('categorias_id_seq'),$1,$2,TO_DATE($3,'DD/MM/YYYY'),$4)`,
            [datos.params, datos.body.nombre, datos.registro, datos.body.genero]
        ); 
        let categoria = await bd.query(
            `SELECT id, id_deporte, nombre, TO_CHAR(fecha_registro, 'DD/MM/YYYY') AS fecha_registro, 
            CASE WHEN genero = 'm' THEN 'Masculino' WHEN genero = 'f' THEN 'Femenino' ELSE 'Unisex' END AS genero 
            FROM categorias 
            ORDER BY id DESC LIMIT 1`
        ); 
        categoria = categoria.rows[0];
        return { codigo: 200, texto: 'Se ha creado la categoría correctamente.', categoria};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verCategorias (id_deporte) {
    try {
        let categorias = await bd.query(
            `SELECT c.id AS id, c.id_deporte AS id_deporte, c.nombre As nombre, TO_CHAR(c.fecha_registro, 'DD/MM/YYYY') AS fecha_registro, 
            CASE WHEN c.genero = 'm' THEN 'Masculino' WHEN c.genero = 'f' THEN 'Femenino' ELSE 'Unisex' END AS genero
            FROM asignaciones a
            FULL JOIN categorias c ON a.id_categoria=c.id
            WHERE c.id_deporte=$1 
            GROUP BY c.id, c.id_deporte, c.nombre, c.fecha_registro, c.genero
            ORDER BY c.id`,
            [id_deporte]
        );
        let categoriasAsignar = await bd.query(
            `SELECT c.id AS id, 
            CASE WHEN c.genero = 'm' THEN (c.nombre || ' (Masculino)') WHEN c.genero = 'f' THEN (c.nombre || ' (Femenino)') ELSE (c.nombre || ' (Unisex)') END AS nombre
            FROM asignaciones a
            FULL JOIN categorias c ON a.id_categoria=c.id
            WHERE c.id_deporte=$1
            GROUP BY c.id, c.genero, c.nombre
            ORDER BY c.id`,
            [id_deporte]
        );
        categoriasAsignar = categoriasAsignar.rows
        categorias = categorias.rows;
        return { codigo: 200, categorias, categoriasAsignar}
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
          FROM categorias 
          WHERE id=$1 AND id_deporte=$2`,
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
    // check = validador.validarGenero(datos.body.genero);
    // if (!check.estado) return { codigo: 422, texto: check.texto }
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
        //Tabla Rendimientos
        await bd.query( `DELETE FROM rendimientos WHERE id_categoria=$1`,[datos.categoria]);
        //Tabla Participaciones
        await bd.query( `DELETE FROM participaciones WHERE id_categoria=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM participaciones WHERE id_categoria_comp=$1`,[datos.categoria]);
        await bd.query( `DELETE FROM participaciones WHERE id_categoria_ent=$1`,[datos.categoria]);
        //Tabla Competencias
        await bd.query( `DELETE FROM competencias WHERE id_categoria=$1`,[datos.categoria]);
        //Tabla Entrenamientos
        await bd.query( `DELETE FROM entrenamientos WHERE id_categoria=$1`,[datos.categoria]);
        //Tabla Inscripciones
        await bd.query( `DELETE FROM inscripciones WHERE id_categoria=$1`,[datos.categoria]);
        //Tabla Asignaciones
        await bd.query( `DELETE FROM asignaciones WHERE id_categoria=$1`,[datos.categoria]);
        //Tabla Categorias
        await bd.query( `DELETE FROM categorias WHERE id=$1`,[datos.categoria]);

        id_categoria = datos.categoria
    
        return { codigo: 200, texto: 'La categoría se ha eliminado correctamente del sistema', id_categoria}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verEntrenadores (id_categoria) {
    try {
        let check = await bd.query(
            `SELECT *
            FROM asignaciones a 
            WHERE a.id_categoria=$1`,
            [id_categoria]
        ); 
        let entrenadoresDis = [];
        check = check.rows;

        entrenadores = await bd.query(
            `SELECT u.cedula AS cedula, (u.primer_nombre || ' ' || u.primer_apellido) AS nombre 
            FROM usuarios u 
            WHERE u.rol='e'`,
        );

        if (check.length == 0) {
            entrenadoresDis = await bd.query(
                `SELECT u.cedula AS cedula, (u.primer_nombre || ' ' || u.primer_apellido) AS nombre 
                FROM usuarios u 
                WHERE u.rol='e'`,
            );
        } else {
            entrenadoresDis = await bd.query(
                `SELECT u.cedula AS cedula, (u.primer_nombre || ' ' || u.primer_apellido) AS nombre 
                FROM usuarios u
                WHERE u.rol='e' AND u.cedula NOT IN (
                    SELECT cedula_usuario FROM asignaciones WHERE id_categoria=$1
                )`,
                [id_categoria]
            );
        }

        entrenadoresAsignados = await bd.query(
            `SELECT u.cedula AS cedula, (u.primer_nombre || ' ' || u.primer_apellido) AS nombre 
            FROM usuarios u
            JOIN asignaciones a ON a.cedula_usuario=u.cedula
            WHERE u.rol='e' AND a.id_categoria=$1`,
            [id_categoria]
        );
        
        entrenadores = entrenadores.rows;
        entrenadoresDis = entrenadoresDis.rows;
        entrenadoresAsignados = entrenadoresAsignados.rows;
        
        return { codigo: 200, entrenadores, entrenadoresDis, entrenadoresAsignados}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verCategoriasEntrenador (datos) {
    try {
        let categorias = await bd.query(
            `SELECT c.id AS id, 
            CASE WHEN c.genero = 'm' THEN (c.nombre || ' (Masculino)') WHEN c.genero = 'f' THEN (c.nombre || ' (Femenino)') ELSE (c.nombre || ' (Unisex)') END AS nombre
            FROM asignaciones a, categorias c
            WHERE c.id_deporte=$1 AND a.cedula_usuario=$2 AND c.id=a.id_categoria
            ORDER BY c.id`,
            [datos.deporte, datos.cedula]
        );
        categorias = categorias.rows
        return { codigo: 200, categorias}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

module.exports = { crearCategoria, verCategorias, verCategoria, editarCategoria, eliminarCategoria, verEntrenadores, verCategoriasEntrenador }
