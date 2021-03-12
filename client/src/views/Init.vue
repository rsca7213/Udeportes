<template>
    <Cargador v-if="cargando" />
    <div v-else>
        <div class="init">
            <v-alert text v-model="alert.show" :type="alert.type" dismissible>{{alert.message}}</v-alert>
            <v-container>
                <v-row justify="center" style="height: 100vh">
                    <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
                        <v-img src="../assets/logo-text.png" contain max-width="240" class="mb-3"> </v-img>
                        <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
                            <v-card-title class="grey--text text--darken-2"> Datos del Administrador </v-card-title>
                            <v-form ref="form" @submit.prevent="submit()" class="px-4">
                                <v-text-field name="cedula" clear-icon="mdi-close" clearable counter="8" label="Cédula de Identidad *"
                                type="text" :rules="reglasCedula" validate-on-blur v-model="inputs.cedula" prepend-icon="mdi-card-account-details"> </v-text-field>
                                <v-text-field name="primer_nombre" clear-icon="mdi-close" clearable counter="50" label="Primer Nombre *"
                                type="text" :rules="reglasNombre" validate-on-blur v-model="inputs.primer_nombre" prepend-icon="mdi-account-edit-outline"> </v-text-field>
                                <v-text-field name="segundo_nombre" clear-icon="mdi-close" clearable counter="50" label="Segundo Nombre" 
                                type="text" :rules="reglasSegundoNombre" validate-on-blur v-model="inputs.segundo_nombre" prepend-icon="mdi-account-edit-outline"> </v-text-field>
                                <v-text-field name="primer_apellido" clear-icon="mdi-close" clearable counter="50" label="Primer Apellido *" 
                                type="text" :rules="reglasNombre" validate-on-blur v-model="inputs.primer_apellido" prepend-icon="mdi-account-edit-outline"> </v-text-field>
                                <v-text-field name="segundo_apellido" clear-icon="mdi-close" clearable counter="50" label="Segundo Apellido *" 
                                type="text" :rules="reglasNombre" validate-on-blur v-model="inputs.segundo_apellido" prepend-icon="mdi-account-edit-outline"> </v-text-field>
                                <v-text-field name="correo" clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico *" 
                                prepend-icon="mdi-email" type="text" :rules="reglasCorreo" 
                                validate-on-blur v-model="inputs.correo"> </v-text-field>
                                <v-text-field name="clave" clear-icon="mdi-close" clearable counter="128" label="Contraseña *" 
                                prepend-icon="mdi-key" type="password" :rules="reglasClave" class="mt-4" 
                                validate-on-blur v-model="inputs.clave"> </v-text-field>
                                <v-card-actions class="mt-4">
                                    <v-container>
                                        <v-row no-gutters>
                                            <v-col cols="12" sm="5">
                                                <v-card-text class="red--text pt-2 d-none d-sm-block">Requerido(*)</v-card-text>
                                                <v-card-text class="red--text pt-2 text-right d-block d-sm-none">Requerido(*)</v-card-text>
                                            </v-col>    
                                            <v-col cols="12" sm="7" class="text-right">
                                                <v-btn color="primary" class="mx-1" :loading="formCargando" type="submit"> 
                                                    <v-icon left> mdi-login </v-icon>
                                                    crear administrador 
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card-actions>
                            </v-form>
                        </v-card>
                    </v-col>
                </v-row> 
                <v-dialog v-model="dialog" max-width="400">
                    <v-card>
                        <v-card-title>
                            ¡Bienvenido a Udeportes!
                            <v-spacer />
                            <v-btn icon @click="dialog=false"><v-icon> mdi-close </v-icon></v-btn>
                        </v-card-title>
                        <v-img src="../assets/init/config_init.png" alt="configurar" max-height="64" contain> </v-img>
                        <v-card-text class="text-justify mt-2">
                            Para comenzar a utilizar el sistema y todas sus funcionalidades es necesario
                            crear una cuenta de usuario administrador. Esta cuenta tendra acceso a todas
                            las funcionalidades sin ningun tipo de restricción. 
                            <v-divider class="my-2"> </v-divider>
                            Una vez tenga la cuenta de administrador, podrá crear las cuentas de los 
                            entrenadores dentro del sistema.
                            <v-divider class="mt-2"> </v-divider>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="secondary" @click="dialog=false">
                                <v-icon left> mdi-check-circle </v-icon>
                                Entendido
                            </v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-container>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Cargador from '../components/Cargador';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
    

    name: 'Init',

    components: {
        Cargador
    },

    data() {
        return {
            alert:{show: false, message: ''},
            cargando: true,
            formCargando: false,
            dialog: true,
            inputs: {
                cedula: '',
                primer_nombre: '',
                segundo_nombre: '',
                primer_apellido: '',
                segundo_apellido: '',
                correo: '',
                clave: ''
            },
            mensajeError: '',
            reglasCedula: [
                v => !!v || 'Este campo es obligatorio',
                v => v && v.length <= 8 || 'La cédula de identidad no debe ser mayor a 8 caracteres',
            ],
            reglasNombre: [
                v => !!v || 'Este campo es obligatorio',
                v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
            ],
            reglasSegundoNombre: [
                v => v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
            ],
            reglasCorreo: [
                v => !!v || 'Debe ingresar un correo electrónico',
                v => v && v.length >= 8 || 'El correo electrónico debe contener como minimo 8 caracteres',
                v => v && v.length <= 256 || 'El correo electrónico debe contener como máximo 256 caracteres',
                v => v && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) || 'Debe ser un correo electrónico valido.'
            ],
            reglasClave: [
                v => !!v || 'Debe ingresar una contraseña',
                v => v && v.length >= 8 || 'La contraseña debe contener como mínimo 8 caracteres.',
                v => v && v.length <= 256 || 'La contraseña debe contener como máximo 256 caracteres.'
            ]
        }
    },
    methods: {
        async submit() {
             if(this.$refs.form.validate()) { 
                this.mensajeError = '';
                this.formCargando = true;
                await axios
                .post(`${server_url}/init/`, this.inputs, { withCredentials: true })
                .then((res) => {
                    if (res.status === 200) this.$router.push('/');
                })
                .catch((error) => {
                    this.formCargando = false;
                    this.$refs.form.reset();
                    this.mensajeError = error.response.status === 400
                    ? '¡Oops! Parece que este sistema ya tiene un usuario administrador. Por favor intenta iniciar sesión'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
            }
        }
    },
    
    async mounted() {
        await axios
            .get(`${server_url}/auth/login`, { withCredentials: true })
            .then((res) => {
                console.log(res.status);
                if (res.status === 200) this.$router.push('/');
            })
            .catch((error) => {
                console.log(error.response.status);
                if (error.response.status === 428) this.cargando = false;
                else this.$router.push('/login');
            });
         
    }

}
</script>
