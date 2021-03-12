<template>
  <div>
    <v-container v-if="!cargando">
      <h1 class="display-1 text-center mt-2">Gestión de Entrenadores</h1>
    <div v-if="!registrar" >
      <div v-for="usuario in usuarios" :key="usuario.nombre">
        <p>usuario.nombre</p>
      </div>
    </div>
    <registro v-if = "registrar"/>
    <v-btn @click="registrar=!registrar">Registrar</v-btn>
    </v-container>
    <cargador v-else/>
  </div>
</template>

<script>
import registro from '../components/RegistroUsuarios/registro';
import cargador from '../components/Cargador';
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'Entrenadores',
  components: {
    registro,
    cargador
  },
  data() {
    return {
      //variable encargada de mostrar/ocultar el formulario para insertar usuarios
      registrar: false,
      // se muestra el componente Cargador si cargando es true
      cargando: true,
      usuarios:[{nombre: 'Pablo', rol: 'Administrador'}, {nombre: 'Pablo2', rol: 'Administrador'}, {nombre: 'Pablo3', rol: 'Administrador'}]
    }
  },
  methods: {
    
  },
  // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
  // en caso positivo, se redirecciona a Entrenadores, sino se muestra el componente para iniciar sesión
  async mounted() {
    await axios
      .get(`${server_url}/auth/login`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) this.cargando = false;
      })
      .catch((error) => {
        if (error.response.status === 428) this.$router.push('/init');
        else this.$router.push('/login');
      });
  }
}
</script>

<style scoped>
</style>