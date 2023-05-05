// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/cyboty-dist5/',
    redirect: '/cyboty-dist5/parameter_configuration'
  },
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
    //     component: () => import(/* webpackChunkName: "home" */ '@/views/ParameterConfiguration.vue'),
    //   },
    // ],
    path: '/cyboty-dist5/parameter_configuration',
    component: () => import('@/views/ParameterConfiguration')
  },
  {
    path: '/cyboty-dist5/dh_parameter',
    component: () => import('@/views/DHParameter')
  },
  {
    path: '/cyboty-dist5/forward_kinematics',
    component: () => import('@/views/ForwardKinematics')
  },
  {
    path: '/cyboty-dist5/inverse_kinematics',
    component: () => import('@/views/InverseKinematics')
  },
  {
    path: '/cyboty-dist5/workspace',
    component: () => import('@/views/WorkSpace')
  },
  {
    path: '/cyboty-dist5/trajectory_planning',
    component: () => import('@/views/TrajectoryPlanning')
  },
  {
    path: '/cyboty-dist5/personal_information',
    component: () => import('@/views/PersonalInformation')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
