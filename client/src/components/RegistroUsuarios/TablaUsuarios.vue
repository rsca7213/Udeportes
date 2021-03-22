<template>
  <v-card class="px-1 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
    <v-card-title class="grey--text text--darken-2"> 
      Usuarios Registrados en el Sistema 
    </v-card-title>
    <v-container>
      <v-row align="center">
        <v-col cols="12" class="px-2">
          <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
          prepend-icon="mdi-magnify" type="text" v-model="search" name="busqueda"> </v-text-field>
        </v-col>
      </v-row>
      <RegistroUsuarios :dialog_editar="dialog_editar" :mensaje_form="titulo_form" :usuario="editar_usuario" @cerrarForm="cerrarForm"/>
      <v-data-table :headers="columnas_tabla" :items="usuarios" :search="search"
        no-results-text="No hay resultados para esta búsqueda."
        loading-text="Cargando datos..."
        locale="es-VE"
        fixed-header
        :loading="tablaCargando"
      >
        <template v-slot:item.fecha_nacimiento="{ item }"> 
          <span class="grey--text" v-if="!item.fecha_nacimiento"> N/A </span>
          <span v-else v-text="item.fecha_nacimiento"> </span>
        </template>
        <template v-slot:item.telefono="{ item }"> 
          <span class="grey--text" v-if="!item.telefono"> N/A </span>
          <span v-else v-text="item.telefono"> </span>
        </template>
        <template v-slot:item.acciones="{ item }">
          <div v-if="item.cedula!=usuario_sesion_cedula" class="d-flex flex-row">
            <EditarClave :cedula_usuario="item.cedula" :nombre_completo_usuario="item.nombre_completo" @editarClave="editarClave"/>
            <v-icon color="primary" dense @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <EliminarUsuario :cedula_usuario="item.cedula" :nombre_completo_usuario="item.nombre_completo" @eliminarUsuario="eliminarUsuario"/>
          </div>
          <div v-else>
            <span class="grey--text"> N/A </span>
          </div>
        </template>
      </v-data-table>
      <ExitoDialog v-if="exito_dialog" :props_exito_dialog="props_exito_dialog"/>
    </v-container>
  </v-card>
</template>

<script>
import RegistroUsuarios from './RegistroUsuarios';
import ExitoDialog from './ExitoDialog';
import EditarClave from './EditarClave';
import EliminarUsuario from './EliminarUsuario';
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'TablaUsuarios',
  components: {
    RegistroUsuarios,
    ExitoDialog,
    EditarClave,
    EliminarUsuario
  },
  data() {
    return {
      // manejadores de UI
      tablaCargando: true,
      // variable encargada de mostrar el componente edición en un dialog para crear o editar usuarios
      dialog_editar: false,
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
      //variable para saber el titulo del form
      flag_editar: -1,
      //variable encargada de mostrar el estado de las confirmaciones exitosas
      exito_dialog: false,
      //estado de la operación y mensaje a mostrar en el dialog de éxito
      props_exito_dialog: {estatus_operacion: false, mensaje_exito: ''},
      //datos del usuario a editar
      editar_usuario: {},
      //cédula del usuario que se encuentra logeado en el sistema
      usuario_sesion_cedula: '',
      //titulo formulario de registro/edicion
      titulo_form: 'Registrar Usuario'
    }
  },
  methods: {
    editItem (item) {
      this.titulo_form='Editar Usuario';
      this.editar_usuario = Object.assign({}, item);
      this.dialog_editar = true;
    },

    //método que se ejecuta cuando se obtiene una respuesta del componente EditarClave
    editarClave(evento){
      //se muestra el diálogo de éxito con su respectivo mensaje
      this.exito_dialog = true;
      this.props_exito_dialog = evento;
    },
    //método que se ejecuta cuando se obtiene una respuesta del componente EliminarUsuario
    eliminarUsuario(evento){
      this.obtenerEntrenadores();
      //se muestra el diálogo de éxito con su respectivo mensaje
      this.exito_dialog = true;
      this.props_exito_dialog = evento;
    },
    //luego de que se cierra el formulario de registro se limpian los datos del registro
    cerrarForm(evento){
      this.titulo_form = 'Registrar Usuario';
      this.editar_usuario = {};
      this.dialog_editar=false;
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
  async mounted(){

    //se obtienen todos los usuarios cuando se inicia el componente
    this.obtenerEntrenadores();

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
