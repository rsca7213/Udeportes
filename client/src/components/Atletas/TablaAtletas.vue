<template>
  <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
    <v-card-title class="grey--text text--darken-2"> 
      Atletas Registrados en el Sistema 
    </v-card-title>
    <v-container>
      <v-row align="center">
        <v-col cols="12">
          <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
          prepend-icon="mdi-magnify" type="text" v-model="inputs.busqueda" name="busqueda"> </v-text-field>
        </v-col>
      </v-row>
      <v-row class="d-none d-md-flex">
        <v-col cols="12" class="text-right">
          <RegistrarAtletas />
          
          <v-btn color="indigo" dark class="ml-3"> 
            <v-icon left> mdi-chart-arc </v-icon>
            Atletas por Educación
          </v-btn>
          <v-btn color="indigo" dark class="ml-3"> 
            <v-icon left> mdi-school </v-icon>
            Gestionar Niveles Educativos
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="d-flex d-md-none">
        <v-col class="text-center">
          <RegistrarAtletas />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12"> 
          <v-data-table :headers="atributosTabla" :items="itemsTabla" :search="inputs.busquedaAtleta" 
          no-data-text="No hay atletas registrados en el sistema."
          no-results-text="No hay resultados para esta busqueda."
          loading-text="Cargando datos..."
          locale="es-VE"
          fixed-header
          mobile-breakpoint="sm">
            <template v-slot:[`item.acciones`]>
              <v-icon dense color="primary"> mdi-eye </v-icon>
              <v-icon dense color="primary"> mdi-pencil </v-icon>
              <v-icon dense color="error"> mdi-delete </v-icon>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>

import RegistrarAtletas from './RegistrarAtletas';

export default {
  name: 'TablaAtletas',

  components: {
    RegistrarAtletas
  }, 

  data() {
    return {
      inputs: {
        busquedaAtleta: ''
      },
      atributosTabla: [
        {
          text: 'Nro. Cedula',
          align: 'center',
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
          align: 'center',
          sortable: true,
          filterable: true,
          value: 'genero',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Edad',
          align: 'center',
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
          value: 'educacion_etapa',
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
      itemsTabla: [
        {
          cedula: 26967602,
          nombre_completo: 'Ricardo Antonio Salvatorelli Capobianco',
          genero: 'Masculino',
          edad: '21 Años',
          correo: 'rsca4321@gmail.com',
          telefono: '+584141737600',
          educacion_etapa: 'Ingeniería Informática (8vo Semestre)',
          beca_porc: 'FAB (30%)'
        }
      ]
    }
  },

  mounted() {

  }

}
</script>

<style>
  .v-data-table-header th {
    white-space: nowrap;
  }
</style>