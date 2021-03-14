<template>
  <div>
    <v-container v-if="!cargando">
      <h1 class="display-1 text-center mt-2">Gestión de Entrenadores</h1>
      <div v-if="!registrar" class="mt-8">
        <v-card>
          <v-data-table :headers="headers" :items="usuarios" sort-by="cedula" class="elevation-4" :search="search">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Usuarios</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar" single-line hide-details></v-text-field>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" persistent max-width="900px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">Agregar Usuario</v-btn>
                </template>
                <Registro :mensaje_form="formTitle" :usuario="editar_usuario" @cerrarForm="cerrarForm"/>
              </v-dialog>   
              <v-dialog v-model="dialogDelete" persistent max-width="400px">
                <v-card>
                  <v-card-title class="headline text-center">¿Deseas eliminar este usuario?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red" dark @click="closeDelete">Cancelar</v-btn>
                    <v-btn color="primary" @click="deleteItemConfirm">Aceptar</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2">
              mdi-key-variant
            </v-icon>
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
          </v-data-table>
          <ExitoDialog v-if="exito_dialog" :props_exito_dialog="props_exito_dialog"/>
        </v-card>
      </div>
    </v-container>
    <Cargador v-else/>
  </div>
</template>

<script>
import Registro from '../components/RegistroUsuarios/Registro';
import Cargador from '../components/Cargador';
import ExitoDialog from '../components/RegistroUsuarios/ExitoDialog';
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'Entrenadores',
  components: {
    Registro,
    Cargador,
    ExitoDialog,
  },
  data() {
    return {
      //variable encargada de mostrar/ocultar el formulario para insertar usuarios
      registrar: false,
      // se muestra el componente Cargador si cargando es true
      cargando: true,
      // variable encargada de mostrar el componente registro en un dialog para crear o editar usuarios
      dialog: false,
      // variable encargada de mostrar el dialog para eliminar usuarios
      dialogDelete: false,
      // variable encargada de buscar lo que se inserte en el campo busqueda
      search: '',
      headers: [
        {
          text: 'Cédula',
          align: 'start',
          value: 'cedula',
          class: 'body-2 primary--text',
        },
        { text: 'Nombre Completo', value: `nombre_completo`, class: 'body-2 primary--text', },
        { text: 'Rol', value: 'rol', class: 'body-2 primary--text',},
        { text: 'Correo', value: 'correo', class: 'body-2 primary--text',},
        { text: 'Fecha de Nacimiento', sortable: false, value: 'fecha_nacimiento', class: 'body-2 primary--text',},
        { text: 'Teléfono', value: 'telefono', sortable: false, class: 'body-2 primary--text',},
        { text: 'Acciones', value: 'actions', sortable: false , class: 'body-2 primary--text',},
      ],
      usuarios: [],
      editar_usuario: {},
      editedIndex: -1,
      editedItem: {
        name: '',
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
      },
      defaultItem: {
        name: '',
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
      },
      exito_dialog: false,
      props_exito_dialog: {estatus_operacion: false, mensaje_exito: ''},
    }
  },
  computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Registrar Usuario' : 'Editar Usuario'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },

    methods: {
      editItem (item) {
        this.editedIndex = this.usuarios.indexOf(item);
        this.editar_usuario = Object.assign({}, item);
        this.editedItem = Object.assign({}, item);
        this.dialog = true;
      },

      deleteItem (item) {
        this.editedIndex = this.usuarios.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        this.usuarios.splice(this.editedIndex, 1)
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.usuarios[this.editedIndex], this.editedItem)
        } else {
          this.usuarios.push(this.editedItem)
        }
        this.close()
      },

      cerrarForm(evento){
        this.editar_usuario = {};
        this.dialog=false;

        if(evento.estatus_operacion != null){
          this.exito_dialog = true;
          this.props_exito_dialog = evento;
        }
      }
    },
    updated(){
      //his.editar_usuario = {a:'a'};
    },
  // al iniciar el componente se chequea que el usuario se encuentre iniciado sesión
  // en caso positivo, se redirecciona a Entrenadores, sino se muestra el componente para iniciar sesión
  async mounted() {
    await axios
      .get(`${server_url}/auth/login`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          this.cargando = false;
          //en caso de que se pasen todas las validaciones se llaman a todos los usuarios del sistema
          axios.get(`${server_url}/entrenadores/list`, { withCredentials: true })
          .then((res) => {
            if (res.data.codigo === 200){
              this.usuarios = res.data.usuarios;
              //ciclo que se encarga de cambiar el formato del rol y la fecha
              this.usuarios.forEach(usuario =>{
                Object.keys(usuario).forEach(key => {
                  if(key === 'rol'){
                    if(usuario[key] === 'a') usuario[key] = 'Administrador';
                    else usuario[key] = 'Entrenador';
                  }
                  else if(usuario['fecha_nacimiento'] && key === 'fecha_nacimiento'){
                    usuario['fecha_nacimiento'] = usuario['fecha_nacimiento'].slice(0, 10);
                    usuario['fecha_nacimiento'] = `${usuario['fecha_nacimiento'].slice(-2)}/${usuario['fecha_nacimiento'].slice(5, 7)}/${usuario['fecha_nacimiento'].slice(0, 4)}`;
                  }
                });
                //se agrega el nombre completo al usuario para visualizarlo en la tabla como un solo dato
                usuario['nombre_completo'] = `${usuario['primer_nombre']} ${(usuario['segundo_nombre'])? usuario['segundo_nombre']:''} ${usuario['primer_apellido']} ${usuario['segundo_apellido']}`
              });
            }
          }).catch((error) => {
              if (error.response.status === 428) this.$router.push('/init');
              else this.$router.push('/login');
          });
        }
      })
      .catch((error) => {
        if (error.response.status === 428) this.$router.push('/init');
        else this.$router.push('/login');
      });
  }
}
</script>

<style >
.v-data-table-header th{
  white-space: nowrap;
}
</style>