<template>
  <div class="indigo">
    <v-container>
      <v-row align="center" style="height: 100vh">
        <v-col> </v-col>
        <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
          <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> Registro de usuarios </v-card-title>
            <v-form ref="form" class="px-4">
              <v-virtual-scroll :items="datosUsuario" :item-height="60" height="420">
                <template v-slot:default="{ item }">
                  <v-text-field v-model="inputs[item.variable_asociada]" v-if="item.nombre != 'Rol *' && item.nombre != 'Fecha de Nacimiento *'" class="px-4" clear-icon="mdi-close" clearable :counter="item.longitud" :label="item.nombre" 
                  :prepend-icon="item.icono" type="text" validate-on-blur> </v-text-field>     
                  <v-select v-else-if="item.nombre == 'Rol *'" v-model="inputs.rol" class="px-4 mt-4" prepend-icon="mdi-account-tie" :items="roles" item-text="nombre" item-value="valor" label="Rol *" dense></v-select>
                  <v-menu v-else-if="item.nombre == 'Fecha de Nacimiento *'" ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="inputs.fecha_nacimiento" class="px-4" clear-icon="mdi-close" clearable :counter="item.longitud" :label="item.nombre" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" ref="picker" v-model="fecha" no-title scrollable @change="guardar" locale="es-419"></v-date-picker>
                  </v-menu>
                </template>
              </v-virtual-scroll>
            </v-form>
            <v-card-actions class="mt-4">
              <v-spacer> </v-spacer>
              <v-dialog v-model="modal" persistent max-width="490">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" v-bind="attrs" v-on="on">
                    <v-icon left> mdi-login </v-icon>
                    Registrar 
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="headline">
                    Registrar usuario
                  </v-card-title>
                  <v-card-text>
                    <v-list>
                      <div v-for="dato in datosUsuario" :key="dato.nombre">
                        <v-list-item v-if="inputs[dato.variable_asociada] != ''">
                          <v-list-item-content class="py-1">
                            <v-list-item-title>{{dato.nombre}}</v-list-item-title>
                            <v-list-item-subtitle>{{inputs[dato.variable_asociada]}}</v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </div>
                    </v-list>
                    <p class="subtitle-1 px-4 my-0">Por favor introduce una contraseña temporal para el usuario</p>
                    <v-text-field clear-icon="mdi-close" clearable counter="128" label="Contraseña" 
                    prepend-icon="mdi-key" type="password" class="px-4" 
                    validate-on-blur v-model="inputs.clave"> </v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" dark @click="modal = false">
                      Cancelar
                    </v-btn>
                    <v-btn color="secondary" @click="submit()">
                      Aceptar
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col> </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
  export default {
    name: 'registro',
    data() {
      return {
        datosUsuario: [
          {nombre: 'Cédula *', requerido:true , longitud: 8, icono: 'mdi-card-account-details', variable_asociada: 'cedula'},
          {nombre: 'Primer Nombre *', requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'primer_nombre'},
          {nombre: 'Segundo Nombre', longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'segundo_nombre'},
          {nombre: 'Primer Apellido *',  requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'primer_apellido'},
          {nombre: 'Segundo Apellido *',  requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'segundo_apellido'},
          {nombre: 'Rol *', icono: 'mdi-account-tie', variable_asociada: 'rol'},
          {nombre: 'Teléfono *',  requerido:true, longitud: 11, icono: 'mdi-cellphone', variable_asociada: 'telefono'},
          {nombre: 'Fecha de Nacimiento *', longitud: 10, icono: 'mdi-calendar', variable_asociada: 'fecha_nacimiento'},
          {nombre: 'Correo *',  requerido:true, longitud: 256, icono: 'mdi-email', variable_asociada: 'correo'}
        ],
        inputs: {
          cedula: "",
          primer_nombre: "",
          segundo_nombre: "",
          primer_apellido: "",
          segundo_apellido: "",
          rol: "",
          telefono: "",
          fecha_nacimiento: "",
          correo: "",
          clave: ""
        },
        roles: [
          {
            nombre: 'Administrador', valor: 'a'
          },
          {
            nombre: 'Entrenador', valor: 'e'
          },
        ],
        menu: false,
        fecha: null,
        modal: false
      }
    },
    watch: {
      //Funcion encargada de observar si se ha hecho click en el menu para abrir el calendario
      menu (val) {
        val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR')) //Abre el calendario comenzando por el año
      },
      //Se encarga de observar si se ha cambiado la fecha para aplicar el formato DD/MM/YYYY
      fecha () {
        this.inputs.fecha_nacimiento = this.formatoFecha(this.fecha)
      },
    },
    methods: {
      //funcion encargada de guardar la fecha (cierra el calendario luego de elegida la fecha)
      guardar (fecha) {
        this.$refs.menu.save(fecha)
      },
      //funcion encargada de convertir la fecha elegida al formato DD/MM/TTTT
      formatoFecha (fecha) {
        if (!fecha) return null
        const [year, mes, dia] = fecha.split('-')
        return `${dia}/${mes}/${year}`
      },
      imprimir(){
        console.log(this.inputs);
      },

      // submit del form
      async submit() {
        this.modal = false;
        //if(this.$refs.form.validate()) {
          //this.mensajeError = '';
          //this.formCargando = true;
          // se solicita al servidor el login con un POST, enviando las credenciales, si se recibe
          // un 200 se redirecciona al Inicio ya que todo salio bien, sino se muestra un mensaje
          // de error que especifica que sucedio
          await axios
            .post(`${server_url}/creacion/usuario`, this.inputs, { withCredentials: true })
            .then((res) => {
              if (res.status === 200) this.$router.push('/');
              console.log("ola");
            })
            .catch((error) => {
              console.log("bye");
              this.formCargando = false;
              this.$refs.form.reset();
              this.mensajeError = error.response.status === 500
                ? 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.'
                : 'Correo electrónico o contraseña incorrecta.';
            });
        //}
      }
    },
  }
</script>