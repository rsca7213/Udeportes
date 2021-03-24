// Importamos Bcrypt, JWT, Instanciamos la conexión a la BD y el validador
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bd = require('../conexion');
const validador = require('./validador');

// Función que compara las credenciales introducidas con las guardadas en la base de datos
async function login (credenciales) {

  // Validamos las credenciales (correo y clave)
  let check = validador.validarCorreo(credenciales.correo);
  if (!check.estado) return { codigo: 422, texto: check.texto }
  check = validador.validarClave(credenciales.clave);
  if (!check.estado) return { codigo: 422, texto: check.texto }

  try {
    // transformamos las credenciales de correo a minuscula ya que los correos son case insensitive
    credenciales.correo = credenciales.correo.toLowerCase();

    // buscamos en la base de datos al usuario con el correo introducido
    let usuario = await bd.query(
      'SELECT u.cedula, u.correo, u.clave FROM usuarios u WHERE u.correo = $1',
      [credenciales.correo]
    );
    usuario = usuario.rows;

    // si el usuario no existe, devolvemos mensaje con codigo 401 (no autorizado)
    if (!usuario.length) return { codigo: 401, texto: 'El correo o la constraseña introducida no es valida.'}
    // en caso contrario, verificamos la clave del usuario con metodos Bcrypt Hash
    else {
      usuario = usuario[0];
      check = await bcrypt.compare(credenciales.clave, usuario.clave);

      // si la clave es correcta, check = true, devolvemos codigo 200 y la cedula del usuario, en caso contrario mensaje con codigo 401
      if (check) return { codigo: 200, cedula: usuario.cedula }
      else return { codigo: 401, texto: 'El correo o la contraseña introducida no es valida.'}
    }
  }
  // en caso de algun error inesperado devolvemos un error 500 y en caso de que el ambiente es DEV, hacemos log del error
  catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return { codigo: 500, texto: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'};
  }
}

// Función que se encarga de generar un token JWT valido por 24 horas que contiene la cedula del usuario autorizado
function crearToken (cedula) {
  let token = jwt.sign(
    {
      cedula: cedula.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '12h'
    }
  );
  return token;
}

module.exports = {
  login,
  crearToken
}
