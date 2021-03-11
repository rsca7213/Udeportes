<template>
  <div>
    <!-- Snackbar -->
    <v-btn text small class="blue--text text--lighten-1" @click="display = !display"> ¿Olvidaste tu contraseña? </v-btn>
    <v-snackbar v-model="display" timeout="4000" shaped transition="scroll-y-reverse-transition" multi-line> 
      ¡Para recuperar tus datos de inicio de sesión, ponte en contacto con el administrador del sitio!
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="display = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'OlvidarDialog',
  data() {
    return {
      display: false
    }
  }
}
</script>

<style>

</style>