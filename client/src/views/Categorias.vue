<template>
  <div>
    <v-container v-if="!cargando">
      <v-row>
        <v-col cols="12"> 
          <TablaCategorias />
        </v-col>
      </v-row>
    </v-container>
    <Cargador v-else/>
  </div>
</template>

<script>
import TablaCategorias from '../components/Categorias/TablaCategorias';
import Cargador from '../components/Cargador';
import axios from 'axios';
const server_url = sessionStorage.getItem('SERVER_URL');
export default {
  name: 'Categorias',
  components: {
    Cargador,
    TablaCategorias
  },
  data() {
    return {
      // se muestra el componente Cargador si cargando es true
      cargando: true,
    }
  },
  async mounted() {
    try {
      await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
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
          this.cargando = false;
          this.display = {
              show: true, 
              mensaje: 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.',
              type: 'error',
          }
        }
      })
    } catch (error) {
      this.cargando = false;
    }
  }
}
</script>

<style >

</style>