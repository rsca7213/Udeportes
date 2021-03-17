<template>
    <v-container>
        <v-card class="px-1 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Categorias de {{deporte.nombre}}  
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
                            Crear Categoria
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
                </v-data-table>
            </v-container>
        </v-card>

        <v-dialog v-model="crearCategoria" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Crear Categoria
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
        display: false,
        tablaCargando: true,
        search: '',
        categoriaCrear: {
            genero: 'm',
        },
        reglasNombre: [
            v => !!v || 'Este campo es obligatorio',
            v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ],
        columnas_tabla: [
        {
            text: 'Nombre',
            align: 'left',
            sortable: true,
            filterable: true,
            value: 'nombre',
            class: 'primary--text font-weight-bold'
        },
        { 
            text: 'Entrenador',
            align: 'left',
            sortable: true,
            filterable: true,
            value: 'entrenador',
            class: 'primary--text font-weight-bold'
        },
        { 
            text: 'Fecha de Registro', 
            align: 'left',
            sortable: true,
            filterable: true,
            value: 'fecha_registro',
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
            filterable: false,
            value: 'acciones',
            class: 'primary--text font-weight-bold',
        },
        ],
        categorias: [],
        deporte: {}
    }
  },
  methods: {
    async obtenerCategorias() {
        this.tablaCargando = true;
        // request GET
        await axios
        .get(`${server_url}/categorias/${this.$route.params.id_deporte}`, { withCredentials: true })
        .then((res) => {
            if (res.data.codigo === 200) this.categorias = res.data.categorias;
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
    },
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
  }
}
</script>

<style >
.v-data-table-header th{
  white-space: nowrap;
}
</style>
