<template>
  <div class="indigo">
    <v-container>
      <v-row align="center" style="height: 100vh">
        <v-col> </v-col>
        <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
          <v-card class="px-2 py-4 login-card" color="#F5F5F5" elevation="4" shaped>
            <v-card-title class="grey--text text--darken-2"> Registro de usuarios </v-card-title>
            <v-form ref="form" class="px-4">
              <v-virtual-scroll :items="[1,2,3,4,5,6,1,1,1,1]" :item-height="50" height="300">
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="128" label="Contraseña" 
              prepend-icon="mdi-key" type="password" class="mt-4" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              <v-text-field clear-icon="mdi-close" clearable counter="256" label="Correo Electrónico" 
              prepend-icon="mdi-email" type="text" validate-on-blur> </v-text-field>
              </v-virtual-scroll>
            </v-form>
            <v-card-actions class="mt-4">
              <v-spacer> </v-spacer>
              <OlvidarDialog class="d-none d-sm-flex"/>
              <v-btn color="primary" @click="submit()" class="mx-1"> 
                <v-icon left> mdi-login </v-icon>
                  Registrar 
              </v-btn>
            </v-card-actions>
          </v-card>
          <OlvidarDialog class="d-flex d-sm-none mt-4 float-right" />
        </v-col>
        <v-col> </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'registro',
    data() {
      
    },
  }
</script>