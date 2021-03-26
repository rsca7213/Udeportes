<template>
  <div class="panelCompetencia">
    <Cargador v-if="cargando" /> 
    <v-container v-else> 
      <v-row>
        <v-col>
          <v-card class="px-2 py-4" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
              Panel de Competencia
              <v-spacer></v-spacer>
              <v-btn text class="blue--text text--lighten-1 px-1 px-sm-3" @click="$router.push('/competencias')">
                <v-icon left> mdi-arrow-left </v-icon>
                Regresar a la lista
              </v-btn>
            </v-card-title>

            <v-row v-if="mensajeError">
              <v-col class="py-0 my-0 px-6"> 
                <v-alert text color="error" dense>
                  <v-icon color="error"> mdi-alert </v-icon>
                  <span v-text="mensajeError" class="ml-1"> </span>
                </v-alert>
              </v-col>
            </v-row>

            <v-container class="pt-0 pl-4">
              <v-row class="pt-0">
                <v-col class="py-0 px-2">
                  <v-icon color="success" v-if="competencia.estatus === 'v'"> mdi-arrow-top-right-thick </v-icon>
                  <v-icon color="error" v-else-if="competencia.estatus === 'd'"> mdi-arrow-bottom-left-thick </v-icon>
                  <v-icon color="indigo" v-else-if="competencia.estatus === 'e'"> mdi-progress-clock </v-icon>
                  <v-icon color="grey darken-1" v-else> mdi-clock-outline </v-icon>
                  <span class="success--text" v-if="competencia.estatus === 'v'"> Victoria </span>
                  <span class="error--text" v-else-if="competencia.estatus === 'd'"> Derrota </span>
                  <span class="indigo--text" v-else-if="competencia.estatus === 'e'"> En curso </span>
                  <span class="grey--text text--darken-1" v-else> No iniciada </span>
                </v-col>
              </v-row>
              <v-row class="pt-0">
                <v-col class="py-0">
                  <span v-text="competencia.nombre"> </span>
                  <span v-text="` (${competencia.fecha_inicio}${competencia.fecha_fin ? ' a ' + competencia.fecha_fin : ''})`"> </span>
                </v-col>
              </v-row>
              <v-row class="pt-0">
                <v-col class="pt-0">
                  <span v-text="competencia.categoria"> </span>
                  <span v-text="` (${competencia.deporte})`"> </span>
                </v-col>
              </v-row>
            </v-container>

            <v-container>
              <v-row>
                <v-col cols="12" xl="4" class="elevation-2 py-4 mt-3 px-4 px-sm-5 px-md-6 rounded-lg">
                  <v-row class="align-center">
                    <v-col class="pt-1 pt-sm-2">
                      <b class="text-subtitle-1 font-weight-medium"> Atletas </b>
                    </v-col>
                    <v-spacer class="d-none d-sm-block"></v-spacer>
                    <v-col class="pt-1 pt-sm-2">
                      <AsistenciaCompetencia :id_deporte="$route.params.id_deporte" 
                      :id_categoria="$route.params.id_categoria" :id="$route.params.id"
                      @updateAsistencias="datosAsistencia" />
                    </v-col>
                  </v-row>
                  <v-row v-for="posicion in competencia.posiciones" :key="posicion.id">
                    <v-col cols="12" class="py-0 px-1">
                      <v-row>
                        <v-col class="px-1">
                          <b class="indigo--text ml-6" v-text="posicion.nombre"> </b>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" v-if="posicion.atletas.length" class="px-1">
                      <v-row>
                        <v-col>
                          <v-expansion-panels accordion>
                            <v-expansion-panel v-for="atleta in posicion.atletas" :key="atleta.cedula" class="pa-0 ma-0">
                              <v-expansion-panel-header class="px-4">
                                <span> 
                                  <span class="indigo--text" v-text="atleta.cedula"> </span>
                                  <span v-text="atleta.nombre" class="ml-2"> </span>
                                </span>
                              </v-expansion-panel-header>
                              <v-expansion-panel-content>
                                <v-col v-for="estadistica in atleta.estadisticas" :key="estadistica.id" cols="12" class="px-1">
                                  <v-row> 
                                    <v-icon dense color="indigo"> mdi-poll-box </v-icon>
                                    <span v-text="estadistica.nombre" class="ml-1 indigo--text"> </span>
                                  </v-row>
                                  <v-row> 
                                    <span v-text="estadistica.valor === null ? 'N/A' : estadistica.valor" class="ml-6"> </span>
                                  </v-row>
                                </v-col>
                                <v-col cols="!2" v-if="!atleta.estadisticas.length" class="px-1"> 
                                  <v-row>
                                    <span class="grey--text text--darken-1"> Sin estadisticas </span>
                                  </v-row>
                                </v-col>
                                <v-col v-else class="px-4">
                                  <EditarRendimiento :estadisticas="atleta.estadisticas" :id="$route.params.id"
                                  :id_deporte="$route.params.id_deporte" :id_categoria="$route.params.id_categoria"
                                  :cedula="atleta.cedula" @rendimientoEditado="getDataCompetencia()"
                                  :id_posicion="posicion.id" />
                                </v-col>
                              </v-expansion-panel-content>
                            </v-expansion-panel>
                          </v-expansion-panels>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" class="py-2 ml-6 px-1" v-else>
                      <v-row>
                        <v-col class="px-1">
                          <span class="grey--text grey--darken-1"> Sin Atletas </span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row v-if="competencia.atletas_libres.length">
                    <v-col cols="12" class="py-0 px-1">
                      <v-row>
                        <v-col class="px-1">
                          <b class="indigo--text ml-6"> Sin Posición </b>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12 px-1">
                      <v-row v-for="atleta in competencia.atletas_libres" :key="atleta.cedula">
                        <v-col class="ml-4">
                          <span> 
                            <span class="indigo--text" v-text="atleta.cedula"> </span>
                            <span v-text="atleta.nombre" class="ml-2"> </span>
                          </span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" xl="4" md="6" class="elevation-2 py-4 mt-3 px-4 px-sm-5 px-md-6 rounded-lg">
                  <v-container class="pt-0">
                    <v-row class="pt-0">
                      <v-col class="pt-0 px-1">
                        <v-select v-model="inputs.cedula" label="Posición o Atleta" prepend-icon="mdi-chart-areaspline"
                        clear-icon="mdi-close" name="categoria" clearable :items="itemsSelect"
                        no-data-text="No hay datos" @change="datosRadar()" >
                        </v-select>
                      </v-col>
                    </v-row>
                    <div v-if="inputs.cedula && radar.categorias.length">
                      <ApexChart type="bar" :height="radar.categorias.length * 100"
                      :options="{ 
                        colors: ['#2196F3', '#8BC34A'],
                        xaxis: { 
                          categories: radar.categorias,
                          labels: {
                            formatter: valor => {
                              if (typeof(valor) != typeof(1) || valor <= 1e-50) return 0;
                              return valor % 1 > 0 ? valor.toFixed(1) : valor;
                            }
                          }
                        }, 
                        plotOptions: {
                          bar: {
                            borderRadius: 4,
                            horizontal: true,
                            barHeight: '70%'
                          }
                        }
                      }" 
                      :series="[ 
                        { name: 'Jugador', data: radar.data_jugador },
                        { name: 'Promedio', data: radar.data_promedio } 
                      ]"
                      class="elevation-4 pa-1 pa-sm-4 rounded-lg" />
                    </div>
                    <div v-else-if="inputs.cedula && !radar.categorias.length"
                    class="text-center grey--text text--darken-1">
                      No hay estadisticas que mostrar.
                    </div>
                    <div v-else class="text-center grey--text text--darken-1">
                      Selecciona una opción.
                    </div>
                  </v-container>
                </v-col>
                <v-col cols="12" xl="4" md="6" class="elevation-2 py-4 mt-3 px-4 px-sm-5 px-md-6 rounded-lg">
                  <v-row class="justify-center">
                    <v-col lg="11" sm="6" cols="12" class="mt-6 mt-lg-0">
                      <ApexChart type="radialBar" :options="asistenciaOptions" 
                      :series="[ratioAsistencias|| 0]"
                      class="elevation-4 p-4 rounded-lg grey lighten-4" />
                    </v-col>
                  </v-row>
                  <v-row class="justify-center">
                    <v-col lg="11" sm="6" cols="12">
                      <ApexChart type="radialBar" :options="inasistenciaOptions" 
                      :series="[ratioInasistencias || 0]"
                      class="elevation-4 p-4 rounded-lg grey lighten-4" />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Cargador from '../components/Cargador';
