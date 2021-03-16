<template>
  <div>
    <v-dialog v-model="dialog_editar_clave" max-width="600px" class="text-center" @click:outside="cerrarEditarClave()">
      <template v-slot:activator="{ on, attrs }">
        <v-icon color="primary" dense v-bind="attrs" v-on="on">
          mdi-key-variant
        </v-icon>
      </template>
      <v-card rounded="md">
        <v-card-title>
          Actualizar Clave de Usuario 
          <v-spacer> </v-spacer>
          <v-btn icon @click="dialog_editar_clave = false"><v-icon> mdi-close </v-icon></v-btn>
        </v-card-title> 
        <v-alert text color="error" dense v-if="mensaje_error">
          <v-icon color="error"> mdi-alert </v-icon>
          <span v-text="mensaje_error" class="ml-1"> </span>
        </v-alert>
        <v-card-text class="text-subtitle-1">
          <p class="subtitle-1 mb-0 mt-1 font-weight-bold">Por favor introduce una contraseña para el usuario:</p>
          <b> Nro. Cédula: </b> <span v-text="cedula_usuario"></span>
          <br>
          <b> Nombre Completo: </b> <span v-text="nombre_completo_usuario"></span>
          <v-form ref="form_clave">
            <v-text-field clear-icon="mdi-close" clearable counter="128" label="Contraseña" 
            prepend-icon="mdi-key" type="password" class="mt-2" 
            validate-on-blur v-model="inputs.clave" :rules="reglasClave"> </v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions> 
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" class="mb-2" dark @click="cerrarEditarClave()">
            <v-icon left> mdi-close </v-icon>
            Cancelar
          </v-btn>
          <v-btn color="secondary" class="mr-2 mb-2" :disabled="!clave_valida" :loading="form_cargando" @click="editarClave()">
            <v-icon left> mdi-check-circle </v-icon>
            Actualizar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'EditarClave',
  props: {
    cedula_usuario: String,
    nombre_completo_usuario: String,
  },
  data() {
    return {
      //variable que abre o cierra el modal de cambiar clave de usuario
      dialog_editar_clave: false,
      //variable que contiene el mensaje del error al momento de cambiar la clave del usuario
      mensaje_error: '',
      //variable que indica si la clave cumple con las validaciones respectivas
      clave_valida: false,
      //
      form_cargando: false,
      //nueva clave para el usuario
      inputs:{
        clave : '',
      },
      //validación que debe cumplir la nueva clave
      reglasClave: [
        v => v && v.length >= 8 || 'La contraseña debe contener como mínimo 8 caracteres.',
        v => v && v.length <= 256 || 'La contraseña debe contener como máximo 256 caracteres.'
      ],
    }
  },
  watch: {
    //Funcion encargada de observar si se ha cambiado la clave del usuario
   "inputs.clave"() {
      //variable de control para saber si se cumplen las reglas de validacion
      let revisar = false;

      //se revisa si se cumplen las reglas de la clave
      this.reglasClave.forEach(claveValidator => {
        if(claveValidator(this.inputs.clave) !== true){
          this.clave_valida = false;
          revisar = true;
        }        
      });

      //si se cumplen las condiciones se activa el botón para actualizar
      if(revisar === false){
        this.clave_valida = true;
      }
    },
  },
  methods: {
    //función que cierra el modal, vacía el campo, vacía el mensaje de error y quita las validaciones
    cerrarEditarClave(){
      this.mensaje_error = '';
      this.dialog_editar_clave = false;
      this.$refs.form_clave.resetValidation();
      this.inputs.clave='';
    },
    //función encargada de actualizar la clave del usuario
    async editarClave(){
      if(this.$refs.form_clave.validate()) {
        this.mensaje_error = '';
        this.form_cargando = true;
        /*
          se solicita al servidor la ediciónn del usuario con un PUT, enviando los datos del usuario, si se recibe
          un 200 se muestra un mensaje de éxito ya que todo la operación fue exitosa, sino se muestra un mensaje
          de error que específica que sucedió
        */
        await axios
          .put(`${server_url}/entrenadores/clave/${this.cedula_usuario}`, this.inputs, { withCredentials: true })
          .then((res) => {
            if (res.data.codigo === 200) {
              //se vacían los campos del formulario
              this.inputs.clave=''
              this.form_cargando = false;
              this.mensaje_exito = '¡Contraseña actualizada exitosamente!';
              this.dialog_editar_clave = false;
              //se emite el evento para que se muestre el snackbar que indica que el cambio de clave fue exitoso
              this.$emit('editarClave', {estatus_operacion: true, mensaje_operacion: this.mensaje_exito});
            }
            else{
              this.form_cargando = false;
              this.mensaje_error = res.data.texto;
            }        
          })
          .catch(() => {
            this.form_cargando = false;
            this.mensaje_error = 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.';
          });
      }
    }
  },
}
</script>

<style>

</style>