<template>

  <div class="login">
    <v-container v-if="!cargando">
      <v-row align="center" style="height: 100vh">
        <v-col> </v-col>
        <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
          <v-img src="../assets/logo-text.png" contain max-width="240" class="mb-3"> </v-img>
          <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> Inicio de Sesión </v-card-title>
            <v-row v-if="mensajeError" class="pl-4">
              <v-col class="error--text"> 
                <v-icon color="error"> mdi-alert </v-icon>
                <span v-text="mensajeError" class="ml-1"> </span>
              </v-col>
            </v-row>
            <v-form ref="form" class="px-4">
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" :rules="reglasCorreo" 
              validate-on-blur v-model="inputs.correo"> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="128" label="Contraseña" 
              prepend-icon="mdi-key" type="password" :rules="reglasClave" class="mt-4" 
              validate-on-blur v-model="inputs.clave"> </v-text-field>
            </v-form>
            <v-card-actions class="mt-4">
              <v-spacer> </v-spacer>
              <OlvidarDialog class="d-none d-sm-flex"/>
              <v-btn color="primary" :disabled="!credencialesValidas" @click="submit()" class="mx-1" :loading="formCargando" type="submit"> 
                <v-icon left> mdi-login </v-icon>
                Iniciar Sesión 
              </v-btn>
            </v-card-actions>
          </v-card>
          <OlvidarDialog class="d-flex d-sm-none mt-4 float-right" />
        </v-col>
        <v-col> </v-col>
      </v-row>
    </v-container>
    <Cargador v-else/>
  </div>
</template>

<script>
import OlvidarDialog from '../components/login/OlvidarDialog';
import Cargador from '../components/Cargador';
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {

  name: 'Login',

  components: {
    OlvidarDialog,
    Cargador
  },

  data() {
    return {
      cargando: true,
      formCargando: false,
      credencialesValidas: false,
      inputs: {
        correo: '',
        clave: ''
      },
      mensajeError: '',
      reglasCorreo: [
        v => v && v.length >= 8 || 'El correo electrónico debe contener como minimo 8 caracteres',
        v => v && v.length <= 256 || 'El correo electrónico debe contener como máximo 256 caracteres',
        v => v && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) || 'Debe ser un correo electrónico valido.'
      ],
      reglasClave: [
        v => v && v.length >= 8 || 'La contraseña debe contener como mínimo 8 caracteres.',
        v => v && v.length <= 256 || 'La contraseña debe contener como máximo 256 caracteres.'
      ]
    }
  },
  watch: {
    //Cuando cambia el email se llama esta funcion automaticamente
    emailYclave: function () {

      //variable de control para saber si se cumplen las reglas de validacion
      let revisar = false;
      
      //se revisa si se cumplen las reglas del email
      this.reglasCorreo.forEach(emailValidator => {
        if(emailValidator(this.inputs.correo) !== true){
          this.credencialesValidas = false;
          revisar = true;
        }        
      });

      //se revisa si se cumplen las reglas de la clave
      this.reglasClave.forEach(claveValidator => {
        if(claveValidator(this.inputs.clave) !== true){
          this.credencialesValidas = false;
          revisar = true;
        }        
      });

      if(revisar === false){
        this.credencialesValidas = true;
      }
    },
  },

  computed: {
    emailYclave() {
      return `${this.inputs.correo}|${this.inputs.clave}`;
    },
  },

  methods: {
    async submit() {
      if(this.$refs.form.validate()) {
        this.mensajeError = '';
        this.formCargando = true;
        await axios
          .post(`${server_url}/auth/login`, this.inputs, { withCredentials: true })
          .then((res) => {
            if (res.status === 200) this.$router.push('/');
          })
          .catch((error) => {
            this.formCargando = false;
            this.$refs.form.reset();
            this.mensajeError = error.response.status === 500
              ? 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'
              : 'Correo electrónico o contraseña incorrecta.';
          });
      }
    }
  },

  async mounted() {
    await axios
      .get(`${server_url}/auth/login`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) this.$router.push('/');
      })
      .catch(() => {});
      this.cargando = false;
  }

}
</script>

<style scoped>
</style>