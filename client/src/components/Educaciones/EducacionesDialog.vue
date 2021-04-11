<template>
  <v-dialog v-model="dialog" class="text-center" max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="indigo" dark v-bind="attrs" v-on="on"> 
        <v-icon left> mdi-school </v-icon>
        Gestionar Niveles Ed<span class="show-xxs-inline">...</span><span class="hide-xxs">ucativos</span>
      </v-btn>
    </template>
    <v-card rounded="md" style="border: 0px">
      <v-card-title>
        <span v-if="step === 'R'"> 
          <span class="d-none d-sm-flex"> Niveles Educativos </span>
          <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Niveles Educativos </b> 
        </span>
        <span v-if="step === 'C'"> 
          <span class="d-none d-sm-flex"> Agregar Educación </span>
          <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Agregar Educación </b> 
        </span>
        <span v-if="step === 'U'">
          <span class="d-none d-sm-flex"> Editar Educación </span>
          <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Editar Educación </b> 
        </span>
        <span v-if="step === 'D'">
          <span class="d-none d-sm-flex"> Eliminar Educación </span>
          <b class="d-flex d-sm-none text-subtitle-1 font-weight-bold"> Eliminar Educación </b> 
        </span>
        <v-spacer> </v-spacer>
        <v-btn icon @click="dialog = false"><v-icon> mdi-close </v-icon></v-btn>
      </v-card-title>
      <v-card-text v-if="educacionCargando" class="mt-2"> 
          <v-progress-linear indeterminate color="primary"> </v-progress-linear>
      </v-card-text>
      <v-card-text v-else>
        <v-alert text color="error" dense v-if="mensajeError">
          <v-icon color="error"> mdi-alert </v-icon>
          <span v-text="mensajeError" class="ml-1"> </span>
        </v-alert>
        <v-alert text color="success" dense v-if="mensajeSuccess">
          <v-icon color="success"> mdi-check-circle </v-icon>
          <span v-text="mensajeSuccess" class="ml-1"> </span>
        </v-alert>
        <div v-if="step === 'R'"> 
          <div class="text-right mb-3" v-if="!mensajeError">
            <v-btn color="primary" @click="cambiarVista('C')"> 
              <v-icon left> mdi-plus-circle </v-icon>
              Agregar educación
            </v-btn>
          </div>
          <v-list outlined class="rounded-lg" v-if="items.length">
            <v-list-item two-line v-for="(educacion, index) in items" :key="educacion.id" 
            :class="items.length - 1 === index ? '' : 'list-item'" >
              <v-list-item-icon class="d-none d-sm-flex">
                <v-icon color="indigo"> mdi-school </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="educacion.nombre"> </v-list-item-title>
                <v-list-item-subtitle> 
                  {{
                    educacion.etapa === 'm'
                      ? 'Mensual'
                      : educacion.etapa === 't'
                        ? 'Trimestral'
                        : educacion.etapa === 's'
                          ? 'Semestral'
                          : 'Anual'
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <div>
                <v-icon color="primary" @click="cambiarVista('U', educacion)"> mdi-pencil </v-icon>
                <v-icon color="error" @click="cambiarVista('D', educacion)"> mdi-delete </v-icon>
              </div>
            </v-list-item>
          </v-list>
          <div v-else-if="!mensajeError" class="text-center text--lighten-2 mt-6">
            No hay educaciones registradas en el sistema.
          </div>
        </div>
        <div v-else-if="step === 'C' || step === 'U'"> 
          <div class="text-center">
            <v-btn text class="blue--text text--lighten-1" @click="cambiarVista('R')">
              <v-icon left> mdi-arrow-left </v-icon>
              Regresar a la lista
            </v-btn>
          </div>
          <v-form ref="form" v-model="formValido"> 
            <v-text-field clear-icon="mdi-close" clearable counter="200" label="Nombre" 
            prepend-icon="mdi-school" type="text" :rules="reglas.nombre" 
            validate-on-blur v-model.trim="educacion.nombre" name="nombre_educacion"> </v-text-field>
            <v-select v-model="educacion.etapa" label="Tipo de Periodo" prepend-icon="mdi-calendar-range"
            clear-icon="mdi-close" name="educacion" clearable :items="[{text: 'Mensual', value: 'm'}, 
            {text: 'Trimestral', value: 't'}, {text: 'Semestral', value: 's'}, 
            {text: 'Anual', value: 'a'}]" :rules="reglas.etapa">
            </v-select>
          </v-form>
        </div>
        <div v-else> 
          <div class="text-center">
            <v-btn text class="blue--text text--lighten-1" @click="cambiarVista('R')">
              <v-icon left> mdi-arrow-left </v-icon>
              Regresar a la lista
            </v-btn>
          </div>
          <div class="text-subtitle-1">
            <b class="error--text"> ¿Está seguro que desea eliminar la educación? </b>
            <br>
            <span class="error--text"> Al eliminar la educación, a todos los atletas con dicha educación se les eliminará. </span>
            <br>
            <b> Educación: </b> <span v-text="educacion.nombre"> </span>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions> 
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" dark @click="dialog = false">
          <v-icon left> mdi-close </v-icon>
          Cerrar
        </v-btn>
        <v-btn color="secondary" :disabled="!formValido" :loading="formEnviando" v-if="step === 'C'" @click="submit('C')">
          <v-icon left> mdi-check-circle </v-icon>
          Agregar
        </v-btn>
        <v-btn color="secondary" :disabled="!formValido" :loading="formEnviando" v-if="step === 'U'" @click="submit('U')">
          <v-icon left> mdi-check-circle </v-icon>
          Editar
        </v-btn>
        <v-btn color="error" :loading="formEnviando" v-if="step === 'D'" @click="submit('D')">
          <v-icon left> mdi-delete </v-icon>
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';

const server_url = sessionStorage.getItem('SERVER_URL');

export default {
  name: 'EducacionesDialog',

  data() {
    return {
      // UI handlers
      dialog: false,
      step: "R",
      formValido: false,
      formEnviando: false,
      educacionCargando: true,
      mensajeError: '',
      mensajeSuccess: '',
      datosEducacionEditar: {
        id: '',
        nombre: '',
        etapa: ''
      },
      // form inputs
      educacion: {
        id: '',
        nombre: '',
        etapa: ''
      },
      // reglas de validacion
      reglas: {
        nombre: [
          v => !!v || 'Este campo es obligatorio',
          v => v && v.length <= 200 || 'Este campo debe contener como máximo 200 caracteres',
        ],
        etapa: [
          v => !!v || 'Este campo es obligatorio'
        ]
      },

      // educaciones del sistema (rellenadas en getData())
      items: []
    }
  },

  watch: {
    // si se cierra el dialog, se reinicia 
    dialog () {
      if (this.dialog) this.getData();
      setTimeout(() => {
        this.step = 'R';
        this.mensajeError = '';
        this.mensajeSuccess = '';
      }, 170);
    }
  },

  methods: {
    // cambia la vista del dialog 
    cambiarVista(vista, educacion = {}) {
      switch (vista) {
        case 'R':
          this.educacion = {
            id: '',
            nombre: '',
            etapa: ''
          };
          if (this.datosEducacionEditar.id) {
            let idx = this.items.findIndex(i => i.id == this.datosEducacionEditar.id);
            this.items[idx] = this.datosEducacionEditar;
          }
          this.mensajeSuccess = '';
          this.mensajeError = '';
          this.step = 'R';
          break;
        case 'C':
          this.educacion = {
            id: '',
            nombre: '',
            etapa: ''
          };
          this.mensajeSuccess = '';
          this.mensajeError = '';
          this.step = 'C';
          break;
        case 'U':
          this.datosEducacionEditar = {
            id: educacion.id,
            nombre: educacion.nombre,
            etapa: educacion.etapa
          };
          this.educacion = educacion;
          this.step = 'U';
          this.mensajeSuccess = '';
          this.mensajeError = '';
          break;
        case 'D':
          this.educacion = educacion;
          this.step = 'D';
          this.mensajeSuccess = '';
          this.mensajeError = '';
          break;
      }
    },

    /*
      Metodo que obtiene todas las educaciones actuales del sistema y las guarda en la variable items
    */
    async getData() {
      this.educacionCargando = true;
      this.items = [];
      await axios.get(`${server_url}/educaciones`, { withCredentials: true })
      .then((res) => {
        // Exito 200 (se hizo el select query, puede haber o no haber datos, indicado por "Vacio")
        if (res.status === 200) {
          // si hay datps se colocan en itemsEducacion
          if (res.data != 'Vacio') 
            Array.from(res.data).forEach(item => this.items.push({
              id: item.id,
              nombre: item.nombre,
              etapa: item.etapa === 'Mes' ? 'm' : item.etapa === 'Trimestre' ? 't' : item.etapa === 'Semestre' ? 's' : 'a'
            }));
          // Maneja el atributo loading del select box
          this.educacionCargando = false;
        }
      })

      .catch((error) => {
        try {
          // Error por parte del servidor
          if (error.response.status) this.mensajeError = 'Ha ocurrido un error inesperado en el servidor, intentalo de nuevo.';
        }
        catch {
          // Servidor inalcanzable
          this.mensajeError = 'El servidor no responde, intentalo de nuevo.';
          console.warn('Warning: No response status was found, is the server running? ');
        }
        finally {
          this.educacionCargando = false;
        }
      });
    },

      /*
        Form submits siempre y cuando los datos sean validos
      */
    async submit (tipo) {
      this.mensajeSuccess = '';
      this.mensajeError = '';
      // validacion
      if (!tipo === 'D' && !this.$refs.form.validate()) return;
      // maneja el atributo loading del boton
      this.formEnviando = true;
      // tipo de submit
      switch (tipo) {
        case 'C':
          // request POST
          await axios.post(`${server_url}/educaciones`, this.educacion, { withCredentials: true })
            // en caso de exito se reinicia el dialog a la vista Read y se vuelve a obtener la data
            .then((res) => {
              if (res.status === 200) {
                this.step = 'R';
                this.mensajeSuccess = 'La educación fue creada exitosamente.';
                this.getData();
                this.$emit('educacionEvent');
              }
            })
            // en caso de errores (sale el alert)
            .catch((err) => {
              try {
                if (err.response.status) this.mensajeError = err.response.data;
              }
              catch {
                this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
                console.warn('Warning: No response status was found, is the server running? ');
              }
            });
          break;
        case 'U':
          // request PUT
          await axios.put(`${server_url}/educaciones/${this.educacion.id}`, this.educacion, { withCredentials: true })
            // en caso de exito se reinicia el dialog a la vista Read y se vuelve a obtener la data
            .then((res) => {
              if (res.status === 200) {
                this.step = 'R';
                this.mensajeSuccess = 'La educación fue editada exitosamente.';
                this.getData();
                this.$emit('educacionEvent');
              }
            })
            // en caso de errores (sale el alert)
            .catch((err) => {
              try {
                if (err.response.status) this.mensajeError = err.response.data;
              }
              catch {
                this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
                console.warn('Warning: No response status was found, is the server running? ');
              }
            });
          break;
        case 'D':
          // request DELETE
          await axios.delete(`${server_url}/educaciones/${this.educacion.id}`, { withCredentials: true })
            // en caso de exito se reinicia el dialog a la vista Read y se vuelve a obtener la data
            .then((res) => {
              if (res.status === 200) {
                this.step = 'R';
                this.mensajeSuccess = 'La educación fue eliminada exitosamente.';
                this.getData();
                this.$emit('educacionEvent');
              }
            })
            // en caso de errores (sale el alert)
            .catch((err) => {
              try {
                if (err.response.status) this.mensajeError = err.response.data;
              }
              catch {
                this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
                console.warn('Warning: No response status was found, is the server running? ');
              }
            });
          break;
      }
      // maneja el atributo loading del boton
      this.formEnviando = false;
    }
  }

}
</script>

<style>
  .list-item {
    border-bottom: solid 1px lightgrey;
  }
</style>