import EditarRendimiento from '../components/Competencias/EditarRendimiento';
import AsistenciaCompetencia from '../components/Competencias/AsistenciaCompetencia';
import ApexChart from 'vue-apexcharts';

import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'PanelCompetencia',

  components: {
    Cargador,
    AsistenciaCompetencia,
    ApexChart,
    EditarRendimiento
  },

  data() {
    return {
      // UI handlers
      cargando: true,
      mensajeError: '',

      // Datos de la competencia
      competencia: {
        categoria: 'Sub 21 - Unisex',
        deporte: 'Futbol',
        nombre: 'Copa Universitaria 2021',
        fecha_inicio: '16/06/2021',
        fecha_fin: '19/06/2021',
        atletas_libres: [],
        posiciones: []
      },

      // Select box del radar
      inputs: {
        cedula: ''
      },
      // Items del select box del radar
      itemsSelect: [],

      // Data para el radar
      radar: {
        categorias: [],
        data_jugador: [],
        data_promedio: [],
        ctd_no_nulos: []
      },
      
      // Opciones asistencias
      asistenciaOptions: {
        chart: {
          type: 'radialBar',
          offsetY: -10,
          sparkline: {
            enabled: true
          }
        },
        
        title: {
          text: '% Asistencia',
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
      // Opciones inasistencias
      inasistenciaOptions: {
        chart: {
          type: 'radialBar',
          offsetY: -10,
          sparkline: {
            enabled: true
          }
        },

        colors: ['#F83E70'],
        
        title: {
          text: '% Inasistencia',
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

      // data para las graficas de asistencia
      ratioAsistencias: 0,
      ratioInasistencias: 0
    }
  },

  methods: {
    // Settea los datos de las graficas de asistencia
    datosAsistencia (data) {
      this.ratioAsistencias = data.asistencias.toFixed(2);
      this.ratioInasistencias = data.inasistencias.toFixed(2);
    },

    /*
      Funcion que retorna los datos y labels de la grafica radar,
      buscando los rendimientos en las estadisticas de la posición del atleta
      y los rendimientos promedio de las estadisticas de la posición en la competencia
    */
    datosRadar() {
      // Si el input esta vacio skip
      if (!this.inputs.cedula) return;

      // Seteamos los valores iniciales del radar
      this.radar = {
        categorias: [],
        data_jugador: [],
        data_promedio: [],
        ctd_no_nulos: []
      };

      /*
        Buscamos la posicion que nos interesa
        posicion = {
          id: Number (puede ser un string de num ej "1"),
          nombre: String,
          atletas: Array
        }
      */
      let posicion = this.competencia.posiciones.filter(pos => {
        return pos.atletas.find(atleta => atleta.cedula === this.inputs.cedula)
      }).pop();

      /*
        Para cada atleta de la posicion, si el atleta es el buscado, agregamos sus estadisticas a
        data_jugador y los nombres a categorias. Para cada uno de los atletas, indiferente de si es el
        buscado o no, vamos sumando las estadisticas a data_promedio
      */
      posicion.atletas.forEach(atleta => {
        atleta.estadisticas.forEach((estadistica, idx) => {
          if (this.inputs.cedula === atleta.cedula) {
            this.radar.categorias[idx] = estadistica.nombre;
            this.radar.data_jugador[idx] = estadistica.valor;
          }
          this.radar.data_promedio[idx] = estadistica.valor + this.radar.data_promedio[idx] || estadistica.valor;
          // Vamos contando la cantidad de atletas que tienen la estadistica no nula
          if (estadistica.valor != null)
            this.radar.ctd_no_nulos[idx] = this.radar.ctd_no_nulos[idx] + 1 || 1;
        });
      });

      
      // Calculamos el promedio para cada estadistica de la posicion
      this.radar.data_promedio = this.radar.data_promedio.map((data, idx) => data / this.radar.ctd_no_nulos[idx] || 0);
    },

    /*
      Funcion que obtiene la data completa de la competencia\
    */
    async getDataCompetencia() {
      this.inputs.select = [];
      this.itemsSelect = [];
      await axios.get(`${server_url}/competencias/${this.$route.params.id_deporte}/${this.$route.params.id_categoria}/
      ${this.$route.params.id}/rendimientos`, { withCredentials: true } )
      .then((res) => {
        // En caso de exito
        if (res.status === 200) {
          // Asignamos la data a la variable competencia
          this.competencia = res.data;
          // Para cada posicion, rellenamos el select box de la grafica de radar
          // con posiciones y atletas
          this.competencia.posiciones.forEach(posicion => {
            if (posicion.atletas.length)
              this.itemsSelect.push({
              header: posicion.nombre,
              divider: true
            });
            posicion.atletas.forEach(atleta => {
              this.itemsSelect.push({
                text: atleta.nombre,
                value: atleta.cedula
              });
            });
          });
          this.datosRadar();
          this.cargando = false;
        }
      })
      .catch((err) => {
        try {
          // errores
          if (err.response.status === 423) this.$router.push('/competencias');
          else if (err.response.status === 401) this.$router.push('/login');
          else if (err.response.status === 404 || err.response.status === 422) this.$router.push('/competencias');
          else this.mensajeError = err.response.data;
        }
        catch (error) {
          // Servidor no disponible
          this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
    }
  },

  async mounted() {
    await this.getDataCompetencia();
  }
}
</script>

<style>
  .apexcharts-menu-icon {
    display: none;
  }

  @media only screen and (max-width: 340px) {
    tspan {
      font-size: 10px;
    }
  }
</style>