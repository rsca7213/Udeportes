<template>
  <v-dialog v-model="dialog" class="text-center" max-width="900">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on"> 
        <v-icon left> mdi-plus-circle </v-icon>
        Registrar atleta
      </v-btn>
    </template>
    <v-card rounded="md">
      <v-card-title>
        Registrar Atleta
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
          <v-row v-if="mensajeError" class="pl-4">
            <v-col class="error--text"> 
              <div class="ml-4">
                <v-icon color="error"> mdi-alert </v-icon>
                <span v-text="mensajeError" class="ml-1"> </span>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" :rules="reglas.correo" 
              validate-on-blur v-model="inputs.correo" name="correo"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="8" label="Cédula de Identidad *"
              prepend-icon="mdi-card-account-details" type="text" :rules="reglas.cedula"
              validate-on-blur v-model="inputs.cedula" name="cedula"> </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="13" label="Teléfono"
              prepend-icon="mdi-cellphone" type="text" :rules="reglas.telefono"
              validate-on-blur v-model="inputs.telefono" name="telefono"
              placeholder="+584141574855"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Primer Nombre *"
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.nombre_apellido"
              validate-on-blur v-model="inputs.primer_nombre" name="primer_nombre"> </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Segundo Nombre" 
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.segundo_nombre" 
              validate-on-blur v-model="inputs.segundo_nombre" name="segundo_nombre"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Primer Apellido *"
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.nombre_apellido"
              validate-on-blur v-model="inputs.primer_apellido" name="primer_apellido"> </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable counter="50" label="Segundo Apellido *" 
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.nombre_apellido" 
              validate-on-blur v-model="inputs.segundo_apellido" name="segundo_apellido"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-radio-group v-model="inputs.genero" row prepend-icon="mdi-human-male-female" 
              name="genero" mandatory label="*">
                <v-radio label="Masculino" value="m"> </v-radio>
                <v-radio label="Femenino" value="f"> </v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="12" sm="6">
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
            <v-col cols="12" sm="6">
              <v-select v-model="inputs.id_educacion" label="Educación" prepend-icon="mdi-school"
              clear-icon="mdi-close" name="educacion" clearable
              :loading="educacionCargando" :items="itemsEducacion" :disabled="educacionCargando">
              </v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable 
              :label="`Etapa (${inputs.id_educacion ? itemsEducacion.filter(item => item.value == inputs.id_educacion)[0].etapa : 'Periodo'})`" 
              :disabled="!inputs.id_educacion"
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.numero_etapa"
              validate-on-blur v-model.number="inputs.numero_etapa" name="numero_etapa"
              :error-messages="validacion.numero_etapa"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable label="Nombre de Beca"
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.nombre_beca"
              validate-on-blur v-model="inputs.nombre_beca" name="nombre_beca"> </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field clear-icon="mdi-close" clearable label="Porcentaje (%)" :disabled="!inputs.nombre_beca"
              prepend-icon="mdi-account-edit-outline" type="text" :rules="reglas.porcentaje_beca"
              validate-on-blur v-model.number="inputs.porcentaje_beca" name="porcentaje_beca"
              :error-messages="validacion.porcentaje_beca"> </v-text-field>
            </v-col>
          </v-row>
      </v-container>
      </v-form>
      <v-card-actions> 
        <v-spacer></v-spacer>
        <v-btn color="red" dark @click="clearDialog()">
          <v-icon left> mdi-close </v-icon>
          Cancelar
        </v-btn>
        <v-btn color="secondary" @click="submit()" :disabled="!datosValidos" :loading="formEnviando">
          <v-icon left> mdi-check-circle </v-icon>
          Registrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'RegistrarAtletas',

  data() {
    return {
      dialog: false,
      menuFechas: false,
      educacionCargando: true,
      mensajeError: '',
      fechaSelec: '',
      formEnviando: false,
      datosValidos: false,
      itemsEducacion: [],
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
      validacion: {
        porcentaje_beca: '',
        numero_etapa: '',
        fecha_nacimiento: ''
      },
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
          v => v === null || v.length === 0 || v.length <= 50 || 'Este campo debe contener como máximo 200 caracteres',
        ],
        porcentaje_beca: [
          v => v === null || typeof(v) === 'number' || 'Debe ser un número',
          v => v === null || v >= 0 || 'El porcentaje debe ser mayor o igual a 0',
          v => v === null || v <= 100 || 'El porcentaje debe ser menor o igual a 100'
        ],
        numero_etapa: [
          v => v === null || v === null || typeof(v) === 'number' || 'Debe ser un número',
          v => v === null || v > 0 || 'Este cambo debe ser mayor o igual a 1'
        ]
      }
    }
  },

  watch: {
    fechaSelec () {
      this.inputs.fecha_nacimiento = this.formatoFecha(this.fechaSelec)
    },
    
    "inputs.porcentaje_beca": function () {
      if (this.dialog && this.validacion.porcentaje_beca)  
        this.validacion.porcentaje_beca = '';
    },

    "inputs.numero_etapa": function () {
      if (this.dialog && this.validacion.numero_etapa)  
        this.validacion.numero_etapa = '';
    },

    "inputs.nombre_beca": function () {
      if (this.dialog && !this.inputs.nombre_beca)  
        this.validacion.porcentaje_beca = '';
    },

    "inputs.id_educacion": function () {
      if (this.dialog && !this.inputs.id_educacion)  
        this.validacion.numero_etapa = '';
    },

    "inputs.fecha_nacimiento": function () {
      if (this.dialog)
        this.validacion.fecha_nacimiento = this.inputs.fecha_nacimiento ? '' : 'Este campo es obligatorio';
    },
  },

  methods: {
    guardar (fecha) {
      this.$refs.menuFechas.save(fecha);
    },

    formatoFecha (fecha) {
      if (!fecha) return null
      const [year, mes, dia] = fecha.split('-')
      return `${dia}/${mes}/${year}`
    },

    clearDialog() {
      this.$refs.form.reset();
      this.validacion = {
        porcentaje_beca: '',
        numero_etapa: '',
        fecha_nacimiento: ''
      };
      this.dialog = false;
    },

    submit() {
      if (this.inputs.nombre_beca)
        this.validacion.porcentaje_beca = this.inputs.porcentaje_beca ? '' : 'Este campo es necesario para la beca';
      if (this.inputs.id_educacion)
        this.validacion.numero_etapa = this.inputs.numero_etapa ? '' : 'Este campo es necesario para la educacion';
      this.validacion.fecha_nacimiento = this.inputs.fecha_nacimiento ? '' : 'Este campo es obligatorio';
      this.$refs.form.validate();
      if(!Object.values(this.validacion).filter(item => item != '').length && this.$refs.form.validate()) {
        console.log('%cama we did it', 'color: lightgreen');
      }
      else {
        console.error('ama this are sad times, we did not do it');
      }
    }

    
  },

  async mounted() {
    await axios.get(`${server_url}/educaciones`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          if (res.data != 'Vacio') 
            Array.from(res.data).forEach(item => this.itemsEducacion.push({ text: item.nombre, value: item.id, etapa: item.etapa }));
          this.educacionCargando = false;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
</script>

<style>

</style>