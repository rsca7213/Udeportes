<template>
  <div class="inicio">
    <Cargador v-if="cargando" />
    <div v-else>
      <span> You made it </span>
      <v-btn color="secondary" @click="logout()"> Cerrar sesión </v-btn>
    </div>
  </div>
</template>

<script>

import Cargador from '../components/Cargador';
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {

  name: 'Inicio',

  components: {
    Cargador
  },

  data() {
    return {
      cargando: true
    }
  },

  methods: {
    async logout() {
      await axios
      .post(`${server_url}/auth/logout`, {}, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) this.$router.push('/login');
      })
      .catch(() => {});
    }
  },

  async mounted() {
    await axios
      .get(`${server_url}/auth/login`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) this.cargando = false;
      })
      .catch(() => {
        this.$router.push('/login');
      });
  }
}
</script>
