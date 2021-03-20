<template>
  <v-dialog v-model="dialog" class="text-center" max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on">
        <v-icon left> mdi-clipboard-list </v-icon>
        Gestionar Asistencias
      </v-btn>
    </template>
    <v-card rounded="md">
      <v-card-title>
        <span class="d-none d-sm-flex"> Gestionar Asistencia </span>
        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Gestionar Asistencia </b>
        <v-spacer> </v-spacer>
        <v-btn icon @click="dialog = false"><v-icon> mdi-close </v-icon></v-btn>
      </v-card-title>
      <v-card-subtitle class="grey--text text--darken-2 subtitle-1 align-center d-none d-sm-flex"> 
        <v-icon dense color="success"> mdi-check-circle-outline </v-icon>
        <span class="success--text ml-1"> Asistió </span>
        <v-icon dense class="ml-2" color="error"> mdi-close-circle-outline </v-icon>
        <span class="error--text ml-1"> Faltó </span>
        <v-icon dense class="ml-2" color="indigo"> mdi-help-circle-outline </v-icon>
        <span class="indigo--text ml-1"> Sin determinar </span>
      </v-card-subtitle>
      <v-card-text>
        <span class="d-block d-sm-none mb-2">
          <span>
            <v-icon dense color="success"> mdi-check-circle-outline </v-icon>
            <span class="success--text ml-1"> Asistió </span>
          </span>
          <span>
            <v-icon dense class="ml-2" color="error"> mdi-close-circle-outline </v-icon>
            <span class="error--text ml-1"> Faltó </span>
          </span>
          <span>
            <v-icon dense class="ml-2" color="indigo"> mdi-help-circle-outline </v-icon>
            <span class="indigo--text ml-1"> Sin determinar </span>
          </span>
        </span>
        <v-row v-if="mensajeError">
          <v-col class="py-0 my-0"> 
            <v-alert text color="error" dense>
              <v-icon color="error"> mdi-alert </v-icon>
              <span v-text="mensajeError" class="ml-1"> </span>
            </v-alert>
          </v-col>
        </v-row>
        <v-list outlined class="rounded-lg" v-if="items.length">
          <v-list-item two-line v-for="(item, index) in items" :key="index.id"
          :class="items.length - 1 === index ? '' : 'list-item'">
            <v-list-item-icon class="d-none d-sm-flex">
              <v-icon color="indigo"> mdi-account </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.nombre_completo" class="d-none d-sm-inline"> </v-list-item-title>
              <v-list-item-title v-text="item.nombre_completo" class="text-body-2 d-inline d-sm-none"> </v-list-item-title>
              <v-list-item-subtitle> 
                <b class="mr-1 hide-xxs"> Nro. Cedula: </b>
                <span v-text="item.cedula"> </span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <div>
              <v-icon :color="inputs[index].asistencia === true ? 'success' : 'grey darken-1'" size="28"
              @click="inputs[index].asistencia = true"> 
                mdi-check-circle-outline 
              </v-icon>
              <v-icon :color="inputs[index].asistencia === false ? 'error' : 'grey darken-1'" size="28"
              @click="inputs[index].asistencia = false">
                mdi-close-circle-outline 
              </v-icon>
              <v-icon :color="inputs[index].asistencia === null ? 'indigo' : 'grey darken-1'" size="28"
              @click="inputs[index].asistencia = null">
                mdi-help-circle-outline 
              </v-icon>
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions> 
        <v-spacer></v-spacer>
        <v-btn color="red" dark @click="clearDialog()">
          <v-icon left> mdi-close </v-icon>
          Cerrar
        </v-btn>
        <v-btn color="secondary" @click="sendData()" :loading="formEnviando">
          <v-icon left> mdi-check-circle </v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
 
<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'AsistenciaCompetencia',
  props: ['id_deporte', 'id_categoria', 'id'],

  data() {
    return {
      dialog: false,
      mensajeError: false,
      formEnviando: false,
      cargando: true,
      items: [],
      inputs: []
    }
  },

  watch: {
    dialog () {
      if (!this.dialog) this.clearDialog();
    }
  },

  methods: {
    /*
      Funcion que calcula el ratio de asistencias e inasistencias a partir del arreglo de items
    */
    calcularRatios() {
      return {
        asistencias: 
          (this.items.filter(item => item.asistencia === true).length / 
          this.items.filter(item => typeof(item.asistencia) === typeof(true) ).length) * 100 || 0,
        inasistencias: (this.items.filter(item => item.asistencia === false).length / 
          this.items.filter(item => typeof(item.asistencia) === typeof(true) ).length) * 100 || 0,
      }
    },

    /*
      Funcion que hace la solicitud POST al servidor para registrar asistencias,
      en caso de 200 (exito) se cierra el dialog, se reinicia todo y se despliega un snackbar de exito,
      en caso de error (bien sea 400 unicidad o 500 error generico) se coloca el mensaje de error en la UI
    */
    async sendData () {
      // maneja el atributo loading del boton
      this.formEnviando = true;
      // request POST
      await axios.post(`${server_url}/competencias/${this.id_deporte}/${this.id_categoria}/${this.id}/participaciones`, 
      { data: this.inputs }, { withCredentials: true })
        .then((res) => {
          // Exito 200
          if (res.status === 200) this.clearDialog(true);
        })
        .catch((err) => {
          try {
            // Error 400 por unicidad o 500 generico
            if (err.response.status) this.mensajeError = err.response.data;
          }
          catch {
            // Servidor no disponible
            this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
            console.warn('Warning: No response status was found, is the server running? ');
          }
        });
      // maneja el atributo loading del boton
      this.formEnviando = false;
    },

    async getData () {
      // Colocamos el loader
      this.items = [];
      this.cargando = true;
      // Request GET
      await axios.get(`${server_url}/competencias/${this.id_deporte}/${this.id_categoria}/${this.id}/participaciones`,
      { withCredentials: true } )
        .then((res) => {
          // En caso de exito
          if (res.status === 200) {
            // Asignamos la data obtenida a la variable items
            this.items = res.data;
            this.inputs = res.data;
            this.inputs = this.inputs.map(item => { return { cedula: item.cedula, asistencia: item.asistencia } });
          }
        })
        .catch((err) => {
          try {
            // errores
            if (err.response.status) this.mensajeError = err.response.data;
          }
          catch (error) {
            // Servidor no disponible
            this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
            console.warn('Warning: No response status was found, is the server running? ');
          }
        });
      // Quitamos el loader
      this.cargando = false;
    },

    /* 
      Cierra el dialog, reinicia las validaciones, 
      en caso de que success sea true, se despliega un snackbar indicando exito
      y se realiza un emit para indicarle a las graficas del panel que se actualice
    */
    clearDialog(success = false) {
      this.dialog = false;
      this.mensajeError = '';
      if (success) {
        setTimeout(async () => {
          await this.getData();
          this.$emit('updateAsistencias', this.calcularRatios());
        }, 170);
      }
      else {
        this.inputs = this.items.map(item => { return { cedula: item.cedula, asistencia: item.asistencia } });
      }
    },
  },

  async mounted() {
    await this.getData();
    this.$emit('updateAsistencias', this.calcularRatios());
  }
}
</script>

<style>
  .list-item {
    border-bottom: solid 1px lightgrey;
  }
</style>