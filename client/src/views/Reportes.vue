<template>
  <div>
    <v-container class="px-0 px-sm-6" v-if="!cargando">
      <v-row>
        <v-col cols="12"> 
          <MenuReportes/>
        </v-col>
      </v-row>
    </v-container>
    <Cargador v-else/>
  </div>
</template>

<script>
import Cargador from '../components/Cargador';
import MenuReportes from '../components/Reportes/MenuReportes';
import axios from 'axios';
const server_url = sessionStorage.getItem('SERVER_URL');
export default {
  name: 'Reportes',
  components: {
    Cargador,
    MenuReportes
  },
  data() {
    return {
      // se muestra el componente Cargador si cargando es true
      cargando: true,
    }
  },
  async mounted() {
    //se verifica que el usuario haya iniciado sesión previamente para poder acceder a la ruta
    await axios
    .get(`${server_url}/auth/login`, { withCredentials: true })
    .then((res) => {
      // si el usuario es admin y ha iniciado sesión
      if (res.status === 200) {
        this.cargando = false;
      }
    })
    .catch((err) => {
      try {
        // no hay config inicial
        if (err.response.status === 428) this.$router.push('/init');
        // usuario no ha iniciado sesión
        else if (err.response.status === 401) this.$router.push('/login');
        // si el usuario ha iniciado sesión pero no es admin
        else {
          this.$router.push('/');
        }
      }
      catch { 
        console.warn('Warning: No response status was found, is the server running? ');
      }
    })
  }
}
</script>

<style>

</style>