<template>
    <v-container v-if="!cargando">
        <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Posiciones de {{deporte.nombre}}
                <v-spacer class="d-none d-sm-flex"></v-spacer>
                <v-btn text class="blue--text text--lighten-1 px-1 px-sm-3" @click="$router.push('/deportes')">
                    <v-icon left> mdi-arrow-left </v-icon>
                    Regresar a deportes
                </v-btn>
            </v-card-title>
            <v-row justify="center" class="my-2" v-if="this.posicionesCheck">
                <v-col cols="12" xl="6" lg="7" md="9" sm="11">
                    <v-list outlined>
                        <template v-for="(posicion, index) in posiciones">
                            <v-list-item :key="posicion.id">
                                <v-list-item-icon class="d-none d-sm-flex">
                                    <v-icon color="indigo"> mdi-source-pull </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title v-text="posicion.nombre"> </v-list-item-title>
                                </v-list-item-content>
                                <div>
                                    <v-icon color="primary" @click="ver_Posicion(posicion.id, 'editar')"> mdi-pencil </v-icon>
                                    <v-icon color="error" @click="ver_Posicion(posicion.id, 'eliminar')"> mdi-delete </v-icon>
                                </div>
                            </v-list-item>
                            <v-divider v-if="index < posiciones.length -1" :key="index + 'a'"></v-divider>
                        </template>
                    </v-list>
                </v-col>
            </v-row>
            <v-card-subtitle class="grey--text text--darken-2" v-else>
                No se encontraron posiciones en {{deporte.nombre}}.
            </v-card-subtitle>

            <!-- Dialog para crear un posicion -->
            <v-dialog  v-model="crearPosicion" max-width="450px">
                <v-card>
                    <v-card-title>
                        <span class="d-none d-sm-flex"> Crear Posición </span>
                        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Crear Posición </b>
                        <v-spacer />
                        <v-btn icon @click="crearPosicion=false"><v-icon> mdi-close </v-icon></v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="crearForm" @submit.prevent="crear_Posicion()" class="ma-3">
                            <v-text-field clear-icon="mdi-close" clearable label="Nombre de la posición" counter="50"
                            type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur v-model="posicionCrear.nombre"></v-text-field>
                            <v-btn block class="mt-3" color="secondary" type="submit">
                                <v-icon left> mdi-check-circle </v-icon>
                                crear
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-dialog>
            
            <!-- Dialog para editar un posicion -->
            <v-dialog  v-model="editarPosicion" max-width="450px">
                <v-card>
                    <v-card-title>
                        <span class="d-none d-sm-flex"> Editar Nombre </span>
                        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Editar Nombre </b>
                        <v-spacer />
                        <v-btn icon @click="editarPosicion = false"><v-icon> mdi-close </v-icon></v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="editForm" @submit.prevent="editar_Posicion()" class="ma-3">
                            <v-text-field clear-icon="mdi-close" clearable label="Nombre de la posición" counter="50"
                            type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur v-model="posicion.nombre"></v-text-field>
                            <v-btn block class="mt-3" color="secondary" type="submit">
                                <v-icon left> mdi-check-circle </v-icon>
                                guardar
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <!-- Dialog para eliminar un posicion -->
            <v-dialog v-model="eliminarPosicion" class="text-center" max-width="600">
                <v-card rounded="md">
                    <v-card-title>
                        <span class="d-none d-sm-flex"> Eliminar Posición </span>
                        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Eliminar Posición </b>
                        <v-spacer> </v-spacer>
                        <v-btn icon @click="eliminarPosicion = false"><v-icon> mdi-close </v-icon></v-btn>
                    </v-card-title> 
                    <v-card-text class="text-subtitle-1">
                        <b class="error--text"> ¿Está seguro que desea eliminar esta posición? </b>
                        <br>
                        <span class="error--text"> Al eliminar la posición se perderán todos los datos de sus estadísticas. </span>
                        <br>
                        <b> Nombre de la Posición: </b> {{posicion.nombre}}
                        <br>
                        <b> Nombre del Deporte: </b> {{deporte.nombre}}
                    </v-card-text>
                    <v-card-actions> 
                        <v-spacer></v-spacer>
                        <v-btn color="grey darken-1" dark @click="eliminarPosicion = false">
                            <v-icon left> mdi-close </v-icon>
                            Cerrar
                        </v-btn>
                        <v-btn color="error" @click="eliminar_Posicion()">
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
        </v-card>  
        <v-row class="d-flex d-sm-none mt-12"> </v-row>
    </v-container>
    <Cargador v-else/>
