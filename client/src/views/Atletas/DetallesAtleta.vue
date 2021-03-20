<template>
  <div class="atletas">
    <Cargador v-if="cargando" /> 
    <v-container v-else fluid> 
      <v-row>
        <v-col cols="12"> 
          <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
              Detalles del Atleta
              <v-spacer class="d-none d-sm-flex"></v-spacer>
              <v-btn text class="blue--text text--lighten-1 px-1 px-sm-3" @click="$router.push('/atletas')">
                <v-icon left> mdi-arrow-left </v-icon>
                Regresar a la lista
              </v-btn>
            </v-card-title>
            <v-container v-if="datosCargando || mensajeError">
              <v-row v-if="mensajeError">
                <v-col class="py-0 my-0"> 
                  <v-alert text color="error" dense>
                    <v-icon color="error"> mdi-alert </v-icon>
                    <span v-text="mensajeError" class="ml-1"> </span>
                  </v-alert>
                </v-col>
              </v-row>
              <v-row v-else-if="datosCargando" class="py-4 px-6"> 
                <v-progress-linear indeterminate color="primary"> </v-progress-linear>
              </v-row>
            </v-container>
            <v-container v-else fluid> 
              <v-row>
                <v-col cols="12" md="4" class="px-1 px-sm-2">
                  <v-card shaped class="pa-3" color="#F5F5F5"> 
                    <v-card-title class="px-0">
                      <v-col class="px-1 grey--text text--darken-2"> Datos Básicos </v-col>
                    </v-card-title>
                    <v-row>
                      <v-col class="align-center">
                        <v-icon class="mr-1" color="indigo" :class="atleta.nombre_completo ? '' : 'text--lighten-2'"> mdi-account </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.nombre_completo ? '' : 'text--lighten-2'"> Nombre Completo: </span>
                        <span v-text="atleta.nombre_completo || 'No disponible'" class="ml-1"
                        :class="atleta.nombre_completo ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="align-center">
                        <v-icon class="mr-1" color="indigo" :class="atleta.correo ? '' : 'text--lighten-2'"> mdi-email </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.correo ? '' : 'text--lighten-2'"> Correo Electrónico: </span>
                        <span v-text="atleta.correo || 'No disponible'" class="ml-1"
                        :class="atleta.correo ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="align-center">
                        <v-icon class="mr-1" color="indigo" :class="atleta.cedula ? '' : 'text--lighten-2'"> mdi-card-account-details </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.cedula ? '' : 'text--lighten-2'"> Nro. Cedula: </span>
                        <span v-text="atleta.cedula || 'No disponible'" class="ml-1"
                        :class="atleta.cedula ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="align-center"> 
                        <v-icon class="mr-1" color="indigo" :class="atleta.fecha_nacimiento ? '' : 'text--lighten-2'"> mdi-calendar </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.fecha_nacimiento ? '' : 'text--lighten-2'"> Fecha de Nacimiento: </span>
                        <span v-text="atleta.fecha_nacimiento || 'No disponible'" class="ml-1"
                        :class="atleta.fecha_nacimiento ? '' : 'grey--text'"> </span>
                        <span v-text="` (${atleta.edad})` || 'No disponible'"
                        :class="atleta.edad ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="align-center"> 
                        <v-icon class="mr-1" color="indigo" :class="atleta.telefono ? '' : 'text--lighten-2'"> mdi-cellphone </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.telefono ? '' : 'text--lighten-2'"> Telefono: </span>
                        <span v-text="atleta.telefono || 'No disponible'" class="ml-1"
                        :class="atleta.telefono ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="align-center"> 
                        <v-icon class="mr-1" color="indigo" :class="atleta.genero ? '' : 'text--lighten-2'"> mdi-human-male-female </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.genero ? '' : 'text--lighten-2'"> Genero: </span>
                        <span v-text="atleta.genero || 'No disponible'" class="ml-1"
                        :class="atleta.genero ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="align-center"> 
                        <v-icon class="mr-1" color="indigo" :class="atleta.educacion ? '' : 'text--lighten-2'"> mdi-school </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.educacion ? '' : 'text--lighten-2'"> Educación: </span>
                        <span v-text="atleta.educacion || 'No disponible'" class="ml-1"
                        :class="atleta.educacion ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="align-center"> 
                        <v-icon class="mr-1" color="indigo" :class="atleta.beca ? '' : 'text--lighten-2'"> mdi-sale </v-icon>
                        <span class="font-weight-medium indigo--text" 
                        :class="atleta.beca ? '' : 'text--lighten-2'"> Beca: </span>
                        <span v-text="atleta.beca || 'No disponible'" class="ml-1"
                        :class="atleta.beca ? '' : 'grey--text'"> </span>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4" class="px-1 px-sm-2">
                  <v-card shaped class="pa-3" color="#F5F5F5">
                    <v-card-title class="px-0">
                      <v-col class="px-1 grey--text text--darken-2"> Categorias del Atleta </v-col>
                    </v-card-title>
                    <v-list two-line outlined v-if="atleta.categorias.length">
                      <v-list-item v-for="(categoria, index) in atleta.categorias" :key="index"
                      :class="atleta.categorias.length - 1 === index ? '' : 'list-item'" >
                        <v-list-item-icon>
                          <v-icon color="indigo"> mdi-basketball </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title v-text="categoria.deporte"> </v-list-item-title>
                          <v-list-item-subtitle v-text="categoria.categoria + ` (${categoria.posicion})`"> </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <div v-else class="ml-1 grey--text">
                      Este atleta no tiene categorias.
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4" class="px-1 px-sm-2">
                  <v-card shaped class="pa-3" color="#F5F5F5">
                    <v-card-title class="px-0">
                      <v-col class="px-1 grey--text text--darken-2"> % Asistencia </v-col>
                    </v-card-title>
                    <v-row>
                      <v-col class="d-flex justify-center">
                        <ApexChart type="radialBar" :options="chartOptions" 
                        :series="[atleta.participaciones.entrenamientos.ratio]" 
                        class="elevation-4 p-4 rounded-lg grey lighten-4" />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="d-flex justify-center">
                        <ApexChart type="radialBar" :options="chartOptions2" 
                        :series="[atleta.participaciones.competencias.ratio]" 
                        class="elevation-4 p-4 rounded-lg grey lighten-4" />
                      </v-col>
                    </v-row>
                  </v-card>
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
import Cargador from '../../components/Cargador';
import ApexChart from 'vue-apexcharts';
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;


