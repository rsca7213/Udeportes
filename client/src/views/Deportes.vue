<template>
    <v-container v-if="!cargando">
        <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Deportes 
            </v-card-title>
            <v-row class="mt-5" v-if="this.deportesCheck" dense>
                <v-col v-for="(deporte, index) in deportes" :key="deporte.id" cols="12" sm="6" md="4" lg="3">
                    <v-card shaped class="ma-3" @click="ver_Deporte(deporte.id, 'config')" elevation="8">
                        <v-card :color="colores[index % 8]" height="150" elevation="0">
                            <v-card-title class="white--text"> 
                                <v-icon left color="white"> mdi-basketball </v-icon>
                                <span v-text="deporte.nombre"> </span>
                            </v-card-title>
                        </v-card>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" class="pa-0 ma-0" x-small dark text fab @click="ver_Deporte(deporte.id, 'editar')"><v-icon>mdi-pencil</v-icon> </v-btn>
                            <v-btn color="red" class="pa-0 ma-0" x-small dark text fab @click="ver_Deporte(deporte.id, 'eliminar')"><v-icon>mdi-delete</v-icon> </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
            <v-card-subtitle class="grey--text text--darken-2" v-else>
                No se encontraron deportes en el sistema.
            </v-card-subtitle>
        </v-card>  
        
        <!-- Dialog para crear un deporte -->
        <v-dialog  v-model="crearDeporte" max-width="450px">
            <v-card>
                <v-card-title>
                    <span class="d-none d-sm-flex"> Crear Deporte </span>
                    <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Crear Deporte </b>
                    <v-spacer />
                    <v-btn icon @click="crearDeporte=false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="crearForm" @submit.prevent="crear_Deporte()" class="ma-3">
                        <v-text-field clear-icon="mdi-close" clearable label="Nombre del deporte" counter="50"
                        type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur v-model="deporteCrear.nombre"></v-text-field>
                        <v-btn block class="mt-3" color="secondary" type="submit">
                            <v-icon left> mdi-check-circle </v-icon>
                            crear
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        
        <!-- Dialog para configurar el deporte (posiciones y categorias) -->
        <v-dialog  v-model="configDeporte" max-width="400px">
            <v-card>
                <v-card-title>
                    <span class="d-none d-sm-flex"> Configurar Deporte </span>
                    <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Configurar Deporte </b>
                    <v-spacer />
                    <v-btn icon @click="configDeporte = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-col>
                    <v-card elevation="2" shaped class="primary" @click="$router.push(`/deporte/${deporte.id}/posiciones`);">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center white--text text-button">Posiciones</v-card-title>
                            <v-avatar class="ma-3" size="60">
                                <v-img src="../assets/deportes/posiciones.png"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                    <br>
                    <v-card elevation="2" shaped class="primary" @click="$router.push(`/deporte/${deporte.id}/estadisticas`)">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center white--text text-button">Estadísticas</v-card-title>
                            <v-avatar class="ma-3" size="60">
                                <v-img src="../assets/deportes/estadisticas.png"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                    <br>
                    <v-card elevation="2" shaped class="primary" @click="$router.push(`/deporte/${deporte.id}/categorias`);">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center white--text text-button">Categorías</v-card-title>
                            <v-avatar class="ma-3" size="60">
                                <v-img src="../assets/deportes/categorias.png"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                    <br>
                    <v-card elevation="2" shaped class="primary" @click="$router.push(`/deporte/${deporte.id}/inscripciones`);">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center white--text text-button">Inscripciones</v-card-title>
                            <v-avatar class="ma-3" size="60">
                                <v-img src="../assets/deportes/inscripciones.png"></v-img>
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
                    <span class="d-none d-sm-flex"> Editar Nombre </span>
                    <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Editar Nombre </b>
                    <v-spacer />
                    <v-btn icon @click="editarDeporte = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="editForm" @submit.prevent="editar_Deporte()" class="ma-3">
                        <v-text-field clear-icon="mdi-close" clearable label="Nombre del deporte" counter="50"
                        type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur v-model="deporte.nombre"></v-text-field>
                        <v-btn block class="mt-3" color="secondary" type="submit">
                            <v-icon left> mdi-check-circle </v-icon>
                            guardar
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog para eliminar un deporte -->
        <v-dialog v-model="eliminarDeporte" class="text-center" max-width="600">
            <v-card rounded="md">
                <v-card-title>
                    <span class="d-none d-sm-flex"> Eliminar Deporte </span>
                    <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Eliminar Deporte </b>
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="eliminarDeporte = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title> 
                <v-card-text class="text-subtitle-1">
                    <b class="error--text"> ¿Está seguro que desea eliminar este deporte? </b>
                    <br>
                    <span class="error--text"> Al eliminar el deporte se eliminarán todos sus datos del sistema, como sus categorías y posiciones. </span>
                    <br>
                    <b> Nombre del deporte: </b> {{deporte.nombre}}
                </v-card-text>
                <v-card-actions> 
                    <v-spacer></v-spacer>
                    <v-btn color="grey darken-1" dark @click="eliminarDeporte = false">
                        <v-icon left> mdi-close </v-icon>
                        Cerrar
                    </v-btn>
                    <v-btn color="error" @click="eliminar_Deporte()">
                        <v-icon left> mdi-delete </v-icon>
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Display de mensaje -->
        <v-snackbar v-model="display.show" timeout="3000" shaped top> 
            <v-icon v-if="display.type == 'success'" left color="secondary"> mdi-check-circle </v-icon>
            <v-icon v-else left color="red"> mdi-alert-circle </v-icon>
            <span :class="display.type == 'success' ? 'secondary--text':'red--text'">{{display.mensaje}}</span> 
            <template v-slot:action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="display.show = false">
                Cerrar
                </v-btn>
            </template>
        </v-snackbar>

        <v-btn color="primary" @click="abrir_crear()" large right fixed bottom fab dark><v-icon>mdi-plus</v-icon></v-btn>
        <v-row class="d-flex d-sm-none mt-12"> </v-row>
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
            colores: ['indigo lighten-2', 'purple lighten-2', 'pink lighten-2', 'teal lighten-2', 'cyan lighten-2',
                      'green lighten-2', 'orange lighten-2', 'blue-grey lighten-2'],
            cargando: true,
            deportesCheck: true,
            crearDeporte: false,
            editarDeporte: false,
            configDeporte: false,
            eliminarDeporte: false,
            display: {show: false},
            deporteCrear: {},
            deporte: {},
            nombre: null,
            deportes: [],
            reglasNombre: [
                v => !!v || 'Este campo es obligatorio',
                v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
            ],
        }
    },
    methods: {
        async obtenerDeportes () {
            this.deportesCheck = true;
            axios.get(`${server_url}/deportes/`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200){
                    this.deportes = res.data.deportes;
                }
                if (this.deportes.length == 0) {
                    this.deportesCheck = false;
                }
            })
        },
        abrir_crear () {
            this.deporteCrear = {};
            this.crearDeporte = true;
        },
        async crear_Deporte () {
            if(this.$refs.crearForm.validate()) { 
                try {
                    await axios
                    .post(`${server_url}/deportes`, this.deporteCrear, { withCredentials: true })
                    .then((res) => {
                        if (res.data.codigo === 200) {
                            this.display = {
                                show: true, 
                                mensaje: res.data.texto,
                                type: 'success',
                            }
                        } else {
                            this.display = {
                                show: true, 
                                mensaje: res.data.texto,
                                type: 'error',
                            }
                        }
                        this.$refs.crearForm.reset();
                        this.crearDeporte = false;
                    })
                } catch (error) {
                    this.crearDeporte = false;
                    this.display = {
                        show: true, 
                        mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
                        type: 'error',
                    }
                }
            }
            this.obtenerDeportes();
        },
        async ver_Deporte (id, evento) {
            try {
                axios.get(`${server_url}/deportes/${id}`, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200){
                        this.deporte = res.data.deporte;
                        this.nombre = this.deporte.nombre;
                    }
                })
            } catch (error) {
                console.log(error);
            }
            if (evento == 'eliminar') {
                this.eliminarDeporte = true;
            } else if (evento == 'editar') {
                this.editarDeporte = true;
            } else {
                if (!this.editarDeporte && !this.eliminarDeporte) {
                    this.configDeporte = true;
                }
            }
        },
        async editar_Deporte () {
            if (this.deporte.nombre != this.nombre) {
                if(this.$refs.editForm.validate()) { 
                    try {
                        await axios
                        .put(`${server_url}/deportes/${this.deporte.id}`, this.deporte, { withCredentials: true })
                        .then((res) => {
                            if (res.data.codigo === 200) {
                                this.display = {
                                    show: true, 
                                    mensaje: res.data.texto,
                                    type: 'success',
                                }
                            } else {
                                this.display = {
                                    show: true, 
                                    mensaje: res.data.texto,
                                    type: 'error',
                                }
                            }
                            this.$refs.editForm.reset();
                            this.editarDeporte = false;
                        })
                    } catch (error) {
                        this.editarDeporte = false;
                        this.display = {
                            show: true, 
                            mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
                            type: 'error',
                        }
                    }
                }
                this.obtenerDeportes();
            }
            this.editarDeporte = false;
        },
        async eliminar_Deporte () {
            this.deportesCheck = true;
            try {
                await axios.delete(`${server_url}/deportes/${this.deporte.id}`, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200){
                        const index = this.deportes.findIndex(d => d.id == this.deporte.id);
                        this.deportes.splice(index, 1);
                        if (this.deportes.length == 0) {
                            this.deportesCheck = false;
                        }
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto,
                            type: 'success',
                        }
                    } else {
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto,
                            type: 'error',
                        }
                    }
                    this.eliminarDeporte = false;
                })
            } catch (error) {
                this.eliminarDeporte = false;
                this.display = {
                    show: true, 
                    mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
                    type: 'error',
                }
            }
        }
    },
    // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
    // en caso positivo, se redirecciona a Deportes, sino se muestra el componente para iniciar sesión
    async mounted() {
        try {
            await axios
            .get(`${server_url}/auth/admin`, { withCredentials: true })
            .then((res) => {
                if (res.status === 200) {
                    //en caso de que se pasen todas las validaciones se llaman a todos los deportes del sistema
                    this.obtenerDeportes();
                    this.cargando = false;
                }
            })
            .catch((error) => {
                if (error.response.status === 428) this.$router.push('/init');
                else this.$router.push('/login');
            }); 
        } catch (error) {
            this.deportesCheck = false;
            this.cargando = false;
            this.display = {
                show: true, 
                mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
                type: 'error',
            }
        }
    }
}
</script>

<style>
</style>