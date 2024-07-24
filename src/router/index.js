import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";
import { auth } from "../firebase";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import UsersView from "../views/UsersView.vue";
import FardosView from "../views/FardosView.vue";
import ReportsView from "../views/ReportsView.vue";
import AdminView from "../views/AdminView.vue";
import FardosIn from "@/components/FardosIn.vue";
import FardosOut from "@/components/FardosOut.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "Home",
        authorization: true,
        layout: false,
        onlyAdmin: false,
        authorizedRol: ["admin", "colaborador", "reporteador"],
      },
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
      meta: { title: "About", authorization: true, layout: false },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: {
        title: "Login",
        authorization: false,
        layout: true,
        onlyAdmin: false,
        authorizedRol: ["admin", "colaborador", "reporteador"],
      },
    },
    {
      path: "/fardos/entradas",
      name: "fardos-entradas",
      component: FardosIn,
      meta: {
        title: "Entradas",
        authorization: true,
        layout: false,
        onlyAdmin: false,
        authorizedRol: ["admin", "colaborador"],
      },
    },
    {
      path: "/fardos/salidas",
      name: "fardos-salidas",
      component: FardosOut,
      meta: {
        title: "Salidas",
        authorization: true,
        layout: false,
        onlyAdmin: false,
        authorizedRol: ["admin", "colaborador"],
      },
    },
    {
      path: "/fardos",
      name: "fardos",
      component: FardosView,
      meta: {
        title: "Fardos",
        authorization: true,
        layout: false,
        onlyAdmin: false,
        authorizedRol: ["admin", "colaborador"],
      },
    },
    {
      path: "/reportes",
      name: "reportes",
      component: ReportsView,
      meta: {
        title: "Reportes",
        authorization: true,
        layout: false,
        onlyAdmin: true,
        authorizedRol: ["admin", "reporteador"],
      },
    },
    {
      path: "/administrador",
      name: "administrador",
      component: AdminView,
      meta: {
        title: "Administrador",
        authorization: true,
        layout: false,
        authorizedRol: ["admin"],
      },
    },
  ],
});

function validToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const { rol } = jwtDecode(token);

  return rol;
}

router.beforeEach(async (to, from, next) => {
  document.title = to.meta?.title;
  const isUser = await getCurrentUser();
  let rol;
  if (isUser) {
    rol = validToken();
    console.log(to.meta.authorizedRol);
  }
  if (to.meta.authorization) {
    if (!isUser) {
      next({ path: "/login" });
    } else if (isUser && !to.meta.authorizedRol.includes(rol)) {
      next({ name: "home" });
    } else next();
  } else if (to.name === "login" && isUser) {
    next({ path: "/" });
  } else next();
});

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        unsubscribe();
        resolve(user);
      },
      () => {
        localStorage.removeItem("token");
        reject();
      }
    );
  });
}

export default router;
