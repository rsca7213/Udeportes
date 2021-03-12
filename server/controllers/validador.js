
/* funcion que toma un arreglo de reglas y un valor, compara el valor con todas las reglas */
function  validar(reglas, valor) {
  for (let i = 0; i < reglas.length; i++) {
    if (reglas[i](valor) != true) return {
      estado: false,
      texto: reglas[i](valor)
    }
  }
  return {
    estado: true,
    texto: ''
  }
};

/***** Reglas de validación ******/

const reglasCedula = [
  v => v && v.length <= 8 || 'La cédula de identidad no debe ser mayor a 8 caracteres',
];

const reglasNombre = [
  v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
];

const reglasSegundoNombre = [
  v => v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
];

const reglasCorreo = [
  v => v && v.length >= 8 || 'El correo electrónico debe contener como minimo 8 caracteres.',
  v => v && v.length <= 256 || 'El correo electrónico debe contener como máximo 256 caracteres.',
  v => v && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) || 'Debe ser un correo electrónico valido.'
];

const reglasClave = [
  v => v && v.length >= 8 || 'La contraseña debe contener como mínimo 8 caracteres.',
  v => v && v.length <= 128 || 'La constraseña debe contener como máximo 128 caracteres.' 
]

let validador = {
  /* Objeto exportable que contendra los metodos de validación */
  validarCedula: (cedula) => validar(reglasCedula, cedula),
  validarNombre: (nombre) => validar(reglasNombre, nombre),
  validarSegundoNombre: (s_nombre) => validar(reglasSegundoNombre, s_nombre),
  validarCorreo: (correo) => validar(reglasCorreo, correo),
  validarClave: (clave) => validar(reglasClave, clave)
};

module.exports = validador;