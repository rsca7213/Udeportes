<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" lg="9" xl="8" class="elevation-4 py-4 px-6 rounded-lg">
        <v-row align="center">
          <v-col cols="12" class="px-1 px-sm-2">
            <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
            prepend-icon="mdi-magnify" type="text" v-model="busquedaEntrenamiento" name="busqueda"> </v-text-field>
          </v-col>
        </v-row>
        <v-row class="d-none d-md-flex">
          <v-col cols="12" class="text-right">
            <RegistrarEntrenamiento :id_deporte="id_deporte" :id_categoria="id_categoria"
            @entrenamientoRegistrado="getEntrenamientos()" />
          </v-col>
        </v-row>
        <v-row class="d-flex d-md-none">
          <v-col class="text-center px-0" cols="12">
            <RegistrarEntrenamiento :id_deporte="id_deporte" :id_categoria="id_categoria"
            @entrenamientoRegistrado="getEntrenamientos()" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="px-0 px-sm-2"> 
            <v-data-table :headers="atributosTabla" :items="entrenamientosData" :search="busquedaEntrenamiento" 
            no-data-text="No hay entrenamientos registrados para esta categoria."
            no-results-text="No hay resultados para esta busqueda."
            loading-text="Cargando datos..."
            locale="es-VE"
            fixed-header
            :loading="tablaCargando"
            >
              <template v-slot:item.acciones="{ item }">
                <AsistenciaEntrenamiento :id_deporte="id_deporte" :id_categoria="id_categoria" :id="item.id" 
                @asistenciasGuardadas="getEntrenamientos(); snackbarAsistencias = true" />
                <EditarEntrenamiento :id_deporte="id_deporte" :id_categoria="id_categoria" 
                :entrenamiento="{id: item.id, nombre: item.nombre === 'Sin nombre' ? ''  :  item.nombre, fecha: item.fecha }" 
                @entrenamientoEditado="getEntrenamientos(); snackbarEditar = true" />
                <EliminarEntrenamiento :id_deporte="id_deporte" :id_categoria="id_categoria" 
                :entrenamiento="{id: item.id, nombre: item.nombre, fecha: item.fecha }" 
                @entrenamientoEliminado="getEntrenamientos(); snackbarEliminar = true" />
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" lg="3" xl="4">
        <v-row class="justify-center" v-if="show">
          <v-col lg="11" sm="6" cols="12" class="mt-6 mt-lg-0">
            <ApexChart type="radialBar" :options="chartOptions" 
            :series="[ratioAsistencias || 0]"
            class="elevation-4 p-4 rounded-lg grey lighten-4" />
          </v-col>
        </v-row>
        <v-row class="justify-center" v-if="show">
          <v-col lg="11" sm="6" cols="12">
            <ApexChart type="radialBar" :options="chartOptions2" 
            :series="[ratioInasistencias || 0]"
            class="elevation-4 p-4 rounded-lg grey lighten-4" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbarAsistencias" timeout="3000" shaped top>
      <v-icon left color="secondary"> mdi-check-circle </v-icon>
      <span class="success--text"> ¡Registro de asistencias guardado con éxito! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbarAsistencias = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbarEliminar" timeout="3000" shaped top>
      <v-icon left color="secondary"> mdi-check-circle </v-icon>
      <span class="success--text"> ¡El entrenamiento fue eliminado con éxito! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbarEliminar = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbarEditar" timeout="3000" shaped top>
      <v-icon left color="secondary"> mdi-check-circle </v-icon>
      <span class="success--text"> ¡El entrenamiento fue editado con éxito! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbarEditar = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

import RegistrarEntrenamiento from './RegistrarEntrenamiento';
import EditarEntrenamiento from './EditarEntrenamiento';
import EliminarEntrenamiento from './EliminarEntrenamiento';
import AsistenciaEntrenamiento from './AsistenciaEntrenamiento';
import ApexChart from 'vue-apexcharts';