</template>

<script>
import axios from 'axios';
import Cargador from '../components/Cargador';

const server_url = sessionStorage.getItem('SERVER_URL');

export default {

  name: 'Posiciones',

  components: {
    Cargador,
  },

  data() {
        return {
            colores: ['indigo lighten-2', 'purple lighten-2', 'pink lighten-2', 'teal lighten-2', 'cyan lighten-2',
                      'green lighten-2', 'orange lighten-2', 'blue-grey lighten-2'],
            cargando: true,
            posicionesCheck: true,
            crearPosicion: false,
            editarPosicion: false,
            eliminarPosicion: false,
            display: {show: false},
            posicionCrear: {},
            posicion: {},
            deporte: {},
            posiciones: [],
            reglasNombre: [
                v => !!v || 'Este campo es obligatorio',
                v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
            ],
        }
    },
    methods: {
        async obtenerPosiciones () {
            this.posicionesCheck= true;
            axios.get(`${server_url}/posiciones/${this.$route.params.id_deporte}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200){
                    this.posiciones = res.data.posiciones;
                }
                if (this.posiciones.length == 0) {
                    this.posicionesCheck= false;
                }
            })
        },
        abrir_crear () {
            this.posicionCrear = {};
            this.crearPosicion = true;
        },
        async crear_Posicion () {
            if(this.$refs.crearForm.validate()) { 
                try {
                    await axios
                    .post(`${server_url}/posiciones/${this.$route.params.id_deporte}`, this.posicionCrear, { withCredentials: true })
                    .then((res) => {
                        if (res.data.codigo === 200) {
                            this.posiciones.push(res.data.posicion);
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
                        this.crearPosicion = false;
                    })
                } catch (error) {
                    this.crearPosicion = false;
                    this.display = {
                        show: true, 
                        mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
                        type: 'error',
                    }
                }
            }
            this.obtenerPosiciones();
        },
        async ver_Posicion (id, evento) {
            try {
                axios.get(`${server_url}/posiciones/${this.$route.params.id_deporte}/${id}`, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200){
                        this.posicion = res.data.posicion;
                    }
                })
            } catch (error) {
                console.log(error);
            }
            if (evento == 'eliminar') {
                this.eliminarPosicion = true;
            } else {
                this.editarPosicion = true;
            } 
        },
        async editar_Posicion () {
            if(this.$refs.editForm.validate()) { 
                try {
                    await axios
                    .put(`${server_url}/posiciones/${this.$route.params.id_deporte}/${this.posicion.id}`, this.posicion, { withCredentials: true })
                    .then((res) => {
                        if (res.data.codigo === 200) {
                            const index = this.posiciones.findIndex(p => p.id == this.posicion.id);
                            this.posiciones[index] = res.data.posicion;
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
                        this.editarPosicion = false;
                    })
                } catch (error) {
                    this.editarPosicion = false;
                    this.display = {
                        show: true, 
                        mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
                        type: 'error',
                    }
                }
            }
            this.obtenerPosiciones();
        },
        async eliminar_Posicion () {
            try {
                await axios.delete(`${server_url}/posiciones/${this.$route.params.id_deporte}/${this.posicion.id}`, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200){
                        const index = this.posiciones.findIndex(p => p.id == this.posicion.id);
                        this.posiciones.splice(index, 1);
                        if (this.posiciones.length == 0) {
                            this.posicionesCheck= false;
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
                    this.eliminarPosicion = false;
                })
            } catch (error) {
                this.eliminarPosicion = false;
                this.display = {
                    show: true, 
                    mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
                    type: 'error',
                }
            }
        },
    },
    // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
    // en caso positivo, se redirecciona a Posiciones, sino se muestra el componente para iniciar sesión
    async mounted() {
        try {
            await axios
            .get(`${server_url}/auth/admin`, { withCredentials: true })
            .then((res) => {
                if (res.status === 200) {
                    //en caso de que se pasen todas las validaciones se llaman a todas las posiciones del deporte
                    this.obtenerPosiciones();
                    //se busca la información del deporte
                    axios.get(`${server_url}/deportes/${this.$route.params.id_deporte}`, { withCredentials: true })
                    .then((res) => {
                        if (res.data.codigo === 200){
                            this.deporte = res.data.deporte;
                        }
                    })
                    this.cargando = false;
                }
            })
            .catch((error) => {
                if (error.response.status === 428) this.$router.push('/init');
                else this.$router.push('/login');
            });
        } catch (error) {
            this.posicionesCheck = false;
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