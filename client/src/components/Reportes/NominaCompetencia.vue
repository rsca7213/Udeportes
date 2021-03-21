<template>
  <div>
    <v-container>
      <v-row class="justify-center" v-if="items_competencias.length">
        <v-row class="justify-center">
          <v-col class="pt-0 pl-md-11" cols="12" sm="10" lg="6" xl="6">
            <v-select v-model="competencia" label="Competencias" prepend-icon="mdi-trophy" :items="items_competencias"
            clear-icon="mdi-close" name="periodo" clearable>
            </v-select>
          </v-col>
        </v-row>
        <v-col cols=12 v-if="items_competencias.length">
          <v-row v-if="!competencia">
            <v-col class="grey--text text-center"> Selecciona una competencia para generar el reporte. </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="competencias_cargando"> 
        <v-col class="px-6 mx-5">
          <v-progress-linear indeterminate color="primary"> </v-progress-linear>
        </v-col>
      </v-row>
      <v-row v-else-if="!competencias_cargando && !items_competencias.length">
        <v-col class="grey--text text-center"> No hay competencias para esta categoria. </v-col>
      </v-row>
      <v-row v-if="competencia" no-gutters>
        <v-col cols="12" lg="9" xl="8" class="elevation-4 py-4 px-6 rounded-lg">
          <v-alert text color="error" dense v-if="mensaje_error">
            <v-icon color="error"> mdi-alert </v-icon>
            <span v-text="mensaje_error" class="ml-1"> </span>
          </v-alert>
          <v-row align="center">
            <v-col cols="12">
              <v-text-field clear-icon="mdi-close" clearable label="Buscar" 
              prepend-icon="mdi-magnify" type="text" v-model="busqueda_atleta" name="busqueda"> </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12"> 
              <v-data-table :headers="atributos_tabla" :items="atletas" :search="busqueda_atleta" 
              no-data-text="No hay atletas registrados para esta competencia."
              no-results-text="No hay resultados para esta búsqueda."
              loading-text="Cargando datos..."
              locale="es-VE"
              fixed-header
              :loading="tabla_cargando"
              >
              </v-data-table>
              
            </v-col>
            
          </v-row>
        </v-col>
        <v-col cols="12" lg="3" xl="4">
          <v-row class="justify-center" v-if="chartData.length">
            <v-col lg="11" sm="8" md="10" cols="11" class="mt-6 mt-lg-0 d-flex justify-center">
              <ApexChart height="270" type="donut" :options="chartOptions" :series="chartData" class="elevation-4  rounded-lg grey lighten-4" />
            </v-col>
          </v-row>
        </v-col>
        
      </v-row>
      <v-row v-if="items_competencias.length">
        <v-col cols="12" lg="9" xl="8" class="d-flex justify-end">
          <v-btn color="primary" @click="getReporte" :disabled="atletas.length? false : true">
            <v-icon>mdi-download</v-icon>
            Generar Reporte
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import ApexChart from 'vue-apexcharts';
import axios from 'axios';
const server_url = `${sessionStorage.getItem('SERVER_URL')}:${sessionStorage.getItem('SERVER_PORT')}`;
export default {
  name: 'NominaCompetencia',
  components: {
    ApexChart
  },
  props:{
    categoria: {},
    equipo: {}
  },
  data() {
    return {

      /*UI handlers*/
      tabla_cargando: false,
      busqueda_atleta: '',
      atletas: [],
      mensaje_error: '',
      items_competencias: [],
      competencias_cargando: false,
      competencia: false,
      equipo_reporte: {
        nombre_equipo: '',
        nombre_categoria: ''
      },
      // headers de la tabla
      atributos_tabla: [
        {
          text: 'Nro. Cedula',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'cedula',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Nombre Completo',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'nombre_completo',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Correo Electrónico',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'correo',
          class: 'primary--text font-weight-bold'
        },
        {
          text: 'Educación',
          align: 'start',
          sortable: true,
          filterable: true,
          value: 'educacion_etapa',
          class: 'primary--text font-weight-bold'
        },
      ],

      chartOptions: {
        chart: {
          type: 'donut',
          offsetY: 0,
          margin: 0,
          
        },
        fill: {
          opacity: '0.85'
        },
        
        title: {
          text: 'Atletas Por Educación',
          align: 'center',
          margin: 20,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize:  '16px',
            fontWeight:  '500',
            fontFamily:  'Roboto',
            color:  '#616161'
          },
        },
        animations: {
          speed: 1600
        },

        legend: {
          offsetX: 0,
          offsetY: 0,
          floating: false,
          position: 'bottom'
        },
        
        grid: {
          padding: {
            top: -10
          },
         

        },

      },
      chartData: [],
    }
  },

  watch: {
    //método que se ejecuta cada vez que cambia la categoría(se selecciona otro valor en el select de equipos)
    categoria(){
      this.atletas=[];
      this.ratioAsistencias = 0;
      this.ratioInasistencias = 0;
      this.competencia = false;
      this.getCompetencias();
    },
    competencia(){
      this.chartData=[];
      this.atletas=[];
      this.ratioAsistencias = 0;
      this.ratioInasistencias = 0;
      if(this.competencia && this.competencia.id_competencia) this.getAtletas();
    }
  },

  methods: {
    //método que genera el reporte
    getReporte(){
      var docDefinition = {
        content: [
          {
            columns: [
              {
                width: 'auto',   
                image: 'data:image/png;base64,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',
                fit:[45, 45],margin: [ 0, -10, 0, 0 ]
              },
              {
                text: 'UDEPORTES', fontSize: 20, color: '#8BC34A', bold: true, margin: [ 10, 0, 0, 0 ],
              },
            ],
            
          },
          {text: [{text:'Nómina de Competencia: ', bold:true, color: '#2196F3'},{text:`${this.competencia.info_competencia}`}], fontSize: 14, margin: [ 0, 10, 0, 0 ]},
          {text: [{text:'Equipo: ', bold:true, color: '#2196F3'},{text:`${this.equipo}`}], fontSize: 14, margin: [ 0, 10, 0, 0 ]},
          {text: [{text:'Competencia: ', bold:true, color: '#2196F3'},{text:`${this.competencia.info_competencia}`}], fontSize: 14, margin: [ 0, 5, 0, 20 ]},
  
          {
            layout: 'lightHorizontalLines',
        
            table: {
              headerRows:1,
              widths: [70, 120, 120, '*' ],
              body: this.datos_reporte()
            }
          },
        ],
        
        footer: function(currentPage, pageCount) { return {text:`Página ${currentPage.toString()} de ${pageCount}`, margin:[40,0,0,0]};}
 
        
      };
      
      pdfMake.createPdf(docDefinition).download(`Nómina Competencia ${this.equipo} ${this.competencia.info_competencia}`);
    },
    //datos que contendrá el reporte
    datos_reporte(){
      let reporte_body = [];
      reporte_body.push([
         { text: 'Nro Cédula', bold: true, color:'#2196F3', alignment: 'right' },
         { text: 'Nombre Completo', bold: true, color:'#2196F3' },
         { text: 'Correo Electrónico', bold: true, color:'#2196F3' },
         { text: 'Educación', bold: true, color:'#2196F3' },
      ]);

      //todos los atletas del reporte
      this.atletas.forEach((atleta) =>{
        reporte_body.push([
          {text: `${atleta.cedula}`, alignment: 'right'},
          {text: `${atleta.nombre_completo}`},
          {text: `${atleta.correo}`},
          {text: `${atleta.educacion_etapa}`}
        ])
      });
      
      return reporte_body;
    },
    //método que se encarga de obtener todos los atletas pertenecientes a un equipo en específico
    async getAtletas() {
      this.tabla_cargando = true;
      await axios.get(`${server_url}/reportes/nomina/competencia/${this.categoria.id_deporte}/${this.categoria.id_categoria}/${this.competencia.id_competencia}`, { withCredentials: true } )
        .then((res) => {
          // En caso de exito
          if (res.status === 200) {
            this.atletas = res.data;

            //si existen atletas se busca la educación de todos los atletas y la cantidad de atletas en cada una de esas educaciones para agregar esos datos a la gráfica de atletas por educación del equipo
            if(this.atletas.length !==0){
              this.chartOptions.labels = [];
              this.atletas.forEach(atleta =>{

                //se agrega la educación de los atletas en caso de que la educación no se haya agregado anteriormente a la gráfica
                if(!this.chartOptions.labels.includes(atleta.educacion)){

                  this.chartOptions.labels.push(atleta.educacion);
                  
                  this.chartData.push(this.atletas.filter(atl =>{
                    return atl.educacion === atleta.educacion;
                  }).length);
                  
                }
              });      
            }
          }
        })
        .catch((error) => {
          try {
            // errores
            // Error por parte del servidor
            console.log(error.response.status);
          }
          catch (error) {
            // Servidor no disponible
            this.mensaje_error = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
            console.warn('Warning: No response status was found, is the server running? ');
          }
        });
      this.tabla_cargando = false;
    }, 
    async getCompetencias() {
      // Colocamos el loader
      this.competencias_cargando = true;
      this.items_competencias = [];
      // Request GET
      await axios.get(`${server_url}/competencias/${this.categoria.id_deporte}/${this.categoria.id_categoria}`, { withCredentials: true } )
        .then((res) => {
          // En caso de exito
          if (res.status === 200) {
            // Asignamos la data obtenida a la variable entrenamientos
            res.data.forEach(competencia => {
              // Para cada competencia del equipo
              this.items_competencias.push({
                  text: `${competencia.nombre} (${competencia.fecha_inicio +' - '+competencia.fecha_fin})`,
                  value: {
                    id_competencia: competencia.id,
                    info_competencia: `${competencia.nombre} (${competencia.fecha_inicio +' - '+competencia.fecha_fin})`
                  }
                });
            });
            //this.calcularRatios();
          }
        })
        .catch((err) => {
          try {
            // errores
            if (err.response.status) this.mensajeError = err.response.data;
          }
          catch (error) {
            // Servidor no disponible
            this.mensajeError = 'No se ha podido conectar con el servidor, intentalo de nuevo.';
            console.warn('Warning: No response status was found, is the server running? ');
          }
        });
      // Quitamos el loader
      this.competencias_cargando = false;
    },
  },
  mounted() {
    this.getCompetencias();
  }

}
</script>

<style >
.v-data-table-header th{
  white-space: nowrap;
}
</style>