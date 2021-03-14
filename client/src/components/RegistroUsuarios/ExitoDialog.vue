<template>
  <div>
    <!-- Snackbar -->
    <v-snackbar v-model="display" timeout="3000" shaped top> 
      <v-icon v-if="props_exito_dialog.estatus_operacion" left color="secondary"> mdi-check-circle </v-icon>
      <v-icon v-else left color="red"> mdi-alert-circle </v-icon>
      <span :class="(props_exito_dialog.estatus_operacion)? 'secondary--text':'red--text'">{{props_exito_dialog.mensaje_operacion}}</span> 
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'ExitoDialog',
  props: {
    props_exito_dialog: {},
  },
  data() {
    return {
      display: false,
    }
  },
  watch: {
    "props_exito_dialog" : function () {
      this.display = true;
    }
  },
  mounted(){
    this.display = true;
  }
}
</script>

<style>

</style>