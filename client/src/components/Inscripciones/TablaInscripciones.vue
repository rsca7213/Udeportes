<template>
    <v-container>
        <v-card class="px-1 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> 
                Inscripciones en {{deporte.nombre}}
                <v-spacer class="d-none d-sm-flex"></v-spacer>
                <v-btn text class="blue--text text--lighten-1 px-1 px-sm-3" @click="$router.push('/deportes')">
                    <v-icon left> mdi-arrow-left </v-icon>
                    Volver
                </v-btn>
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
                        <v-btn color="primary" dark @click="abrir('registrar')"> 
                            <v-icon left> mdi-clipboard-check </v-icon>
                            Inscribir Atleta
                        </v-btn>
                        <v-btn class="ml-3" color="indigo" dark @click="abrir('editar')"> 
                            <v-icon left> mdi-clipboard-flow </v-icon>
                            Editar Inscripción
                        </v-btn>
                        <v-btn class="ml-3" color="red" dark @click="abrir('eliminar')"> 
                            <v-icon left> mdi-clipboard-alert </v-icon>
                            Eliminar Inscripción
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row class="d-flex d-md-none">
                    <v-col class="text-center" cols="12">
                        <v-btn color="primary" dark @click="abrir('registrar')"> 
                            <v-icon left> mdi-clipboard-check </v-icon>
                            Inscribir Atleta
                        </v-btn>
                    </v-col>
                    <v-col class="text-center" cols="12">
                        <v-btn class="ml-3" color="indigo" dark @click="abrir('editar')"> 
                            <v-icon left> mdi-clipboard-flow </v-icon>
                            Editar Inscripción
                        </v-btn>
                    </v-col>
                    <v-col class="text-center" cols="12">
                        <v-btn class="ml-3" color="red" dark @click="abrir('eliminar')"> 
                            <v-icon left> mdi-clipboard-alert </v-icon>
                            Eliminar Inscripción
                        </v-btn>
                    </v-col>
                </v-row>
                <v-data-table class="mt-5" :headers="columnas_tabla" :items="inscripciones" :search="search"
                    no-data-text="No hay inscripciones para este deporte."
                    no-results-text="No hay resultados para esta búsqueda."
                    loading-text="Cargando datos..."
                    locale="es-VE"
                    fixed-header
                    :loading="tablaCargando"
                >
                </v-data-table>
            </v-container>
        </v-card>

        <!-- Dialog para registrar una inscripciones -->
        <v-dialog v-model="registrarInscripcion" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Registrar Inscripción
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="registrarInscripcion = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
                    <span>Los campos que contienen un 
                    <span class="red--text">"*"</span> 
                    son obligatorios</span> 
                </v-card-subtitle>
                <v-form ref="form" @submit.prevent="registrar_Inscripcion()">
                    <v-container class="px-md-4">
                        <!-- <v-text-field clear-icon="mdi-close" clearable counter="8" label="Cédula de Identidad del Atleta *"
                        prepend-icon="mdi-card-account-details" type="text" :rules="reglasCedula"
                        validate-on-blur v-model="atleta.contenido" name="cedula" @change="obtenerCategoriasAtleta()"> </v-text-field> -->

                        <v-combobox prepend-icon="mdi-card-account-details" v-model="atleta.contenido" 
                        label="Atleta * (Debe incluir el Nro. de Cédula)" :items="atletas" @change="obtenerCategoriasAtleta()"></v-combobox>

                        <v-select v-model="categoria.id" label="Categoría *" prepend-icon="mdi-clipboard-text"
                        clear-icon="mdi-close" name="categoria" :items="categoriasDis" 
                        no-data-text="No hay categorias disponibles" @change="obtenerPosicionesCategoria()" disabled v-if="!this.validar">
                        </v-select>
                        <v-select v-model="categoria.id" label="Categoría *" prepend-icon="mdi-clipboard-text"
                        clear-icon="mdi-close" name="categoria" :items="categoriasDis" 
                        no-data-text="No hay categorias disponibles" @change="obtenerPosicionesCategoria()" v-else>
                        </v-select>

                        <v-select v-model="posicion.id" label="Posición" prepend-icon="mdi-source-pull"
                        clear-icon="mdi-close" name="posicion" :items="posicionesCategoria"
                        no-data-text="No hay posiciones disponibles" disabled v-if="!this.validar">
                        </v-select>
                        <v-select v-model="posicion.id" label="Posición" prepend-icon="mdi-source-pull"
                        clear-icon="mdi-close" name="posicion" :items="posicionesCategoria"
                        no-data-text="No hay posiciones disponibles" v-else>
                        </v-select>
                        <v-btn color="secondary" block type="submit" v-if="this.categoria.id != null">
                            <v-icon left> mdi-check-circle </v-icon>
                            Inscribir
                        </v-btn>
                        <v-btn color="secondary" block type="submit" disabled v-else>
                            <v-icon left> mdi-check-circle </v-icon>
                            Inscribir
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para editar una inscripciones -->
        <v-dialog v-model="editarInscripcion" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Editar Inscripción
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="editarInscripcion = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
                    <span>Los campos que contienen un 
                    <span class="red--text">"*"</span> 
                    son obligatorios</span> 
                </v-card-subtitle>
                <v-form ref="form" @submit.prevent="editar_Inscripcion()">
                    <v-container class="px-md-4">
                        <!-- <v-text-field clear-icon="mdi-close" clearable counter="8" label="Cédula de Identidad del Atleta *"
                        prepend-icon="mdi-card-account-details" type="text" :rules="reglasCedula"
                        validate-on-blur v-model="atleta.cedula" name="cedula" @change="obtenerCategoriasAtleta()"> </v-text-field> -->

                        <v-combobox prepend-icon="mdi-card-account-details" v-model="atleta.contenido"
                        label="Atleta * (Debe incluir el Nro. de Cédula)" :items="atletas" @change="obtenerCategoriasAtleta()"></v-combobox>

                        <v-select v-model="categoria.id" label="Categoría *" prepend-icon="mdi-clipboard-text"
                        clear-icon="mdi-close" name="categoria" :items="categoriasIns" 
                        no-data-text="No hay categorias disponibles" @change="obtenerPosicionesCategoria()" disabled v-if="!this.validar">
                        </v-select>
                        <v-select v-model="categoria.id" label="Categoría *" prepend-icon="mdi-clipboard-text"
                        clear-icon="mdi-close" name="categoria" :items="categoriasIns" 
                        no-data-text="No hay categorias disponibles" @change="obtenerPosicionesCategoria()" v-else>
                        </v-select>

                        <v-select v-model="posicion.id" label="Posición *" prepend-icon="mdi-source-pull"
                        clear-icon="mdi-close" name="posicion" :items="posicionesCategoriaDis"
                        no-data-text="No hay posiciones disponibles" disabled v-if="!this.validar">
                        </v-select>
                        <v-select v-model="posicion.id" label="Posición *" prepend-icon="mdi-source-pull"
                        clear-icon="mdi-close" name="posicion" :items="posicionesCategoriaDis"
                        no-data-text="No hay posiciones disponibles" v-else>
                        </v-select>
                        <v-btn color="secondary" block type="submit" v-if="this.posicion.id != null && this.categoria.id != null">
                            <v-icon left> mdi-check-circle </v-icon>
                            guardar
                        </v-btn>
                        <v-btn color="secondary" block type="submit" disabled v-else>
                            <v-icon left> mdi-check-circle </v-icon>
                            guardar
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para eliminar una inscripciones -->
        <v-dialog v-model="eliminarInscripcion" class="text-center" max-width="450">
            <v-card rounded="md">
                <v-card-title>
                    Eliminar Inscripción
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="eliminarInscripcion = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-subtitle class="grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> 
                    <span>Los campos que contienen un 
                    <span class="red--text">"*"</span> 
                    son obligatorios</span> 
                </v-card-subtitle>
                <v-form ref="form" @submit.prevent="confimar_Eliminar()">
                    <v-container class="px-md-4">
                        <!-- <v-text-field clear-icon="mdi-close" clearable counter="8" label="Cédula de Identidad del Atleta *"
                        prepend-icon="mdi-card-account-details" type="text" :rules="reglasCedula"
                        validate-on-blur v-model="atleta.cedula" name="cedula" @change="obtenerCategoriasAtleta()"> </v-text-field> -->

                        <v-combobox prepend-icon="mdi-card-account-details" v-model="atleta.contenido"
                        label="Atleta * (Debe incluir el Nro. de Cédula)" :items="atletas" @change="obtenerCategoriasAtleta()"></v-combobox>

                        <v-select v-model="categoria.id" label="Categoría *" prepend-icon="mdi-clipboard-text"
                        clear-icon="mdi-close" name="categoria" :items="categoriasIns" 
                        no-data-text="No hay categorias disponibles" @change="obtenerPosicionesCategoria()" disabled v-if="!this.validar">
                        </v-select>
                        <v-select v-model="categoria.id" label="Categoría *" prepend-icon="mdi-clipboard-text"
                        clear-icon="mdi-close" name="categoria" :items="categoriasIns" 
                        no-data-text="No hay categorias disponibles" @change="obtenerPosicionesCategoria()" v-else>
                        </v-select>
                        <v-btn dark color="red" block type="submit" v-if="this.categoria.id != null">
                            <v-icon left> mdi-delete </v-icon>
                            confirmar
                        </v-btn>
                        <v-btn color="red" block type="submit" disabled v-else>
                            <v-icon left> mdi-delete </v-icon>
                            confirmar
                        </v-btn>
                    </v-container>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Dialog para confirmar eliminar una inscripciones -->
        <v-dialog v-model="confirmar" class="text-center" max-width="600">
            <v-card rounded="md">
                <v-card-title>
                    Confirmación
                    <v-spacer> </v-spacer>
                    <v-btn icon @click="confirmar = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title> 
                <v-card-text class="text-subtitle-1">
                    <b class="error--text"> ¿Está seguro que desea eliminar esta inscripción? </b>
                    <br>
                    <span class="error--text"> Al eliminar la inscripción el atleta no formará parte de la plantilla. </span>
                    <br>
                    <br>
                    <b> Nombre del Atleta: </b> {{confirmacion.atleta}}
                    <br>
                    <b> Nombre del deporte: </b> {{deporte.nombre}}
                    <br>
                    <b> Nombre de la categoría: </b> {{confirmacion.categoria}}
                </v-card-text>
                <v-card-actions> 
                    <v-spacer></v-spacer>
                    <v-btn color="grey darken-1" dark @click="confirmar = false">
                        <v-icon left> mdi-close </v-icon>
                        Cerrar
                    </v-btn>
                    <v-btn color="error" @click="eliminar_Inscripcion()">
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
  name: 'TablaInscripciones',
  data() {
    return {
        registrarInscripcion: false,
        editarInscripcion: false, 
        eliminarInscripcion: false,
        confirmar: false,
        validar: null,
        display: false,
        tablaCargando: true,
        search: '',
        usuario: {},
        inscripcionRegistrar: {},
        inscripcion: {},
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
                text: 'Cédula de Identidad',
                align: 'center',
                sortable: true,
                filterable: true,
                value: 'cedula',
                class: 'primary--text font-weight-bold'
            },
            { 
                text: 'Nombre Atleta',
                align: 'center',
                sortable: false,
                filterable: true,
                value: 'nombre',
                class: 'primary--text font-weight-bold'
            },
            { 
                text: 'Género Atleta',
                sortable: false,
                value: 'genero',
                class: 'primary--text font-weight-bold',
                align: 'center',
            },
            { 
                text: 'Nombre Categoría',
                align: 'center',
                sortable: false,
                filterable: true,
                value: 'categoria',
                class: 'primary--text font-weight-bold'
            },
            { 
                text: 'Posición',
                sortable: false,
                value: 'posicion',
                class: 'primary--text font-weight-bold',
                align: 'center',
            },
        ],
        inscripciones: [],
        atletas: [],
        cedula: [],
        categoriasDis: [],
        categoriasIns: [],
        posicionesCategoria: [],
        posicionesCategoriaIns: [],
        posicionesCategoriaDis: [],
        atleta: {},
        categoria: {},
        posicion: {},
        confirmacion: {},
        deporte: {},
        reglasCedula: [
            v => !!v || 'Este campo es obligatorio',
            v => v && v.length <= 8 || 'La cédula de identidad no debe ser mayor a 8 caracteres',
            v => v && (/^\d{0,9}$/.test(v)) || 'Debe ser una cédula válida',
        ],
    }
  },
  methods: {
    async obtenerInscripciones() {
        this.tablaCargando = true;
        try {
            await axios
            .post(`${server_url}/inscripciones`, this.usuario, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200) {
                    this.inscripciones = res.data.inscripciones;
                    res.data.atletas.forEach(atleta => {
                        this.atletas.push(atleta.nombre);
                    });
                    this.deporte = res.data.deporte[0];
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
        } catch (error) {
            console.log(error);
        }
        this.tablaCargando = false;
    },
    async obtenerCategoriasAtleta () {
        this.categoria = {};
        this.posicion = {};
        if (this.atleta.contenido != null)  {
            this.cedula = this.atleta.contenido.split(" ");
        }
        this.cedula = this.cedula[0];
        try {
            if (this.$refs.form.validate()) {
                await axios
                .post(`${server_url}/inscripciones/${this.$route.params.id_deporte}/${this.cedula}`, this.usuario, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200) {
                        this.categoriasDis = [];
                        res.data.categoriasDisponibles.forEach(categoria => {
                            this.categoriasDis.push({
                                text: categoria.nombre,
                                value: {
                                    id_categoria: categoria.id
                                }
                            });
                        });
                        this.categoriasIns = [];
                        res.data.categoriasInscrito.forEach(categoria => {
                            this.categoriasIns.push({
                                text: categoria.nombre,
                                value: {
                                    id_categoria: categoria.id
                                }
                            });
                        });
                    }
                })
                this.validar = true;
            } else {
                this.validar = false;
                this.inscripcionRegistrar.categoria = null;
                this.inscripcionRegistrar.posicion = null;
            }
        } catch (error) {
            console.log(error);
        }
    },
    async obtenerPosicionesCategoria() {
        this.posicion = {};
        try {
            await axios
            .get(`${server_url}/inscripciones/${this.$route.params.id_deporte}/categoria/${this.categoria.id.id_categoria}/${this.cedula}`, { withCredentials: true })
            .then((res) => {
                if (res.data.codigo === 200) {
                    this.posicionesCategoria = [];
                    res.data.posiciones.forEach(posicion => {
                        this.posicionesCategoria.push({
                            text: posicion.nombre,
                            value: {
                                id_posicion: posicion.id
                            }
                        });
                    });
                    this.posicionesCategoriaIns = [];
                    res.data.posicionesInscrito.forEach(posicion => {
                        this.posicionesCategoriaIns.push({
                            text: posicion.nombre,
                            value: {
                                id_posicion: posicion.id
                            }
                        });
                    });
                    this.posicionesCategoriaDis = [];
                    res.data.posicionesDisponibles.forEach(posicion => {
                        this.posicionesCategoriaDis.push({
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
    },
    abrir (evento) {
        this.atleta = {};
        this.categoria = {};
        this.posicion = {};
        this.validar = null;
        if (evento == 'registrar') {
            this.registrarInscripcion = true;
        } else if (evento == 'editar') {
            this.editarInscripcion = true;
        } else {
            this.eliminarInscripcion = true;
        }
    },
    async registrar_Inscripcion () {
        this.inscripcionRegistrar.cedula = this.cedula;
        this.inscripcionRegistrar.categoria = this.categoria.id.id_categoria;
        if (this.posicion.id == null) {
            this.inscripcionRegistrar.posicion = null;
        } else {
            this.inscripcionRegistrar.posicion = this.posicion.id.id_posicion;
        }
        try {
            if (this.$refs.form.validate()) {
                await axios
                .post(`${server_url}/inscripciones/${this.$route.params.id_deporte}`, this.inscripcionRegistrar, { withCredentials: true })
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
                    this.registrarInscripcion = false;
                })
                .catch((error) => {
                    this.mensajeError = error.response.status === 400
                    ? 'Ha ocurrido un error a la hora de crear la categoria'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
            }
        } catch (error) {
            console.log(error);
        }
        this.atleta = {};
        this.categoria = {};
        this.posicion = {};
        this.validar = null;
        this.obtenerInscripciones();
    },
    async editar_Inscripcion () {
        this.inscripcion.cedula = this.cedula;
        this.inscripcion.categoria = this.categoria.id.id_categoria;
        this.inscripcion.posicion = this.posicion.id.id_posicion;
        try {
            if (this.$refs.form.validate()) {
                await axios
                .put(`${server_url}/inscripciones/${this.$route.params.id_deporte}`, this.inscripcion, { withCredentials: true })
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
                    this.editarInscripcion = false;
                })
                .catch((error) => {
                    this.mensajeError = error.response.status === 400
                    ? 'Ha ocurrido un error a la hora de crear la categoria'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
            }
        } catch (error) {
            console.log(error);
        }
        this.atleta = {};
        this.categoria = {};
        this.posicion = {};
        this.validar = null;
        this.obtenerInscripciones();
    },
    async confimar_Eliminar() {
        this.inscripcion.cedula = this.cedula;
        this.inscripcion.categoria = this.categoria.id.id_categoria;
        try {
            if (this.$refs.form.validate()) {
                await axios
                .get(`${server_url}/inscripciones/${this.inscripcion.categoria}/${this.inscripcion.posicion}/${this.inscripcion.cedula}`, { withCredentials: true })
                .then((res) => {
                    if (res.data.codigo === 200) {
                        this.confirmacion.atleta = res.data.atleta[0].nombre;
                        this.confirmacion.categoria = res.data.categoria[0].nombre;
                    }
                    this.confirmar = true;
                })
            }
        } catch (error) {
            console.log(error);
        }
    },
    async eliminar_Inscripcion () {
        try {
            if (this.$refs.form.validate()) {
                await axios
                .delete(`${server_url}/inscripciones/${this.inscripcion.categoria}/${this.inscripcion.posicion}/${this.inscripcion.cedula}`, { withCredentials: true })
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
                    this.confirmar = false;
                    this.eliminarInscripcion = false;
                })
                .catch((error) => {
                    this.mensajeError = error.response.status === 400
                    ? 'Ha ocurrido un error a la hora de crear la categoria'
                    : 'Ha ocurrido un error inesperado en el servidor, por favor intentalo de nuevo.';
                });
            }
        } catch (error) {
            console.log(error);
        }
        this.atleta = {};
        this.categoria = {};
        this.posicion = {};
        this.validar = null;
        this.obtenerInscripciones();
    },
  },
  async mounted(){

    if (await axios
      .get(`${server_url}/auth/admin`, { withCredentials: true })
      .then((res) => {
        // si el usuario es admin y ha iniciado sesión
        if (res.status === 200) {
          this.usuario.admin = true;
          return true;
        }
      })
      .catch((err) => {
        // si el usuario ha iniciado sesión pero no es admin
        try {
          if (err.response.status === 403)  {
            this.usuario.admin = false;
            return true;
          }
        }
        catch { 
          console.warn('Warning: No response status was found, is the server running? ');
          return false; 
        }
      }))
        await axios
        .get(`${server_url}/perfil?data=cedula`, { withCredentials: true })
        .then((res) => {
          if (res.status === 200) 
            this.usuario = {
                deporte: this.$route.params.id_deporte,
                admin: this.usuario.admin
            };
        })
        .catch(() => { });

        //se obtienen todas las inscripciones del deporte
        this.obtenerInscripciones();
  }
}
</script>

<style >
.v-data-table-header th{
  white-space: nowrap;
}
</style>
