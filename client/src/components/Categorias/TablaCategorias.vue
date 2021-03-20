<template>
    <v-container>
        <v-card class="px-1 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Categorías de {{deporte.nombre}}  
            </v-card-title>
            <v-container>
                <v-row align="center">
                    <v-col cols="12">
                    <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
                    prepend-icon="mdi-magnify" type="text" v-model="search" name="busqueda"> </v-text-field>
                    </v-col>
                </v-row>
                <v-row class="d-none d-md-flex">
                    <v-col cols="12" class="text-right">
                        <v-btn color="primary" dark @click="crearCategoria = true"> 
                            <v-icon left> mdi-plus-circle </v-icon>
                            Crear Categoría
                        </v-btn>
                        <v-btn class="ml-3" color="indigo" dark @click="asignacion = true"> 
                            <v-icon left> mdi-whistle </v-icon>
                            Asignar Entrenador
                        </v-btn>
                        <v-btn class="ml-3" color="red" dark @click="destitucion = true"> 
                            <v-icon left> mdi-delete </v-icon>
                            Destituir Entrenador
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row class="d-flex d-md-none">
                    <v-col class="text-center" cols="12">
                        <v-btn color="primary" dark @click="crearCategoria = true"> 
                            <v-icon left> mdi-plus-circle </v-icon>
                            Crear Categoría
                        </v-btn>
                    </v-col>
                    <v-col class="text-center" cols="12">
                        <v-btn class="ml-3" color="indigo" dark @click="asignacion = true"> 
                            <v-icon left> mdi-whistle </v-icon>
                            Asignar Entrenador
                        </v-btn>
                    </v-col>
                    <v-col class="text-center" cols="12">
                        <v-btn class="ml-3" color="red" dark @click="destitucion = true"> 
                            <v-icon left> mdi-delete </v-icon>
                            Destituir Entrenador
                        </v-btn>
                    </v-col>
                </v-row>
                <v-data-table class="mt-5" :headers="columnas_tabla" :items="categorias" :search="search"
                    no-data-text="No hay categorias para este deporte."
                    no-results-text="No hay resultados para esta búsqueda."
                    loading-text="Cargando datos..."
                    locale="es-VE"
                    fixed-header
                    :loading="tablaCargando"
                >
                    <template v-slot:item.acciones="{ item }">
                        <v-icon dense color="primary" @click="ver_Categoria(item, 'editar')"> mdi-pencil </v-icon>
                        <v-icon dense color="red" @click="ver_Categoria(item, 'eliminar')"> mdi-delete </v-icon>
                    </template>
                </v-data-table>
            </v-container>
        </v-card>

        <!-- Dialog para crear una categoría -->
        <v-dialog v-model="crearCategoria" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Crear Categoría
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="crearCategoria = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
                    <span>Los campos que contienen un 
                    <span class="red--text">"*"</span> 
                    son obligatorios</span> 
                </v-card-subtitle>
                <v-form ref="crearForm" @submit.prevent="crear_Categoria()">
                    <v-container class="px-md-4">
                        <v-text-field clear-icon="mdi-close" clearable counter="50" label="Nombre Categoria *"
                        prepend-icon="mdi-account-edit-outline" type="text" :rules="reglasNombre"
                        validate-on-blur v-model="categoriaCrear.nombre" name="nombre"> </v-text-field>
                        <v-radio-group v-model="categoriaCrear.genero" row prepend-icon="mdi-human-male-female" 
                        name="genero" mandatory label="*">
                            <v-radio label="Masculino" value="m"> </v-radio>
                            <v-radio label="Femenino" value="f"> </v-radio>
                            <v-radio label="Unisex" value="u"> </v-radio>
                        </v-radio-group>
                        <v-btn color="secondary" block type="submit">
                            <v-icon left> mdi-check-circle </v-icon>
                            crear
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para editar una categoría -->
        <v-dialog v-model="editarCategoria" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Editar Categoría
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="editarCategoria = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
                    <span>Los campos que contienen un 
                    <span class="red--text">"*"</span> 
                    son obligatorios</span> 
                </v-card-subtitle>
                <v-form ref="editForm" @submit.prevent="editar_Categoria()">
                    <v-container class="px-md-4">
                        <v-text-field clear-icon="mdi-close" clearable counter="50" label="Nombre Categoria *"
                        prepend-icon="mdi-account-edit-outline" type="text" :rules="reglasNombre"
                        validate-on-blur v-model="categoria.nombre" name="nombre"> </v-text-field>
                        <v-radio-group v-model="categoria.genero" row prepend-icon="mdi-human-male-female" 
                        name="genero" mandatory label="*">
                            <v-radio label="Masculino" value="m"> </v-radio>
                            <v-radio label="Femenino" value="f"> </v-radio>
                            <v-radio label="Unisex" value="u"> </v-radio>
                        </v-radio-group>
                        <v-btn color="secondary" block type="submit">
                            <v-icon left> mdi-check-circle </v-icon>
                            guardar
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para eliminar una categoría -->
        <v-dialog v-model="eliminarCategoria" class="text-center" max-width="600">
            <v-card rounded="md">
                <v-card-title>
                    Eliminar Categoría
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="eliminarCategoria = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title> 
                <v-card-text class="text-subtitle-1">
                    <b class="error--text"> ¿Está seguro que desea eliminar esta categoría? </b>
                    <br>
                    <span class="error--text"> Al eliminar la categoría se eliminarán todos sus datos del sistema, como sus entrenamientos y competencias. </span>
                    <br>
                    <b> Nombre del deporte: </b> {{deporte.nombre}}
                    <br>
                    <b> Nombre de la categoría: </b> {{categoria.nombre}}
                </v-card-text>
                <v-card-actions> 
                    <v-spacer></v-spacer>
                    <v-btn color="grey darken-1" dark @click="eliminarCategoria = false">
                        <v-icon left> mdi-close </v-icon>
                        Cerrar
                    </v-btn>
                    <v-btn color="error" @click="eliminar_Categoria()">
                        <v-icon left> mdi-delete </v-icon>
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog para asignar entrenadores -->
        <v-dialog v-model="asignacion" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Asignar entrenador
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="cerrar('asignar')"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text  class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start">
                    Escoge una categoría y el entrenador que desea asignar.
                </v-card-text>
                <v-form ref="asignarForm" @submit.prevent="asignar()">
                    <v-container class="px-md-4">
                        <v-col>
                            <v-select v-model="categoria" label="Categoría" prepend-icon="mdi-clipboard-text"
                            clear-icon="mdi-close" name="categoria" :items="categoriasNoAsignadas"
                            no-data-text="No hay categorias disponibles">
                            </v-select>
                            <v-select v-model="entrenador" label="Entrenadores" prepend-icon="mdi-whistle"
                            clear-icon="mdi-close" name="entrenadores" :items="entrenadoresSelect"
                            no-data-text="No existen entrenadores en el sistema">
                            </v-select>
                        </v-col>
                        <br>
                        <v-btn disabled color="secondary" block type="submit" v-if="categoria.id_categoria == null || entrenador.cedula == null">
                            <v-icon left> mdi-check-circle </v-icon>
                            asignar
                        </v-btn>
                        <v-btn color="secondary" block type="submit" v-else>
                            <v-icon left> mdi-check-circle </v-icon>
                            asignar
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para destituir entrenadores -->
        <v-dialog v-model="destitucion" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Destituir entrenador
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="cerrar('destituir')"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text  class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start">
                    Escoge el entrenador junto con la categoría de la cual lo va a destituir de su cargo.
                </v-card-text>
                <v-form ref="destituirForm" @submit.prevent="destituir()">
                    <v-container class="px-md-4">
                        <v-col>
                            <v-select v-model="entrenador" label="Entrenadores" prepend-icon="mdi-clipboard-text"
                            clear-icon="mdi-close" name="entrenadores" :items="entrenadoresSelect" @change="obtenerCategoriasEntrenador()"
                            no-data-text="No hay entrenadores disponibles">
                            </v-select>
                            <v-select v-model="categoria" label="Categoría" prepend-icon="mdi-clipboard-text"
                            clear-icon="mdi-close" name="categoria" :items="categoriasEntrenador"
                            no-data-text="No hay categorias disponibles" v-if="entrenador.cedula != null">
                            </v-select>
                        </v-col>
                        <br>
                        <v-btn disabled color="red" block type="submit" v-if="categoria.id_categoria == null || entrenador.cedula == null">
                            <v-icon left> mdi-delete </v-icon>
                            destituir
                        </v-btn>
                        <v-btn color="red" block type="submit" dark v-else>
                            <v-icon left> mdi-delete </v-icon>
                            destituir
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>
        
        <!-- Display de mensaje -->
        <v-snackbar v-model="display.show" timeout="3000" shaped top> 
            <v-icon v-if="display.type == 'success'" left color="secondary"> mdi-check-circle </v-icon>
            <v-icon v-else left color="red"> mdi-alert-circle </v-icon>
            <span :class="display.type == 'success' ? 'secondary--text':'red--text'">{{display.mensaje}}</span> 
            <template v-slot:action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="display.show = false">
                Cerrar
                </v-btn>
            </template>
        </v-snackbar>

    </v-container>
