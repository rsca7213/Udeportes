<template>
  <v-dialog v-model="dialog" class="text-center" max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="indigo" dark v-bind="attrs" v-on="on" class="mx-0 mx-md-3"> 
        <v-icon left> mdi-chart-arc </v-icon>
        Atletas por Educación
      </v-btn>
    </template>
    <v-card rounded="md" style="border: 0px">
      <v-card-title>
        <span class="d-none d-sm-flex"> Atletas por Educación </span>
        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Atletas por Educación </b>
        <v-spacer> </v-spacer>
        <v-btn icon @click="dialog = false"><v-icon> mdi-close </v-icon></v-btn>
      </v-card-title>
      <v-card-text v-if="dialogCargando" class="mt-2"> 
        <v-progress-linear indeterminate color="primary"> </v-progress-linear>
      </v-card-text>
      <v-card-text v-else-if="vista === 1">
        <v-alert text color="error" dense v-if="mensajeError">
          <v-icon color="error"> mdi-alert </v-icon>
          <span v-text="mensajeError" class="ml-1"> </span>
        </v-alert>
        <div class="text-right mb-3" @click="vista = 2">
          <v-btn color="primary"  v-if="items.filter(item => item.atletas.length > 0).length">
            <v-icon left> mdi-chart-arc </v-icon>
            Ver gráfica
          </v-btn>
        </div>
        <v-expansion-panels v-if="items.length" accordion>
          <v-expansion-panel v-for="(educacion, index) in items" :key="index" :disabled="!educacion.atletas.length">
            <v-expansion-panel-header> 
              <span>
                <v-icon color="indigo" left> mdi-school </v-icon>
                <span v-text="educacion.nombre"> </span>
                <span :class="educacion.atletas.length ? 'indigo--text' : 'indigo--text text--lighten-2'">
                  ({{ educacion.atletas.length }}
                  {{ educacion.atletas.length === 1 ? ' Atleta' : ' Atletas' }})
                </span>
              </span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list dense>
                <v-list-item v-for="(atleta, index) in educacion.atletas" 
                :key="index" two-line> 
                  <v-list-item-content class="text-caption">
                    <v-list-item-title v-text="atleta.nombre_completo"> </v-list-item-title>
                    <v-list-item-subtitle> 
                      <b> Edad: </b>
                      <span v-text="atleta.edad"> </span>
                      <b> | Género: </b>
                      <span v-text="atleta.genero"> </span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <div v-else class="text-center text--lighten-2 mt-6">
          No hay educaciones registradas en el sistema.
        </div>
      </v-card-text>
      <v-card-text v-if="vista === 2">
        <div class="text-center">
          <v-btn text class="blue--text text--lighten-1" @click="vista = 1">
            <v-icon left> mdi-arrow-left </v-icon>
            Regresar a la lista
          </v-btn>
        </div>
        <div class="d-flex justify-center mt-2" v-if="chartData.length">
          <ApexChart width="550" type="donut" :options="chartOptions" :series="chartData" class="elevation-4 p-4 rounded-lg grey lighten-4" />
        </div>
        <div class="text-center" v-else>
          No hay datos.
        </div>
      </v-card-text>
      <v-card-actions> 
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" dark @click="dialog = false">
          <v-icon left> mdi-close </v-icon>
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import ApexChart from 'vue-apexcharts';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'AtletasPorEducacion',

  components: {
    ApexChart
  },

  data() {
    return {
      dialog: false,
      vista: 1,
      dialogCargando: true,
      mensajeError: '',
      items: [],
      chartOptions: {
        type: 'donut',
        fill: {
          opacity: '0.85'
        },
        animations: {
          speed: 1600
        },
        responsive: [
          {
            breakpoint: 350,
            options: {
              chart: {
                size: 100,
                width: 200,
                height: 800
              },
              plotOptions: {
                donut: {
                  labels: {
                    show: false
                  }
                }
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 375,
            options: {
              chart: {
                size: 100,
                width: 260,
                height: 900
              },
              plotOptions: {
                donut: {
                  labels: {
                    show: false
                  }
                }
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 410,
            options: {
              chart: {
                size: 100,
                width: 300,
                height: 1000
              },
              plotOptions: {
                donut: {
                  labels: {
                    show: false
                  }
                }
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 430,
            options: {
              chart: {
                width: 350,
                height: 1000
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 470,
            options: {
              chart: {
                width: 370,
                height: 1000
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 500,
            options: {
              chart: {
                width: 400
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 550,
            options: {
              chart: {
                width: 420
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 600,
            options: {
              chart: {
                width: 470
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 630,
            options: {
              chart: {
                width: 500
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ]
      },
      
    
      chartData: []
    }
  },

  watch: {
    async dialog() {
      if (this.dialog) await this.getData();
      else if (this.vista === 2)
        await setTimeout(() => this.vista = 1, 170);
    }
  },

  methods: {
    async getData() {
      this.mensajeError = '';
      this.dialogCargando = true;
      this.items = [];
      await axios.get(`${server_url}/educaciones/atletas`, { withCredentials: true })
      .then((res) => {
        // Exito 200 (se hizo el select query, puede haber o no haber datos)
        if (res.status === 200) {
          // si hay datos se colocan en items y se rellena la grafica
          this.items = res.data;
          this.chartData = this.items.map(item => item.atletas.length);
          this.chartOptions.labels = this.items.map(item => item.nombre);
          
        }
      })

      .catch((error) => {
        try {
          // Error por parte del servidor
          console.warn(error.response.status);
          this.mensajeError = error.response.data;
        }
        catch {
          // Servidor inalcanzable
          console.warn('Warning: No response status was found, is the server running? ');
          this.mensajeError = 'No se ha podido conectar con el servidor.';
        }
      });
      // Maneja el atributo loading del select box
      this.dialogCargando = false;
    }
  }
}
</script>

<style>

</style>