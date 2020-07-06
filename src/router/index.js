import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      login: false,
      title: '線上相簿'
    }
  },
  {
    path: '/reg',
    name: 'Reg',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "reg" */ '../views/Reg.vue'),
    meta: {
      login: false,
      title: '線上相簿 ｜ 註冊'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
    meta: {
      login: false,
      title: '線上相簿 ｜ 登入'
    }
  },
  {
    path: '/album',
    name: 'Album',
    component: () => import(/* webpackChunkName: "album" */ '../views/Album.vue'),
    meta: {
      login: true
      // 因為還未登入，無法正確抓取 'xxx' 的相簿，所以要用另外一種方式寫 title
    }
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // 如果要去的地方'需要登入'，且 user 尚未登入，就轉到 login 頁面
  if (to.meta.login && !store.state.user) {
    next('/login')
  } else {
    // 有登入，就去到他自己的相簿裡
    next()
  }
})

router.afterEach((to, from) => {
  // if , else
  document.title = (to.name !== 'Album') ? to.meta.title : store.state.user + ' 的相簿'
  // if(to.name !== 'Album') document.title = to.meta.title
  // else document.title = store.state.user + ' 的相簿'
})

export default router
