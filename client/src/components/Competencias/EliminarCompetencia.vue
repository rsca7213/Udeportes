<template>
  <v-dialog v-model="dialog" class="text-center" max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <v-icon dense color="error" dark v-bind="attrs" v-on="on"> mdi-delete </v-icon>
    </template>
    <v-card rounded="md">
      <v-card-title>
        <span class="d-none d-sm-flex"> Eliminar Competencia </span>
        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Eliminar Competencia </b>
        <v-spacer> </v-spacer>
        <v-btn icon @click="dialog = false"><v-icon> mdi-close </v-icon></v-btn>
      </v-card-title> 
      <v-alert text color="error" dense v-if="mensajeError">
        <v-icon color="error"> mdi-alert </v-icon>
        <span v-text="mensajeError" class="ml-1"> </span>
      </v-alert>
      <v-card-text class="text-subtitle-1">
        <b class="error--text"> ¿Está seguro que desea eliminar la competencia? </b>
        <br>
        <span class="error--text"> Al eliminar la competencia, se eliminarán todos los registros de asistencia y estadisticas de esta. </span>
        <br>
        <b> Nombre: </b> <span v-text="competencia.nombre"> </span>
      </v-card-text>
      <v-card-actions> 
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" dark @click="clearDialog()">
          <v-icon left> mdi-close </v-icon>
          Cerrar
        </v-btn>
        <v-btn color="error" @click="submit()" :loading="formEnviando">
          <v-icon left> mdi-delete </v-icon>
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';

const server_url = sessionStorage.getItem('SERVER_URL');

export default {
  name: 'EliminarCompetencia',

  props: ['id_deporte', 'id_categoria', 'competencia'],

  data() {
    return {
      // UI handlers
      dialog: false,
      formEnviando: false,
      mensajeError: ''
    }
  },

  methods: {

    /*
      Funcion que hace la solicitud DELETE al servidor para eliminar la competencia,
      en caso de 200 (exito) se cierra el dialog y se despliega un snackbar de exito,
      en caso de error (bien sea 400 no existe o 500 error generico) se coloca el mensaje de error en la UI
    */
    async sendData () {
      // maneja el atributo loading del boton
      this.formEnviando = true;
      // request DELETE
      await axios.delete(`${server_url}/competencias/${this.id_deporte}/${this.id_categoria}/${this.competencia.id}`, 
      { withCredentials: true })
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

    /* 
      Cierra el dialog, 
      en caso de que success sea true, se despliega un snackbar indicando exito
      y se realiza un emit para indicarle a la tabla de competencias que se actualice
    */
    clearDialog(success = false) {
      this.dialog = false;
      this.mensajeError = '';
      if (success) {
        this.snackbar = true;
        this.$emit('competenciaEliminada');
      }
    },

    // Submit del delete
    submit() {
      this.mensajeError = '';
      this.sendData();
    }
 
  }
}
</script>

<style>

</style>