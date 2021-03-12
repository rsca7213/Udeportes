// Importamos Bcrypt, JWT, Instanciamos la conexión a la BD y el validador
const bcrypt = require('bcrypt');
const bd = require('../conexion');
const validador = require('./validador');

// Función que compara las credenciales introducidas con las guardadas en la base de datos
async function init (params) {
    let check = validador.validarCedula(params.cedula);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarNombre(params.primer_nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarNombre(params.primer_apellido);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarNombre(params.segundo_apellido);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarSegundoNombre(params.segundo_nombre);
    if (!check.estado) return { codigo: 422, texto: check.texto }
    check = validador.validarClave(params.clave);
    if (!check.estado) return { codigo: 422, texto: check.texto }

    try {
        params.clave = await bcrypt.hash(params.clave, 10);
        params.correo = params.correo.toLowerCase(); 
        const {cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, clave} = params;
        await bd.query(
            `INSERT INTO usuarios (cedula, rol, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, clave) VALUES ($1,'a',$2,$3,$4,$5,$6,$7)`,
            [cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, clave]
        ); 
        return { codigo: 200, texto: 'Se ha creado el administrador correctamente.'};
    }
    catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
    }
}

module.exports = {init}
