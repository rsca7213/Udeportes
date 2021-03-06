<template>
  <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
    <v-card-title class="grey--text text--darken-2"> 
      Atletas Registrados en el Sistema 
    </v-card-title>
    <v-container>
      <v-row align="center">
        <v-col cols="12" class="px-2">
          <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
          prepend-icon="mdi-magnify" type="text" v-model="busquedaAtleta" name="busqueda"> </v-text-field>
        </v-col>
      </v-row>
      <v-row class="d-none d-md-flex">
        <v-col cols="12" class="text-right">
          <RegistrarAtletas @atletaRegistrado="obtenerAtletas()" />
          <AtletasPorEducacion />
          <EducacionesDialog @educacionEvent="obtenerAtletas()"/>
        </v-col>
      </v-row>
      <v-row class="d-flex d-md-none">
        <v-col class="text-center" cols="12">
          <RegistrarAtletas @atletaRegistrado="obtenerAtletas()" />
        </v-col>
        <v-col class="text-center" cols="12">
          <AtletasPorEducacion />
        </v-col>
        <v-col class="text-center" cols="12">
          <EducacionesDialog @educacionEvent="obtenerAtletas()" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="px-1"> 
          <v-data-table :headers="atributosTabla" :items="itemsTabla" :search="busquedaAtleta" 
          no-data-text="No hay atletas registrados en el sistema."
          no-results-text="No hay resultados para esta busqueda."
          loading-text="Cargando datos..."
          locale="es-VE"
          fixed-header
          :loading="tablaCargando"
          >
            <template v-slot:item.correo="{ item }"> 
              <span v-if="!item.correo" class="grey--text d-inline-block d-sm-none text-truncate mr-0 pt-1" style="max-width: 130px;"> No especificado  </span>
              <span v-else class="d-inline-block d-sm-none text-truncate mr-0 pt-1" style="max-width: 130px;" v-text="item.correo"></span>
              <span v-if="!item.correo" class="grey--text d-none d-sm-flex"> No especificado  </span>
              <span v-else class="d-none d-sm-flex" v-text="item.correo"></span>
            </template>
            <template v-slot:item.educacion="{ item }"> 
              <span class="grey--text" v-if="!item.educacion"> No especificada </span>
              <span v-else v-text="item.educacion"></span>
            </template>
            <template v-slot:item.acciones="{ item }">
              <v-icon dense color="primary" @click="$router.push(`/atletas/${item.cedula}`)"> mdi-eye </v-icon>
              <EditarAtleta :cedula="item.cedula" @atletaEditado="obtenerAtletas()" />
              <EliminarAtleta :cedula="item.cedula" :nombre_completo="item.nombre_completo" @atletaEliminado="obtenerAtletas(); snackbarEliminar = true" />
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar v-model="snackbarEliminar" timeout="3000" shaped top>
      <v-icon left color="secondary"> mdi-check-circle </v-icon>
      <span class="success--text"> ¡El atleta fue eliminado con éxito! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbarEliminar = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>

import axios from 'axios';
const server_url = sessionStorage.getItem('SERVER_URL');
import RegistrarAtletas from './RegistrarAtletas';
import EditarAtleta from './EditarAtleta';
import EliminarAtleta from './EliminarAtleta';
import EducacionesDialog from '../Educaciones/EducacionesDialog';
import AtletasPorEducacion from '../Educaciones/AtletasPorEducacion';

export default {
  name: 'TablaAtletas',

  components: {
    RegistrarAtletas,
    EditarAtleta,
    EliminarAtleta,
    EducacionesDialog,
    AtletasPorEducacion
  }, 

  data() {
    return {
      // manejadores de UI
      tablaCargando: true,
      snackbarEliminar: false,
      // input de busqueda de la tabla
      busquedaAtleta: '',
      // headers de la tabla
      atributosTabla: [
        {
          text: 'Nro. Cédula',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'cedula',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Nombre Completo',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'nombre_completo',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Género',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'genero',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Edad',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'edad',
          class: 'primary--text font-weight-bold',
          sort: (a, b) => {
            a = parseInt(a.replace(' Año', '').replace(' Años', ''));
            b = parseInt(b.replace(' Año', '').replace(' Años', ''));
            return a > b ? 1 : -1;
          }
        },
        {
          text: 'Correo Electrónico',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'correo',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Educación (Etapa)',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'educacion',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Acciones',
          align: 'start',
          sortable: false,
          filterable: false,
          value: 'acciones',
          class: 'primary--text font-weight-bold',
          width: '95'
        },
      ],
      // filas de la tabla (rellenados con la funcion obtenerAtletas)
      itemsTabla: []
    }
  },

  methods: {
    /*
      Funcion que hace un request GET para obtener los datos basicos de todos
      los atletas del sistema para colocarlos en la tabla
      Se llama en mounted y cuando los componentes CRUD emiten eventos
    */
    async obtenerAtletas() {
      this.tablaCargando = true;
      // request GET
      await axios.get(`${server_url}/atletas`, { withCredentials: true })
      .then((res) => {
        // Si el codigo es de exito se rellena la tabla
        if (res.status === 200) {
          this.itemsTabla = res.data;
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
      this.tablaCargando = false;
    }
  },

  mounted() {
    this.obtenerAtletas();
  }

}
</script>

<style>
  .v-data-table-header th {
    white-space: nowrap;
  }
</style>