// Instanciamos la conexión a la BD y el validador
const bd = require('../conexion');
const validador = require('./validador');

async function crearInscripcion (datos) {
    let checkInscripcion = await bd.query(
        `SELECT * FROM inscripciones 
        WHERE cedula_atleta=$1 AND id_categoria=$2 AND id_deporte=$3`,
        [datos.cedula, datos.categoria, datos.deporte]
    ); 
    checkInscripcion = checkInscripcion.rows;
    if(checkInscripcion.length){
        return { codigo: 400, texto:'El atleta ya se encuentra inscrito en esta categoria.'}
    }
    let checkAtleta = await bd.query(
        `SELECT * FROM atletas 
        WHERE cedula=$1`,
        [datos.cedula]
    ); 
    checkAtleta = checkAtleta.rows;
    if(checkAtleta.length == 0){
        return { codigo: 400, texto:'El atleta no se encuentra registrado en el sistema.'}
    }

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
    let check = validador.validarCedula(datos.cedula);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    try {
        await bd.query(
            `INSERT INTO inscripciones (cedula_atleta, id_categoria, id_deporte, fecha_registro, id_posicion, id_deporte_pos) VALUES
            ($1,$2,$3,TO_DATE($4,'DD/MM/YYYY'),$5,$6)`,
            [datos.cedula, datos.categoria, datos.deporte, datos.registro, datos.posicion, datos.deporte]
        );

        let inscripcion = await bd.query(
            `SELECT cedula_atleta, id_categoria, id_deporte, TO_CHAR(fecha_registro, 'DD/MM/YYYY'), id_posicion, id_deporte_pos 
            FROM inscripciones 
            WHERE cedula_atleta=$1 AND id_categoria=$2 AND id_deporte=$3 AND 
                fecha_registro=TO_DATE($4,'DD/MM/YYYY') AND id_posicion=$5 AND id_deporte_pos=$6`,
            [datos.cedula, datos.categoria, datos.deporte, datos.registro, datos.posicion, datos.deporte]
        ); 

        inscripcion = inscripcion.rows;
        return { codigo: 200, texto: 'Se ha registrado la inscripción del atleta correctamente', inscripcion}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verInscripciones (id_deporte) {
    try {
        let inscripciones = await bd.query(
            `SELECT TO_CHAR(i.fecha_registro, 'DD/MM/YYYY') AS fecha_registro, i.cedula_atleta AS cedula, (a.primer_nombre || ' ' || a.primer_apellido) AS nombre, 
            CASE WHEN a.genero = 'm' THEN 'Masculino' WHEN a.genero = 'f' THEN 'Femenino' ELSE 'Unisex' END AS genero, 
            CASE WHEN c.genero = 'm' THEN (c.nombre || ' (Masculino)') WHEN c.genero = 'f' THEN (c.nombre || ' (Femenino)') ELSE (c.nombre || ' (Unisex)') END AS categoria, 
            CASE WHEN i.id_posicion IS NULL THEN 'Sin Asignar' ELSE p.nombre END AS posicion, 
            i.id_deporte AS id_deporte, i.id_categoria AS id_categoria, i.id_posicion AS id_posicion
            FROM inscripciones i 
            JOIN atletas a ON a.cedula=i.cedula_atleta
            JOIN categorias c ON i.id_categoria=c.id
            FULL JOIN posiciones p ON i.id_posicion=p.id
            WHERE i.id_deporte=$1 
            ORDER BY i.id_categoria`,
            [id_deporte]
        );
        inscripciones = inscripciones.rows;
        return { codigo: 200, inscripciones}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verInscripcion (datos) {
    try {
        let atleta = await bd.query(
            `SELECT (primer_nombre || ' ' || primer_apellido) AS nombre
            FROM atletas
            WHERE cedula=$1`,
            [datos.cedula]
        );
        let categoria = await bd.query(
            `SELECT nombre AS nombre
            FROM categorias
            WHERE id=$1`,
            [datos.categoria]
        );

        atleta = atleta.rows;
        categoria = categoria.rows;

        return { codigo: 200, atleta, categoria}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function editarInscripcion (datos) {
    let checkAtleta = await bd.query(
        `SELECT * FROM atletas 
        WHERE cedula=$1`,
        [datos.cedula]
    ); 
    checkAtleta = checkAtleta.rows;
    if(checkAtleta.length == 0){
        return { codigo: 400, texto:'El atleta no se encuentra registrado en el sistema.'}
    }
    try {
        await bd.query(
            `UPDATE inscripciones SET id_posicion=$1 
            WHERE cedula_atleta=$2 AND id_categoria=$3 AND id_deporte=$4`,
            [datos.posicion, datos.cedula, datos.categoria, datos.deporte]
        ); 
        let inscripcion = await bd.query(
            `SELECT cedula_atleta, id_categoria, id_deporte, TO_CHAR(fecha_registro, 'DD/MM/YYYY'), id_posicion, id_deporte_pos 
            FROM inscripciones 
            WHERE cedula_atleta=$1 AND id_categoria=$2 AND id_deporte=$3`,
            [datos.cedula, datos.categoria, datos.deporte]
        ); 

        inscripcion = inscripcion.rows;
        return { codigo: 200, texto: 'Se han guardado los cambios correctamente.', inscripcion};
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function eliminarInscripcion (datos) {
    let checkAtleta = await bd.query(
        `SELECT * FROM atletas 
        WHERE cedula=$1`,
        [datos.cedula]
    ); 
    checkAtleta = checkAtleta.rows;
    if(checkAtleta.length == 0){
        return { codigo: 400, texto:'El atleta no se encuentra registrado en el sistema.'}
    }
    try {
        //Tabla Inscripciones
        await bd.query(
            `DELETE FROM inscripciones 
            WHERE cedula_atleta=$1 AND id_categoria=$2`,
        [datos.cedula, datos.categoria]);
        //Tabla Participaciones
        await bd.query(
            `DELETE FROM participaciones 
            WHERE cedula_atleta=$1 AND id_categoria=$2`,
        [datos.cedula, datos.categoria]);
    
        return { codigo: 200, texto: 'El atleta se ha removido de la plantilla correctamente', datos}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verCategoriasAtleta (datos) {
    let check = await bd.query(
        `SELECT * FROM atletas 
        WHERE cedula=$1`,
        [datos.cedula]
    ); 
    check = check.rows;
    if(check.length == 0){
        return { codigo: 400}
    }
    try {
        let categoriasDisponibles = await bd.query(
            `SELECT c.id AS id, c.id_deporte AS id_deporte,
            CASE WHEN c.genero = 'm' THEN (c.nombre || ' (Masculino)') WHEN c.genero = 'f' THEN (c.nombre || ' (Femenino)') ELSE (c.nombre || ' (Unisex)') END AS nombre
            FROM categorias c
            FULL JOIN inscripciones i ON i.id_categoria=c.id
            WHERE c.id_deporte=$1 AND (i.cedula_atleta<>$2 OR i.cedula_atleta IS NULL)
            GROUP BY c.id, c.id_deporte, c.genero
            ORDER BY c.id`,
            [datos.deporte, datos.cedula]
        );

        let categoriasInscrito = await bd.query(
            `SELECT c.id AS id, c.id_deporte AS id_deporte,
            CASE WHEN c.genero = 'm' THEN (c.nombre || ' (Masculino)') WHEN c.genero = 'f' THEN (c.nombre || ' (Femenino)') ELSE (c.nombre || ' (Unisex)') END AS nombre
            FROM categorias c
            FULL JOIN inscripciones i ON i.id_categoria=c.id
            WHERE c.id_deporte=$1 AND i.cedula_atleta=$2
            ORDER BY c.id`,
            [datos.deporte, datos.cedula]
        );

        categoriasDisponibles = categoriasDisponibles.rows;
        categoriasInscrito = categoriasInscrito.rows;
        
        return { codigo: 200, categoriasDisponibles, categoriasInscrito}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

async function verPosicionesCategoria (datos) {
    try {
        let posiciones = await bd.query(
            `SELECT p.id AS id, p.id_deporte AS id_deporte, p.nombre AS nombre 
            FROM posiciones p
            JOIN categorias c ON c.id_deporte=p.id_deporte
            WHERE c.id=$1
            ORDER BY p.id`,
            [datos.categoria]
        );

        let posicionesInscrito = await bd.query(
            `SELECT p.id AS id, p.id_deporte AS id_deporte, p.nombre AS nombre 
            FROM posiciones p
            JOIN inscripciones i ON i.id_posicion=p.id
            WHERE i.id_categoria=$1 AND i.cedula_atleta=$2
            ORDER BY p.id`,
            [datos.categoria, datos.cedula]
        );

        let posicionesDisponibles = await bd.query(
            `SELECT p.id AS id, p.id_deporte AS id_deporte, p.nombre AS nombre 
            FROM posiciones p
            WHERE p.id NOT IN (
                SELECT p.id AS id 
                FROM posiciones p
                JOIN inscripciones i ON i.id_posicion=p.id
                WHERE i.id_categoria=$1 AND i.cedula_atleta=$2
                ORDER BY p.id
            ) AND p.id_deporte=$3`,
            [datos.categoria, datos.cedula, datos.deporte]
        );

        posiciones = posiciones.rows;
        posicionesInscrito = posicionesInscrito.rows;
        posicionesDisponibles = posicionesDisponibles.rows;

        return { codigo: 200, posiciones, posicionesInscrito, posicionesDisponibles}
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

module.exports = { crearInscripcion, verInscripciones, verInscripcion, eliminarInscripcion, editarInscripcion, verCategoriasAtleta, verPosicionesCategoria }
