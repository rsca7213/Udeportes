<template>
<span>
  <v-dialog v-model="dialog" class="text-center" max-width="900">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on"> 
        <v-icon left> mdi-plus-circle </v-icon>
        Registrar atleta
      </v-btn>
    </template>
    <v-card rounded="md">
      <v-card-title>
        <span class="d-none d-sm-flex"> Registrar Atleta </span>
        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Registrar Atleta </b>
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
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" :rules="reglas.correo" 
              validate-on-blur v-model.trim="inputs.correo" name="correo"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="8" label="Cédula de Identidad *"
              prepend-icon="mdi-card-account-details" type="text" :rules="reglas.cedula"
              validate-on-blur v-model.trim="inputs.cedula" name="cedula"> </v-text-field>
            </v-col>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="13" label="Teléfono"
              prepend-icon="mdi-cellphone" type="text" :rules="reglas.telefono"
              validate-on-blur v-model.trim="inputs.telefono" name="telefono"
              placeholder="+584141574855"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Primer Nombre *"
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.nombre_apellido"
              validate-on-blur v-model.trim="inputs.primer_nombre" name="primer_nombre"> </v-text-field>
            </v-col>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Segundo Nombre" 
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.segundo_nombre" 
              validate-on-blur v-model.trim="inputs.segundo_nombre" name="segundo_nombre"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Primer Apellido *"
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.nombre_apellido"
              validate-on-blur v-model.trim="inputs.primer_apellido" name="primer_apellido"> </v-text-field>
            </v-col>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Segundo Apellido *" 
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.nombre_apellido" 
              validate-on-blur v-model.trim="inputs.segundo_apellido" name="segundo_apellido"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12" sm="6">
              <v-radio-group v-model="inputs.genero" row prepend-icon="mdi-human-male-female" 
              name="genero" mandatory>
                <v-radio label="Masculino" value="m"> </v-radio>
                <v-radio label="Femenino" value="f"> </v-radio>
              </v-radio-group>
            </v-col>
            <v-col class="px-3" cols="12" sm="6">
              <v-menu ref="menuFechas" v-model="menuFechas" :close-on-content-click="false" 
              transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field name="fecha_nacimiento" v-model="inputs.fecha_nacimiento" 
                   clear-icon="mdi-close" clearable counter="10" label="Fecha de Nacimiento *"
                  prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" 
                  :error-messages="validacion.fecha_nacimiento"></v-text-field>
                </template>
                <v-date-picker color="primary" ref="picker" v-model="fechaSelec" no-title
                scrollable @change="guardar" locale="es-419"></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12" sm="6">
              <v-select v-model="inputs.id_educacion" label="Educación" prepend-icon="mdi-school"
              clear-icon="mdi-close" name="educacion" clearable
              :loading="educacionCargando" :items="itemsEducacion" :disabled="educacionCargando">
              </v-select>
            </v-col>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable 
              :label="`${inputs.id_educacion ? itemsEducacion.filter(item => item.value == inputs.id_educacion)[0].etapa : 'Etapa'}`" 
              :disabled="!inputs.id_educacion"
              prepend-icon="mdi-numeric-1-box" type="text" :rules="reglas.numero_etapa"
              validate-on-blur v-model.number.trim="inputs.numero_etapa" name="numero_etapa"
              :error-messages="validacion.numero_etapa"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable label="Nombre de Beca"
              prepend-icon="mdi-sale" type="text" :rules="reglas.nombre_beca"
              validate-on-blur v-model.trim="inputs.nombre_beca" name="nombre_beca"> </v-text-field>
            </v-col>
            <v-col class="px-3" cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable label="Porcentaje (%)" :disabled="!inputs.nombre_beca"
              prepend-icon="mdi-percent" type="text" :rules="reglas.porcentaje_beca"
              validate-on-blur v-model.number.trim="inputs.porcentaje_beca" name="porcentaje_beca"
              :error-messages="validacion.porcentaje_beca"> </v-text-field>
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
          Registrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar" timeout="3000" shaped top>
      <v-icon left color="secondary"> mdi-check-circle </v-icon>
      <span class="success--text"> ¡El atleta fue registrado con éxito! </span>
      <template v-slot:action="{ attrs }">
        <v-btn color=¨white¨ text v-bind="attrs" @click="snackbar = false"> Cerrar </v-btn>
      </template>
  </v-snackbar>
</span>
</template>

