<template>
  <div>
    <v-container>
      <v-row class="" align="start">
        <v-col cols="12 "> 
          <v-card rounded="md">
            <v-card-title class="pl-8 pb-0 grey--text text--darken-2">
              Reportes
            </v-card-title>
            <div>
              <!--<v-card-subtitle class="pb-0 pt-3 pl-8 grey--text text--darken-2 subtitle-1 d-flex justify-center justify-sm-start">
                <span>Los campos que contienen un <span class="red--text">"*"</span> son obligatorios</span>
              </v-card-subtitle>-
              <div v-if="mensaje_error" class="">
                <v-col class="error--text px-4"> 
                  <div class="ml-4">
                    <v-alert text color="error" dense>
                      <v-icon color="error"> mdi-alert </v-icon>
                      <span v-text="mensaje_error" class="ml-1"> </span>
                    </v-alert>
                  </div>
                </v-col>
              </div>-->
              <v-card-actions class="mt-4 d-flex justify-end">
                <v-btn color="secondary" class="mr-2 mb-2">
                  <v-icon left> mdi-check-circle </v-icon>
                  Rerpotes de Asistencia
                </v-btn>
                <v-btn color="secondary" class="mr-2 mb-2">
                  <v-icon left> mdi-check-circle </v-icon>
                  Nóminas
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <ExitoDialog v-if="exito_dialog" :props_exito_dialog="props_exito_dialog"/>
    </v-container>
  </div>
</template>

<script>
//import axios from 'axios';
//const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'MenuReportes',
  components: {

  },
  data() {
    return {

    }
  },
  async mounted() {

  }
}
</script>

<style>

</style>