</template>

<script>
import axios from 'axios';

const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;

export default {
  name: 'TablaCategorias',
  data() {
    return {
        crearCategoria: false,
        editarCategoria: false, 
        eliminarCategoria: false,
        asignacion: false,
        destitucion: false,
        display: false,
        tablaCargando: true,
        search: '',
        categoriaCrear: {
            genero: 'm',
        },
        columnas_tabla: [
            { 
                text: 'Fecha de Registro', 
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'fecha_registro',
                class: 'primary--text font-weight-bold',
                width: '100'
            },
            {
                text: 'Nombre de Categoría',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'nombre',
                class: 'primary--text font-weight-bold'
            },
            { 
                text: 'Entrenador',
                align: 'center',
                sortable: false,
                value: 'entrenador',
                class: 'primary--text font-weight-bold'
            },
            { 
                text: 'Género',
                sortable: false,
                value: 'genero',
                class: 'primary--text font-weight-bold',
                align: 'center',
            },
            {
                text: 'Acciones',
                align: 'center',
                sortable: false,
                value: 'acciones',
                class: 'primary--text font-weight-bold',
            },
        ],
        categorias: [],
        categoriasEntrenador: [],
        categoriasNoAsignadas: [],
        categoria: {id_categoria: null},
        entrenadoresSelect: [],
        entrenador: {cedula: null},
        deporte: {},
        reglasNombre: [
            v => !!v || 'Este campo es obligatorio',
            v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ],
    }
  },
  methods: {
    async obtenerCategorias() {
        this.tablaCargando = true;
        // request GET
        await axios
        .get(`${server_url}/categorias/${this.$route.params.id_deporte}`, { withCredentials: true })
        .then((res) => {
            if (res.data.codigo === 200) {
                this.categorias = res.data.categorias;
                this.categoriasNoAsignadas = [];
                res.data.categoriasNoAsignadas.forEach(categoria => {
                    this.categoriasNoAsignadas.push({
                        text: categoria.nombre,
                        value: {
                            id_categoria: categoria.id
                        }
                    });
                });
            }
            this.categorias.forEach(categoria => {
                if (categoria.entrenador == null) {
                    categoria.entrenador = 'Sin asignar';
                }
            });
        })
        .catch((error) => {
            try {
            // Error por parte del servidor
            console.log(error.response.status);
            }
            catch {
            // Servidor inalcanzable
            console.warn('Warning: No response status was found, is the server running? ');
            }
        });
        this.tablaCargando = false;
    },
    async obtenerEntrenadores () {
        await axios
        .get(`${server_url}/categorias/`, { withCredentials: true })
        .then((res) => {
            if (res.data.codigo === 200) {
                this.entrenadoresSelect = [];
                res.data.entrenadores.forEach(entrenador => {
                    this.entrenadoresSelect.push({
                        text: entrenador.nombre,
                        value: {
                            cedula: entrenador.cedula
                        }
                    });
                });
            }
        })
    },
    async obtenerCategoriasEntrenador() {
        await axios
        .get(`${server_url}/categorias/${this.$route.params.id_deporte}/entrenador/${this.entrenador.cedula}`, { withCredentials: true })
        .then((res) => {
            this.categoriasEntrenador = [];
            if (res.data.codigo === 200) {
                res.data.categorias.forEach(categoria => {
                    this.categoriasEntrenador.push({
                        text: categoria.nombre,
                        value: {
                            id_categoria: categoria.id
                        }
                    });
                });
            }
        })
    },
    async crear_Categoria () {
        if(this.$refs.crearForm.validate()) { 
            try {
                await axios
                .post(`${server_url}/categorias/${this.$route.params.id_deporte}`, this.categoriaCrear, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200) {
                        this.categorias.push(res.data.categoria);
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto,
                            type: 'success',
                        }
                    } else {
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto,
                            type: 'error',
                        }
                    }
                    this.$refs.crearForm.reset();
                    this.crearCategoria = false;
                })
                .catch((error) => {
                    this.$refs.crearForm.reset();
                    this.mensajeError = error.response.status === 400
                    ? 'Ha ocurrido un error a la hora de crear la categoria'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
                
            } catch (error) {
                console.log(error);
            }
        }
        this.obtenerCategorias();
    },
    async ver_Categoria (item, evento) {
        try {
            axios.get(`${server_url}/categorias/${this.$route.params.id_deporte}/${item.id}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200){
                    this.categoria = res.data.categoria;
                }
            })
        } catch (error) {
            console.log(error);
        }
        if (evento == 'eliminar') {
            this.eliminarCategoria = true;
        } else {
            this.editarCategoria = true;
        } 
    },
    async editar_Categoria () {
        if(this.$refs.editForm.validate()) { 
            try {
                await axios
                .put(`${server_url}/categorias/${this.$route.params.id_deporte}/${this.categoria.id}`, this.categoria, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200) {
                        const index = this.categorias.findIndex(c => c.id == this.categoria.id);
                        this.categorias[index] = res.data.categoria;
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto,
                            type: 'success',
                        }
                    } else {
                        this.display = {
                            show: true, 
                            mensaje: res.data.texto,
                            type: 'error',
                        }
                    }
                    this.$refs.editForm.reset();
                    this.editarCategoria = false;
                })
                .catch((error) => {
                    this.$refs.editForm.reset();
                    this.mensajeError = error.response.status === 400
                    ? 'Ha ocurrido un error a la hora de editar el deporte'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
            } catch (error) {
                console.log(error);
            }
        }
        this.obtenerCategorias();
    },
    async eliminar_Categoria () {
        try {
            axios.delete(`${server_url}/categorias/${this.$route.params.id_deporte}/${this.categoria.id}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200){
                    const index = this.categorias.findIndex(c => c.id == this.categoria.id);
                    this.categorias.splice(index, 1);
                    this.display = {
                        show: true, 
                        mensaje: res.data.texto,
                        type: 'success',
                    }
                } else {
                    this.display = {
                        show: true, 
                        mensaje: res.data.texto,
                        type: 'error',
                    }
                }
                this.eliminarCategoria = false;
            })
        } catch (error) {
            console.log(error);
        }
    },
    cerrar (caso) {
        if (caso === 'asignar') {
            this.asignacion = false;
        } else {
            this.destitucion = false;
        }
        this.categoria = {};
        this.entrenador = {};
    },
    async asignar () {
        try {
            await axios
            .get(`${server_url}/asignaciones/${this.$route.params.id_deporte}/${this.categoria.id_categoria}/${this.entrenador.cedula}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200) {
                    this.display = {
                        show: true, 
                        mensaje: res.data.texto,
                        type: 'success',
                    }
                } else {
                    this.display = {
                        show: true, 
                        mensaje: res.data.texto,
                        type: 'error',
                    }
                }
                this.obtenerCategorias();
                this.obtenerEntrenadores();
                this.categoria = {};
                this.entrenador = {};
                this.asignacion = false;
            })
            .catch((error) => {
                this.categoria = {};
                this.entrenador = {};
                this.mensajeError = error.response.status === 400
                ? 'Ha ocurrido un error a la hora de crear la categoria'
                : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
            });
        } catch (error) {
            console.log(error);
        }
    },
    async destituir () {
        try {
            await axios
            .delete(`${server_url}/asignaciones/${this.$route.params.id_deporte}/${this.categoria.id_categoria}/${this.entrenador.cedula}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200) {
                    this.display = {
                        show: true, 
                        mensaje: res.data.texto,
                        type: 'success',
                    }
                } else {
                    this.display = {
                        show: true, 
                        mensaje: res.data.texto,
                        type: 'error',
                    }
                }
                this.obtenerCategorias();
                this.obtenerEntrenadores();
                this.categoria = {};
                this.entrenador = {};
                this.destitucion = false;
            })
            .catch((error) => {
                this.categoria = {};
                this.entrenador = {};
                this.mensajeError = error.response.status === 400
                ? 'Ha ocurrido un error a la hora de crear la categoria'
                : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
            });
        } catch (error) {
            console.log(error);
        }
    }
  },
  async mounted(){
    //se obtienen todas las categorias del deporte
    this.obtenerCategorias();
    //se obtienen los datos del deporte
    await axios
    .get(`${server_url}/deportes/${this.$route.params.id_deporte}`, { withCredentials: true })
    .then((res) => {
        if (res.data.codigo === 200) this.deporte = res.data.deporte;
    })
    this.obtenerEntrenadores();
  }
}
</script>

<style >
.v-data-table-header th{
  white-space: nowrap;
}
</style>
