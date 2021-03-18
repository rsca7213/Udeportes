/*
  Funcion que toma 2 fechas en formato "dd/mm/yyyy"
  y retorna true si la segunda es mayor o igual a la primera
  falso en caso contrario
*/
function comparar (fecha1, fecha2) {
  let dia = parseInt(fecha1.split("/")[0]);
  let mes = parseInt(fecha1.split("/")[1]);
  let year = parseInt(fecha1.split("/")[2]);

  let fechaUTC1 = new Date (year, mes, dia);

  dia = parseInt(fecha2.split("/")[0]);
  mes = parseInt(fecha2.split("/")[1]);
  year = parseInt(fecha2.split("/")[2]);

  let fechaUTC2 = new Date (year, mes, dia);
  
  return fechaUTC2 >= fechaUTC1;
}

module.exports = comparar;