export default {
  name: 'TablaEntrenamientos',

  components: {
    RegistrarEntrenamiento,
    EditarEntrenamiento,
    EliminarEntrenamiento,
    AsistenciaEntrenamiento,
    ApexChart
  },

  props: ['entrenamientos', 'id_deporte', 'id_categoria'],

  data() {
    return {
      entrenamientosData: [],
      // UI Handlers
      tablaCargando: false,
      snackbarEliminar: false,
      snackbarEditar: false,
      snackbarAsistencias: false,
      show: false,
      // Input del search bar
      busquedaEntrenamiento: '',
      // Ratios de ambos charts
      ratioAsistencias: 0,
      ratioInasistencias: 0,
      // headers de la tabla
      atributosTabla: [
        {
          text: 'Fecha',
          align: 'center',
          sortable: true,
          filterable: true,
          value: 'fecha',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Nombre',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'nombre',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Asistencias',
          align: 'end',
          sortable: true,
          filterable: true,
          value: 'asistencias',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Inasistencias',
          align: 'end',
          sortable: true,
          filterable: true,
          value: 'faltas',
          class: 'primary--text font-weight-bold'
        },
        {
          text: '% Asistencia',
          align: 'end',
          sortable: true,
          filterable: true,
          value: 'porcentaje',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Acciones',
          align: 'center',
          sortable: false,
          filterable: false,
          value: 'acciones',
          class: 'primary--text font-weight-bold',
          width: '95'
        },
      ],
      // Opciones chart1
      chartOptions: {
        chart: {
          type: 'radialBar',
          offsetY: -10,
          sparkline: {
            enabled: true
          }
        },
        
        title: {
          text: '% Asistencia General',
          align: 'center',
          margin: 0,
          offsetX: 0,
          offsetY: 10,
          floating: false,
          style: {
            fontSize:  '16px',
            fontWeight:  '500',
            fontFamily:  'Roboto',
            color:  '#616161'
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: "#e7e7e7",
              strokeWidth: '97%',
              margin: 5, // margin is in pixels
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                color: '#616161',
                opacity: 1,
                blur: 2
              }
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                offsetY: -2,
                fontSize: '22px'
              }
            }
          }
        },
        grid: {
          padding: {
            top: -10
          }
        }

      },
      // Opciones chart2
      chartOptions2: {
        chart: {
          type: 'radialBar',
          offsetY: -10,
          sparkline: {
            enabled: true
          }
        },

        colors: ['#F83E70'],
        
        title: {
          text: '% Inasistencia General',
          align: 'center',
          margin: 0,
          offsetX: 0,
          offsetY: 10,
          floating: false,
          style: {
            fontSize:  '16px',
            fontWeight:  '500',
            fontFamily:  'Roboto',
            color:  '#616161'
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: "#e7e7e7",
              strokeWidth: '97%',
              margin: 5, // margin is in pixels
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                color: '#616161',
                opacity: 1,
                blur: 2
              }
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                offsetY: -2,
                fontSize: '22px'
              }
            }
          }
        },
        grid: {
          padding: {
            top: -10
          }
        }

      },
    }
  },

  methods: {
    /*
      Función que calcula los ratios para ambos
      ApexCharts de Asistencias e Inasistencias
    */
    calcularRatios() {
      this.show = false;
      // Generamos un arreglo con la cantidad de atletas que asistieron y faltaron (sumados) por entrenamiento
      let total = this.entrenamientosData.map(item => 
        parseInt(item.asistencias.replace(' Atleta', '').replace(' Atletas', '')) +
        parseInt(item.faltas.replace(' Atleta', '').replace(' Atletas', '')) 
      );
      // Sumamos el arreglo generado para obtener el total de atletas que asistieron y faltaron (sumados)
      total = total.reduce(function(a, b) {
        return a + b;
      }, 0);
      // Generamos un arreglo con la cantidad de atletas que asistieron por entrenamiento
      let totalAsistencias = this.entrenamientosData.map(item => parseInt(item.asistencias.replace(' Atleta', '').replace(' Atletas', '')));
      // Sumamos dicho arreglo para obtener el total de asistencias
      totalAsistencias = totalAsistencias.reduce(function(a, b) {
        return a + b;
      }, 0);
      // Calculamos los ratios
      this.ratioAsistencias = ((totalAsistencias/total)*100|| 0).toFixed(2);
      this.ratioInasistencias = (((total - totalAsistencias)/total)*100|| 0).toFixed(2);
      this.show = true;
    },

    /*
      Función que obtiene los entrenamientos de una categoria
      Los datos obtenidos son:
      res.data = {
        id: Number,
        fecha: Date (String 'dd/mm/yyyy'),
        nombre: String,
        asistencias: String (Ej.: '4 Atletas'),
        faltas: String (Ej.: '2 Atletas'),
        porcentaje: String (Ej.: '50.00 %')
      }
    */
    async getEntrenamientos() {
      // Colocamos el loader
      this.entrenamientosData = [];
      this.tablaCargando = true;
      // Request GET
      await axios.get(`${server_url}/entrenamientos/${this.id_deporte}/${this.id_categoria}`, { withCredentials: true } )
        .then((res) => {
          // En caso de exito
          if (res.status === 200) {
            // Asignamos la data obtenida a la variable entrenamientos
            this.entrenamientosData = res.data;
            this.calcularRatios();
          }
        })
        .catch((err) => {
          try {
            // errores
            if (err.response.status) this.mensajeError = err.response.data;
          }
          catch (error) {
            // Servidor no disponible
            this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
            console.warn('Warning: No response status was found, is the server running? ');
          }
        });
      // Quitamos el loader
      this.tablaCargando = false;
    }
  },

  mounted() {
    this.getEntrenamientos();
  }

}
</script>

<style>
  .v-data-table-header th {
    white-space: nowrap;
  }
</style>