<template>
  <div>
    <v-container>
      <v-row class="" align="start">
        <v-col cols="12 "> 
          <v-card color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="pl-11 pb-0 grey--text text--darken-2">
              {{card_title}}
            </v-card-title>
            <div v-if="menu_reportes === 'menu'">
              <v-card-text>
                <v-expansion-panels class="px-8" v-if="true" accordion>
                  <v-expansion-panel :disabled="false">
                    <v-expansion-panel-header> 
                      <span>
                        <v-icon color="indigo" left> mdi-clipboard-text </v-icon>
                        <span class="subtitle-1">Reportes de Asistencia a Entrenamientos y Competencias</span>
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-list-item-group v-model="asistencia_general" color="indigo">
                        <v-list dense>
                          <v-list-item two-line v-for="(item, index) in reportes_asistencia" :key="index" @click="cambiarVista(item.nombre)"> 
                            <v-list-item-content class="text-caption">
                              <v-list-item-title> 
                                <v-icon color="indigo" left> mdi-clipboard-text-outline </v-icon>
                                <span class="subtitle-2" v-text="item.nombre"></span>
                              </v-list-item-title>
                              <v-list-item-subtitle class="pl-8"> 
                                <span v-text="item.descripcion"></span>
                              </v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-list-item-group>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel :disabled="false">
                    <v-expansion-panel-header> 
                      <span>
                        <v-icon color="indigo" left> mdi-clipboard-text </v-icon>
                        <span class="subtitle-1">Nóminas de Equipos y Competencias</span>
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-list-item-group color="indigo">
                        <v-list dense>
                          <v-list-item two-line v-for="(item, index) in nominas" :key="index" @click="cambiarVista(item.nombre)"> 
                            <v-list-item-content class="text-caption">
                              <v-list-item-title> 
                                <v-icon color="indigo" left> mdi-clipboard-text-outline </v-icon>
                                <span class="subtitle-2" v-text="item.nombre"></span>
                              </v-list-item-title>
                              <v-list-item-subtitle class="pl-8"> 
                                <span v-text="item.descripcion"></span>
                              </v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-list-item-group>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </div>
            <div v-else-if="menu_reportes !=='menu'">
              <v-card-subtitle class="pl-11 py-2">
                Puedes cambiar la categoria en cualquier momento.
              </v-card-subtitle>
              <div class="text-center">
                <v-btn text class="blue--text text--lighten-1 mb-4" @click="cambiarVista('Reportes')">
                  <v-icon left> mdi-arrow-left </v-icon>
                  Regresar al menú
                </v-btn>
              </div>
              <v-container class="pt-0">
                <v-row class="pt-0 justify-center">
                  <v-col class="pt-0 pl-md-11" cols="12" sm="10" lg="6" xl="6">
                    <v-select v-model="categoria" label="Categoria" prepend-icon="mdi-clipboard-text"
                    clear-icon="mdi-close" name="categoria" clearable :items="items_deportes"
                    no-data-text="No tiene categorias asignadas" @change="datosEquipo()">
                    </v-select>
                  </v-col>
                  <v-col v-if="categoria && categoria.id_categoria && menu_reportes==='Nómina de Competencia'" class="pt-0 pl-md-11" cols="12" sm="10" lg="6" xl="6">
                    <v-select v-model="competencia" label="Competencias" prepend-icon="mdi-trophy"
                    clear-icon="mdi-close" name="competencias" clearable 
                    no-data-text="No hay competencias a mostrar">
                    </v-select>
                  </v-col>
                </v-row>
                <v-row class="justify-center">
                  <v-col cols=12 lg=9 md=10>
                    <v-row>
                      <v-col cols="12" sm="4" md="4" lg="4">
                        <span class="my-0 pt-0 pl-md-12">Entrenamientos</span>
                      </v-col>
                      <v-col cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="my-0 pt-0 pl-md-10" label="Seleccionar Todos"></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row class="justify-center">
                  <v-col cols=12 lg=9 md=10>
                    <v-row class="">
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="Entrenamiento de resistencia 14/03/2020"></v-checkbox>       
                      </v-col>
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="14/03/2020"></v-checkbox>       
                      </v-col>
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="Entrenamiento de resistencia 14/03/2020"></v-checkbox>       
                      </v-col>
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="Entrenamiento de resistencia 14/03/2020"></v-checkbox>       
                      </v-col>
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="Entrenamiento de resistencia 14/03/2020"></v-checkbox>       
                      </v-col>
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="Entrenamiento de resistencia 14/03/2020"></v-checkbox>       
                      </v-col>
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="Entrenamiento de resistencia 14/03/2020"></v-checkbox>       
                      </v-col>
                      <v-col class="py-0" cols="12" sm="4" md="4" lg="4">
                        <v-checkbox class="pl-3 py-0 pl-md-10" label="14/03/2020"></v-checkbox>       
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row v-if="!categoria || !categoria.id_categoria">
                  <v-col class="grey--text text-center"> Selecciona una categoría para generar el reporte. </v-col>
                </v-row>
                <v-row v-else-if="(!competencia || !competencia.id_competencia) && menu_reportes==='Nómina de Competencia'">
                  <v-col class="grey--text text-center"> Selecciona una competencia para generar el reporte. </v-col>
                </v-row>
                <div>
                  <NominaEquipo v-if="categoria!==null && categoria.id_categoria && menu_reportes==='Nómina de Equipo'" :categoria="categoria" :equipo="equipo"/>
                  <NominaCompetencia v-else-if="categoria!==null && categoria.id_categoria && competencia && competencia.id_competencia && menu_reportes==='Nómina de Competencia'" :competencia="competencia"/>
                  <AsistenciaGeneralEntrenamientos v-else-if="categoria!==null && categoria.id_categoria && menu_reportes==='Asistencia General a Entrenamientos'" :categoria="categoria" :equipo="equipo"/>
                </div>
              </v-container>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import NominaEquipo from './NominaEquipo';
