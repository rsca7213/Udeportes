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
      rutasConNav: [ 
        'Inicio', 
        'Entrenadores', 
        'Atletas', 
        'Deportes', 
        'Posiciones', 
        'Estadisticas',
        'Categorias', 
        'Inscripciones', 
        'DetallesAtleta', 
        'Perfil', 
        'Entrenamientos', 
        'Reportes',
        'Competencias',
        'PanelCompetencia',
        'HistorialAcademicoAtleta',
        'HistorialDeportivoAtleta'
      ]
    }
  }
}
</script>

<style>
    @media only screen and (min-width: 340px) {
    .hide-xxs {
      display: inline-block;
    }

    .show-xxs-inline {
      display: none;
    }
  }

  @media only screen and (max-width: 340px) {
    .show-xxs-inline {
      display: inline-block;
    }

    .hide-xxs {
      display: none;
    }
  }
</style>
