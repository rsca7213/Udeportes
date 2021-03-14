/*
  Funcion que toma la fecha de nacimiento en formato "dd/mm/yyyy"
  y retorna la edad comparandola con la fecha actua;
*/
function calcularEdad (fecha) {
  let dia = parseInt(fecha.split("/")[0]);
  let mes = parseInt(fecha.split("/")[1]);
  let year = parseInt(fecha.split("/")[2]);

  let fechaUTC = new Date (year, mes, dia);

  return Math.abs(new Date (Date.now() - fechaUTC.getTime()).getUTCFullYear() - 1970);
}

module.exports = calcularEdad;