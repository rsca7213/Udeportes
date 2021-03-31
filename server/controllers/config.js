// Importamos Bcrypt, Instanciamos la conexión a la BD y el validador
const bcrypt = require('bcrypt');
const bd = require('../conexion');
const validador = require('./validador');

// Función que realiza la configuración inicial del sistema (agregar al usuario admin), solo sera llamada cuando no haya ningun usuario
// registrado en el sistema, verificado por mw_config
async function init (params) {
    // Validamos los datos introducidos por el usuario 
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
    // Intentamos insertar al usuario, devolviendo 200 si todo sale bien
    try {
        params.clave = await bcrypt.hash(params.clave, 10);
        params.correo = params.correo.toLowerCase(); 
        const {cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, clave} = params;
        await bd.query(
            `INSERT INTO usuarios (cedula, rol, primer_nombre, segundo_nombre, primer_apellido, 
            segundo_apellido, correo, clave) VALUES ($1,'a',$2,$3,$4,$5,$6,$7)`,
            [cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, clave]
        ); 
        return { codigo: 200, texto: 'Se ha realizado la configuración inicial del sistema correctamente.'};
    }
    // En caso de un error inesperado retornamos un codigo 500
    catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.'};
    }
}

/*
    Funcion auxiliar para verificar la existencia de configuración inicial,
    utilizada al momento de verificar la accion POST del routerConfig
*/
async function verifyInitAux () {
    try  {
        /* contamos a los usuarios del sistema */
        let check = await bd.query('SELECT COUNT(*) FROM usuarios');
        check = check.rows;
        /* no existen usuarios --> se envia 428 */
        if (!check.length || check[0].count === 0 || check[0].count === '0') return false;
        /* existen usuarios --> no se requiere config */
        else return true;
    
    }
      /* en caso de error inesperado */
    catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return false;
    }
}

module.exports = {init, verifyInitAux}
