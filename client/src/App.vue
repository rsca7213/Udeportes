<template>
  <v-app id="app"> 
    <Navbar :ruta="this.$router.currentRoute" />
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
  }
}
</script>

<style>

</style>
