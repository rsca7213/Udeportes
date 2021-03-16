<template>
  <div>
    <v-dialog v-model="dialog_eliminar_usuario" persistent max-width="600px" class="text-center">
      <template v-slot:activator="{ on, attrs }">
        <v-icon color="error" dense v-bind="attrs" v-on="on">
          mdi-delete
        </v-icon>
      </template>
      <v-card rounded="md">
        <v-card-title>
          Eliminar Usuario
          <v-spacer> </v-spacer>
          <v-btn icon @click="dialog_eliminar_usuario = false"><v-icon> mdi-close </v-icon></v-btn>
        </v-card-title> 
        <v-alert text color="error" dense v-if="mensaje_error">
          <v-icon color="error"> mdi-alert </v-icon>
          <span v-text="mensaje_error" class="ml-1"> </span>
        </v-alert>
        <v-card-text class="text-subtitle-1">
          <b class="error--text"> ¿Está seguro que desea eliminar al usuario? </b>
          <br>
          <span class="error--text"> Al eliminar al usuario se eliminarán todos sus datos del sistema. </span>
          <br>
          <b> Nro. Cédula: </b> <span v-text="cedula_usuario"> </span>
          <br>
          <b> Nombre Completo: </b> <span v-text="nombre_completo_usuario"> </span>
        </v-card-text>
        <v-card-actions> 
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" class="mb-2" dark @click="cerrarEliminarUsuario()">
            <v-icon left> mdi-close </v-icon>
            Cancelar
          </v-btn>
          <v-btn color="error" class="mr-2 mb-2" :loading="form_cargando" @click="eliminarUsuario()">
            <v-icon left> mdi-delete </v-icon>
            Eliminar
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
  name: 'EliminarUsuario',
  props: {
    cedula_usuario: String,
    nombre_completo_usuario: String,
  },
  data() {
    return {
      //variable que abre o cierra el modal de cambiar clave de usuario
      dialog_eliminar_usuario: false,
      //variable que contiene el mensaje del error al momento de cambiar la clave del usuario
      mensaje_error: '',
      //variable para color el botón de eliminar en un estado de loading
      form_cargando: false,
    }
  },
  methods: {
    //función que cierra el modal y vacía el mensaje de error
    cerrarEliminarUsuario(){
      this.mensaje_error = '';
      this.dialog_eliminar_usuario = false;
    },
    //función encargada de eliminar al usuario
    async eliminarUsuario(){

      this.mensaje_error = '';
      this.form_cargando = true;
      /*
        se solicita al servidor la eliminación del usuario con un DELETE, enviando la cédula del usuario, si se recibe
        un 200 se muestra un mensaje de éxito ya que todo la operación fue exitosa, sino se muestra un mensaje
        de error que específica que sucedió
      */
      await axios
        .delete(`${server_url}/entrenadores/${this.cedula_usuario}`, { withCredentials: true })
        .then((res) => {
          if (res.data.codigo === 200) {
            this.form_cargando = false;
            this.mensaje_exito = '¡Usuario eliminado exitosamente!';
            this.dialog_eliminar_usuario = false;
            //se emite el evento para que se muestre el snackbar que indica que el cambio de clave fue exitoso
            this.$emit('eliminarUsuario', {estatus_operacion: true, mensaje_operacion: this.mensaje_exito});
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
  },
}
</script>

<style>

</style>