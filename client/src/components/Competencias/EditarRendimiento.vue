<template>
<span>
  <v-dialog v-model="dialog" class="text-center" max-width="320">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" small text class="px-1" v-bind="attrs" v-on="on"> 
        <v-icon left> mdi-pencil </v-icon>
        Editar Rendimiento
      </v-btn>
    </template>
    <v-card rounded="md">
      <v-card-title>
        <span class="d-none d-sm-flex"> Editar Rendimiento </span>
        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Editar Rendimiento </b>
        <v-spacer> </v-spacer>
        <v-btn icon @click="dialog = false"><v-icon> mdi-close </v-icon></v-btn>
      </v-card-title>
      <v-card-subtitle> Los campos deben ser números </v-card-subtitle>
      <v-form ref="form" v-model="datosValidos">
        <v-container class="px-md-4">
          <v-row v-if="mensajeError">
            <v-col class="py-0 my-0"> 
              <v-alert text color="error" dense>
                <v-icon color="error"> mdi-alert </v-icon>
                <span v-text="mensajeError" class="ml-1"> </span>
              </v-alert>
            </v-col>
          </v-row>
          <v-row v-for="estadistica in estadisticasData" :key="estadistica.id">
            <v-col class="px-6 py-0">
              <v-text-field clear-icon="mdi-close" clearable :label="estadistica.nombre" 
              prepend-icon="mdi-poll-box" validate-on-blur v-model.number="estadistica.valor" name="estadistica"
              :messages="
                `${estadistica.min ? 'Min: ' + estadistica.min : ''} 
                 ${estadistica.min ? estadistica.max ?  '─' : '' : '' }
                 ${estadistica.max ? 'Max: ' + estadistica.max : ''}`
              "
              :rules="
              [
                v => v === null || typeof(v) === typeof(1) || 'Debe ser un numero',
                v => estadistica.min === null || v === null || v >= estadistica.min || `Debe ser mayor o igual a ${estadistica.min}`,
                v => estadistica.max === null || v === null || v <= estadistica.max || `Debe ser menor o igual a ${estadistica.max}`
              ]
              "> </v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-card-actions> 
        <v-spacer></v-spacer>
        <v-btn color="red" dark @click="dialog = false">
          <v-icon left> mdi-close </v-icon>
          Cerrar
        </v-btn>
        <v-btn color="secondary" @click="submit()" :disabled="!datosValidos" :loading="formEnviando">
          <v-icon left> mdi-check-circle </v-icon>
          Editar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</span>
</template>

<script>

import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'EditarRendimiento',

  props: ['estadisticas', 'id', 'id_deporte', 'id_categoria', 'cedula', 'id_posicion'],

  data() {
    return {
      // UI handlers
      dialog: false,
      mensajeError: '',
      datosValidos: false,
      formEnviando: false,

      // Estadisticas de la posicion del atleta (se igualan al prop estadisticas)
      estadisticasData: [],
    }
  },

  methods: {

    /*
      Funcion que actualiza el rendimiento del atleta con dicha posicion en la competencia
    */
    async submit() {
      this.mensajeError = '';
      this.formEnviando = true;
      await axios.post(`${server_url}/competencias/${this.id_deporte}/${this.id_categoria}/
      ${this.id}/rendimientos/${this.cedula}/${this.id_posicion}`, { data: this.estadisticasData.map(e => new Object({ id: e.id, valor: e.valor })) },
      { withCredentials: true } )
      .then((res) => {
        // En caso de exito
        if (res.status === 200) {
          this.dialog = false;
          this.$emit('rendimientoEditado');
          
        }
      })
      .catch((err) => {
        try {
          // errores
          this.mensajeError = err.response.data;
        }
        catch (error) {
          // Servidor no disponible
          this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
      this.formEnviando = false;
    }
  },

  // Cada vez que se abre el dialog se reinicia la data del componente
  watch: {
    dialog() {
      this.formEnviando = false;
      this.mensajeError = '';
      this.estadisticasData = [];
      this.estadisticas.forEach(e => this.estadisticasData.push({ 
        id: e.id, 
        nombre: e.nombre,
        max: e.maximo ? parseInt(e.maximo) : null, 
        min: e.minimo ? parseInt(e.minimo) : null, 
        valor: e.valor ? parseInt(e.valor) : null
      }));
    }
  }


}
</script>

<style>

</style>