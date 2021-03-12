/* instanciamos la conexion a la bd */
const bd = require('../conexion');

/* 
  verifica si se requiere configuracion inicial contando los usuarios, si no hay usuarios se envia
  un codigo HTTP 428 (Precondición requerida) y el mensaje config indicando que se debe hacer la config
  inicial para acceder a este contenido, en caso de error inesperado se devuelve un codigo 500
  Si todo sale bien se llama a next() ya que no se requiere configuración inicial
*/
async function verifyConfig (req, res, next) {
  try  {
    /* contamos a los usuarios del sistema */
    let check = await bd.query('SELECT COUNT(*) FROM usuarios');
    check = check.rows;
    /* no existen usuarios --> se envia 428 */
    if (!check.length || check[0].count === 0 || check[0].count === '0') res.status(428).send('config');
    /* existen usuarios --> no se requiere config */
    else next();

  }
  /* en caso de error inesperado */
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    res.status(500).send('Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.');
  }
}

module.exports = verifyConfig;