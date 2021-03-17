<template>
  <v-dialog v-model="dialog" class="text-center" max-width="900">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on"> 
        <v-icon left> mdi-plus-circle </v-icon>
        Registrar Entrenamiento
      </v-btn>
    </template>
  </v-dialog>
</template>

<script>
export default {
  name: 'RegistrarEntrenamiento',

  data() {
    return {
      dialog: false
    }
  }
}
</script>

<style>

</style>