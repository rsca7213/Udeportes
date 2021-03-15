<template>
    <v-container v-if="!cargando">
        <h1 class="display-1 mt-2">Deportes</h1>
        <br>
        <v-row class="mt-5" justify="center" v-if="deportes.length > 0">
            <v-card shaped class="ma-3" width="344" v-for="deporte in deportes" :key="deporte.id" @click="dialogEditar()" elevation="8">
                <v-card color="green" height="50px" elevation="0" tile></v-card>
                <v-card-title>{{deporte.nombre}}</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" small dark fab @click="ver_Deporte(deporte.id, false)"><v-icon>mdi-pencil</v-icon></v-btn>
                    <v-btn color="red" small dark fab @click="ver_Deporte(deporte.id, true)"><v-icon>mdi-delete</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-row>
        <v-row class="mt-5" justify="center" v-else>
            <h2 class="font-weight-light">No se encontraron deportes en el sistema.</h2>
        </v-row>

        <!-- Dialog para crear un deporte -->
        <v-dialog  v-model="crearDeporte" max-width="450px">
            <v-card>
                <v-card-title>
                    Crear Deporte
                    <v-spacer />
                    <v-btn icon @click="crearDeporte=false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="crearForm" @submit.prevent="crear_Deporte()" class="ma-3">
                        <v-text-field clear-icon="mdi-close" clearable label="Nombre del deporte" counter="50"
                        type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur v-model="deporteCrear.nombre"></v-text-field>
                        <v-btn block class="mt-3" color="secondary" type="submit">crear</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        
        <!-- Dialog para configurar el deporte (posiciones y categorias) -->
        <v-dialog  v-model="configDeporte" max-width="450px">
            <v-card>
                <v-card-title>
                    Editar Deporte
                    <v-spacer />
                    <v-btn icon @click="configDeporte = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-col>
                    <v-card elevation="11">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center">Posiciones</v-card-title>
                            <v-avatar class="ma-3" size="100">
                                <v-img src="../assets/deportes/posiciones.png"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                    <br>
                    <v-card elevation="11">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center">Categorias</v-card-title>
                            <v-avatar class="ma-3" size="100">
                                <v-img src="../assets/deportes/categorias.png"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                    <br>
                    <v-card elevation="11">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center">Entrenadores</v-card-title>
                            <v-avatar class="ma-3" size="100">
                                <v-img src="../assets/deportes/entrenadores.png"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                </v-col>
            </v-card>
        </v-dialog>
        
        <!-- Dialog para editar un deporte -->
        <v-dialog  v-model="editarDeporte" max-width="450px">
            <v-card>
                <v-card-title>
                    Editar Nombre
                    <v-spacer />
                    <v-btn icon @click="editarDeporte = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="editForm" @submit.prevent="editar_Deporte()" class="ma-3">
                        <v-text-field clear-icon="mdi-close" clearable label="Nombre del deporte" counter="50"
                        type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur v-model="deporte.nombre"></v-text-field>
                        <v-btn block class="mt-3" color="secondary" type="submit">guardar</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog para eliminar un deporte -->
        <v-dialog  v-model="eliminarDeporte" max-width="450px">
            <v-card>
                <v-card-title>
                    Eliminar Deporte
                    <v-spacer />
                    <v-btn icon @click="eliminarDeporte = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text class="text-justify mt-2">
                    ¿Esta seguro de que desea eliminar {{deporte.nombre}}?
                    <v-divider class="my-2"> </v-divider>
                    Una vez eliminado no se podrán recuperar los datos del deporte
                    como posiciones, categorias, entrenamientos y competencias.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" dark @click="eliminar_Deporte()">
                        <v-icon left> mdi-delete </v-icon>
                        eliminar
                    </v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Display de mensaje -->
        <v-snackbar v-model="display.show" timeout="4000" shaped transition="scroll-y-reverse-transition" multi-line> 
            {{display.mensaje}}
            <template v-slot:action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="display = false">
                Cerrar
                </v-btn>
            </template>
        </v-snackbar>

        <v-btn color="primary" @click="crearDeporte = true" large right fixed bottom fab dark><v-icon>mdi-plus</v-icon></v-btn>
    </v-container>
    <Cargador v-else/>
