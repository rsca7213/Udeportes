<template>

  <div class="login">
    <v-container>
      <v-row align="center" style="height: 100vh">
        <v-col> </v-col>
        <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
          <v-img src="../assets/logo-text.png" contain max-width="240" class="mb-3"> </v-img>
          <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> Inicio de Sesión </v-card-title>
            <v-form ref="form" class="px-4">
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" :rules="reglasEmail" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="128" label="Contraseña" 
              prepend-icon="mdi-key" type="password" :rules="reglasClave" class="mt-4" validate-on-blur> </v-text-field>
            </v-form>
            <v-card-actions class="mt-4">
              <v-spacer> </v-spacer>
              <OlvidarDialog class="d-none d-sm-flex"/>
              <v-btn color="primary" @click="submit()" class="mx-1"> 
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
  </div>
</template>

<script>
import OlvidarDialog from '../components/login/OlvidarDialog';

export default {
  name: 'Login',
  components: {
    OlvidarDialog
  },
  data() {
    return {
      email: '',
      clave: '',
      reglasEmail: [
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
  methods: {
    submit() {
      if(this.$refs.form.validate()) {
        this.$refs.form.reset();
      }
    }
  }
}
</script>

<style scoped>
</style>