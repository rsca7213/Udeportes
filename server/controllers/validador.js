
/* funcion que toma un arreglo de reglas y un valor, compara el valor con todas las reglas */
function validar(reglas, valor) {
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
  v => !!v || 'La cédula de identidad es obligatoria',
  v => v && v.length <= 8 || 'La cédula de identidad no debe ser mayor a 8 caracteres',
  v => v && (/^\d{0,9}$/.test(v)) || 'Debe ser una cédula válida',
];

const reglasNombre = [
  v => !!v || 'Este campo es obligatorio',
  v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
];

const reglasSegundoNombre = [
  v => !v || v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
];

const reglasCorreo = [
  v => v && v.length >= 8 || 'El correo electrónico debe contener como mínimo 8 caracteres.',
  v => v && v.length <= 256 || 'El correo electrónico debe contener como máximo 256 caracteres.',
  v => v && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) || 'Debe ser un correo electrónico valido.'
];

const reglasClave = [
  v => v && v.length >= 8 || 'La contraseña debe contener como mínimo 8 caracteres.',
  v => v && v.length <= 128 || 'La constraseña debe contener como máximo 128 caracteres.'
];

const reglasTelefono = [
  v => ((v && v.length == 11) || !v) || 'El teléfono debe tener 11 caracteres.',
  v => ((v && (/^\d{1,11}$/.test(v))) || !v) || 'Debe ser un teléfono válido.'
];

const reglasFecha = [
  v => (!v || (v && (/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/]\d{4}$/)).test(v)) || 'Debe ser una fecha válida dd/mm/yyyy',
  v => !v || v.length <= 10 || 'La fecha debe contener como máximo 10 caracteres.'
];

const reglasFechaObligatoria = [
  v => !!v || 'La fecha es obligatoria.',
  v => v && (/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/]\d{4}$/).test(v) || 'Debe ser una fecha válida dd/mm/yyyy',
  v => v && v.length <= 10 || 'La fecha debe contener como máximo 10 caracteres.'
]

const reglasRol = [
  v => ['a', 'e'].includes(v) || 'El rol es obligatorio',
];

const reglasGenero = [
  v => v && ['m', 'f'].includes(v) || 'El género es obligatorio'
];

const reglasEducacionAtleta = [
  // El valor "v"  tiene la siguiente forma: v = { id: Number, etapa: Number }
  v => !v.id || v.id === '0' || typeof (parseInt(v.id)) === typeof (1) || 'La educación no es válida',
  v => !v.id || v.id === '0' || v.id > 0 || 'La educación no es válida',
  v => !v.id || v.id === '0' || typeof (v.etapa) === 'number' || 'La etapa debe ser un número',
  v => !v.id || v.id === '0' || v.etapa > 0 || 'La etapa debe ser mayor o igual a 1',
  v => !v.id || v.id === '0' || v.etapa < 100 || 'La etapa debe ser menor o igual a 99'
];

const reglasCorreoOpcional = [
  v => !v || v.length >= 8 || 'El correo electrónico debe contener como mínimo 8 caracteres.',
  v => !v || v.length <= 256 || 'El correo electrónico debe contener como máximo 256 caracteres.',
  v => !v || (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) || 'Debe ser un correo electrónico valido.'
];

const reglasBeca = [
  // El valor "v" tiene la siguiente forma: v = { nombre: String, porcentaje: String }
  v => !v.nombre || v.nombre.length === 0 || v.nombre.length <= 200 || 'El nombre de la beca debe contener como máximo 200 caracteres',
  v => !v.nombre || v.nombre.length === 0 || typeof (v.porcentaje) === 'number' || 'El porcentaje de la beca debe ser un número',
  v => !v.nombre || v.nombre.length === 0 || v.porcentaje >= 0 || 'El porcentaje de la beca debe ser mayor o igual a 0',
  v => !v.nombre || v.nombre.length === 0 || v.porcentaje <= 100 || 'El porcentaje de la beca debe ser menor o igual a 100'
];

const reglasNombreEducacion = [
  v => !!v || 'El nombre es obligatorio',
  v => v && v.length <= 200 || 'El nombre debe contener como máximo 200 caracteres',
];

const reglasEtapaEducacion = [
  v => v && ['m', 't', 's', 'a'].includes(v) || 'El tipo de etapa o período es obligatorio'
];

const reglasId = [
  v => v && typeof (v) === typeof (1) || 'La id no es un número'
];

const reglasNombreEntrenamiento = [
  v => !v || v.length === 0 || v.length <= 50 || 'El nombre del entrenamiento debe contener como máximo 50 caracteres'
];

const reglasNombreCompetencia = [
  v => !!v || 'El nombre de la competencia es obligatorio',
  v => v && v.length <= 50 || 'El nombre de la competencia debe contener como máximo 50 caracteres'
];

const reglasEstatusCompetencia = [
  v => !!v || 'El estatus es obligatorio',
  v => v && ['n', 'e', , 'i', 'd', 'v'].includes(v) || 'Valor de estatus inválido'
];

const reglasEstadisticas = [
  v => v <= 99999999 || 'El valor no debe ser mayor a 8 dígitos',
  v => (/^\d{0,9}$/.test(v)) || 'Debe ser una cifra válida',
];



let validador = {
  /* Objeto exportable que contendra los metodos de validación */
  validarCedula: (cedula) => validar(reglasCedula, cedula),
  validarNombre: (nombre) => validar(reglasNombre, nombre),
  validarSegundoNombre: (s_nombre) => validar(reglasSegundoNombre, s_nombre),
  validarCorreo: (correo) => validar(reglasCorreo, correo),
  validarClave: (clave) => validar(reglasClave, clave),
  validarTelefono: (telefono) => validar(reglasTelefono, telefono),
  validarFecha: (fecha) => validar(reglasFecha, fecha),
  validarRol: (rol) => validar(reglasRol, rol),
  validarGenero: (genero) => validar(reglasGenero, genero),
  // validarEducacionAtleta requiere de un objeto del tipo educacion = { id: Number, etapa: Number }
  validarEducacionAtleta: (educacion) => validar(reglasEducacionAtleta, educacion),
  validarCorreoOpcional: (correo) => validar(reglasCorreoOpcional, correo),
  // validarBeca requiere de un objeto del tipo beca = { nombre: String, porcentaje: Number }
  validarBeca: (beca) => validar(reglasBeca, beca),
  validarFechaObligatoria: (fecha) => validar(reglasFechaObligatoria, fecha),
  validarNombreEducacion: (nombre) => validar(reglasNombreEducacion, nombre),
  validarEtapaEducacion: (etapa) => validar(reglasEtapaEducacion, etapa),
  validarId: (id) => validar(reglasId, id),
  validarNombreEntrenamiento: (nombre) => validar(reglasNombreEntrenamiento, nombre),
  validarNombreCompetencia: (nombre) => validar(reglasNombreCompetencia, nombre),
  validarEstatusCompetencia: (estatus) => validar(reglasEstatusCompetencia, estatus),
  validarEstadistica: (valor) => validar(reglasEstadisticas, valor),
};

module.exports = validador;