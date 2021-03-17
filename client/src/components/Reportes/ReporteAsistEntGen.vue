<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" lg="9" xl="8" class="elevation-4 py-4 px-6 rounded-lg">
        <v-row align="center">
          <v-col cols="12">
            <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
            prepend-icon="mdi-magnify" type="text" v-model="busquedaEntrenamiento" name="busqueda"> </v-text-field>
          </v-col>
        </v-row>
        <v-row class="d-none d-md-flex">
          <v-col cols="12" class="text-right">
            <RegistrarEntrenamiento />
          </v-col>
        </v-row>
        <v-row class="d-flex d-md-none">
          <v-col class="text-center" cols="12">
            <RegistrarEntrenamiento />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12"> 
            <v-data-table :headers="atributosTabla" :items="entrenamientos" :search="busquedaEntrenamiento" 
            no-data-text="No hay entrenamientos registrados para esta categoria."
            no-results-text="No hay resultados para esta busqueda."
            loading-text="Cargando datos..."
            locale="es-VE"
            fixed-header
            :loading="tablaCargando"
            >
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" lg="3" xl="4">
        <v-row class="justify-center">
          <v-col lg="11" sm="6" cols="11" class="mt-6 mt-lg-0">
            <ApexChart type="radialBar" :options="chartOptions" 
            :series="[ratioAsistencias]" 
            class="elevation-4 p-4 rounded-lg grey lighten-4" />
          </v-col>
        </v-row>
        <v-row class="justify-center">
          <v-col lg="11" sm="6" cols="11">
            <ApexChart type="radialBar" :options="chartOptions2" 
            :series="[ratioInasistencias]" 
            class="elevation-4 p-4 rounded-lg grey lighten-4" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ApexChart from 'vue-apexcharts';

export default {
  name: 'ReporteAsistEntGen',
  components: {
    ApexChart
  },
  data() {
    return {
      tablaCargando: false,
      busquedaEntrenamiento: '',
      ratioAsistencias: 0,
      ratioInasistencias: 0,
      entrenamientos: [],
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
      ],

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
    async getEntrenamientos() {
      if (this.categoria) {
        this.categoriaCargando = true;
        await axios.get(`${server_url}/entrenamientos/${this.categoria.id_deporte}/${this.categoria.id_categoria}`, { withCredentials: true } )
          .then((res) => {
            // En caso de exito
            if (res.status === 200) {
              this.entrenamientos = res.data;
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
        this.categoriaCargando = false;
      }
    }
  },
  mounted() {
    let total = this.entrenamientos.map(item => 
      parseInt(item.asistencias.replace(' Atleta', '').replace(' Atletas', '')) +
      parseInt(item.faltas.replace(' Atleta', '').replace(' Atletas', '')) 
    );
    total = total.reduce(function(a, b) {
      return a + b;
    }, 0);

    let totalAsistencias = this.entrenamientos.map(item => parseInt(item.asistencias.replace(' Atleta', '').replace(' Atletas', '')));
    totalAsistencias = totalAsistencias.reduce(function(a, b) {
      return a + b;
    }, 0);

    this.ratioAsistencias = (totalAsistencias/total)*100|| 0;
    this.ratioInasistencias = ((total - totalAsistencias)/total)*100|| 0;
  }

}
</script>

<style>

</style>