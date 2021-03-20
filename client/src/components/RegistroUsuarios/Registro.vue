<template>
  <div class="">
    <v-container>
      <v-row class="" align="start">
        <v-col cols="12 px-0 py-0"> 
          <v-card rounded="md">
            <v-card-title class="pl-8 pb-0 grey--text text--darken-2">
              <span class="d-none d-sm-flex"> {{ mensaje_form }} </span>
              <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> {{ mensaje_form }} </b>
              <v-spacer> </v-spacer>
              <v-btn icon @click="cerrarForm({estatus_operacion: null, mensaje_exito: null})"><v-icon> mdi-close </v-icon></v-btn>
            </v-card-title>
            <div v-show="!confirmar_registro">
              <v-card-subtitle class="pb-0 pt-3 pl-8 grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> <span>Los campos que contienen un <span class="red--text">"*"</span> son obligatorios</span> </v-card-subtitle>
              <div v-if="mensajeError" class="">
                <v-col class="error--text px-4"> 
                  <div class="ml-4">
                    <v-alert text color="error" dense>
                      <v-icon color="error"> mdi-alert </v-icon>
                      <span v-text="mensajeError" class="ml-1"> </span>
                    </v-alert>
                  </div>
                </v-col>
              </div>
              <v-form ref="form">
                <v-container class="px-md-4">
                  <v-row class="px-0">
                    <v-col cols=12 :sm="(item.nombre === 'Correo')? 12:6" v-for="item in datosUsuario" :key="item.cedula">
                      <v-text-field :name="item.variable_asociada" v-model.trim="inputs[item.variable_asociada]" v-if="item.nombre != 'Rol' && item.nombre != 'Fecha de Nacimiento'" class="px-4" clear-icon="mdi-close" clearable :counter="item.longitud" :label="item.requerido? item.nombre+' *':item.nombre" :disabled="(usuario.cedula && item.variable_asociada==='cedula')? true:false"
                      :prepend-icon="item.icono" type="text" validate-on-blur :rules="reglas[item.validacion]" :placeholder="item.placeholder"> </v-text-field>     
                      <v-select v-else-if="item.nombre === 'Rol'" :name="item.variable_asociada" v-model="inputs.rol" class="px-4 mt-4" prepend-icon="mdi-account-tie" :items="roles" item-text="nombre" item-value="valor" :label="item.requerido? item.nombre+' *':item.nombre" dense validate-on-blur :rules="reglas[item.validacion]"></v-select>
                      <v-menu v-else-if="item.nombre === 'Fecha de Nacimiento'" ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field :name="item.variable_asociada" v-model="inputs.fecha_nacimiento" class="px-4" clear-icon="mdi-close" clearable :counter="item.longitud" :label="item.nombre" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" validate-on-blur :rules="reglas[item.validacion]"></v-text-field>
                        </template>
                        <v-date-picker color="primary" ref="picker" v-model="fecha" no-title scrollable @change="guardar" locale="es-419"></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
              <v-card-actions class="mt-4 d-flex justify-center justify-sm-end flex-column flex-sm-row">
                <v-btn class="mb-2" color="error" dark @click="cerrarForm({estatus_operacion: null, mensaje_exito: null})">
                  <v-icon left> mdi-close </v-icon>
                  Cerrar
                </v-btn>
                <v-btn class="mr-2 mb-2" v-if="!usuario.cedula" color="secondary" :disabled="!credencialesValidas" :loading="formCargando" @click="mostrarConfirmacion()">
                  <v-icon left> mdi-check-circle </v-icon>
                  Registrar
                </v-btn>
                <v-btn v-else color="secondary" class="mr-2 mb-2" :disabled="!credencialesValidas" :loading="formCargando" @click="editarUsuario()">
                  <v-icon left> mdi-check-circle </v-icon>
                  Editar
                </v-btn>
              </v-card-actions>
            </div>
            <div v-show="confirmar_registro">
              <v-card-text class="pb-0 pt-4 text-subtitle-1">
                <v-container>
                  <v-row class="px-1">
                    <v-col  cols=12 sm=6 lg=4 class="py-1" v-for="dato in datosUsuario" :key="dato.nombre" v-show="inputs[dato.variable_asociada] != ''">
                      <b><span class="my-0 grey--text text--darken-2">{{dato.nombre+": "}}</span></b>
                      <span class="my-0 grey--text text--darken-2">{{(dato.variable_asociada == 'rol')? ((inputs[dato.variable_asociada] == 'a')? 'Administrador':'Entrenador'): inputs[dato.variable_asociada]}}</span>  
                    </v-col>
                  </v-row>
                </v-container>
                <p class="subtitle-1 px-4 mb-0 mt-5">Por favor introduce una contraseña para el usuario.</p>
                <v-form ref="form_clave">
                  <v-text-field clear-icon="mdi-close" clearable counter="128" label="Contraseña" 
                  prepend-icon="mdi-key" type="password" class="px-4" 
                  validate-on-blur v-model="inputs.clave" :rules="reglas.reglasClave"> </v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions class="d-flex justify-center justify-sm-end mt-2">
                <v-btn color="error" dark @click="confirmar_registro = false">
                  <v-icon left> mdi-close </v-icon>
                  Volver
                </v-btn>
                <v-btn color="secondary" @click="submit()" :disabled="!claveValida" :loading="formCargando">
                  <v-icon left> mdi-check-circle </v-icon>
                  Aceptar
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
  export default {
    name: 'registro',
    props: {
      usuario: {},
      mensaje_form : String,
    },
    data() {
      return {
        //informacion de todos los campos de texto del formulario
        datosUsuario: [
          {nombre: 'Correo',  requerido:true, longitud: 256, icono: 'mdi-email', variable_asociada: 'correo', validacion: 'reglasCorreo'},
          {nombre: 'Cédula', requerido:true , longitud: 8, icono: 'mdi-card-account-details', variable_asociada: 'cedula', validacion: 'reglasCedula'},
          {nombre: 'Teléfono', requerido:false, longitud: 13, icono: 'mdi-cellphone', variable_asociada: 'telefono', validacion: 'reglasTelefono', placeholder: '+584141234567'},
          {nombre: 'Primer Nombre', requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'primer_nombre', validacion: 'reglasNombre'},
          {nombre: 'Segundo Nombre', requerido:false, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'segundo_nombre', validacion: 'reglasSegundoNombre'},
          {nombre: 'Primer Apellido', requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'primer_apellido', validacion: 'reglasNombre'},
          {nombre: 'Segundo Apellido', requerido:true, longitud: 50, icono: 'mdi-account-edit-outline', variable_asociada: 'segundo_apellido', validacion: 'reglasNombre'},
          {nombre: 'Rol', requerido:true,icono: 'mdi-account-tie', variable_asociada: 'rol', validacion: 'reglasRol'},
          {nombre: 'Fecha de Nacimiento', longitud: 10, icono: 'mdi-calendar', variable_asociada: 'fecha_nacimiento', validacion: 'reglasFecha'},
        ],
        //datos del usuario a insertar
        inputs: {
          cedula: '',
          primer_nombre: '',
          segundo_nombre: '',
          primer_apellido: '',
          segundo_apellido: '',
          rol: '',
          telefono: '',
          fecha_nacimiento: '',
          correo: '',
          clave: ''
        },
        roles: [
          {
            nombre: 'Administrador', valor: 'a'
          },
          {
            nombre: 'Entrenador', valor: 'e'
          },
        ],
        // el botón del form se coloca en loading si formCargando es true
        formCargando: false,
        // mensaje de error al hacer submit y recibir errores del servidor
        mensajeError: '',
        //mensaje de éxito para cuando se crea un usuario o se edita un usuario
        mensajeExito: '',
        //variable que se encarga de mostrar el menu de la fecha
        menu: false,
        //valor inicial de la fecha
        fecha: null,
        //variable que se encarga de mostrar el modal con el resumen de los datos del usuario a crear
        modal: false,
        //variable de control para saber si todos los datos del usuario a crear son validos
        credencialesValidas: false,
        //variable que permite activar el boton de crear usuario cuando la clave es válida
        claveValida: false,
        //variable para mostrar la confirmación del registro en el mismo dialog donde se muestra el form de registro
        confirmar_registro: false,
        //editado:
        editado: true,
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
      },
      //Watcher que actualiza los datos del formulario para editar un usuario luego de la primera vez
      usuario: function(){
        console.log('epa');
        if(this.usuario.cedula){
          this.inputs.cedula = this.usuario.cedula;
          this.inputs.primer_nombre = this.usuario.primer_nombre;
          this.inputs.segundo_nombre = this.usuario.segundo_nombre;
          this.inputs.primer_apellido = this.usuario.primer_apellido;
          this.inputs.segundo_apellido = this.usuario.segundo_apellido;
          this.inputs.correo = this.usuario.correo;
          this.inputs.telefono = this.usuario.telefono;
          this.inputs.rol = this.usuario.rol==='Entrenador'? 'e':'a';
          this.inputs.fecha_nacimiento = this.usuario.fecha_nacimiento;
        }
      }
    },
    computed: {
      //método que retorna los datos que serán observados por el watcher(datos)
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
    //asigna los datos del usuario a editar para mostrarlos en el form la primera vez
    mounted(){
      if(this.usuario.cedula){
        this.inputs.cedula = this.usuario.cedula;
        this.inputs.primer_nombre = this.usuario.primer_nombre;
        this.inputs.segundo_nombre = this.usuario.segundo_nombre;
        this.inputs.primer_apellido = this.usuario.primer_apellido;
        this.inputs.segundo_apellido = this.usuario.segundo_apellido;
        this.inputs.correo = this.usuario.correo;
        this.inputs.telefono = this.usuario.telefono;
        this.inputs.rol = this.usuario.rol==='Entrenador'? 'e':'a';
        this.inputs.fecha_nacimiento = this.usuario.fecha_nacimiento;
      }
    },
    methods: {
      //funcion encargada de guardar la fecha (cierra el calendario luego de elegida la fecha)
      guardar (fecha) {
        this.$refs.menu[0].save(fecha);
      },
      //funcion encargada de convertir la fecha elegida al formato DD/MM/TTTT
      formatoFecha (fecha) {
        if (!fecha) return null
        const [year, mes, dia] = fecha.split('-')
        return `${dia}/${mes}/${year}`
      },
      /*
        funcion encargada de decirle al componente entrenadores que se debe cerrar el modal que
        contiene el form de registro de usuarios y de emitir el evento para mostrar mensaje de operacion
        en caso de que exista
      */
      // :estatus_operacion (true = exitosa, false = fallida)
      // :mensaje_operacion (mensaje a mostrar segun el tipo de operación y su estatus)
      cerrarForm({estatus_operacion, mensaje_operacion}){
        
        //se reinicia la validación y se quita el mensaje de error en caso de que exista
        this.$refs.form.resetValidation();
        this.mensajeError = '';

        //se oculta el modal de confirmar registro para que se muestre de primero el formulario
        this.confirmar_registro = false;

        //ciclo que se encarga de limpiar todos los campos del formulario
        Object.keys(this.inputs).forEach(key => {
          this.inputs[key] = "";
        });

        this.$emit('cerrarForm', {estatus_operacion, mensaje_operacion});
      },
      //se encarga de mostrar el formulario de confirmación de registro
      mostrarConfirmacion(){
        this.$refs.form_clave.resetValidation();
        this.confirmar_registro = !this.confirmar_registro;
      },
      // función encargada de cerrar el modal de confirmacion de inserción
      cerrarConfirmacion(){
        this.modal = false;
        this.$refs.form_clave.resetValidation();
        this.inputs.clave='';
      },
      // submit del form para insertar nuevos usuarios
      async submit() {
        this.modal = false;
        if(this.$refs.form.validate()) {
          this.mensajeError = '';
          this.formCargando = true;
          /*
            se solicita al servidor la creacion del usuario con un POST, enviando los datos del usuario, si se recibe
            un 200 se redirecciona se muestra un mensaje de éxito ya que todo salio bien, sino se muestra un mensaje
            de error que especifica que sucedió
          */
          await axios
            .post(`${server_url}/entrenadores/`, this.inputs, { withCredentials: true })
            .then((res) => {
              if (res.data.codigo === 200) {
                //ciclo que se encarga de limpiar todos los campos del formulario
                Object.keys(this.inputs).forEach(key => {
                  this.inputs[key] = '';
                });
                this.mensajeExito = 'Usuario creado exitosamente!'
                //this.display_creacion_dialog= true;
                this.formCargando = false;
                //para cerrar el modal
                this.confirmar_registro = false;
                this.cerrarForm({estatus_operacion: true, mensaje_operacion: this.mensajeExito});
              }
              else{
                this.inputs.clave='';
                //se oculta el dialog de confirmar y se muestra el formulario con el mensaje de error
                this.confirmar_registro = false;
                this.mensajeError = res.data.texto;
                this.formCargando = false;
              }
            })
            .catch(() => {
              this.formCargando = false;
              this.mensajeError = 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.';
              //se oculta el dialog de confirmar y se muestra el formulario con el mensaje de error
              this.confirmar_registro = false;
            });
        }
      },
      //metodo para editar usuarios
      async editarUsuario(){
        this.modal = false;
        if(this.$refs.form.validate()) {
          this.mensajeError = '';
          this.formCargando = true;
          /*
            se solicita al servidor la ediciónn del usuario con un PUT, enviando los datos del usuario, si se recibe
            un 200 se muestra un mensaje de éxito ya que todo la operación fue exitosa, sino se muestra un mensaje
            de error que específica que sucedió
          */
          await axios
            .put(`${server_url}/entrenadores/${this.inputs.cedula}`, this.inputs, { withCredentials: true })
            .then((res) => {
              if (res.data.codigo === 200) {
                //ciclo que se encarga de limpiar todos los campos del formulario
                Object.keys(this.inputs).forEach(key => {
                  this.inputs[key] = '';
                });
                this.formCargando = false;
                this.mensajeExito = 'Usuario editado exitosamente!';
                this.cerrarForm({estatus_operacion: true, mensaje_operacion: this.mensajeExito});
              }
              else{
                this.formCargando = false;
                this.mensajeError = res.data.texto;
              }
              
            })
            .catch(() => {
              this.formCargando = false;
              this.mensajeError = 'Ha ocurrido un error inesperado en el servidor, por favor inténtalo de nuevo.';
            });
        }
      },
    },
  }
</script>