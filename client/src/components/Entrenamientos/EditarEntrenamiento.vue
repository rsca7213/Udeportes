<template>
  <v-dialog v-model="dialog" class="text-center" max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-icon dense color="primary" dark v-bind="attrs" v-on="on"> mdi-pencil </v-icon>
    </template>
    <v-card rounded="md">
      <v-card-title>
        <span class="d-none d-sm-flex"> Editar Entrenamiento </span>
        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Editar Entrenamiento </b>
        <v-spacer> </v-spacer>
        <v-btn icon @click="dialog = false"><v-icon> mdi-close </v-icon></v-btn>
      </v-card-title>
      <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
        <span>Los campos que contienen un 
          <span class="red--text">"*"</span> 
        son obligatorios</span> 
      </v-card-subtitle>
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
          <v-row>
            <v-col cols="12" class="px-4">
              <v-menu ref="menuFechas" v-model="menuFechas" :close-on-content-click="false" 
              transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field name="fecha" v-model="inputs.fecha" 
                   clear-icon="mdi-close" clearable counter="10" label="Fecha *"
                  prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" 
                  :error-messages="validacion.fecha"></v-text-field>
                </template>
                <v-date-picker color="primary" ref="picker" v-model="fechaSelec" no-title
                scrollable @change="guardar" locale="es-419"></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-4">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Nombre" 
              prepend-icon="mdi-square-edit-outline" type="text" :rules="reglas.nombre" 
              validate-on-blur v-model.trim="inputs.nombre" name="nombre"> </v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-card-actions> 
        <v-spacer></v-spacer>
        <v-btn color="red" dark @click="clearDialog()">
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
</template> 

<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'EditarEntrenamiento',

  props: ['id_deporte', 'id_categoria', 'entrenamiento'],

  data() {
    return {
      dialog: false,
      mensajeError: '',
      datosValidos: false,
      menuFechas: false,
      formEnviando: false,
      fechaSelec : '',
      inputs: {
        nombre: this.entrenamiento.nombre,
        fecha: this.entrenamiento.fecha
      },
      reglas: {
        nombre: [
          v => v === null || v.length === 0 || v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ]
      },
      // Validacion manual (fecha y valores dependientes de otros)
      validacion: {
        fecha: ''
      },
    }
  },

  watch: {
    dialog () {
      if (!this.dialog) this.clearDialog();
    }, 

    // Watcher que cambia el formato de la fecha 'yyyy-mm-dd' a dd/mm/yyyy'
    fechaSelec () {
      this.inputs.fecha = this.formatoFecha(this.fechaSelec)
    },

    // Validacion manual de la fecha
    "inputs.fecha": function () {
      if (this.dialog)
        this.validacion.fecha = this.inputs.fecha ? '' : 'Este campo es obligatorio';
    },
  },

  methods: {
    // Guarda la fecha del selector de fechas de la UI
    guardar (fecha) {
      this.$refs.menuFechas.save(fecha);
    },

    // Cambia el formato de la fecha de 'yyyy-mm-dd' a 'dd/mm/yyyy'
    formatoFecha (fecha) {
      if (!fecha) return null
      const [year, mes, dia] = fecha.split('-')
      return `${dia}/${mes}/${year}`
    },

    /*
      Funcion que hace la solicitud PUT al servidor para editar un entrenamiento,
      en caso de 200 (exito) se cierra el dialog, se reinicia todo y se despliega un snackbar de exito,
      en caso de error (bien sea 400 unicidad o 500 error generico) se coloca el mensaje de error en la UI
    */
    async sendData () {
      // maneja el atributo loading del boton
      this.formEnviando = true;
      // request POST
      await axios.put(`${server_url}/entrenamientos/${this.id_deporte}/${this.id_categoria}/${this.entrenamiento.id}`, 
      this.inputs, { withCredentials: true })
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
      Cierra el dialog, reinicia las validaciones, 
      en caso de que success sea true, se despliega un snackbar indicando exito
      y se realiza un emit para indicarle a la tabla de entrenamientos que se actualice
    */
    clearDialog(success = false) {
      this.dialog = false;
      this.mensajeError = '';
      this.validacion = {
        fecha: ''
      };
      this.inputs = {
        nombre: this.entrenamiento.nombre,
        fecha: this.entrenamiento.fecha
      };
      if (success) {
        this.snackbar = true;
        this.$emit('entrenamientoEditado');
      }
    },

    // Realiza validacion manual y automatica del form. en caso de datos validos se procede a hacer la solicitud POST
    // en caso de error de validacion se despliegan los respectivos mensajes y no se realiza solicitud al servidor
    submit() {
      this.mensajeError = '';
      this.validacion.fecha = this.inputs.fecha ? '' : 'Este campo es obligatorio';
      this.$refs.form.validate();
      if(!Object.values(this.validacion).filter(item => item != '').length && this.$refs.form.validate()) {
        this.sendData();
      }
    }
  }
}
</script>

<style>

</style>