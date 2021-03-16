<template>
  <nav v-if="usuario.nombre">

    <v-navigation-drawer v-model="menu" app color="primary">
      <v-container>
        <v-row class="pt-2 pl-2 pb-2">
          <v-img src="../assets/logo-blanco.png" alt="logo" max-width="40"> </v-img>
          <span class="white--text text-button ml-3 mt-1"> Menú Principal </span>
        </v-row>
        <v-divider class="mt-5 white--text white"> </v-divider>
        <v-list nav dark>
          <v-list-item v-for="item in usuario.admin ? itemsSidebar : itemsSidebar.filter(item => !item.admin)" 
          :key="item.ruta" router :to="item.ruta">
            <v-list-item-icon> <v-icon v-text="item.icono"> </v-icon> </v-list-item-icon>
            <v-list-item-title> {{ item.nombre }} </v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider class="white--text white"> </v-divider>
        <v-list nav dark>
          <v-list-group no-action prepend-icon="mdi-account-circle" color="white">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title v-if="!usuario.nombre"> Usuario </v-list-item-title>
                <v-list-item-title v-else v-text="`${usuario.nombre} ${usuario.apellido}`" class="text-capitalize"> </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item v-for="item in itemsPerfil" :key="item.nombre" class="primary--text pl-8" @click="accionPerfil(item)">
              <v-list-item-icon> <v-icon v-text="item.icono"> </v-icon> </v-list-item-icon>
              <v-list-item-title> {{ item.nombre }} </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-container>
    </v-navigation-drawer>

    <v-app-bar app class="primary" dark> 
      <v-app-bar-nav-icon @click.stop="menu = !menu" class="white--text"></v-app-bar-nav-icon>
      <v-app-bar-title class="text-capitalize white--text titulo">
        <span class="titulo"> Udeportes </span>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y transition="slide-y-transition" rounded="lg">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" depressed outlined dark> 
            <v-icon left> mdi-account-circle </v-icon>
            <span v-if="!usuario.nombre" class="d-none d-sm-block text-capitalize"> Usuario </span>
            <span v-else v-text="`${usuario.nombre} ${usuario.apellido}`" class="text-capitalize d-none d-sm-block"> </span>
            <v-icon> mdi-chevron-down </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="item in itemsPerfil" :key="item.nombre" class="primary--text" @click="accionPerfil(item)">
            <v-list-item-icon> <v-icon v-text="item.icono"> </v-icon> </v-list-item-icon>
            <v-list-item-title> {{ item.nombre }} </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  
  </nav>
</template>

<script>

import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {

  name: 'Navbar',

  data() {
    return {
      // abrir o cerrar sidebar
      menu: false,
      // ruta actual
      ruta: window.location.pathname,
      // datos del usuario actualmente iniciado sesión
      usuario: {
        nombre: null,
        apellido: null,
        admin: false
      },
      // items del menu desplegable de la derecha
      itemsPerfil: [
        {
          nombre: 'Editar Perfil',
          ruta: '/perfil',
          icono: 'mdi-account-edit',
          funcion: null,
        },
        {
          nombre: 'Cerrar Sesión',
          ruta: null,
          icono: 'mdi-logout',
          funcion: 'logout'
        }
      ],
      // items del sidebar
      itemsSidebar: [
        {
          nombre: 'Inicio',
          ruta: '/',
          icono: 'mdi-home',
          admin: false
        },
        {
          nombre: 'Deportes',
          ruta: '/deportes',
          icono: 'mdi-basketball',
          admin: true,
        },
        {
          nombre: 'Entrenadores',
          ruta: '/entrenadores',
          icono: 'mdi-whistle',
          admin: true
        },
        {
          nombre: 'Atletas',
          ruta: '/atletas',
          icono: 'mdi-weight-lifter',
          admin: true
        },
        {
          nombre: 'Competencias',
          ruta: '/d',
          icono: 'mdi-trophy',
          admin: false
        },
        {
          nombre: 'Entrenamientos',
          ruta: '/e',
          icono: 'mdi-clipboard-text',
          admin: false
        },
        {
          nombre: 'Reportes',
          ruta: '/f',
          icono: 'mdi-pdf-box',
          admin: false
        },

      ]
    }
  },

  methods: {
    // accion de la barra desplegable de la derecha, si la accion es cerrar sesión se hace su
    // request respectivo al servidor, si es editar perfil se enruta a la vista respectiva
    async accionPerfil(item) {
      if(item.funcion === 'logout') {
        await axios
        .post(`${server_url}/auth/logout`, {}, { withCredentials: true })
        .then((res) => {
          if (res.status === 200) {
            this.usuario = { nombre: null, apellido: null, admin: null }
            this.$router.push('/login');
          }
        })
        .catch(() => {});
      }
      else {
        this.$router.push(item.ruta);
      }
    }
  },
  // en mounted se revisa si el usuario esta iniciado y es admin, utilizando la ruta GET /auth/admin
  // y luego de haber comprobado estos datos, se solicitan sus datos de nombre y apellido para rellenar
  // el sidebar
  async mounted() {
      if (await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
      .then((res) => {
        // si el usuario es admin y ha iniciado sesión
        if (res.status === 200) {
          this.usuario.admin = true;
          return true;
        }
      })
      .catch((err) => {
        // si el usuario ha iniciado sesión pero no es admin
        try {
          if (err.response.status === 403)  {
            this.usuario.admin = false;
            return true;
          }
        }
        catch { 
          console.warn('Warning: No response status was found, is the server running? ');
          return false; 
        }
      }))
        await axios
        .get(`${server_url}/perfil?data=nombre`, { withCredentials: true })
        .then((res) => {
          if (res.status === 200) 
            this.usuario = {
              nombre: res.data.primer_nombre,
              apellido: res.data.primer_apellido,
              admin: this.usuario.admin
            };
        })
        .catch(() => { });
    }
  }
</script>

<style>
  .titulo, .v-app-bar-title__placeholder, .v-app-bar-title__content {
    text-overflow: clip !important;
  }
</style>