<template>
    <div class="init">
        <v-alert text v-model="alert.show" :type="alert.type" dismissible>{{alert.message}}</v-alert>
        <v-container>
            <v-row justify="center" style="height: 100vh">
                <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
                    <v-img src="../assets/logo-text.png" contain max-width="240" class="mb-3"> </v-img>
                    <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
                        <v-card-title class="grey--text text--darken-2"> Datos del Administrador </v-card-title>
                        <v-form ref="form" @submit.prevent="submit()" class="px-4">
                            <v-text-field clear-icon="mdi-close" clearable counter="8" label="Cédula de Identidad"
                            type="text" :rules="reglasCedula" validate-on-blur v-model="inputs.cedula"> </v-text-field>
                            <v-text-field clear-icon="mdi-close" clearable counter="50" label="Primer Nombre"
                            type="text" :rules="reglasNombre" validate-on-blur v-model="inputs.primer_nombre"> </v-text-field>
                            <v-text-field clear-icon="mdi-close" clearable counter="50" label="Segundo Nombre" 
                            type="text" :rules="reglasSegundoNombre" validate-on-blur v-model="inputs.segundo_nombre"> </v-text-field>
                            <v-text-field clear-icon="mdi-close" clearable counter="50" label="Primer Apellido" 
                            type="text" :rules="reglasNombre" validate-on-blur v-model="inputs.primer_apellido"> </v-text-field>
                            <v-text-field clear-icon="mdi-close" clearable counter="50" label="Segundo Apellido" 
                            type="text" :rules="reglasNombre" validate-on-blur v-model="inputs.segundo_apellido"> </v-text-field>
                            <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
                            prepend-icon="mdi-email" type="text" :rules="reglasCorreo" 
                            validate-on-blur v-model="inputs.correo"> </v-text-field>
                            <v-text-field clear-icon="mdi-close" clearable counter="128" label="Contraseña" 
                            prepend-icon="mdi-key" type="password" :rules="reglasClave" class="mt-4" 
                            validate-on-blur v-model="inputs.clave"> </v-text-field>
                            <v-card-actions class="mt-4">
                                <v-spacer> </v-spacer>
                                <v-btn color="primary" class="mx-1" :loading="formCargando" type="submit"> 
                                    <v-icon left> mdi-login </v-icon>
                                    crear administrador 
                                </v-btn>
                            </v-card-actions>
                        </v-form>
                    </v-card>
                </v-col>
            </v-row> 
        </v-container>
    </div>
</template>

<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
    

    name: 'Init',

    data() {
        return {
            alert:{show: false, message: ''},
            cargando: true,
            formCargando: false,
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
                    this.mensajeError = error.response.status === 500
                    ? 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'
                    : '';
                });
            }
        }
    }

}
</script>
