<template>
  <div class="relative w-full h-full bg-[#141627]">
    <div class="flex flex-col w-full h-full items-center py-8">
      <!-- Tarjeta bienvenida -->
      <div class="flex space-x-4">
        <!-- icono -->
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full bg-gainsboro"
        >
          <UserIcon class="text-white w-10" />
        </div>
        <!--  -->
        <div class="text-white">
          <h3>Bienvenido</h3>
          <p class="text-xl">{{ auth.currentUser?.displayName }}</p>
        </div>
      </div>
      <!-- separador -->
      <div
        class="mt-8 flex w-full items-center justify-center transition-all duration-600"
      >
        <div class="flex w-[80%] border-b-[3px] border-white"></div>
      </div>
      <!-- links -->
      <div class="w-[80%] h-auto mt-10">
        <ul class="flex flex-col space-y-4 text-white px-2">
          <li
            :class="[
              $route.path == '/' ? 'bg-[#6B76D1]/40' : '',
              'flex items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
            ]"
            @click="$router.push({ name: 'home' })"
          >
            <div
              class="flex space-x-2 items-center min-w-[120px] max-w-[120px]"
            >
              <div><IconDashboard :color="'#ffff'" /></div>
              <div>Home</div>
            </div>
          </li>
          <li
            v-if="customClaim === 'admin' || customClaim === 'reporteador'"
            :class="[
              $route.path == '/reportes' ? 'bg-[#6B76D1]/40' : '',
              'flex w-full items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
            ]"
            @click="$router.push({ name: 'reportes' })"
          >
            <div
              class="flex space-x-2 items-center min-w-[120px] max-w-[120px]"
            >
              <div><IconReport :color="'#ffff'" /></div>
              <div>Reportes</div>
            </div>
          </li>
          <li
            v-if="customClaim === 'admin' || customClaim === 'colaborador'"
            :class="[
              $route.path == '/fardos' || $route.path.includes('/fardos/') ? 'bg-[#6B76D1]/40' : '',
              'flex w-full items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
            ]"
            @click="$router.push({ name: 'fardos' })"
          >
            <div
              class="flex space-x-2 items-center min-w-[120px] max-w-[120px]"
            >
              <div><ArchiveBoxIcon class="text-white w-6 h-6" /></div>
              <div>Fardos</div>
            </div>
          </li>
          <li
            v-if="customClaim === 'admin'"
            :class="[
              $route.path == '/administrador' ? 'bg-[#6B76D1]/40' : '',
              'flex w-full items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
            ]"
            @click="$router.push({ name: 'administrador' })"
          >
            <div
              class="flex space-x-2 items-center min-w-[120px] max-w-[120px]"
            >
              <div><CogIcon class="text-white w-6 h-6" /></div>
              <div>Administrador</div>
            </div>
          </li>
        </ul>
      </div>
      <div class="absolute text-white bottom-0 p-2">v1.3.0</div>
    </div>
  </div>
</template>

<script setup>
import { auth } from "../firebase.js";
import IconTicket from "./icons/IconTicket.vue";
import IconDashboard from "./icons/IconDashboard.vue";
import IconReport from "./icons/IconReport.vue";
import {
  CogIcon,
  UserIcon,
  ArchiveBoxIcon,
} from "@heroicons/vue/24/outline";
import { useUserRol } from "@/stores/user";
import { storeToRefs } from "pinia";

const store = useUserRol();
const { customClaim } = storeToRefs(store);

// const version = __APP_VERSION__;
</script>
