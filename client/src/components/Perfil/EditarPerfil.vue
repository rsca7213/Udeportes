<template>
  <div>
    <v-container class="px-0">
      <v-row align="start">
        <v-col cols="12" class="px-0"> 
          <v-card color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="pl-8 pb-0 grey--text text--darken-2">
              Editar Perfil
            </v-card-title>
            <div>
              <v-card-subtitle class="pb-0 pt-3 pl-8 grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start">
                <span>Los campos que contienen un <span class="red--text">"*"</span> son obligatorios</span>
              </v-card-subtitle>
              <div v-if="mensaje_error" class="">
                <v-col class="error--text px-4"> 
                  <div class="ml-4">
                    <v-alert text color="error" dense>
                      <v-icon color="error"> mdi-alert </v-icon>
                      <span v-text="mensaje_error" class="ml-1"> </span>
                    </v-alert>
                  </div>
                </v-col>
              </div>
              <v-form ref="form">
                <v-container class="px-md-4">
                  <v-row class="px-0">
                    <v-col cols=12 :sm="(item.nombre === 'Correo')? 12:6" v-for="item in datos_usuario" :key="item.cedula">
                      <v-text-field v-if="item.nombre && item.nombre != 'Fecha de Nacimiento'"
                      :name="item.variable_asociada" v-model.trim="inputs[item.variable_asociada]" class="px-4"
                      clear-icon="mdi-close" clearable :counter="item.longitud" 
                      :label="item.requerido? item.nombre+' *':item.nombre" :disabled="(item.variable_asociada==='cedula' || item.variable_asociada==='rol')? true:false"
                      :prepend-icon="item.icono" type="text" validate-on-blur :rules="reglas[item.validacion]" :placeholder="item.placeholder"> </v-text-field>     
                      <!--<v-select v-else-if="item.nombre === 'Rol'" :name="item.variable_asociada" v-model="inputs.rol" class="px-4 mt-4" prepend-icon="mdi-account-tie" :items="roles" item-text="nombre" item-value="valor" :label="item.requerido? item.nombre+' *':item.nombre" dense validate-on-blur :rules="reglas[item.validacion]" :disabled="true"></v-select>-->
                      <v-menu v-else-if="item.nombre === 'Fecha de Nacimiento'" ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field :name="item.variable_asociada" v-model="inputs.fecha_nacimiento" class="px-4" clear-icon="mdi-close" clearable :counter="item.longitud" :label="item.nombre" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" validate-on-blur :rules="reglas[item.validacion]" @click:clear="fecha=''"></v-text-field>
                        </template>
                        <v-date-picker color="primary" ref="picker" v-model="fecha" no-title scrollable @change="guardar" locale="es-419"></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
              <v-card-actions class="mt-4 d-flex justify-end">
                <EditarClavePerfil :cedula_usuario="inputs.cedula" @editarClave="editarClave"/>
                <v-btn color="secondary" class="mr-2 mb-2" :disabled="!credenciales_validas" :loading="form_cargando" @click="editarPerfil()">
                  <v-icon left> mdi-check-circle </v-icon>
                  Editar
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <ExitoDialog v-if="exito_dialog" :props_exito_dialog="props_exito_dialog"/>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios';
const server_url = sessionStorage.getItem('SERVER_URL');
import ExitoDialog from '../RegistroUsuarios/ExitoDialog';
import EditarClavePerfil from './EditarClavePerfil';
export default {
  name: 'EditarPerfil',
  components: {
    ExitoDialog,
    EditarClavePerfil
  },

  data() {
    return {
      // se muestra el componente Cargador si cargando es true
      form_cargando: false,
      //variable de control para saber si todos los datos del usuario a crear son validos
      credenciales_validas: false,
      //variable para saber si la clave es válida
      clave_valida: false,
      //variable para saber si los datos del usuario son válidos
      datos_validos: false,
      //variable que se encarga de mostrar el menu de la fecha
      menu: false,
      //valor inicial de la fecha
      fecha: null,
      // mensaje de error al hacer submit y recibir errores del servidor
      mensaje_error: '',
      //mensaje que se muestra informando el error en caso de que exista
      mensaje_exito: '',
      //variable para mostrar mensaje de exito en caso de que ocurra
      exito_dialog: false,
      //estado de la operación y mensaje a mostrar en el dialog de éxito
      props_exito_dialog: {estatus_operacion: false, mensaje_exito: ''},
      //informacion de todos los campos de texto del formulario,
      datos_usuario: [
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
      //nombre y valores del select para el rol
      roles: [
        {
          nombre: 'Administrador', valor: 'a'
        },
        {
          nombre: 'Entrenador', valor: 'e'
        },
      ],
      //reglas de validación de los campos de los formularios de registro y actualización de usuarios
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
          v => (v && v.trim()!=='') || 'Este campo es obligatorio',
          v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ],
        reglasSegundoNombre: [
          v => !v || (v.length <= 50) || 'Este campo debe contener como máximo 50 caracteres',
        ],
        reglasTelefono: [
          v => ((v && v.length == 13) || !v) || 'El teléfono debe tener 13 caracteres.',
          v => ((v && (/^[+]\d{1,12}$/.test(v))) || !v) || 'Debe ser un teléfono válido.'
        ],
        reglasFecha: [
          v => !v || (v.length <= 10) || 'La fecha debe contener como máximo 10 caracteres.'
        ],
      },
    }
  },
  watch:{
    //Función encargada de observar si se ha hecho click en el menu para abrir el calendario
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
          this.credenciales_validas = false;
          revisar = true;
        } 
      });

      //se revisa si se cumplen las reglas de la cedula
      this.reglas.reglasCedula.forEach(cedulaValidator => {
        if(cedulaValidator(this.inputs.cedula) !== true){
          this.credenciales_validas = false;
          revisar = true;
        }  
      });

      //se revisa si se cumplen las reglas del telefono
      this.reglas.reglasTelefono.forEach(telefonoValidator => {
        if(telefonoValidator(this.inputs.telefono) !== true){
          this.credenciales_validas = false;
          revisar = true;
        }  
      });

      //se revisa si se cumplen las reglas del primer nombre, primer apellido y segundo apellido
      this.reglas.reglasNombre.forEach(nombreValidator => {
        if(nombreValidator(this.inputs.primer_nombre) !== true){
          this.credenciales_validas = false;
          revisar = true;
        } 
        if(nombreValidator(this.inputs.primer_apellido) !== true){
          this.credenciales_validas = false;
          revisar = true;
        } 
        if(nombreValidator(this.inputs.segundo_apellido) !== true){
          this.credenciales_validas = false;
          revisar = true;
        }        
      });

      //se revisa si se cumplen las reglas del segundo nombre
      this.reglas.reglasSegundoNombre.forEach(segundoNombreValidator => {
        if(segundoNombreValidator(this.inputs.segundo_nombre) !== true){
          this.credenciales_validas = false;
          revisar = true;
        }  
      });

      //se revisa si se cumplen las reglas de la fecha
      this.reglas.reglasFecha.forEach(fechaValidator => {
        //if(this.fecha === null) this.fecha = '';
        if(fechaValidator(this.inputs.fecha_nacimiento) !== true){
          this.credenciales_validas = false;
          revisar = true;
        }      
      });

      //si se cumplen todas las reglas entonces se permite agregar el usuario
      if(revisar === false){
        this.credenciales_validas = true;
      }
    },
    //Cuando cambia la clave se llama esta funcion automaticamente
    datos_clave: function(){
      //variable de control para saber si se cumplen las reglas de validacion
      let revisar = false;

      //se revisa si se cumplen las reglas de la clave
      this.reglas.reglasClave.forEach(claveValidator => {
      if(this.inputs.clave === null) this.inputs.clave = '';
        if(claveValidator(this.inputs.clave) !== true){
          this.clave_valida = false;
          revisar = true;
        }        
      });

      if(revisar === false){
        this.clave_valida = true;
      }
    },
  },
  computed: {
    //método que retorna los datos que serán observados por el watcher(datos)
    datos() {
      return `${this.inputs.primer_nombre}|${this.inputs.segundo_nombre}|
      ${this.inputs.primer_apellido}|${this.inputs.segundo_apellido}|
      ${this.inputs.telefono}|${this.fecha}|${this.inputs.correo}`;
    },
    //metodo que retorna la clave que será observada por el watcher(datos_clave)
    datos_clave() {
      return `${this.inputs.clave}`;
    },
  },
  methods: {
    //función encargada de guardar la fecha (cierra el calendario luego de elegida la fecha)
    guardar (fecha) {
      this.$refs.menu[0].save(fecha);
    },
    //funcion encargada de convertir la fecha elegida al formato DD/MM/TTTT
    formatoFecha (fecha) {
      if (!fecha) return null
      const [year, mes, dia] = fecha.split('-')
      return `${dia}/${mes}/${year}`
    },
    //método que se ejecuta cuando se obtiene una respuesta del componente EditarClave
    editarClave(evento){
      //se muestra el diálogo de éxito con su respectivo mensaje
      this.exito_dialog = true;
      this.props_exito_dialog = evento;
    },
    //método para editar usuarios
    async editarPerfil(){
      if(this.$refs.form.validate()) {
        this.mensaje_error = '';
        this.form_cargando = true;
        /*
          se solicita al servidor la ediciónn del usuario con un PUT, enviando los datos del usuario, si se recibe
          un 200 se muestra un mensaje de éxito ya que todo la operación fue exitosa, sino se muestra un mensaje
          de error que específica que sucedió
        */
        await axios
          .put(`${server_url}/entrenadores/perfil/${this.inputs.cedula}`, this.inputs, { withCredentials: true })
          .then((res) => {
            if (res.data.codigo === 200) {
              this.form_cargando = false;
              
              /*
                Se agrega la key edit al sesión storage para mostrar el snackbar de éxito luego de 
                editar la información del usuario y recargar la página
              */
              sessionStorage.edit = true;
              this.$router.go();
              
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
  },
  //Se cargan los datos del usuario para rellenar el formulario con dichos datos
  async mounted(){
    /*
      se busca la informacion completa del usuario
    */
    await axios
    .get(`${server_url}/perfil?data=completa`, { withCredentials: true })
    .then((res) => {
      if (res.status === 200) 
        this.inputs = res.data.usuario;
        this.inputs.rol = (this.inputs.rol === 'a')? 'Administrador' : 'Entrenador';
    })
    .catch(() => { });

    /*
      Para actualizar el nombre del usuario en el navbar se utiliza sessionStorage
      y en caso de que la key edit sea igual a true entonces se muestra el snackbar de
      éxito y por último se remueve la key del sessionStorage
    */ 
    if (sessionStorage.edit){
      this.mensaje_exito = '¡Información editada exitosamente!';
      let datos_exito_dialog = {estatus_operacion : true, mensaje_operacion : this.mensaje_exito};
      this.props_exito_dialog = datos_exito_dialog;
      this.exito_dialog = true;
      sessionStorage.removeItem('edit');
    }
  }
}
</script>

<style>

</style>