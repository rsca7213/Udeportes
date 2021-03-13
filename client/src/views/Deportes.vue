<template>
    <v-container>
        <h1 class="font-weight-light">Deportes</h1>
        <br>
        <v-row justify="center">
            <v-card class="ma-3" max-width="344" v-for="deporte in deportes" :key="deporte.id" @click="dialogEditar()" elevation="8">
                <v-img src="https://png.pngtree.com/element_our/20190602/ourlarge/pngtree-various-ball-sports-illustrations-image_1402516.jpg" height="150px"></v-img>
                <v-card-title>{{deporte.nombre}}</v-card-title>
                <v-card-subtitle v-if="deporte.entrenador != null">Entrenador: {{deporte.entrenador}}</v-card-subtitle>
                <v-card-subtitle v-else>Entrenador: Sin asignar</v-card-subtitle>
                <v-card-actions>
                    <v-btn color="primary" small dark fab @click="editarNombre = true"><v-icon>mdi-pencil</v-icon></v-btn>
                    <v-btn color="red" small dark fab><v-icon>mdi-delete</v-icon></v-btn>
                </v-card-actions>
            </v-card>
        </v-row>

        <v-dialog  v-model="crearDeporte" max-width="450px">
            <v-card>
                <v-card-title>
                    Crear Deporte
                    <v-spacer />
                    <v-btn icon @click="crearDeporte=false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="crearForm" @submit.prevent="crear_Deporte()" class="ma-3">
                        <v-text-field clear-icon="mdi-close" clearable label="Nombre del deporte" counter="50"
                        type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur></v-text-field>
                        <v-btn block class="mt-3" color="secondary" type="submit">crear</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        
        <v-dialog  v-model="editarDeporte" max-width="450px">
            <v-card>
                <v-card-title>
                    Editar Deporte
                    <v-spacer />
                    <v-btn icon @click="editarDeporte = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-col>
                    <v-card elevation="11">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center">Posiciones</v-card-title>
                            <v-avatar class="ma-3" size="100">
                                <v-img src="https://tuzonadefutbol.com/wp-content/uploads/2019/02/areas_y_posiciones_en_el_futbol_2.jpg"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                    <br>
                    <v-card elevation="11">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center">Categorias</v-card-title>
                            <v-avatar class="ma-3" size="100">
                                <v-img src="http://2.bp.blogspot.com/-W_hu3sNCkfs/Vbt0bks0-1I/AAAAAAAAAWI/o4Eu0q1BYj4/s640/Campeonatos_Oficiales_AFA.jpg"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                    <br>
                    <v-card elevation="11">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <v-card-title class="align-center">Entrenadores</v-card-title>
                            <v-avatar class="ma-3" size="100">
                                <v-img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdNPMePWFmHpr6wajr2h8fAEeppvuVc_csBA&usqp=CAU"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                </v-col>
            </v-card>
        </v-dialog>
        
        <v-dialog  v-model="editarNombre" max-width="450px">
            <v-card>
                <v-card-title>
                    Editar Nombre
                    <v-spacer />
                    <v-btn icon @click="editarNombre = false"><v-icon> mdi-close </v-icon></v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="editForm" @submit.prevent="editar_Deporte()" class="ma-3">
                        <v-text-field clear-icon="mdi-close" clearable label="Nombre del deporte" counter="50"
                        type="text" prepend-icon="mdi-square-edit-outline" :rules="reglasNombre" validate-on-blur></v-text-field>
                        <v-btn block class="mt-3" color="secondary" type="submit">guardar</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-btn color="primary" @click="crearDeporte = true" large right fixed bottom fab dark><v-icon>mdi-plus</v-icon></v-btn>
    </v-container>
</template>

<script>
export default {
  name: 'Deportes',
  data() {
        return {
            crearDeporte: false,
            editarDeporte: false,
            editarNombre: false,
            deportes: [
                {id: 1, nombre: 'Futbol', entrenador: 'David'}, 
                {id: 2, nombre: 'Basketball', entrenador: 'Ricardo'}, 
                {id: 3, nombre: 'Volleyball', entrenador: 'Jose'},
                {id: 4, nombre: 'Baseball', entrenador: null}
            ],
            reglasNombre: [
                v => !!v || 'Este campo es obligatorio',
                v => v && v.length <= 50 || 'Este campo debe contener como máximo 50 caracteres',
            ],
        }
    },
    methods: {
        crear_Deporte () {
            if(this.$refs.crearForm.validate()) { 
                console.log('crear deporte');
                this.crearDeporte = false;
            }
        },
       editar_Deporte () {
            if(this.$refs.editForm.validate()) { 
                console.log('editar deporte');
                this.editarNombre = false;
            }
        },
        dialogEditar () {
            if (!this.editarNombre) {
                this.editarDeporte = true;
            }
        },
    },
}
</script>

<style>

</style>