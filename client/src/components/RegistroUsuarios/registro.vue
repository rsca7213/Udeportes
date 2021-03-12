<template>
  <div class="indigo">
    <v-container>
      <v-row align="center" style="height: 100vh">
        <v-col> </v-col>
        <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
          <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2 d-flex justify-center justify-sm-start"> Registro de usuarios </v-card-title>
            <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> <span>Los campos que contienen un <span class="red--text">"*"</span> son obligatorios</span> </v-card-subtitle>
            <v-row v-if="mensajeError" class="pl-4">
              <v-col class="error--text"> 
                <div class="ml-4">
                  <v-icon color="error"> mdi-alert </v-icon>
                  <span v-text="mensajeError" class="ml-1"> </span>
                </div>
              </v-col>
            </v-row>
            <v-form ref="form" class="px-4">
              <v-virtual-scroll :items="datosUsuario" :item-height="70" height="420">
                <template v-slot:default="{ item }">
                  <v-text-field :name="item.variable_asociada" v-model="inputs[item.variable_asociada]" v-if="item.nombre != 'Rol' && item.nombre != 'Fecha de Nacimiento'" class="px-4" clear-icon="mdi-close" clearable :counter="item.longitud" :label="item.requerido? item.nombre+' *':item.nombre" 
                  :prepend-icon="item.icono" type="text" validate-on-blur :rules="reglas[item.validacion]" :placeholder="item.placeholder"> </v-text-field>     
                  <v-select v-else-if="item.nombre == 'Rol'" :name="item.variable_asociada" v-model="inputs.rol" class="px-4 mt-4" prepend-icon="mdi-account-tie" :items="roles" item-text="nombre" item-value="valor" :label="item.requerido? item.nombre+' *':item.nombre" dense validate-on-blur :rules="reglas[item.validacion]"></v-select>
                  <v-menu v-else-if="item.nombre == 'Fecha de Nacimiento'" ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field :name="item.variable_asociada" v-model="inputs.fecha_nacimiento" class="px-4" clear-icon="mdi-close" clearable :counter="item.longitud" :label="item.nombre" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" validate-on-blur :rules="reglas[item.validacion]"></v-text-field>
                    </template>
                    <v-date-picker color="primary" ref="picker" v-model="fecha" no-title scrollable @change="guardar" locale="es-419"></v-date-picker>
                  </v-menu>
                </template>
              </v-virtual-scroll>
            </v-form>
            <v-card-actions class="mt-4 d-flex justify-center justify-sm-end">
              <v-dialog v-model="modal" persistent max-width="490">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" v-bind="attrs" v-on="on" :disabled="!credencialesValidas" :loading="formCargando">
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
                    validate-on-blur v-model="inputs.clave" :rules="reglas.reglasClave"> </v-text-field>
                  </v-card-text>
                  <v-card-actions class="d-flex justify-center justify-sm-end">
                    <v-btn color="red" dark @click="modal = false">
                      Cancelar
                    </v-btn>
                    <v-btn color="secondary" @click="submit()" :disabled="!claveValida" :loading="formCargando">
                      Aceptar
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-actions>
          </v-card>
          <v-snackbar v-model="display_creacion_dialog" timeout="4000" shaped transition="scroll-y-reverse-transition" multi-line> 
            <span class="secondary--text">Usuario creado exitosamente!</span> 
            <template v-slot:action="{ attrs }">
              <v-btn color="white" text v-bind="attrs" @click="display_creacion_dialog = false">
                Cerrar
              </v-btn>
            </template>
          </v-snackbar>
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
        //informacion de todos los campos de texto del formulario
        datosUsuario: [
          {nombre: 'Cédula', requerido:true , longitud: 8, icono: 'mdi-card-account-details', variable_asociada: 'cedula', validacion: 'reglasCedula'},
          {nombre: 'Primer Nombre', requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'primer_nombre', validacion: 'reglasNombre'},
          {nombre: 'Segundo Nombre', requerido:false, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'segundo_nombre', validacion: 'reglasSegundoNombre'},
          {nombre: 'Primer Apellido', requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'primer_apellido', validacion: 'reglasNombre'},
          {nombre: 'Segundo Apellido', requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'segundo_apellido', validacion: 'reglasNombre'},
          {nombre: 'Rol', requerido:true,icono: 'mdi-account-tie', variable_asociada: 'rol', validacion: 'reglasRol'},
          {nombre: 'Teléfono', requerido:false, longitud: 13, icono: 'mdi-cellphone', variable_asociada: 'telefono', validacion: 'reglasTelefono', placeholder: '+584141234567'},
          {nombre: 'Fecha de Nacimiento', longitud: 10, icono: 'mdi-calendar', variable_asociada: 'fecha_nacimiento', validacion: 'reglasFecha'},
          {nombre: 'Correo',  requerido:true, longitud: 256, icono: 'mdi-email', variable_asociada: 'correo', validacion: 'reglasCorreo'}
        ],
        //datos del usuario a insertar
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
        // el boton del form se coloca en loading si formCargando es true
        formCargando: false,
        // mensaje de error al hacer submit y recibir errores del servidor
        mensajeError: '',
        //variable que se encarga de mostrar el menu de la fecha
        menu: false,
        //valor inicial de la fecha
        fecha: null,
        //variable que se encarga de mostrar el modal con el resumen de los datos del usuario a crear
        modal: false,
        //variable que se encarga de mostrar el dialogue en caso de que se cree el usuario con exito
        display_creacion_dialog: false,
        //variable de control para saber si todos los datos del usuario a crear son validos
        credencialesValidas: false,
        //variable que permite activar el boton de crear usuario cuando la clave es válida
        claveValida: false,
        reglas: {
          reglasCorreo: [
            v => v && v.length >= 8 || 'El correo electrónico debe contener como minimo 8 caracteres',
            v => v && v.length <= 256 || 'El correo electrónico debe contener como máximo 256 caracteres',
            v => v && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)) || 'Debe ser un correo electrónico valido.'
          ],
          reglasClave: [
            v => v && v.length >= 8 || 'La contraseña debe contener como mínimo 8 caracteres.',
            v => v && v.length <= 256 || 'La contraseña debe contener como máximo 256 caracteres.'
          ],
          reglasCedula: [
            v => !!v || 'Este campo es obligatorio',
            v => v && v.length <= 8 || 'La cédula de identidad no debe ser mayor a 8 caracteres',
            v => v && (/^\d{0,9}$/.test(v)) || 'Debe ser una cédula válida',
          ],
          reglasNombre: [
            v => !!v || 'Este campo es obligatorio',
            v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
          ],
          reglasSegundoNombre: [
            v => v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
          ],
          reglasTelefono: [
            v => ((v && v.length == 13) || !v) || 'El teléfono debe tener 13 caracteres.',
            v => ((v && (/^[+]\d{1,12}$/.test(v))) || !v) || 'Debe ser un teléfono válido.'
          ],
          reglasFecha: [
            v => v.length <= 10 || 'La fecha debe contener como máximo 10 caracteres.'
          ],
          reglasRol: [
            v => ['a', 'e'].includes(v) || 'El rol es obligatorio',
          ],
        }
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
      //Cuando cambia algun campo del input se llama esta funcion automaticamente para validar los inputs
      datos: function () {
        //variable de control para saber si se cumplen las reglas de validacion
        let revisar = false;

        //se revisa si se cumplen las reglas del email
        this.reglas.reglasCorreo.forEach(emailValidator => {
          if(emailValidator(this.inputs.correo) !== true){
            this.credencialesValidas = false;
            revisar = true;
          } 
        });

        //se revisa si se cumplen las reglas de la cedula
         this.reglas.reglasCedula.forEach(cedulaValidator => {
          if(cedulaValidator(this.inputs.cedula) !== true){
            this.credencialesValidas = false;
            revisar = true;
          }  
        });

        //se revisa si se cumplen las reglas del telefono
         this.reglas.reglasTelefono.forEach(telefonoValidator => {
          if(telefonoValidator(this.inputs.telefono) !== true){
            this.credencialesValidas = false;
            revisar = true;
          }  
        });

        //se revisa si se cumplen las reglas del primer nombre, primer apellido y segundo apellido
         this.reglas.reglasNombre.forEach(nombreValidator => {
          if(nombreValidator(this.inputs.primer_nombre) !== true){
            this.credencialesValidas = false;
            revisar = true;
          } 
          if(nombreValidator(this.inputs.primer_apellido) !== true){
            this.credencialesValidas = false;
            revisar = true;
          } 
          if(nombreValidator(this.inputs.segundo_apellido) !== true){
            this.credencialesValidas = false;
            revisar = true;
          }        
        });

        //se revisa si se cumplen las reglas del segundo nombre
         this.reglas.reglasSegundoNombre.forEach(segundoNombreValidator => {
          if(segundoNombreValidator(this.inputs.segundo_nombre) !== true){
            this.credencialesValidas = false;
            revisar = true;
          }  
        });

        //se revisa si se cumplen las reglas de la fecha
         this.reglas.reglasFecha.forEach(fechaValidator => {
          if(fechaValidator(this.inputs.fecha_nacimiento) !== true){
            this.credencialesValidas = false;
            revisar = true;
          }      
        });

        //se revisa si se cumplen las reglas del rol
         this.reglas.reglasRol.forEach(rolValidator => {
          if(rolValidator(this.inputs.rol) !== true){
            this.credencialesValidas = false;
            revisar = true;
          }
        });

        //si se cumplen todas las reglas entonces se permite agregar el usuario
        if(revisar === false){
          this.credencialesValidas = true;
        }
      },
      //Cuando cambia la clave se llama esta funcion automaticamente
      datos_clave: function(){
        //variable de control para saber si se cumplen las reglas de validacion
        let revisar = false;

        //se revisa si se cumplen las reglas de la clave
        this.reglas.reglasClave.forEach(claveValidator => {
          if(claveValidator(this.inputs.clave) !== true){
            this.claveValida = false;
            revisar = true;
          }        
        });

        if(revisar === false){
          this.claveValida = true;
        }
      }
    },
    computed: {
      //metodo que retorna los datos que serán observados por el watcher(datos)
      datos() {
        return `${this.inputs.cedula}|${this.inputs.primer_nombre}|${this.inputs.segundo_nombre}|
        ${this.inputs.primer_apellido}|${this.inputs.segundo_apellido}|${this.inputs.rol}|
        ${this.inputs.telefono}|${this.fecha}|${this.inputs.correo}`;
      },
      //metodo que retorna la clave que será observada por el watcher(datos_clave)
      datos_clave() {
        return `${this.inputs.clave}`;
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

      // submit del form
      async submit() {
        this.modal = false;
        if(this.$refs.form.validate()) {
          this.mensajeError = '';
          this.formCargando = true;
          // se solicita al servidor la creacion del usuario con un POST, enviando los datos del usuario, si se recibe
          // un 200 se redirecciona al Inicio ya que todo salio bien, sino se muestra un mensaje
          // de error que especifica que sucedio
          await axios
            .post(`${server_url}/creacion/usuario`, this.inputs, { withCredentials: true })
            .then((res) => {
              if (res.data.codigo === 200) {
                 //ciclo que se encarga de limpiar todos los campos del formulario
                Object.keys(this.inputs).forEach(key => {
                  this.inputs[key] = "";
                });
                this.display_creacion_dialog= true;    
                //this.$router.push('/');
              }
              else{
                this.mensajeError = res.data.texto;
              }
              this.formCargando = false;
            })
            .catch(() => {
              this.formCargando = false;
              this.mensajeError = 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
            });
        }
      }
    },
  }
</script>