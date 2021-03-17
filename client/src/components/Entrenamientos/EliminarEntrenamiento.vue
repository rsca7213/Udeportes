<template>
  <v-dialog v-model="dialog" class="text-center" max-width="900">
    <template v-slot:activator="{ on, attrs }">
      <v-icon dense color="error" dark v-bind="attrs" v-on="on"> mdi-delete </v-icon>
    </template>
  </v-dialog>
</template>

<script>
export default {
  name: 'EliminarEntrenamiento',

  data() {
    return {
      dialog: false
    }
  }
}
</script>

<style>

</style>