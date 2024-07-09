import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";
import { auth } from "../firebase";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import UsersView from "../views/UsersView.vue";
import FardosView from "../views/FardosView.vue";
import ReportsView from "../views/ReportsView.vue";

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
      },
    },
    {
      path: "/users",
      name: "users",
      component: UsersView,
      meta: {
        title: "Usuarios",
        authorization: true,
        layout: false,
        onlyAdmin: true,
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
      },
    },
  ],
});

function validToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const { admin } = jwtDecode(token);

  return admin;
}

router.beforeEach(async (to, from, next) => {
  document.title = to.meta?.title;
  const isUser = await getCurrentUser();
  let isAdmin;
  if (isUser) {
    isAdmin = validToken();
  }
  if (to.meta.authorization) {
    if (!isUser) {
      next({ path: "/login" });
    } else if (to.meta.onlyAdmin && !isAdmin) {
      next({ path: "/" })
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
