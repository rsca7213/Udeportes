<template>
  <div class="inicio">
    <Cargador v-if="cargando" /> 
    <v-container v-else> 
      <v-row>
        <v-col>
          <v-card class="px-2 py-4" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
              Panel de Control
            </v-card-title>
            <v-card-subtitle>
              ¡Bienvenido a Udeportes! Para comenzar, selecciona alguna opción.
            </v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col cols="12" xl="4" md="6" v-for="(item, index) in 
                admin ? items : items.filter(i => !i.admin)" :key="index" class="px-1 px-sm-3">
                  <v-card elevation="2" shaped class="primary py-2" @click="$router.push(item.ruta)">
                    <div class="d-flex flex-no-wrap justify-space-between">
                      <v-card-title class="align-center white--text text-button">
                        {{ item.nombre }}
                      </v-card-title>
                      <v-avatar class="ma-3" size="60">
                        <v-img :src="item.imagen"></v-img>
                      </v-avatar>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" class="mr-1" @click="$router.push('/perfil')">
                <v-icon left> mdi-account-edit </v-icon>
                <span class="d-none d-sm-inline-block mr-1">Editar</span> Perfil
              </v-btn>
              <v-btn color="error" class="mr-2" @click="logout()">
                <v-icon left> mdi-logout </v-icon>
                Cerrar Se<span class="show-xxs-inline">...</span><span class="hide-xxs">sión</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>

import Cargador from '../components/Cargador';
import axios from 'axios';
import imagenEntrenadores from '../assets/inicio/entrenadores.png';
import imagenDeportes from '../assets/inicio/deportes.png';
import imagenAtletas from '../assets/inicio/atletas.png';
import imagenCompetencias from '../assets/inicio/competencias.png';
import imagenEntrenamientos from '../assets/inicio/entrenamientos.png';
import imagenReportes from '../assets/inicio/reportes.png';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {

  name: 'Inicio',

  components: {
    Cargador
  },

  data() {
    return {
      cargando: true,
      admin: false,
      items: [
        {
          nombre: 'Deportes',
          ruta: '/deportes',
          imagen: imagenDeportes,
          admin: true
        },
        {
          nombre: 'Entrenadores',
          ruta: '/entrenadores',
          imagen: imagenEntrenadores,
          admin: true
        },
        {
          nombre: 'Atletas',
          ruta: '/atletas',
          imagen: imagenAtletas,
          admin: true
        },
        {
          nombre: 'Competencias',
          ruta: '/competencias',
          imagen: imagenCompetencias,
          admin: false
        },
        {
          nombre: 'Entrenamientos',
          ruta: '/entrenamientos',
          imagen: imagenEntrenamientos,
          admin: false
        },
        {
          nombre: 'Reportes',
          ruta: '/reportes',
          imagen: imagenReportes,
          admin: false
        }
      ]
    }
  },

  methods: {
    // accion de logout
    // request respectivo al servidor
    async logout() {
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
  },

  // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
  // en caso negativo se redirecciona a Login, en caso positivo se muestra el componente de Inicio
  async mounted() {
    await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) { 
          this.admin = true;
          this.cargando = false;
        }
      })
      .catch((error) => {
        try {
          if (error.response.status === 428) this.$router.push('/init');
          else if (error.response.status === 403) {
            this.admin = false;
            this.cargando = false;
          }
          else this.$router.push('/login');
        }
        catch {
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
  }
}
</script>
