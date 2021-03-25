<template>
  <div class="competencias">
    <Cargador v-if="cargando" /> 
    <v-container v-else> 
      <v-row>
        <v-col>
          <v-card class="px-2 py-4" color="#F5F5F5" elevation="4" shaped>
            <v-card-title> Competencias </v-card-title>
            <v-card-subtitle v-if="!categoria || !categoria.id_categoria"> 
              Para comenzar a gestionar las competencias, por favor selecciona una categoría. 
            </v-card-subtitle>
            <v-card-subtitle v-else> 
              Puedes cambiar la categoria en cualquier momento.
            </v-card-subtitle>
            <v-container class="pt-0">
              <v-row class="pt-0">
                <v-col class="pt-0" cols="12" md="6" lg="4" xl="3">
                  <v-select v-model="categoria" label="Categoría" prepend-icon="mdi-clipboard-text"
                  clear-icon="mdi-close" name="categoria" clearable :items="itemsSelect" :messages="deporteActual"
                  no-data-text="No tiene categorias asignadas" @change="getCompetencias()">
                  </v-select>
                </v-col>
              </v-row>
              <v-row v-if="!categoria || !categoria.id_categoria">
                <v-col class="grey--text text-center"> Selecciona una categoría para gestionar sus competencias. </v-col>
              </v-row>
              <v-row v-else-if="categoriaCargando"> 
                <v-col class="px-6 mx-5">
                  <v-progress-linear indeterminate color="primary"> </v-progress-linear>
                </v-col>
              </v-row>
            </v-container>
            <span v-if="categoria && categoria.id_categoria && !categoriaCargando">
              <TablaCompetencias :competencias="competencias" :id_deporte="categoria.id_deporte" 
              :id_categoria="categoria.id_categoria" :usuario="usuario" />
            </span>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Cargador from '../components/Cargador';
import TablaCompetencias from '../components/Competencias/TablaCompetencias';
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'Competencias',

  components: {
    Cargador,
    TablaCompetencias
  },

  data() {
    return {
      // UI Handlers
      cargando: true,
      categoriaCargando: true,
      mensajeError: '',
      // Usuario actualmente iniciado
      usuario: {
        admin: false
      },
      // Competencias de una categoria
      competencias: [],
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
      Función que obtiene las competencias de una categoria
      Los datos obtenidos son:
      res.data = {
        id: Number,
        nombre: String,
        estatus: String,
        fecha_inicio: Date (String 'dd/mm/yyyy'),
        fecha_fin: Date (String 'dd/mm/yyyy'),
      }
    */
    async getCompetencias() {
      // Si se selecciona una categoria
      if (this.categoria) {
        // Colocamos el loader
        this.categoriaCargando = true;
        // Request GET
        await axios.get(`${server_url}/competencias/${this.categoria.id_deporte}/${this.categoria.id_categoria}`,
        { withCredentials: true } )
          .then((res) => {
            // En caso de exito
            if (res.status === 200) {
              // Asignamos la data obtenida a la variable entrenamientos
              this.competencias = res.data;
              if (!this.competencias) this.competencias = [];
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
    },

    /*
    Funcion que rellena el select box de categorias haciendo una solicitud GET al servidor,
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
  async obtenerCategorias() {
    // Solicitud GET
    await axios.get(`${server_url}/competencias/categorias`, { withCredentials: true })
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
          else if (err.response.status) this.mensajeError = err.response.data;
        }
        catch (error) {
          // Servidor no disponible
          this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
          console.warn('Warning: No response status was found, is the server running? ');
        }
      })
  }
  },

  // Determina el nombre del deporte actual de la categoria seleccionada
  computed: {
    deporteActual() {
      return this.deportes.find(item => item.id  === this.categoria.id_deporte)?.nombre;
    }
  },

  // En mounted verificamos login, admin y config inicial, adicionalmente rellenamos el selectBox con
  // las categorias a las que tiene acceso el usuario
  async mounted() {
    // Ocultamos el componente, mostrando el Cargador
    this.cargando = true;
    await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
      .then((res) => {
        // si el usuario es admin y ha iniciado sesión
        if (res.status === 200) {
          this.usuario.admin = true;
          this.obtenerCategorias();
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
            this.usuario.admin = false;
            this.obtenerCategorias();
          }
        }
        catch { 
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
  }
}
</script>

<style>

</style>