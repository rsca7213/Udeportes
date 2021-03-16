<template>
  <div>
    <v-container>
        <v-row class="" align="start">
          <v-col cols="12 px-0 py-0"> 
            <v-card rounded="md">
              <v-card-title class="pl-8 pb-0 grey--text text--darken-2">
                Editar Perfil
                <v-spacer> </v-spacer>
                <v-btn icon ><v-icon> mdi-close </v-icon></v-btn>
              </v-card-title>
              <div>
                <v-card-subtitle class="pb-0 pt-3 pl-8 grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start"> <span>Los campos que contienen un <span class="red--text">"*"</span> son obligatorios</span> </v-card-subtitle>
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
                <v-card-actions class="mt-4 d-flex justify-end">
                  <v-btn class="mb-2" color="error" dark>
                    <v-icon left> mdi-close </v-icon>
                      Cancelar
                  </v-btn>
                  <v-btn class="mr-2 mb-2" v-if="!usuario.cedula" color="secondary" :disabled="!credenciales_validas" :loading="form_cargando" @click="mostrarConfirmacion()">
                    <v-icon left> mdi-check-circle </v-icon>
                    Registrar
                  </v-btn>
                  <v-btn v-else color="secondary" class="mr-2 mb-2" :disabled="!credenciales_validas" :loading="form_cargando" @click="editarUsuario()">
                    <v-icon left> mdi-check-circle </v-icon>
                    Editar
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
export default {
  name: 'EditarPerfil',

  data() {
    return {
      // se muestra el componente Cargador si cargando es true
      form_cargando: false,
      //variable de control para saber si todos los datos del usuario a crear son validos
      credenciales_validas: false,
      // mensaje de error al hacer submit y recibir errores del servidor
      mensaje_error: '',
    }
  },
}
</script>

<style>

</style>