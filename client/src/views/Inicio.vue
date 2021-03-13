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
    
  },

  // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
  // en caso negativo se redirecciona a Login, en caso positivo se muestra el componente de Inicio
  async mounted() {
    await axios
      .get(`${server_url}/auth/login`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) this.cargando = false;
      })
      .catch((error) => {
        try {
          if (error.response.status === 428) this.$router.push('/init');
          else this.$router.push('/login');
        }
        catch {
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
  }
}
</script>
