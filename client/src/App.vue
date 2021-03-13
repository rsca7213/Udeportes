<template>
  <v-app id="app"> 
    <Navbar v-if="this.rutasConNav.includes(this.$route.name)" />
    <v-main class="grey lighten-4">
      <router-view> </router-view>
    </v-main>
  </v-app>
</template>

<script>

import Navbar from './components/Navbar';

sessionStorage.setItem('SERVER_PORT', '5000/api');
sessionStorage.setItem('SERVER_URL', 'http://localhost');

export default {
  name: 'App',

  components: {
    Navbar
  },

  data() {
    return {
      // rutas que deberian tener sidebar (agregar rutas aqui)
      rutasConNav: [ 'Inicio', 'Entrenadores', 'Atletas' ]
    }
  }
}
</script>

<style>

</style>
