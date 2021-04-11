<template>
  <div class="entrenamientos">
    <v-snackbar v-model="snackbar" timeout="3000" shaped top>
      <v-icon left color="error"> mdi-cancel </v-icon>
      <span class="error--text"> ¡Ha ocurrido un error inesperado, refresca la pagina! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbar = false"> Cerrar </v-btn>
      </template>
    </v-snackbar>
    <Cargador v-if="cargando" /> 
    <v-container v-else> 
      <v-row>
        <v-col>
          <v-card class="px-2 py-4" color="#F5F5F5" elevation="4" shaped>
            <v-card-title> Entrenamientos </v-card-title>
            <v-card-subtitle v-if="!categoria || !categoria.id_categoria"> 
              Para comenzar a gestionar los entrenamientos, por favor selecciona una categoría. 
            </v-card-subtitle>
            <v-card-subtitle> 
              Puedes cambiar la categoría en cualquier momento.
            </v-card-subtitle>
            <v-container class="pt-0">
              <v-row class="pt-0">
                <v-col class="pt-0" cols="12" md="6" lg="4" xl="3">
                  <v-select v-model="categoria" :label="`Categoría ${deporteActual ? '(' + deporteActual + ')' : ''}`" 
                  prepend-icon="mdi-clipboard-text"
                  clear-icon="mdi-close" name="categoria" clearable :items="itemsSelect"
                  no-data-text="No tiene categorias asignadas" @change="getEntrenamientos()">
                  </v-select>
                </v-col>
              </v-row>
              <v-row v-if="!categoria || !categoria.id_categoria">
                <v-col class="grey--text text-center"> Selecciona una categoría para gestionar sus entrenamientos. </v-col>
              </v-row>
              <v-row v-else-if="categoriaCargando"> 
                <v-col class="px-6 mx-5">
                  <v-progress-linear indeterminate color="primary"> </v-progress-linear>
                </v-col>
              </v-row>
            </v-container>
            <span v-if="categoria && categoria.id_categoria && !categoriaCargando">
              <TablaEntrenamientos :entrenamientos="entrenamientos" :id_deporte="categoria.id_deporte" 
              :id_categoria="categoria.id_categoria" />
            </span>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Cargador from '../components/Cargador';
import TablaEntrenamientos from '../components/Entrenamientos/TablaEntrenamientos';
import axios from 'axios';

const server_url = sessionStorage.getItem('SERVER_URL');

export default {
  name: 'Entrenamientos',

  components: {
    Cargador,
    TablaEntrenamientos
  },

  data() {
    return {
      // UI Handlers
      cargando: true,
      categoriaCargando: true,
      snackbar: false,
      mensajeError: '',
      // Entrenamientos de una categoria
      entrenamientos: [],
      // Items en el select box (Categorias)
      itemsSelect: [],
      // Deportes { id, nombre } para mostrarlo al seleccionar una categoria
      deportes: [],
      // V-model del select box
      categoria: {
        id_categoria: 0,
        id_deporte: 0
      }
    }
  },

  methods: {
    /*
      Función que obtiene los entrenamientos de una categoria
      Los datos obtenidos son:
      res.data = {
        id: Number,
        fecha: Date (String 'dd/mm/yyyy'),
        nombre: String,
        asistencias: String (Ej.: '4 Atletas'),
        faltas: String (Ej.: '2 Atletas'),
        porcentaje: String (Ej.: '50.00 %')
      }
    */
    async getEntrenamientos() {
      // Si se selecciona una categoria
      if (this.categoria) {
        this.entrenamientos = [];
        // Colocamos el loader
        this.categoriaCargando = true;
        // Request GET
        await axios.get(`${server_url}/entrenamientos/${this.categoria.id_deporte}/${this.categoria.id_categoria}`, { withCredentials: true } )
          .then((res) => {
            // En caso de exito
            if (res.status === 200) {
              // Asignamos la data obtenida a la variable entrenamientos
              this.entrenamientos = res.data;
            }
          })
          .catch((err) => {
            try {
              // errores
              if (err.response.status) this.mensajeError = err.response.data;
            }
            catch (error) {
              // Servidor no disponible
              this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
              console.warn('Warning: No response status was found, is the server running? ');
            }
          });
        // Quitamos el loader
        this.categoriaCargando = false;
      }
    }
  },

  // Determina el nombre del deporte actual de la categoria seleccionada
  computed: {
    deporteActual() {
      return this.deportes.find(item => item.id  === this.categoria?.id_deporte)?.nombre;
    }
  },

  /*
    En mounted se rellena el select box de categorias haciendo una solicitud GET al servidor,
    esta devolvera un arreglo de objetos de la siguiente manera
    res.data = [
      {
        deporte: String,
        id_deporte: Number,
        categorias: [
          {
            categoria: String,
            id_categoria: Number
          }
        ]
      }
    ]
    Estos datos deben ser transformados para el select box, por lo cual al obtener los datos se realizan
    una serie de pasos para obtener lo siguiente:
    itemsSelect = [
      {
        text: String, //Para las opciones de categoria
        value: { //Para las opciones de categoria
          id_categoria: Number,
          id_deporte: Number
        }
        divider: Boolean, // Para tener un separador indicando el nombre del deporte
        header: String //Para tener un separador indicando el nombre del deporte
      }
    ]

    Al finalizar el request y la transformacion, se quita el atributo cargando
    En caso de error de login se redirecciona a '/login', en caso de otros errores
    se indica con un v-alert
  */
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
            this.itemsSelect.push({
              header: asignacion.deporte
            });
            this.itemsSelect.push({
              divider: true
            });
            // Para cada categoria del deporte
            asignacion.categorias.forEach(categoria => {
              this.itemsSelect.push({
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
          this.cargando = false;
        }
      })
      .catch((err) => {
        try {
          // Error de login
          if (err.response.status === 401) this.$router.push('/login');
          // Otros errores
          else if (err.response.status) { 
            this.snackbar = true;
            this.mensajeError = err.response.data;
          }
        }
        catch (error) {
          // Servidor no disponible
          this.snackbar = true;
          this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
          console.warn('Warning: No response status was found, is the server running? ');
        }
      })
  }
}
</script>

<style>

</style>