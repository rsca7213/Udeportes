<template>
    <v-container>
        <v-card class="px-1 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Historial Académico de {{atleta.nombre}} {{atleta.apellido}}
                <v-spacer class="d-none d-sm-flex"></v-spacer>
                <v-btn text class="blue--text text--lighten-1 px-1 px-sm-3" @click="$router.push(`/atletas/${$route.params.cedula}`)">
                    <v-icon left> mdi-arrow-left </v-icon>
                    Volver
                </v-btn>
            </v-card-title>
            <v-container>
              <v-row align="center">
                    <v-col cols="12">
                        <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
                        prepend-icon="mdi-magnify" type="text" v-model="search" name="busqueda"> </v-text-field>
                    </v-col>
                </v-row>
                <v-data-table class="mt-5" :headers="columnas_tabla" :items="historial_educativo" :search="search"
                    no-data-text="No se encontraron datos."
                    no-results-text="No hay resultados para esta búsqueda."
                    loading-text="Cargando datos..."
                    locale="es-VE"
                    fixed-header
                    :loading="tablaCargando"
                >
                <template v-slot:item.nombre_educacion="{ item }"> 
                    <span class="grey--text" v-if="item.nombre_educacion === null"> N/A </span>
                    <span v-else v-text="item.nombre_educacion"></span>
                </template>
                <template v-slot:item.tipo_etapa="{ item }"> 
                    <span class="grey--text" v-if="item.tipo_etapa === null"> N/A </span>
                    <span v-else v-text="item.tipo_etapa"></span>
                </template>
                <template v-slot:item.numero_etapa="{ item }"> 
                    <span class="grey--text" v-if="item.numero_etapa === null"> N/A </span>
                    <span v-else v-text="item.numero_etapa"></span>
                </template>
                </v-data-table>
            </v-container>
        </v-card>
    </v-container>
</template>
<script>
import axios from 'axios';

const server_url = sessionStorage.getItem('SERVER_URL');

export default {
  name: 'HistorialAcademicoAtleta',
  data() {
    return {
        historial_educativo: [],
        atleta: {},
        cargando: true,
        tablaCargando: true,
        search: '',
        columnas_tabla: [
            { 
                text: 'Fecha de Registro', 
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'fecha',
                class: 'primary--text font-weight-bold',
                width: '100'
            },
            {
                text: 'Educación',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'nombre_educacion',
                class: 'primary--text font-weight-bold'
            },
            {
                text: 'Tipo Educación',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'tipo_etapa',
                class: 'primary--text font-weight-bold'
            },
            { 
                text: 'Etapa',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'numero_etapa',
                class: 'primary--text font-weight-bold'
            }
        ],
    }
  },
  methods: {
      async getData() {
      await axios
        .get(`${server_url}/atletas/${this.$route.params.cedula}/historico?data=academico`, { withCredentials: true })
        .then((res) => {
          // Si se consiguen los datos
          if (res.status === 200) {
            this.historial_educativo = []
            this.atleta = res.data.atleta;
            res.data.historial_educativo.forEach(historial => {
              if (historial.tipo_etapa === 'Mensual') {
                historial.numero_etapa = historial.numero_etapa + ' mes'
              } else if (historial.tipo_etapa === 'Trimestral') {
                historial.numero_etapa = historial.numero_etapa + ' trimestre'
              } else if (historial.tipo_etapa === 'Semestral') {
                historial.numero_etapa = historial.numero_etapa + ' semestre'
              } else if (historial.tipo_etapa === 'Anual') {
                historial.numero_etapa = historial.numero_etapa + ' año'
              }
              this.historial_educativo.push(historial)
            });
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
      this.tablaCargando = false;
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
          this.snackbar = true;
          console.warn('Warning: No response status was found, is the server running? ');
        }
      })
  }
}
</script>

<style >
.v-data-table-header th{
  white-space: nowrap;
}
</style>