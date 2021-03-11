<template>
  <div class="inicio">
    <Cargador v-if="cargando" />
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
    // solicitud POST que le pide al servidor que destruya el token, en caso de respuesta 200
    // se redirecciona a Login
    async logout() {
      await axios
      .post(`${server_url}/auth/logout`, {}, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) this.$router.push('/login');
      })
      .catch(() => {});
    }
  },

  // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
  // en caso negativo se redirecciona a Login, en caso positivo se muestra el componente de Inicio
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
