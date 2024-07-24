<template>
  <div class="w-screen h-screen p-6 lg:p-0 md:p-0">
    <div class="flex w-full h-full">
      <!-- Imagen portada -->
      <div
        class="xl:w-[46.8%] lg:w-[62.5%] 2xl:w-[48%] bg-home-1 bg-cover bg-no-repeat"
      ></div>
      <!-- Formulario -->
      <div
        class="flex justify-center items-center xl:w-[53.2%] lg:w-[37.5%] 2xl:w-[52%]"
      >
        <!-- contenedor -->
        <div class="w-80">
          <!-- logo -->
          <div class="p-3 flex justify-center">
            <img src="/src/assets/img/logo_negativo.png" width="200" />
          </div>
          <form @submit.prevent="login" autocomplete="on">
            <div class="flex flex-col space-y-8 w-full">
              <input
                v-model="credentials.email"
                type="email"
                class="form-input w-full rounded-lg border-[#CED7E4] border-2 placeholder:text-dark-slate placeholder:tracking-[.5px] placeholder:font-normal hover:border-dark-slate hover:placeholder:text-slate-blue transition-colors px-2 py-1"
                placeholder="Nombre de usuario"
              />
              <input
                v-model="credentials.password"
                type="password"
                class="form-input w-full rounded-lg border-[#CED7E4] border-2 placeholder:text-dark-slate placeholder:tracking-[.5px] placeholder:font-normal hover:border-dark-slate hover:placeholder:text-slate-blue transition-colors px-2 py-1"
                placeholder="Contraseña"
              />
              <div
                class="flex justify-end text-slate-blue hover:underline cursor-pointer w-full"
              >
                <span class="text-sm">¿Olvidaste tu contraseña?</span>
              </div>
              <div class="relative w-full">
                <button
                  type="submit"
                  class="flex justify-center bg-blue-700 text-white w-full py-3 rounded-lg hover:bg-slate-blue transition-colors duration-500"
                  :disabled="loading"
                >
                  <IconSpinner v-if="loading" />
                  <span v-else> Iniciar sesión </span>
                </button>
                <div
                  v-if="error.state"
                  class="absolute -bottom-10 text-red-500"
                >
                  <p>{{ error.message }}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import IconSpinner from "@/components/icons/IconSpinner.vue";
import { useRouter } from "vue-router";
import { useUserRol } from "@/stores/user";

const credentials = reactive({
  email: "",
  password: "",
});
const store = useUserRol()
const error = reactive({
  state: false,
  message: "El usuario no existe.",
});
const router = useRouter();
const loading = ref(false);

const login = async () => {
  loading.value = true;
  await signInWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  )
    .then(async (snapshot) => {
      await snapshot.user.getIdToken(true).then((token) => {
        store.setCustomClaim(token)
      });
      router.push({ name: "home" });
    })
    .catch((e) => {
      console.log(e);
      error.state = true;
      switch (e.code) {
        case "auth/wrong-password":
          error.message = "Usuario o contraseña incorrecta.";
          break;
        case "auth/user-not-found":
          error.message = "Usuario o contraseña incorrecta.";
          break;
        case "auth/invalid-email":
          error.message = "Usuario o contraseña no válidos";
          break;
        default:
          error.message = "Por favor intentalo más tarde.";
          break;
      }
      loading.value = false;
    });
};
</script>
