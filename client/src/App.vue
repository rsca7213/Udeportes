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

export default {
  name: 'App',

  components: {
    Navbar
  },

  data() {
    return {
      // rutas que deberian tener sidebar (agregar rutas aqui)
      rutasConNav: [ 'Inicio' ]
    }
  }
}
</script>

<style>

</style>
