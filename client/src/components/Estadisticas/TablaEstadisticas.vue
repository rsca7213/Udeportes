<template>
    <v-container class="px-0">
        <v-card class=" py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Estadísticas de {{deporte.nombre}}  
                <v-spacer class="d-none d-sm-flex"></v-spacer>
                <v-btn text class="blue--text text--lighten-1 px-1 px-sm-3" @click="$router.push('/deportes')">
                    <v-icon left> mdi-arrow-left </v-icon>
                    Regresar a deportes
                </v-btn>
            </v-card-title>
            <v-container class="px-2">
                <v-row align="center">
                    <v-col cols="12">
                    <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
                    prepend-icon="mdi-magnify" type="text" v-model="search" name="busqueda"> </v-text-field>
                    </v-col>
                </v-row>
                <v-row class="d-none d-md-flex">
                    <v-col cols="12" class="text-right">
                        <v-btn color="primary" dark @click="abrir()"> 
                            <v-icon left> mdi-plus-circle </v-icon>
                            Crear Estadística
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row class="d-flex d-md-none">
                    <v-col class="text-center px-1" cols="12">
                        <v-btn color="primary" dark @click="abrir()"> 
                            <v-icon left> mdi-plus-circle </v-icon>
                            Crear Estadística
                        </v-btn>
                    </v-col>
                </v-row>
                <v-data-table class="mt-5" :headers="columnas_tabla" :items="estadisticas" :search="search"
                    no-data-text="No hay estadísticas para este deporte."
                    no-results-text="No hay resultados para esta búsqueda."
                    loading-text="Cargando datos..."
                    locale="es-VE"
                    fixed-header
                    :loading="tablaCargando"
                >
                    <template v-slot:item.acciones="{ item }">
                        <v-icon dense color="primary" @click="ver_Estadistica(item, 'editar')"> mdi-pencil </v-icon>
                        <v-icon dense color="red" @click="ver_Estadistica(item, 'eliminar')"> mdi-delete </v-icon>
                    </template>
                </v-data-table>
            </v-container>
        </v-card>

        <!-- Dialog para crear una estadística -->
        <v-dialog v-model="crearEstadistica" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    <span class="d-none d-sm-flex"> Crear Estadística </span>
                    <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Crear Estadística </b>
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="crearEstadistica = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
                    <span>Los campos que contienen un 
                    <span class="red--text">"*"</span> 
                    son obligatorios</span> 
                </v-card-subtitle>
                <v-form ref="crearForm" @submit.prevent="crear_Estadistica()">
                    <v-container class="px-md-4">
                        <v-text-field clear-icon="mdi-close" clearable counter="50" label="Nombre de la Estadística *"
                        prepend-icon="mdi-chart-line" type="text" :rules="reglasNombre"
                        validate-on-blur v-model="estadisticaCrear.nombre" name="nombre"> </v-text-field>
                        <v-text-field clear-icon="mdi-close" clearable counter="8" label="Valor Mínimo"
                        prepend-icon="mdi-arrow-down" type="text" @change="check_minimo()"
                        validate-on-blur v-model="estadisticaCrear.minimo" name="minimo"> </v-text-field>

                        <v-text-field clear-icon="mdi-close" clearable counter="8" label="Valor Máximo"
                        prepend-icon="mdi-arrow-up" type="text" disabled v-if="estadisticaCrear.minimo == null"
                        validate-on-blur v-model="estadisticaCrear.maximo" name="maximo"> </v-text-field>
                        <v-text-field clear-icon="mdi-close" clearable counter="8" label="Valor Máximo"
                        prepend-icon="mdi-arrow-up" type="text" v-else
                        validate-on-blur v-model="estadisticaCrear.maximo" name="maximo"> </v-text-field>
                        
                        <v-select v-model="estadisticaCrear.id_posicion" label="Posición *" prepend-icon="mdi-source-pull"
                        clear-icon="mdi-close" name="posicion" :items="posiciones"
                        no-data-text="No hay posiciones disponibles">
                        </v-select>
                        <v-btn color="secondary" block type="submit" disabled v-if="estadisticaCrear.nombre == null || estadisticaCrear.id_posicion == null">
                            <v-icon left> mdi-check-circle </v-icon>
                            crear
                        </v-btn>
                        <v-btn color="secondary" block type="submit" v-else>
                            <v-icon left> mdi-check-circle </v-icon>
                            crear
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para editar una estadística -->
        <v-dialog v-model="editarEstadistica" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    <span class="d-none d-sm-flex"> Editar Categoría </span>
                    <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Editar Categoría </b>
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="editarEstadistica = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <!-- <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
                    <span>Los campos que contienen un 
                    <span class="red--text">"*"</span> 
                    son obligatorios</span> 
                </v-card-subtitle> -->
                <v-form ref="editForm" @submit.prevent="editar_Estadistica()">
                    <v-container class="px-md-4">
                        <v-text-field clear-icon="mdi-close" clearable counter="50" label="Nombre de la Estadística"
                        prepend-icon="mdi-chart-line" type="text" :rules="reglasNombre"
                        validate-on-blur v-model="estadistica.nombre" name="nombre"> </v-text-field>

                        <v-text-field clear-icon="mdi-close" clearable counter="8" label="Valor Mínimo"
                        prepend-icon="mdi-arrow-down" type="text" @change="check_minimo()"
                        validate-on-blur v-model="estadistica.minimo" name="minimo"> </v-text-field>

                        <v-text-field clear-icon="mdi-close" clearable counter="8" label="Valor Máximo"
                        prepend-icon="mdi-arrow-up" type="text" disabled v-if="estadistica.minimo == null"
                        validate-on-blur v-model="estadistica.maximo" name="maximo"> </v-text-field>
                        <v-text-field clear-icon="mdi-close" clearable counter="8" label="Valor Máximo"
                        prepend-icon="mdi-arrow-up" type="text" v-else
                        validate-on-blur v-model="estadistica.maximo" name="maximo"> </v-text-field>
                        
                        <v-select v-model="estadistica.id_posicion" :label="estadistica.posicion" prepend-icon="mdi-source-pull"
                        clear-icon="mdi-close" name="posicion" :items="posiciones"
                        no-data-text="No hay posiciones disponibles">
                        </v-select>
                        <v-btn color="secondary" block type="submit" disabled v-if="estadistica.nombre == null || estadistica.id_posicion == null">
                            <v-icon left> mdi-check-circle </v-icon>
                            guardar
                        </v-btn>
                        <v-btn color="secondary" block type="submit" v-else>
                            <v-icon left> mdi-check-circle </v-icon>
                            guardar
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para eliminar una estadística -->
        <v-dialog v-model="eliminarEstadistica" class="text-center" max-width="600">
            <v-card rounded="md">
                <v-card-title>
                    <span class="d-none d-sm-flex"> Eliminar Estadística </span>
                        <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Eliminar Estadística </b>
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="eliminarEstadistica = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title> 
                <v-card-text class="text-subtitle-1">
                    <b class="error--text"> ¿Está seguro que desea eliminar esta estadística? </b>
                    <br>
                    <span class="error--text"> Al eliminar la estadística se eliminarán todos los datos del sistema. </span>
                    <br>
                    <b> Nombre del deporte: </b> {{deporte.nombre}}
                    <br>
                    <b> Nombre de la Estadística: </b> {{estadistica.nombre}}
                    <br>
                    <b> Posición: </b> {{estadistica.posicion}}
                    <br>
                    <b v-if="estadistica.minimo != null"> Valor Mínimo: </b> {{estadistica.minimo}} 
                    <br>
                    <b v-if="estadistica.maximo != null">Valor Máximo: </b> {{estadistica.maximo}}
                </v-card-text>
                <v-card-actions> 
                    <v-spacer></v-spacer>
                    <v-btn color="grey darken-1" dark @click="eliminarEstadistica = false">
                        <v-icon left> mdi-close </v-icon>
                        Cerrar
                    </v-btn>
                    <v-btn color="error" @click="eliminar_Estadistica()">
                        <v-icon left> mdi-delete </v-icon>
                        Eliminar
                    </v-btn>
                </v-card-actions>
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
        crearEstadistica: false,
        editarEstadistica: false,
        eliminarEstadistica: false,
        display: false,
        tablaCargando: true,
        search: '',
        columnas_tabla: [
            { 
                text: 'Nombre Estadística', 
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'nombre',
                class: 'primary--text font-weight-bold',
                width: '100'
            },
            {
                text: 'Posición',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'posicion',
                class: 'primary--text font-weight-bold'
            },
            { 
                text: 'Valor Mínimo',
                sortable: true,
                filterable: true,
                value: 'minimo',
                class: 'primary--text font-weight-bold',
                align: 'center',
            },
            { 
                text: 'Valor Máximo',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'maximo',
                class: 'primary--text font-weight-bold'
            },
            {
                text: 'Acciones',
                align: 'center',
                sortable: false,
                value: 'acciones',
                class: 'primary--text font-weight-bold',
            },
        ],
        estadisticas: [],
        posiciones: [],
        estadisticaCrear: {},
        deporte: {},
        estadistica: {},
        reglasNombre: [
            v => !!v || 'Este campo es obligatorio',
            v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
        ],
        // reglasMinimo: [
        //     v => v && (/^\d{0,9}$/.test(v)) || 'Debe ser una cifra válida',
        //     v => v && v.length <= 8 || 'El valor no debe ser mayor a 8 caracteres',
        // ],
        // reglasMaximo: [
        //     v => v && (/^\d{0,9}$/.test(v)) || 'Debe ser una cifra válida',
        //     v => v && v.length <= 8 || 'El valor no debe ser mayor a 8 caracteres',
        // ]
    }
  },
  methods: {
    async obtenerEstadisticas() {
        this.tablaCargando = true;
        // request GET
        await axios
        .get(`${server_url}/estadisticas/${this.$route.params.id_deporte}`, { withCredentials: true })
        .then((res) => {
            if (res.data.codigo === 200) {
                this.estadisticas = res.data.estadisticas;
                this.posiciones = [];
                res.data.posiciones.forEach(posicion => {
                    this.posiciones.push({
                        text: posicion.nombre,
                        value: {
                            id_posicion: posicion.id
                        }
                    });
                });
                this.estadisticas.forEach(estadistica => {
                    if (estadistica.minimo == null) {
                        estadistica.minimo = 'Sin Definir';
                    }
                    if (estadistica.maximo == null) {
                        estadistica.maximo = 'Sin Definir';
                    }
                });
            }
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
    async crear_Estadistica () {
        this.estadisticaCrear.id_posicion = this.estadisticaCrear.id_posicion.id_posicion;
        if(this.$refs.crearForm.validate()) { 
            try {
                await axios
                .post(`${server_url}/estadisticas/${this.$route.params.id_deporte}/${this.estadisticaCrear.id_posicion}`, this.estadisticaCrear, { withCredentials: true })
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
                    this.crearEstadistica = false;
                })
                .catch((error) => {
                    this.mensajeError = error.response.status === 400
                    ? 'Ha ocurrido un error a la hora de crear la categoria'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
                
            } catch (error) {
                console.log(error);
            }
        }
        this.estadisticaCrear = {};
        this.$refs.crearForm.reset();
        this.obtenerEstadisticas();
    },
    async ver_Estadistica (item, evento) {
        try {
            axios.get(`${server_url}/estadisticas/${this.$route.params.id_deporte}/estadistica/${item.id}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200){
                    this.estadistica = res.data.estadistica;
                    this.posiciones = [];
                    res.data.posiciones.forEach(posicion => {
                    this.posiciones.push({
                        text: posicion.nombre,
                        value: {
                            id_posicion: posicion.id
                        }
                    });
                });
                }
            })
        } catch (error) {
            console.log(error);
        }
        if (evento == 'eliminar') {
            this.eliminarEstadistica = true;
        } else {
            this.editarEstadistica = true;
        }
    },
    async editar_Estadistica () {
        if (this.estadistica.id_posicion.id_posicion != null) {
           this.estadistica.id_posicion = this.estadistica.id_posicion.id_posicion; 
        }    
        if(this.$refs.editForm.validate()) { 
            try {
                await axios
                .put(`${server_url}/estadisticas/${this.$route.params.id_deporte}/estadistica/${this.estadistica.id}`, this.estadistica, { withCredentials: true })
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
                    this.editarEstadistica = false;
                })
                .catch((error) => {
                    this.mensajeError = error.response.status === 400
                    ? 'Ha ocurrido un error a la hora de editar el deporte'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
            } catch (error) {
                console.log(error);
            }
        }
        this.obtenerEstadisticas();
    },
    async eliminar_Estadistica () {
        try {
            axios.delete(`${server_url}/estadisticas/${this.$route.params.id_deporte}/estadistica/${this.estadistica.id}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200){
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
                this.eliminarEstadistica = false;
            })
        } catch (error) {
            console.log(error);
        }
        this.obtenerEstadisticas();
    },
    abrir () {
        this.estadisticaCrear = {};
        this.crearEstadistica = true;
    },
    check_minimo () {
        if (this.estadisticaCrear.minimo == null) {
            this.estadisticaCrear.maximo = null;
        }
        if (this.estadistica.minimo == null) {
            this.estadistica.maximo = null;
        }
    }
  },
  async mounted(){
    //se obtienen todas las categorias del deporte
    this.obtenerEstadisticas();
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