</template>

<script>
import axios from 'axios';
import Cargador from '../components/Cargador';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {

  name: 'Deportes',

  components: {
    Cargador,
  },

  data() {
        return {
            cargando: true,
            crearDeporte: false,
            editarDeporte: false,
            configDeporte: false,
            eliminarDeporte: false,
            display: {show: false},
            deporteCrear: {},
            deporte: {},
            deportes: [],
            reglasNombre: [
                v => !!v || 'Este campo es obligatorio',
                v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
            ],
        }
    },
    methods: {
        async crear_Deporte () {
            if(this.$refs.crearForm.validate()) { 
                try {
                    await axios
                    .post(`${server_url}/deportes/crear`, this.deporteCrear, { withCredentials: true })
                    .then((res) => {
                        if (res.data.codigo === 200) this.deportes.push(res.data.deporte);
                        console.log(res.data.texto);
                        this.$refs.crearForm.reset();
                        this.crearDeporte = false;
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto
                        };
                    })
                    .catch((error) => {
                        this.$refs.crearForm.reset();
                        this.mensajeError = error.response.status === 400
                        ? 'Ha ocurrido un error a la hora de crear el deporte'
                        : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        },
        async ver_Deporte (id, eliminar) {
            try {
                axios.get(`${server_url}/deportes/${id}`, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200){
                        this.deporte = res.data.deporte;
                    }
                }).catch((error) => {
                    if (error.response.status === 428) this.$router.push('/init');
                    else this.$router.push('/login');
                });
            } catch (error) {
                console.log(error);
            }
            if (eliminar) {
                this.eliminarDeporte = true;
            } else {
                this.editarDeporte = true;
            }
        },
        async editar_Deporte () {
            if(this.$refs.editForm.validate()) { 
                try {
                    await axios
                    .put(`${server_url}/deportes/editar/${this.deporte.id}`, this.deporte, { withCredentials: true })
                    .then((res) => {
                        if (res.data.codigo === 200) {
                            const index = this.deportes.findIndex(d => d.id == this.deporte.id);
                            this.deportes[index] = res.data.deporte;
                        }
                        console.log(res.data.texto);
                        this.$refs.editForm.reset();
                        this.editarDeporte = false;
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto
                        };
                    })
                    .catch((error) => {
                        this.$refs.editForm.reset();
                        this.mensajeError = error.response.status === 400
                        ? 'Ha ocurrido un error a la hora de editar el deporte'
                        : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        },
        async eliminar_Deporte () {
            try {
                axios.delete(`${server_url}/deportes/eliminar/${this.deporte.id}`, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200){
                        const index = this.deportes.findIndex(d => d.id == this.deporte.id);
                        this.deportes.splice(index, 1);
                    }
                    this.eliminarDeporte = false;
                    this.display = {
                        show: true, 
                        mensaje: res.data.texto
                    };
                }).catch((error) => {
                    if (error.response.status === 428) this.$router.push('/init');
                    else this.$router.push('/login');
                });
            } catch (error) {
                console.log(error);
            }
        },
        dialogEditar () {
            if (!this.editarDeporte && !this.eliminarDeporte) {
                this.configDeporte = true;
            }
        },
    },
    // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
    // en caso positivo, se redirecciona a Deportes, sino se muestra el componente para iniciar sesión
    async mounted() {
    await axios
      .get(`${server_url}/auth/login`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          this.cargando = false;
          //en caso de que se pasen todas las validaciones se llaman a todos los deportes del sistema
          axios.get(`${server_url}/deportes/`, { withCredentials: true })
          .then((res) => {
            if (res.data.codigo === 200){
                this.deportes = res.data.deportes;
            }
          }).catch((error) => {
              if (error.response.status === 428) this.$router.push('/init');
              else this.$router.push('/login');
          });
        }
      })
      .catch((error) => {
        if (error.response.status === 428) this.$router.push('/init');
        else this.$router.push('/login');
      });
  }
}
</script>

<style>
</style>