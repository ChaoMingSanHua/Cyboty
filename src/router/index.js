// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    // path: '/',
    // component: () => import('@/layouts/default/Default.vue'),
    // children: [
    //   {
    //     path: '',
    //     name: 'Home',
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    //   },
    // ],

    path: '/',
    component: () => import('@/views/Home')
  },
  {
    path: '/forward_kinematics',
    component: () => import('@/views/ForwardKinematics')
  },
  {
    path: '/inverse_kinematics',
    component: () => import('@/views/InverseKinematics')
  },
  {
    path: '/trajectory_planning',
    component: () => import('@/views/TrajectoryPlanning')
  },
  {
    path: '/personal_information',
    component: () => import('@/views/PersonalInformation')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router