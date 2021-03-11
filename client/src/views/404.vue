<template>
  <div class="404">
    <v-container>
      <v-row align="center" class="mt-6">
        <v-col> </v-col>
        <v-col cols="12" xl="4" lg="6" md="7" sm="10"> 
          <v-img src="../assets/logo-text.png" contain max-width="240" class="mb-3"> </v-img>
          <v-card class="px-2 py-4" color="#F5F5F5" elevation="4" shaped>
            <v-img height="250" src="../assets/404.png" alt="404"> </v-img>
            <v-card-title class="grey--text text--darken-2"> ¡Oops! Parece que esta página no existe </v-card-title>
            <v-card-subtitle class="error--text"> Error 404: Página no encontrada </v-card-subtitle>
            <v-card-actions class="mt-4">
              <v-container>
                <v-row class="mb-2">
                  <v-col></v-col>
                  <v-btn text small class="blue--text text--lighten-1" @click="$router.go(-1)">
                    <v-icon left> mdi-arrow-left </v-icon>
                    Regresar a la página anterior
                  </v-btn>
                  <v-col></v-col>
                </v-row>
                <v-row>
                  <v-btn color="primary" block @click="$router.push('/')"> 
                    <v-icon left> mdi-home </v-icon>
                    Ir al inicio
                  </v-btn>
                </v-row>
              </v-container>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col> </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>