<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'RegistrarAtletas',

  data() {
    return {
      // UI handlers
      dialog: false,
      menuFechas: false,
      educacionCargando: true,
      snackbar: false,
      formEnviando: false,
      datosValidos: false,
      mensajeError: '',
      fechaSelec: '',

      // Data para el select de educaciones, rellenado en mounted()
      itemsEducacion: [],

      // Form inputs
      inputs: {
        cedula: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        genero: 'm',
        fecha_nacimiento: '',
        id_educacion: 0,
        correo: '',
        telefono: '',
        nombre_beca: '',
        porcentaje_beca: null,
        numero_etapa: null
      },

      // Validacion manual (fecha y valores dependientes de otros)
      validacion: {
        porcentaje_beca: '',
        numero_etapa: '',
        fecha_nacimiento: ''
      },

      // Validacion automatica
      reglas: {
        cedula: [
          v => !!v || 'Este campo es obligatorio',
          v => v && v.length <= 8 || 'La cédula de identidad no debe ser mayor a 8 caracteres',
          v => v && (/^\d{0,9}$/.test(v)) || 'Debe ser una cédula válida',
        ],
        nombre_apellido: [
          v => !!v || 'Este campo es obligatorio',
          v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ],
        segundo_nombre: [
          v => v === null || v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ],
        correo: [
          v => v === null || v.length === 0 || v.length >= 8 || 'El correo electrónico debe contener como minimo 8 caracteres',
          v => v === null || v.length <= 256 || 'El correo electrónico debe contener como máximo 256 caracteres',
          v => v === null || v.length === 0 || (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) || 'Debe ser un correo electrónico valido'
        ],
        telefono: [
          v => v === null || v.length === 0 || (v && v.length == 13) || 'El teléfono debe tener 13 caracteres',
          v => v === null || v.length === 0 || (v && (/^[+]\d{1,12}$/.test(v))) || 'Debe ser un teléfono válido'
        ],
        nombre_beca: [
          v => v === null || v.length === 0 || v.length <= 200 || 'Este campo debe contener como máximo 200 caracteres',
        ],
        porcentaje_beca: [
          v => v === null || typeof(v) === 'number' || 'Debe ser un número',
          v => v === null || v >= 0 || 'El porcentaje debe ser mayor o igual a 0',
          v => v === null || v <= 100 || 'El porcentaje debe ser menor o igual a 100'
        ],
        numero_etapa: [
          v => v === null || typeof(v) === 'number' || 'Debe ser un número',
          v => v === null || v > 0 || 'Este campo debe ser mayor o igual a 1',
          v => v === null || v < 100 || 'Este campo debe ser menor o igual a 99'
        ]
      }
    }
  },

  watch: {
    dialog () {
      if (!this.dialog) this.clearDialog();
      else this.getData();
    }, 

    // Watcher que cambia el formato de la fecha 'yyyy-mm-dd' a dd/mm/yyyy'
    fechaSelec () {
      this.inputs.fecha_nacimiento = this.formatoFecha(this.fechaSelec)
    },
    
    // Validacion manual del porcentaje de la beca
    "inputs.porcentaje_beca": function () {
      if (this.dialog && this.validacion.porcentaje_beca)  
        this.validacion.porcentaje_beca = '';
    },

    // Validacion manual del numero de etapa de la educacion
    "inputs.numero_etapa": function () {
      if (this.dialog && this.validacion.numero_etapa)  
        this.validacion.numero_etapa = '';
    },

    // Validacion manual del porcentaje de la beca
    "inputs.nombre_beca": function () {
      if (this.dialog && !this.inputs.nombre_beca)  
        this.validacion.porcentaje_beca = '';
    },

    // Validacion manual del numero de etapa de la educacion
    "inputs.id_educacion": function () {
      if (this.dialog && !this.inputs.id_educacion)  
        this.validacion.numero_etapa = '';
    },

    // Validacion manual de la fecha de nacimiento
    "inputs.fecha_nacimiento": function () {
      if (this.dialog)
        this.validacion.fecha_nacimiento = this.inputs.fecha_nacimiento ? '' : 'Este campo es obligatorio';
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
      Funcion que hace la solicitud POST al servidor para registrar a un atleta,
      en caso de 200 (exito) se cierra el dialog, se reinicia todo y se despliega un snackbar de exito,
      en caso de error (bien sea 400 unicidad o 500 error generico) se coloca el mensaje de error en la UI
    */
    async sendData () {
      // maneja el atributo loading del boton
      this.formEnviando = true;
      // request POST
      await axios.post(`${server_url}/atletas`, this.inputs, { withCredentials: true })
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
      y se realiza un emit para indicarle a la tabla de atletas que se actualice
    */
    clearDialog(success = false) {
      this.dialog = false;
      this.mensajeError = '';
      this.$refs.form.reset();
      this.validacion = {
        porcentaje_beca: '',
        numero_etapa: '',
        fecha_nacimiento: ''
      };
      if (success) {
        this.snackbar = true;
        this.$emit('atletaRegistrado');
      }
    },

    // Realiza validacion manual y automatica del form. en caso de datos validos se procede a hacer la solicitud POST
    // en caso de error de validacion se despliegan los respectivos mensajes y no se realiza solicitud al servidor
    submit() {
      this.mensajeError = '';
      if (this.inputs.nombre_beca)
        this.validacion.porcentaje_beca = this.inputs.porcentaje_beca ? '' : 'Este campo es necesario para la beca';
      if (this.inputs.id_educacion)
        this.validacion.numero_etapa = this.inputs.numero_etapa ? '' : 'Este campo es necesario para la educacion';
      this.validacion.fecha_nacimiento = this.inputs.fecha_nacimiento ? '' : 'Este campo es obligatorio';
      this.$refs.form.validate();
      if(!Object.values(this.validacion).filter(item => item != '').length && this.$refs.form.validate()) {
        this.sendData();
      }
    },

    async getData() {
      this.itemsEducacion = [];
      await axios.get(`${server_url}/educaciones`, { withCredentials: true })
      .then((res) => {
        // Exito 200 (se hizo el select query, puede haber o no haber datos, indicado por "Vacio")
        if (res.status === 200) {
          // si hay datps se colocan en itemsEducacion
          if (res.data != 'Vacio') 
            Array.from(res.data).forEach(item => this.itemsEducacion.push({ text: item.nombre, value: item.id, etapa: item.etapa }));
          // Maneja el atributo loading del select box
          this.educacionCargando = false;
        }
      })

      .catch((error) => {
        try {
          // Error por parte del servidor
          console.log(error.response.status);
        }
        catch {
          // Servidor inalcanzable
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
    }
    
  },

  /*
    En mounted, se rellena el select box de educaciones, si hay datos se colocan en itemsEducacion
  */
  async mounted() {
    this.getData();
  }
}
</script>

<style>

</style>