import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Chart from "./views/Chart.vue";
import scorings from "./views/scorings.vue";
import Employees from "./views/Employees.vue";
import Login from "./views/Login.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/chart",
      name: "chart",
      component: Chart
    },
    {
      path: "/scorings",
      name: "scorings",
      component: scorings
    },
    {
      path: "/employees",
      name: "employees",
      component: Employees
    },
    {
      path: "/login",
      name: "login",
      component: Login
    }
  ],
  mode: "history"
});
