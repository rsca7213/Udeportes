<template>
  <div class="atletas">
    <Cargador v-if="cargando" /> 
    <v-container v-else> 
      <v-row>
        <v-col cols="12"> 
          <TablaAtletas />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Cargador from '../components/Cargador';
import TablaAtletas from '../components/Atletas/TablaAtletas';
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'Atletas',

  components: {
    Cargador,
    TablaAtletas
  },

  data() {
    return {
      cargando: true,
      usuarioAdmin: false
    }
  },

  // En mounted verificamos login, admin y config inicial
  async mounted() {
    await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
      .then((res) => {
        // si el usuario es admin y ha iniciado sesión
        if (res.status === 200) {
          this.usuarioAdmin = true;
          this.cargando = false;
        }
      })
      .catch((err) => {
        // no hay config inicial
        if (err.response.status === 428) this.$router.push('/init');
        // usuario no ha iniciado sesión
        else if (err.response.status === 401) this.$router.push('/login');
        // si el usuario ha iniciado sesión pero no es admin
        else {
          this.usuarioAdmin = false;
          this.cargando = false;
        }
      })
  }
}
</script>

<style>

</style>