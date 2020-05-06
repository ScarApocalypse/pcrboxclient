import Vue from "vue"
import VueRouter from "vue-router"

import RoleList from "../views/roleslist"
Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    redirect: "/roleslist"
  },
  {
    path: "/roleslist",
    name: "roleslist",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: RoleList
  }
]

const router = new VueRouter({
  routes
})

export default router
