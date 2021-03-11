/* instanciamos la conexión a la bd */
const bd = require('../conexion');

/* 
  Funcion que obtiene el nombre y apellido de un usuario a partir de la cedula que se provee, devuelve los datos
  con un codigo 200 si todo sale bien, 404 si no encuentra al usuario y 500 en caso de error inesperado
*/
async function nombrePerfil (cedula) {

  try {
    /* intenta buscar los datos del usuario a partir de la cedula */
    let perfil = await bd.query(
      'SELECT u.cedula, u.primer_nombre, u.primer_apellido FROM usuarios u WHERE u.cedula = $1',
      [cedula]
    );
    perfil = perfil.rows;
    /* si no se consigue al usuario se devuelve un 404 */
    if (!perfil.length) return { codigo: 404, texto: 'Perfil no encontrado.'}
    /* en caso de que todo salga bien se retorna un 200 y los datos */
    else {
      return {
        codigo: 200,
        primer_nombre: perfil[0].primer_nombre,
        primer_apellido: perfil[0].primer_apellido,
      }
    }
  }
  /* en caso de error inesperado */
  catch(error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }

}

module.exports = {
  nombrePerfil
}