export default {
  name: 'DetallesAtleta',

  components: {
    Cargador,
    ApexChart
  },

  data() {
    return {
      cargando: true,
      datosCargando: true,
      mensajeError: '',
      atleta: {
        cedula: '',
        nombre_completo: '',
        genero: '',
        fecha_nacimiento: '',
        edad: '',
        educacion: '',
        correo: '',
        telefono: '',
        beca: '',
        categorias: [],
        participaciones: {
          entrenamientos: {
            asistencias: '',
            faltadas: ''
          },
          competencias: {
            asistencias: '',
            faltadas: ''
          }
        },
      },
      
      chartOptions: {
        chart: {
          type: 'radialBar',
          offsetY: -10,
          sparkline: {
            enabled: true
          }
        },
        title: {
          text: 'Entrenamientos',
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
        title: {
          text: 'Competencias',
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
      Funcion que obtiene los datos completos del atleta y los guarda en atleta
    */
    async getData() {
      this.datosCargando = true;
      await axios
        .get(`${server_url}/atletas/${this.$route.params.cedula}?data=completa`, { withCredentials: true })
        .then((res) => {
          // Si se consiguen los datos
          if (res.status === 200) {
            this.atleta = res.data;
            // calculamos el % para las graficas
            this.atleta.participaciones.entrenamientos.ratio = (this.atleta.participaciones.entrenamientos.asistencias /
            (this.atleta.participaciones.entrenamientos.asistencias + this.atleta.participaciones.entrenamientos.faltadas)) * 100 || 0;
            this.atleta.participaciones.competencias.ratio = (this.atleta.participaciones.competencias.asistencias /
            (this.atleta.participaciones.competencias.asistencias + this.atleta.participaciones.competencias.faltadas)) * 100 || 0;
            
            
          }
        })
        .catch((err) => {
          try {
            // Error 400 por unicidad o 500 generico
            if (err.response.status) this.mensajeError = err.response.data;
          }
          catch {
            // Servidor no disponible
            this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
            console.warn('Warning: No response status was found, is the server running? ');
          }
        });
      this.datosCargando = false;
    }
  },

  async mounted() {
    // En mounted verificamos login, admin y config inicial
    await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
      .then((res) => {
        // si el usuario es admin y ha iniciado sesión
        if (res.status === 200) {
          this.cargando = false;
          this.getData();
        }
      })
      .catch((err) => {
        try {
          // no hay config inicial
          if (err.response.status === 428) this.$router.push('/init');
          // usuario no ha iniciado sesión
          else if (err.response.status === 401) this.$router.push('/login');
          // si el usuario ha iniciado sesión pero no es admin
          else {
            this.$router.push('/');
          }
        }
        catch { 
          console.warn('Warning: No response status was found, is the server running? ');
        }
      })
  }
  
}
</script>

<style>
  .list-item {
    border-bottom: solid 1px lightgrey;
  }
</style>