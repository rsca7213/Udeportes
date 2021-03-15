<template>
  <div>
    <v-container v-if="!cargando">
      <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
        <v-card-title class="grey--text text--darken-2"> 
          Usuarios Registrados en el Sistema 
        </v-card-title>
        <v-container>
          <v-row align="center">
            <v-col cols="12">
              <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
              prepend-icon="mdi-magnify" type="text" v-model="search" name="busqueda"> </v-text-field>
            </v-col>
          </v-row>
          <v-data-table :headers="columnas_tabla" :items="usuarios" :search="search"
            no-results-text="No hay resultados para esta búsqueda."
            loading-text="Cargando datos..."
            locale="es-VE"
            fixed-header
          >
          <template v-slot:top>
            <v-dialog v-model="dialog_registro" persistent max-width="800px">
              <template v-slot:activator="{ on, attrs }">
                <div class="d-flex justify-end">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                    <v-icon left> mdi-plus-circle </v-icon>
                    Registrar Usuarios
                  </v-btn>
                </div>
              </template>
              <Registro :mensaje_form="formTitle" :usuario="editar_usuario" @cerrarForm="cerrarForm" :cedula_usuario="cedula_usuario"/>
            </v-dialog>   
            <v-dialog v-model="dialogDelete" persistent max-width="600px" class="text-center">
              <v-card rounded="md">
                <v-card-title>
                  Eliminar Usuario
                  <v-spacer> </v-spacer>
                  <v-btn icon @click="dialogDelete = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title> 
                <v-alert text color="error" dense v-if="false">
                  <v-icon color="error"> mdi-alert </v-icon>
                  <span v-text="mensajeError" class="ml-1"> </span>
                </v-alert>
                <v-card-text class="text-subtitle-1">
                  <b class="error--text"> ¿Está seguro que desea eliminar al usuario? </b>
                  <br>
                  <span class="error--text"> Al eliminar al usuario se eliminarán todos sus datos del sistema. </span>
                  <br>
                  <b> Nro. Cédula: </b> <span v-text="editar_usuario.cedula"> </span>
                  <br>
                  <b> Nombre Completo: </b> <span v-text="editar_usuario.nombre_completo"> </span>
                </v-card-text>
                <v-card-actions> 
                  <v-spacer></v-spacer>
                  <v-btn color="grey darken-1" dark @click="closeDelete">
                    <v-icon left> mdi-close </v-icon>
                    Cancelar
                  </v-btn>
                  <v-btn color="error" @click="deleteItemConfirm">
                    <v-icon left> mdi-delete </v-icon>
                    Eliminar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
          <template v-slot:item.acciones="{ item }">
            <div v-if="item.cedula!=usuario_sesion_cedula" class="d-flex flex-row">
              <!--<v-icon color="orange" dense @click="editarClave(item)">
                mdi-key-variant
              </v-icon>-->
              <EditarClave :cedula_usuario="item.cedula" :nombre_completo_usuario="item.nombre_completo" @editarClave="editarClave"/>
              <v-icon color="primary" dense @click="editItem(item)">
                mdi-pencil
              </v-icon>
              <v-icon dense color="error" @click="deleteItem(item)">
                mdi-delete
              </v-icon>
            </div>
          </template>
          </v-data-table>
          <ExitoDialog v-if="exito_dialog" :props_exito_dialog="props_exito_dialog"/>
        </v-container>
      </v-card>
    </v-container>
    <Cargador v-else/>
  </div>
</template>

