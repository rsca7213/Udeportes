<template>
  <v-container>
    <v-row v-if="mensajeError">
      <v-col>
        <v-alert text color="error" dense v-if="mensajeError">
          <v-icon color="error"> mdi-alert </v-icon>
          <span v-text="mensajeError" class="ml-1"> </span>
        </v-alert>
      </v-col>
    </v-row>
    <v-row no-gutters v-else>
      <v-col cols="12" lg="9" xl="8" class="elevation-4 py-4 px-6 rounded-lg">
        <v-row align="center">
          <v-col cols="12" class="px-1">
            <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
            prepend-icon="mdi-magnify" type="text" v-model="busquedaCompetencia" name="busqueda"> </v-text-field>
          </v-col>
        </v-row>
        <v-row class="d-none d-md-flex">
          <v-col cols="12" class="text-right">
            <RegistrarCompetencia :id_deporte="id_deporte" :id_categoria="id_categoria"
            @competenciaRegistrada="getCompetencias()" v-if="usuario.admin" />
          </v-col>
        </v-row>
        <v-row class="d-flex d-md-none">
          <v-col class="text-center px-0 px-sm-2" cols="12">
            <RegistrarCompetencia :id_deporte="id_deporte" :id_categoria="id_categoria"
            @competenciaRegistrada="getCompetencias()" v-if="usuario.admin" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="px-0 px-sm-2"> 
            <v-data-table :headers="atributosTabla" :items="competenciasData" :search="busquedaCompetencia" 
            no-data-text="No hay competencias registradas para esta categoria."
            no-results-text="No hay resultados para esta busqueda."
            loading-text="Cargando datos..."
            locale="es-VE"
            fixed-header
            :loading="tablaCargando"
            >
              <template v-slot:item.estatus="{ item }">
                <span v-if="item.estatus === 'n'">
                  <v-icon color="grey darken-1"> mdi-clock-outline </v-icon>
                  <span class="grey--text text--darken-1 ml-1"> No iniciada </span>
                </span>
                <span v-else-if="item.estatus === 'e'">
                  <v-icon color="indigo"> mdi-progress-clock </v-icon>
                  <span class="indigo--text ml-1"> En curso </span>
                </span>
                <span v-else-if="item.estatus === 'd'">
                  <v-icon color="error"> mdi-arrow-bottom-left-thick </v-icon>
                  <span class="error--text ml-1"> Derrota </span>
                </span>
                <span v-else>
                  <v-icon color="success"> mdi-arrow-top-right-thick </v-icon>
                  <span class="success--text ml-1"> Victoria </span>
                </span>
              </template>
              <template v-slot:item.acciones="{ item }">
                <v-icon dense color="primary" dark 
                @click="$router.push(`/competencias/${id_deporte}/${id_categoria}/${item.id}`)"> 
                  mdi-view-dashboard
                </v-icon>
                <EditarCompetencia :id_deporte="id_deporte" :id_categoria="id_categoria" 
                :competencia="{id: item.id, nombre: item.nombre, estatus: item.estatus, fecha_inicio: item.fecha_inicio,
                fecha_fin: item.fecha_fin === 'No especificada' ? '' : item.fecha_fin }"
                @competenciaEditada="getCompetencias(); snackbarEditar = true" v-if="usuario.admin" />
                <EliminarCompetencia :id_deporte="id_deporte" :id_categoria="id_categoria" 
                :competencia="{id: item.id, nombre: item.nombre }"
                @competenciaEliminada="getCompetencias(); snackbarEliminar = true" v-if="usuario.admin" />
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" lg="3" xl="4">
        <v-row class="justify-center" v-if="show">
          <v-col lg="11" sm="6" cols="12" class="mt-6 mt-lg-0">
            <ApexChart type="radialBar" :options="chartOptions" 
            :series="[ratioVictorias || 0]"
            class="elevation-4 p-4 rounded-lg grey lighten-4" />
          </v-col>
        </v-row>
        <v-row class="justify-center" v-if="show">
          <v-col lg="11" sm="6" cols="12">
            <ApexChart type="radialBar" :options="chartOptions2" 
            :series="[ratioDerrotas || 0]"
            class="elevation-4 p-4 rounded-lg grey lighten-4" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbarEliminar" timeout="3000" shaped top>
      <v-icon left color="secondary"> mdi-check-circle </v-icon>
      <span class="success--text"> ¡La competencia fue eliminada con éxito! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbarEliminar = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbarEditar" timeout="3000" shaped top>
      <v-icon left color="secondary"> mdi-check-circle </v-icon>
      <span class="success--text"> ¡La competencia fue editada con éxito! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbarEditar = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

import RegistrarCompetencia from './RegistrarCompetencia';
import EditarCompetencia from './EditarCompetencia';
import EliminarCompetencia from './EliminarCompetencia';
import ApexChart from 'vue-apexcharts';

export default {
  name: 'TablaCompetencias',

  components: {
    RegistrarCompetencia,
    EditarCompetencia,
    EliminarCompetencia,
    ApexChart
  },

  props: ['competencias', 'id_deporte', 'id_categoria', 'usuario'],

  data() {
    return {
      competenciasData: [],
      // UI Handlers
      tablaCargando: false,
      snackbarEliminar: false,
      snackbarEditar: false,
      mensajeError: '',
      show: false,
      // Input del search bar
      busquedaCompetencia: '',
      // Ratios de ambos charts
      ratioVictorias: 0,
      ratioDerrotas: 0,
      // headers de la tabla
      atributosTabla: [
        {
          text: 'Nombre',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'nombre',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Fecha Inicio',
          align: 'center',
          sortable: true,
          filterable: true,
          value: 'fecha_inicio',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Fecha Fin',
          align: 'center',
          sortable: true,
          filterable: true,
          value: 'fecha_fin',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Estatus',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'estatus',
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
          text: '% Victorias',
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
          text: '% Derrotas',
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
      ApexCharts de Victorias y Derrotas
    */
    calcularRatios() {
      this.show = false;
      let victorias = this.competenciasData.filter(item => item.estatus === 'v').length;
      let derrotas = this.competenciasData.filter(item => item.estatus === 'd').length;
      // Calculamos los ratios
      this.ratioVictorias = ((victorias/(victorias + derrotas))*100|| 0).toFixed(2);
      this.ratioDerrotas = ((derrotas/(victorias + derrotas))*100|| 0).toFixed(2);
      this.show = true;
    },

    /*
      Función que obtiene las competencias de una categoria
      Los datos obtenidos son:
      res.data = {
        id: Number,
        fecha_inicio: Date (String 'dd/mm/yyyy'),
        nombre: String,
        estatus: String (Char(1)),
        fecha_fin: Date (String 'dd/mm/yyyy')

      }
    */
    async getCompetencias() {
      // Colocamos el loader
      this.competenciasData = [];
      this.tablaCargando = true;
      // Request GET
      await axios.get(`${server_url}/competencias/${this.id_deporte}/${this.id_categoria}`, { withCredentials: true } )
        .then((res) => {
          // En caso de exito
          if (res.status === 200) {
            // Asignamos la data obtenida a la variable competencias
            this.competenciasData = res.data;
            if (!this.competenciasData) this.competenciasData = [];
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
    this.getCompetencias();
  }

}
</script>

<style>
  .v-data-table-header th {
    white-space: nowrap;
  }
</style>