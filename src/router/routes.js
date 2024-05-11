const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'old', component: () => import('pages/IndexPage.vue') },
      { path: '/detail', component: () => import('pages/PokeDetail.vue') },
      { path: '/tujian', component: () => import('pages/TuJian.vue') },
      { path: '', component: () => import('pages/VeTest.vue') },
      { path: '/scan', component: () => import('pages/PokeScan.vue') },
    ]
  },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
