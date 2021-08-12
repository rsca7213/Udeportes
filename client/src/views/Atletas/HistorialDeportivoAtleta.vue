<template>
    <v-container>
        <v-card class="px-1 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Historial Deportivo de {{atleta.nombre}} {{atleta.apellido}}
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
                <v-data-table class="mt-5" :headers="columnas_tabla" :items="historial_deportivo" :search="search"
                    group-by="Educación"
                    no-data-text="No se encontraron datos."
                    no-results-text="No hay resultados para esta búsqueda."
                    loading-text="Cargando datos..."
                    locale="es-VE"
                    fixed-header
                    :loading="tablaCargando"
                >
                <template v-slot:group.header="{items, isOpen, toggle }">
                  <th colspan="5" class="grey lighten-4">
                    <v-icon @click="toggle">
                      {{ isOpen ? 'mdi-minus' : 'mdi-plus' }}
                    </v-icon>
                    <span class="indigo--text font-weight-bold"> {{ items[0].Educación }} </span>
                  </th>
                </template>
                <template v-slot:item="{ item }">
                  <tr>
                    <td align="center">{{ item.fecha }}</td>
                    <td align="center">{{ item.nombre_deporte }}</td>
                    <td align="center">{{ item.nombre_categoria }}</td>
                    <td align="center">{{ item.genero_categoria }}</td>
                    <td align="center" class="grey--text" v-if="item.nombre_posicion === null">N/A</td>
                    <td align="center" v-else>{{item.nombre_posicion}}</td>
                  </tr>
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
  name: 'HistorialDeportivoAtleta',
  data() {
    return {
        historial_deportivo: [],
        educacion: [],
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
                width: '100',
                groupable: false
            },
            {
                text: 'Deporte',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'nombre_deporte',
                class: 'primary--text font-weight-bold',
                groupable: false
            },
            {
                text: 'Categoría',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'nombre_categoria',
                class: 'primary--text font-weight-bold',
                groupable: false
            },
            { 
                text: 'Género Categoría',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'genero_categoria',
                class: 'primary--text font-weight-bold',
                groupable: false
            },
            { 
                text: 'Posición',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'nombre_posicion',
                class: 'primary--text font-weight-bold',
                groupable: false
            },
        ],
    }
  },
  methods: {
      async getData() {
      await axios
        .get(`${server_url}/atletas/${this.$route.params.cedula}/historico?data=deportivo`, { withCredentials: true })
        .then((res) => {
          // Si se consiguen los datos
          if (res.status === 200) {
            this.historial_deportivo = []
            this.atleta = res.data.atleta;
            res.data.historial_deportivo.forEach(historial => {
              this.historial_deportivo.push(historial)
            });
            res.data.historial_educativo.forEach(historial => {
              let nombre = 'Sin educación'
              if (historial.nombre_educacion != null) {
                nombre = historial.nombre_educacion + ': ' + historial.numero_etapa + ' ' + historial.tipo_etapa
              }
              this.educacion.push({
                id: historial.id,
                nombre: nombre
              })
            });
            this.historial_deportivo.forEach(historial => {
              this.educacion.forEach(educacion => {
                if (historial.id_etapa === educacion.id) {
                  historial.Educación = educacion.nombre
                }
              })
            })
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