<script>
import Registro from '../components/RegistroUsuarios/Registro';
import Cargador from '../components/Cargador';
import ExitoDialog from '../components/RegistroUsuarios/ExitoDialog';
import EditarClave from '../components/RegistroUsuarios/EditarClave';
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'Entrenadores',
  components: {
    Registro,
    Cargador,
    ExitoDialog,
    EditarClave
  },
  data() {
    return {
      // se muestra el componente Cargador si cargando es true
      cargando: true,
      // variable encargada de mostrar el componente registro en un dialog para crear o editar usuarios
      dialog_registro: false,
      // variable encargada de mostrar el dialog para eliminar usuarios
      dialogDelete: false,
      // variable encargada de buscar lo que se inserte en el campo busqueda
      search: '',
      columnas_tabla: [
        {
          text: 'Nro. Cédula',
          align: 'end',
          sortable: true,
          filterable: true,
          value: 'cedula',
          class: 'primary--text font-weight-bold'
        },
        { 
          text: 'Nombre Completo',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'nombre_completo',
          class: 'primary--text font-weight-bold'
        },
        { 
          text: 'Rol', 
          value: 'rol',
          align: 'left',
          sortable: true,
          filterable: true,
          class: 'primary--text font-weight-bold'},
        { 
          text: 'Correo', 
          value: 'correo',
          align: 'left',
          sortable: true,
          filterable: true,
          class: 'primary--text font-weight-bold'
        },
        { 
          text: 'Fecha de Nacimiento',
          sortable: false,
          value: 'fecha_nacimiento',
          class: 'primary--text font-weight-bold',
          align: 'center',
        },
        { 
          text: 'Teléfono',
          value: 'telefono',
          sortable: false,
          class: 'primary--text font-weight-bold',
          align: 'center',
        },
        {
          text: 'Acciones',
          align: 'center',
          sortable: false,
          filterable: false,
          value: 'acciones',
          class: 'primary--text font-weight-bold',
          width: '95'
        },
      ],
      usuarios: [],
      editedIndex: -1,
      //variable encargada de mostrar el estado de las confirmaciones exitosas
      exito_dialog: false,
      //estado de la operación y mensaje a mostrar en el dialog de éxito
      props_exito_dialog: {estatus_operacion: false, mensaje_exito: ''},
      //variable con la cédula del usuario a editar
      cedula_usuario: '',
      //datos del usuario a editar
      editar_usuario: {},
      //cédula del usuario que se encuentra logeado en el sistema
      usuario_sesion_cedula: '',
    }
  },
  computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Registrar Usuario' : 'Editar Usuario'
      },
    },
  watch: {
    /*dialog (val) {
      val || this.close()
    },*/
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  methods: {
    editItem (item) {
      this.editedIndex = this.usuarios.indexOf(item);
      this.editar_usuario = Object.assign({}, item);
      this.cedula_usuario = this.editar_usuario.cedula;
      this.dialog = true;
    },

    deleteItem (item) {
      this.editedIndex = this.usuarios.indexOf(item)
      //this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      this.usuarios.splice(this.editedIndex, 1)
      this.closeDelete()
    },

    /*close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },*/
    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    //método que se ejecuta cuando se obtiene una respuesta del componente EditarClave
    editarClave(evento){
      //se muestra el dialogo de éxito con su respectivo mensaje
      this.exito_dialog = true;
      this.props_exito_dialog = evento;
    },

    cerrarForm(evento){
      this.editar_usuario = {};
      this.cedula_usuario = '';
      this.dialog_registro=false;

      if(evento.estatus_operacion != null){
        this.obtenerEntrenadores();
        this.exito_dialog = true;
        this.props_exito_dialog = evento;
      }
    },
      /*
      Función que hace un request GET para obtener los datos de
      todos los entrenadores del sistema para colocarlos en la tabla
      Se llama en mounted y cuando los componentes CRUD emiten eventos
    */
    async obtenerEntrenadores() {
      this.tablaCargando = true;
      // request GET
      await axios.get(`${server_url}/entrenadores/`, { withCredentials: true })
      .then((res) => {
        // Si el codigo es de exito se rellena la tabla
        if (res.data.codigo === 200) {
        this.usuarios = res.data.usuarios;
          //ciclo que se encarga de cambiar el formato del rol y la fecha
          this.usuarios.forEach(usuario =>{
            //se agrega el nombre completo al usuario para visualizarlo en la tabla como un solo dato
            usuario['nombre_completo'] = `${usuario['primer_nombre']} ${(usuario['segundo_nombre'])? usuario['segundo_nombre']:''} ${usuario['primer_apellido']} ${usuario['segundo_apellido']}`
          });
        }
      })
      .catch((error) => {
        try {
          // Error por parte del servidor
          console.log(error.response.status);
          if (error.response.status === 428) this.$router.push('/init');
          else this.$router.push('/login');         
        }
        catch {
          // Servidor inalcanzable
          console.warn('Warning: No response status was found, is the server running? ');
        }
      });
      this.tablaCargando = false;
    }
  },
 
  /*
    al iniciar el componente se chequea que el usuario se encuentre iniciado sesión y que sea administrador
    en caso positivo, se redirecciona a Entrenadores, sino se muestra el componente para iniciar sesión
  */
  async mounted() {
      await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
      .then((res) => {
        // si el usuario es admin y ha iniciado sesión
        if (res.status === 200) {
          this.cargando = false;
          //en caso de que se pasen todas las validaciones se llaman a todos los usuarios del sistema
          this.obtenerEntrenadores();
        }
      })
      .catch((err) => {
        try {
          // no hay config inicial
          if (err.response.status === 428) this.$router.push('/init');
          // usuario no ha iniciado sesión
          else if (err.response.status === 401) this.$router.push('/login');
          // si el usuario ha iniciado sesión pero no es admin
          else {
            this.$router.push('/');
          }
        }
        catch { 
          console.warn('Warning: No response status was found, is the server running? ');
        }
      })

      /*
        se busca la cédula del usuario para que las acciones de la tabla no se puedan realizar
        sobre el directamente, ya que el usuario debe actualizar sus datos en editar perfil
      */
      await axios
      .get(`${server_url}/perfil?data=cedula`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) 
          this.usuario_sesion_cedula = res.data;
      })
      .catch(() => { });
  }
}
</script>

<style >
.v-data-table-header th{
  white-space: nowrap;
}
</style>