import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: () => import('../views/Inicio.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/init',
    name: 'Init',
    component: () => import('../views/Init.vue')
  },
  {
    path: '/entrenadores',
    name: 'Entrenadores',
    component: () => import('../views/Entrenadores.vue')
  },
  {
    path: '/atletas',
    name: 'Atletas',
    component: () => import('../views/Atletas/Atletas.vue')
  },
  {
    path: '/atletas/:cedula',
    name: 'DetallesAtleta',
    component: () => import('../views/Atletas/DetallesAtleta.vue')
  },
  {
    path: '/deportes',
    name: 'Deportes',
    component: () => import('../views/Deportes.vue')
  },
  {
    path: '/deporte/:id_deporte/posiciones',
    name: 'Posiciones',
    component: () => import('../views/Posiciones.vue')
  },
  {
    path: '/deporte/:id_deporte/estadisticas',
    name: 'Estadisticas',
    component: () => import('../views/Estadisticas.vue')
  },
  {
    path: '/deporte/:id_deporte/categorias',
    name: 'Categorias',
    component: () => import('../views/Categorias.vue')
  },
  {
    path: '/deporte/:id_deporte/inscripciones',
    name: 'Inscripciones',
    component: () => import('../views/Inscripciones.vue')
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('../views/Perfil.vue')
  },
  {
    path: '/entrenamientos',
    name: 'Entrenamientos',
    component: () => import('../views/Entrenamientos.vue')
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('../views/Reportes.vue')
  },
  {
    path: '/competencias',
    name: 'Competencias',
    component: () => import('../views/Competencias.vue')
  },
  {
    path: '/competencias/:id_deporte/:id_categoria/:id',
    name: 'PanelCompetencia',
    component: () => import('../views/PanelCompetencia.vue')
  },
  {
    path: '/atletas/:cedula/historial/academico',
    name: 'HistorialAcademicoAtleta',
    component: () => import('../views/Atletas/HistorialAcademicoAtleta.vue')
  },
  {
    path: '/atletas/:cedula/historial/deportivo',
    name: 'HistorialDeportivoAtleta',
    component: () => import('../views/Atletas/HistorialDeportivoAtleta.vue')
  },
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: () => import('../views/404')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
