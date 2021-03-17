<template>
  <div>
    <v-container>
      <v-row class="" align="start">
        <v-col cols="12 "> 
          <v-card rounded="md">
            <v-card-title class="pl-11 pb-0 grey--text text--darken-2">
              Reportes
            </v-card-title>
            <div v-if="menu_reportes === 'menu'">
              <v-card-text>
                <v-expansion-panels class="px-8" v-if="true" accordion>
                  <v-expansion-panel :disabled="false">
                    <v-expansion-panel-header> 
                      <span>
                        <v-icon color="indigo" left> mdi-alert </v-icon>
                        <span class="subtitle-1">Reportes de Asistencia a Entrenamientos y Competencias</span>
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-list-item-group v-model="asistencia_general" color="indigo">
                        <v-list dense>
                          <v-list-item two-line v-for="(item, index) in reportes_asistencia" :key="index" @click="menu_reportes=item.nombre"> 
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
                        <v-icon color="indigo" left> mdi-clipboard-text-outline </v-icon>
                        <span class="subtitle-1">Nóminas de Equipos y Competencias</span>
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-list-item-group color="indigo">
                        <v-list dense>
                          <v-list-item two-line v-for="(item, index) in nominas" :key="index"> 
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
            <div v-else-if="menu_reportes ==='Asistencia General a Entrenamientos'">
              <v-card-text class="px-11">
                <v-form>
                  <v-select label="Deportes" prepend-icon="mdi-alert"
                  clear-icon="mdi-close" name="educacion" clearable
                  :loading="deportes_cargando" :items="items_deportes" :disabled="deportes_cargando">
                  </v-select>
                </v-form>
              </v-card-text>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <!--<ExitoDialog v-if="exito_dialog" :props_exito_dialog="props_exito_dialog"/>-->
    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'MenuReportes',
  components: {

  },
  data() {
    return {
      asistencia_general: 1,
      /* UI handlers*/
      menu_reportes: 'menu',
      deportes_cargando: true,

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
          nombre: 'Nómina de Asistencia',
          descripcion: 'Consulta todos los atletas de una competencia',
        },
      ]
    }
  },
  methods: {
    //método que obtiene los datos para rellenar los selects
    async getData() {
      this.items_deportes = [];
      await axios.get(`${server_url}/deportes`, { withCredentials: true })
      .then((res) => {
        // Exito 200 (se hizo el select query, puede haber o no haber datos, indicado por "Vacio")
        if (res.status === 200) {
          // si hay datos se colocan en items_deportes
          if (res.data != 'Vacio') 
            Array.from(res.data.deportes).forEach(item => this.items_deportes.push({ text: item.nombre, value: item.id}));
          // Maneja el atributo loading del select box
          this.deportes_cargando = false;
        }
      })

      .catch((error) => {
        try {
          // Error por parte del servidor
          console.log(error.response.status);
        }
        catch {
          // Servidor inalcanzable
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
    },
  },
  async mounted() {
    console.log('hola');
    this.getData();
  }
}
</script>

<style>

</style>