import NominaCompetencia from './NominaCompetencia';
import AsistenciaGeneralEntrenamientos from './AsistenciaGeneralEntrenamientos';
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'MenuReportes',
  components: {
    NominaEquipo,
    NominaCompetencia,
    AsistenciaGeneralEntrenamientos
  },
  data() {
    return {
      asistencia_general: 1,
      /* UI handlers*/
      card_title: 'Reportes',
      menu_reportes: 'menu',
      deportes_cargando: true,
      categoria: {
        id_categoria: 0,
        id_deporte: 0
      },
      competencia: {
        id_competencia: 0,
        nombre_competencia: ''
      },
      equipo: '',
      // Data para el select de deportes, rellenado en mounted()
      items_deportes: [],
      //Información de reportes de asistencia a entrenamientos y competencias
      reportes_asistencia: [
        {
          nombre: 'Asistencia General a Entrenamientos',
          descripcion: 'Consulta la asistencia a todos los entrenamientos de un equipo',
        },
        {
          nombre: 'Asistencia a Entrenamientos',
          descripcion: 'Consulta la asistencia a todos los entrenamientos de un equipo dentro de un rango de fechas',
        },
        {
          nombre: 'Asistencia General a Competencias',
          descripcion: 'Consulta la asistencia a todos los competencias de un equipo',
        },
        {
          nombre: 'Asistencia a Competencias',
          descripcion: 'Consulta la asistencia a todos los competencias de un equipo dentro de un rango de fechas',
        }
      ],
      //Información de nóminas de equipo y competencias de atletas
      nominas: [
        {
          nombre: 'Nómina de Equipo',
          descripcion: 'Consulta todos los atletas de un equipo',
        },
        {
          nombre: 'Nómina de Competencia',
          descripcion: 'Consulta todos los atletas de una competencia',
        },
      ]
    }
  },
  methods: {
    //método que genera el reporte
    /*getReporte(){
      if(this.menu_reportes === 'Asistencia General a Entrenamientos'){
        console.log('aqui no');
      }
      else if(this.menu_reportes === 'Asistencia a Entrenamientos'){
        console.log('aqui no');
      }
      else if(this.menu_reportes === 'Asistencia General a Competencias'){
        console.log('aqui no');
      }
      else if(this.menu_reportes === 'Nómina de Equipo'){
        console.log(this.menu_reportes);
      }
      else if(this.menu_reportes === 'Nómina de Asistencia'){
        console.log('aqui no');
      }
    },*/
    //método encargado de cambiar la vista de los reportes
    cambiarVista(titulo){
      this.categoria={
        id_categoria:0,
        id_competencia:0
      }
      this.competencia.id_competencia=0;
      this.competencia.nombre_competencia='';
      this.card_title = titulo;
      (titulo === 'Reportes')? this.menu_reportes = 'menu': this.menu_reportes = titulo;
      
    },
    //método para obtener el nombre del deporte y de la categoría para mostrarlo en el reporte
    datosEquipo(){

      this.competencia.id_competencia=0;
      this.competencia.nombre_competencia='';

      let nombre_deporte='';
      let nombre_categoria= '';
  
      if(this.categoria!==null){
        for(let item of this.items_deportes){
          if(item.header){
            nombre_deporte = item.header;
          }
          else if(item.text){
            nombre_categoria=item.text;
            if(item.value.id_categoria===this.categoria.id_categoria){
              break;
            }
          }
        }
      }
      else{
        this.categoria={
          id_deporte: 0,
          id_categoria: 0
        }
      }

      this.equipo = `${nombre_deporte} ${nombre_categoria}`
    },
  },
  async mounted() {
    // Ocultamos el componente y desplegamos el componente Cargador hasta que termine el proceso
    this.cargando = true;
    // Solicitud GET
    await axios.get(`${server_url}/entrenamientos/categorias`, { withCredentials: true })
      .then((res) => {
        // En caso de exito
        if (res.status === 200) {
          // Para cada deporte
          res.data.forEach(asignacion => {
            this.items_deportes.push({
              header: asignacion.deporte
            });
            this.items_deportes.push({
              divider: true
            });
            // Para cada categoria del deporte
            asignacion.categorias.forEach(categoria => {
              this.items_deportes.push({
                text: categoria.categoria,
                value: {
                  id_categoria: categoria.id_categoria,
                  id_deporte: asignacion.id_deporte
                }
              });
            });
          });
          // Mostramos el componente al tener listo el select box
          this.cargando = false;
        }
      })
      .catch((err) => {
        try {
          // Error de login
          if (err.response.status === 401) this.$router.push('/login');
          // Otros errores
          else if (err.response.status) this.mensajeError = err.response.data;
        }
        catch (error) {
          // Servidor no disponible
          this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
          console.warn('Warning: No response status was found, is the server running? ');
        }
      })
  }
}
</script>

<style>

</style>