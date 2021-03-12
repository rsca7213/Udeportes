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
