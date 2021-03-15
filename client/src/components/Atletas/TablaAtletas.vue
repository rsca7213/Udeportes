<template>
  <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
    <v-card-title class="grey--text text--darken-2"> 
      Atletas Registrados en el Sistema 
    </v-card-title>
    <v-container>
      <v-row align="center">
        <v-col cols="12">
          <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
          prepend-icon="mdi-magnify" type="text" v-model="busquedaAtleta" name="busqueda"> </v-text-field>
        </v-col>
      </v-row>
      <v-row class="d-none d-md-flex">
        <v-col cols="12" class="text-right">
          <RegistrarAtletas @atletaRegistrado="obtenerAtletas()" />
          
          <v-btn color="indigo" dark class="mx-3"> 
            <v-icon left> mdi-chart-arc </v-icon>
            Atletas por Educación
          </v-btn>
          <EducacionesDialog @educacionEvent="obtenerAtletas()"/>
        </v-col>
      </v-row>
      <v-row class="d-flex d-md-none">
        <v-col class="text-center" cols="12">
          <RegistrarAtletas @atletaRegistrado="obtenerAtletas()" />
        </v-col>
        <v-col class="text-center" cols="12">
          <EducacionesDialog @educacionEvent="obtenerAtletas()" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12"> 
          <v-data-table :headers="atributosTabla" :items="itemsTabla" :search="busquedaAtleta" 
          no-data-text="No hay atletas registrados en el sistema."
          no-results-text="No hay resultados para esta busqueda."
          loading-text="Cargando datos..."
          locale="es-VE"
          fixed-header
          :loading="tablaCargando"
          >
            <template v-slot:item.acciones="{ item }">
              <v-icon dense color="primary"> mdi-eye </v-icon>
              <EditarAtleta :cedula="item.cedula" @atletaEditado="obtenerAtletas()" />
              <EliminarAtleta :cedula="item.cedula" :nombre_completo="item.nombre_completo" @atletaEliminado="obtenerAtletas()" />
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>

import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

import RegistrarAtletas from './RegistrarAtletas';
import EditarAtleta from './EditarAtleta';
import EliminarAtleta from './EliminarAtleta';
import EducacionesDialog from '../Educaciones/EducacionesDialog';

export default {
  name: 'TablaAtletas',

  components: {
    RegistrarAtletas,
    EditarAtleta,
    EliminarAtleta,
    EducacionesDialog
  }, 

  data() {
    return {
      // manejadores de UI
      tablaCargando: true,
      // input de busqueda de la tabla
      busquedaAtleta: '',
      // headers de la tabla
      atributosTabla: [
        {
          text: 'Nro. Cedula',
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
          text: 'Genero',
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
          class: 'primary--text font-weight-bold'
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