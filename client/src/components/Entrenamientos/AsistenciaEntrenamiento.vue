<template>
  <v-dialog v-model="dialog" class="text-center" max-width="900">
    <template v-slot:activator="{ on, attrs }">
      <v-icon dense color="primary" dark v-bind="attrs" v-on="on"> mdi-clipboard-list </v-icon>
    </template>
  </v-dialog>
</template>

<script>
export default {
  name: 'AsistenciaEntrenamiento',

  data() {
    return {
      dialog: false
    }
  }
}
</script>

<style>

</style>