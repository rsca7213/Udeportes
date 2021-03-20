<template>
<span>
  <v-dialog v-model="dialog" class="text-center" max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-icon dense color="primary" v-bind="attrs" v-on="on"> mdi-pencil </v-icon>
    </template>
    <v-card rounded="md">
      <v-card-title>
        <span class="d-none d-sm-flex"> Editar Competencia </span>
        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Editar Competencia </b>
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
            <v-col class="px-3">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Nombre *" 
              prepend-icon="mdi-square-edit-outline" type="text" :rules="reglas.nombre" 
              validate-on-blur v-model.trim="inputs.nombre" name="nombre"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12">
              <v-menu ref="menuFechasInicio" v-model="menuFechasInicio" :close-on-content-click="false" 
              transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field name="fecha_inicio" v-model="inputs.fecha_inicio" 
                   clear-icon="mdi-close" clearable counter="10" label="Fecha Inicio *"
                  prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" 
                  :error-messages="validacion.fecha_inicio"></v-text-field>
                </template>
                <v-date-picker color="primary" ref="picker" v-model="fechaInicioSelec" no-title
                scrollable @change="guardarInicio" locale="es-419"></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12">
              <v-menu ref="menuFechasFin" v-model="menuFechasFin" :close-on-content-click="false" 
              transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field name="fecha_fin" v-model="inputs.fecha_fin" 
                   clear-icon="mdi-close" clearable counter="10" label="Fecha Fin"
                  prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" 
                  :error-messages="validacion.fecha_fin"></v-text-field>
                </template>
                <v-date-picker color="primary" ref="picker" v-model="fechaFinSelec" no-title
                scrollable @change="guardarFin" locale="es-419"></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12">
              <v-select v-model="inputs.estatus" label="Estatus *" prepend-icon="mdi-clock"
              clear-icon="mdi-close" name="educacion" clearable :rules="reglas.estatus"
              :items="[{text: 'No iniciada', value: 'n'}, {text: 'En curso', value: 'e'}, 
              {text: 'Derrota', value: 'd'}, {text: 'Victoria', value: 'v'}]">
              </v-select>
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
</span>
</template> 

<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'EditarCompetencia',

  props: ['id_deporte', 'id_categoria', 'competencia'],

  data() {
    return {
      // UI handlers
      dialog: false,
      mensajeError: '',
      datosValidos: false,
      menuFechasInicio: false,
      menuFechasFin: false,
      formEnviando: false,
      fechaInicioSelec: '',
      fechaFinSelec: '',
      // inputs
      inputs: {
        nombre: this.competencia.nombre,
        fecha_inicio: this.competencia.fecha_inicio,
        fecha_fin: this.competencia.fecha_fin,
        estatus: this.competencia.estatus
      },
      reglas: {
        nombre: [
          v => !!v || 'Este campo es obligatorio.',
          v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ],
        estatus: [
          v => v && ['n', 'e', 'd', 'v'].includes(v) || 'Este campo es obligatorio'
        ]
      },
      // Validacion manual (fecha y valores dependientes de otros)
      validacion: {
        fecha_inicio: '',
        fecha_fin: ''
      },
    }
  },

  watch: {
    dialog () {
      if (!this.dialog) this.clearDialog();
    }, 

    // Watcher que cambia el formato de la fecha 'yyyy-mm-dd' a dd/mm/yyyy'
    fechaInicioSelec () {
      this.inputs.fecha_inicio = this.formatoFecha(this.fechaInicioSelec)
    },

    // Watcher que cambia el formato de la fecha 'yyyy-mm-dd' a dd/mm/yyyy'
    fechaFinSelec () {
      this.inputs.fecha_fin = this.formatoFecha(this.fechaFinSelec)
    },

    // Validacion manual de la fecha
    "inputs.fecha_inicio": function () {
      if (this.dialog)
        this.validacion.fecha_inicio = this.inputs.fecha_inicio ? '' : 'Este campo es obligatorio';
    }
  },

  methods: {
    // Guarda la fecha del selector de fechas de la UI
    guardarInicio (fecha) {
      this.$refs.menuFechasInicio.save(fecha);
    },

    // Guarda la fecha del selector de fechas de la UI
    guardarFin (fecha) {
      this.$refs.menuFechasFin.save(fecha);
    },

    // Cambia el formato de la fecha de 'yyyy-mm-dd' a 'dd/mm/yyyy'
    formatoFecha (fecha) {
      if (!fecha) return null
      const [year, mes, dia] = fecha.split('-')
      return `${dia}/${mes}/${year}`
    },

    /*
      Funcion que hace la solicitud PUT al servidor para actualizar la competencia,
      en caso de 200 (exito) se cierra el dialog, se reinicia todo y se despliega un snackbar de exito,
      en caso de error se coloca el mensaje de error en la UI
    */
    async sendData () {
      // maneja el atributo loading del boton
      this.formEnviando = true;
      // request POST
      await axios.put(`${server_url}/competencias/${this.id_deporte}/${this.id_categoria}/${this.competencia.id}`, 
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
      y se realiza un emit para indicarle a la tabla de competencias que se actualice
    */
    clearDialog(success = false) {
      this.dialog = false;
      this.mensajeError = '';
      this.validacion = {
        fecha_inicio: '',
        fecha_fin: ''
      };
      this.inputs = {
        nombre: this.competencia.nombre,
        fecha_inicio: this.competencia.fecha_inicio,
        fecha_fin: this.competencia.fecha_fin,
        estatus: this.competencia.estatus
      };
      this.$refs.form.resetValidation();
      if (success) {
        this.$emit('competenciaEditada');
      }
    },

    // Realiza validacion manual y automatica del form. en caso de datos validos se procede a hacer la solicitud POST
    // en caso de error de validacion se despliegan los respectivos mensajes y no se realiza solicitud al servidor
    submit() {
      this.mensajeError = '';
      this.validacion.fecha_inicio = this.inputs.fecha_inicio ? '' : 'Este campo es obligatorio';
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