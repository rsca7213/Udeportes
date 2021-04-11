<template>
  <div>
    <v-container>
      <v-row class="" align="start">
        <v-col cols="12 "> 
          <v-card color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="pl-sm-11 pl-4 pb-0 grey--text text--darken-2">
              {{card_title}}
            </v-card-title>
            <div v-if="menu_reportes === 'menu'">
              <v-card-text>
                <v-expansion-panels class="px-0 px-sm-8" v-if="true" accordion>
                  <v-expansion-panel :disabled="false">
                    <v-expansion-panel-header> 
                      <span class="d-flex justify-start">
                        <v-icon color="indigo" left> mdi-clipboard-text </v-icon>
                        <span class="subtitle-1">Reportes de Asistencia a Entrenamientos y Competencias</span>
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-list-item-group color="indigo">
                        <v-list dense>
                          <v-list-item two-line v-for="(item, index) in reportes_asistencia" :key="index" @click="cambiarVista(item.nombre)"> 
                            <v-list-item-content class="text-caption">
                              <v-list-item-title class="text-wrap d-flex justify-start"> 
                                <v-icon color="indigo" left> mdi-clipboard-text-outline </v-icon>
                                <span class="subtitle-2" v-text="item.nombre"></span>
                              </v-list-item-title>
                              <v-list-item-subtitle class="pl-8 text-wrap"> 
                                <span v-text="item.descripcion"></span>
                              </v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-list-item-group>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel class="justify-start" :disabled="false">
                    <v-expansion-panel-header>
                      <span class="d-flex justify-start">
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
                  <v-expansion-panel v-if="rol_usuario==='Administrador'">
                    <v-expansion-panel-header> 
                      <span class="d-flex justify-start">
                        <v-icon color="indigo" left> mdi-clipboard-text </v-icon>
                        <span class="subtitle-1">Reportes de Atletas</span>
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-list-item-group color="indigo">
                        <v-list dense>
                          <v-list-item two-line v-for="(item, index) in reportes_atletas" :key="index" @click="cambiarVista(item.nombre)"> 
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
              <v-card-subtitle class="py-2 pl-sm-11 pl-4" v-if="!reportes_atletas.filter(reporte => reporte.nombre ===menu_reportes).length">
                Puedes cambiar la categoría en cualquier momento.
              </v-card-subtitle>
              <div class="text-center">
                <v-btn text class="blue--text text--lighten-1 mb-3" @click="cambiarVista('Reportes')">
                  <v-icon left> mdi-arrow-left </v-icon>
                  Regresar al menú
                </v-btn>
              </div>
              <v-container class="pt-0">
                <v-row class="pt-0 justify-center" v-if="!reportes_atletas.filter(reporte => reporte.nombre ===menu_reportes).length">
                  <v-col class="pt-0 pl-md-11" cols="12" sm="10" lg="6" xl="6">
                    <v-select class="mb-4" v-model="categoria" :label="`Categoría ${deporteActual ? '(' + deporteActual + ')' : ''}`" prepend-icon="mdi-clipboard-text"
                    clear-icon="mdi-close" name="categoria" clearable :items="items_deportes"
                    no-data-text="No tiene categorias asignadas" @change="datosEquipo()" hide-details>
                    </v-select>
                  </v-col>
                </v-row>
                <v-row v-if="(!categoria || !categoria.id_categoria) && !reportes_atletas.filter(reporte => reporte.nombre ===menu_reportes).length">
                  <v-col class="grey--text text-center pt-0"> Selecciona una categoría para generar el reporte. </v-col>
                </v-row>
                <v-row v-else-if="categoria_cargando"> 
                  <v-col class="px-6 mx-5">
                    <v-progress-linear indeterminate color="primary"> </v-progress-linear>
                  </v-col>
                </v-row>
                <div>
                  <NominaEquipo v-if="categoria!==null && categoria.id_categoria && menu_reportes==='Nómina de Equipo'" :categoria="categoria" :equipo="equipo"/>
                  <NominaCompetencia v-else-if="categoria!==null && categoria.id_categoria && menu_reportes==='Nómina de Competencia'" :categoria="categoria" :equipo="equipo"/>
                  <AsistenciaGeneralEntrenamientos v-else-if="categoria!==null && categoria.id_categoria && menu_reportes==='Asistencia General a Entrenamientos'" :categoria="categoria" :equipo="equipo"/>
                  <AsistenciaGeneralCompetencias v-else-if="categoria!==null && categoria.id_categoria && menu_reportes==='Asistencia General a Competencias'" :categoria="categoria" :equipo="equipo"/>
                  <AsistenciaDetalladaEntrenamientos v-else-if="categoria!==null && categoria.id_categoria && menu_reportes==='Asistencia a Entrenamientos en Detalle'" :categoria="categoria" :equipo="equipo"/>
                  <AsistenciaDetalladaCompetencias v-else-if="categoria!==null && categoria.id_categoria && menu_reportes==='Asistencia a Competencias en Detalle'" :categoria="categoria" :equipo="equipo"/>
                  <AtletasConBeca v-if="menu_reportes === 'Reporte de Atletas con Beca'"/>
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
import AsistenciaDetalladaEntrenamientos from './AsistenciaDetalladaEntrenamientos';
import AsistenciaDetalladaCompetencias from './AsistenciaDetalladaCompetencias';
import AsistenciaGeneralCompetencias from './AsistenciaGeneralCompetencias';
import AtletasConBeca from './AtletasConBeca';
import axios from 'axios';
const server_url = sessionStorage.getItem('SERVER_URL');
export default {
  name: 'MenuReportes',
  components: {
    NominaEquipo,
    NominaCompetencia,
    AsistenciaGeneralEntrenamientos,
    AsistenciaGeneralCompetencias,
    AsistenciaDetalladaEntrenamientos,
    AsistenciaDetalladaCompetencias,
    AtletasConBeca
  },
  data() {
    return {
      /* UI handlers*/
      card_title: 'Reportes',
      menu_reportes: 'menu',
      categoria_cargando: true,
      //categoria que se le pasa a los componentes para las búsquedas que sean necesarias
      categoria: {
        id_categoria: 0,
        id_deporte: 0
      },
      //rol de usuario para mostrar solo las opciones de reportes respectivas
      rol_usuario: '',
      //nombre del equipo para mostrarlo en el reporte respectivo
      equipo: '',
      //deportes del select
      deportes: [],
      // Data para el select de deportes, rellenado en mounted()
      items_deportes: [],
      //Información de reportes de asistencia a entrenamientos y competencias
      reportes_asistencia: [
        {
          nombre: 'Asistencia General a Entrenamientos',
          descripcion: 'Consulta la asistencia a todos los entrenamientos de un equipo',
        },
        {
          nombre: 'Asistencia a Entrenamientos en Detalle',
          descripcion: 'Consulta la asistencia de un entrenamiento de un equipo en detalle',
        },
        {
          nombre: 'Asistencia General a Competencias',
          descripcion: 'Consulta la asistencia a todos los competencias de un equipo',
        },
        {
          nombre: 'Asistencia a Competencias en Detalle',
          descripcion: 'Consulta la asistencia de una competencia de un equipo en detalle',
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
          descripcion: 'Consulta todos los atletas que asistieron a una competencia',
        },
      ],
      //Información de reportes de atletas
      reportes_atletas : [
        {
          nombre: 'Reporte de Atletas con Beca',
          descripcion: 'Consulta todos los atletas que poseen una beca'
        }
      ]
    }
  },
  // Determina el nombre del deporte actual de la categoria seleccionada
  computed: {
    deporteActual() {
      return this.deportes.find(item => item.id  === this.categoria?.id_deporte)?.nombre;
    }
  },
  methods: {
    //método encargado de cambiar la vista de los reportes
    cambiarVista(titulo){
      this.categoria={
        id_categoria:0,
      }
      this.card_title = titulo;
      (titulo === 'Reportes')? this.menu_reportes = 'menu': this.menu_reportes = titulo;
      
    },
    //método para obtener el nombre del deporte y de la categoría para mostrarlo en el reporte
    datosEquipo(){

      let nombre_deporte='';
      let nombre_categoria= '';

      nombre_deporte = this.deportes.find(item => item.id  === this.categoria?.id_deporte)?.nombre;
      nombre_categoria = this.items_deportes.find(item => item.value?.id_categoria  === this.categoria?.id_categoria)?.text;

      this.equipo = `${nombre_deporte} ${nombre_categoria}`
    },
  },
  async mounted() {
    this.categoria_cargando = true;
    // se obtiene el rol del usuario para mostrar los reportes que pueda generar
    await axios
      .get(`${server_url}/perfil?data=completa`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) 
          this.rol_usuario = (res.data.usuario.rol==='a')? 'Administrador' : 'Entrenador';
          
      })
      .catch(() => { });

    //se obtienen todos las categorias a mostrar en el select de categorias
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

              // Agregamos el deporte al arreglo de deportes siempre y cuando no exista ya en dicho arreglo
              if (!this.deportes.map(i => i.id).includes(asignacion.id_deporte))
              this.deportes.push({
                id: asignacion.id_deporte,
                nombre: asignacion.deporte
              });
            });
          });
          // Mostramos el componente al tener listo el select box
          this.categoria_cargando = false;
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