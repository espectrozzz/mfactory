<template>
  <TransitionRoot appear :show="openModal" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50 h-full">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex h-full items-start justify-start text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="w-0"
            enter-to="w-full"
            leave="duration-200 ease-in"
            leave-from="w-full"
            leave-to="w-0"
          >
            <DialogPanel
              class="flex min-h-full w-[60%] bg-[#141627] max-w-xs transform flex-col justify-between overflow-hidden p-6 text-left align-middle shadow-xl transition-all"
            >
              <div class="flex flex-col w-full h-full items-center py-8">
                <!-- Tarjeta bienvenida -->
                <div class="flex space-x-4">
                  <!-- icono -->
                  <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-gainsboro"
                  >
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/siosapp-335118.appspot.com/o/resource%2Ficons%2Fsvg%2Fsidebar%2Fusuario.svg?alt=media&token=e8deb6f4-06f3-4d0b-a903-0c1863c09f37"
                      width="30"
                    />
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
                <div class="w-full h-auto mt-10">
                  <ul class="flex flex-col space-y-4 text-white px-2">
                    <li
                      :class="[
                        $route.path == '/' ? 'bg-[#6B76D1]/40' : '',
                        'flex items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
                      ]"
                      @click="changeRoute('home')"
                    >
                      <div
                        class="flex space-x-2 items-center min-w-[120px] max-w-[120px]"
                      >
                        <div><IconDashboard :color="'#ffff'" /></div>
                        <div>Home</div>
                      </div>
                    </li>
                    <li
                      v-if="
                        customClaim === 'admin' || customClaim === 'reporteador'
                      "
                      :class="[
                        $route.path == '/reportes' ? 'bg-[#6B76D1]/40' : '',
                        'flex w-full items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
                      ]"
                      @click="changeRoute('reportes')"
                    >
                      <div
                        class="flex space-x-2 items-center min-w-[120px] max-w-[120px]"
                      >
                        <div><IconReport :color="'#ffff'" /></div>
                        <div>Reportes</div>
                      </div>
                    </li>
                    <li
                      v-if="
                        customClaim === 'admin' || customClaim === 'colaborador'
                      "
                      :class="[
                        $route.path == '/fardos' ||
                        $route.path.includes('/fardos/')
                          ? 'bg-[#6B76D1]/40'
                          : '',
                        'flex w-full items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
                      ]"
                      @click="changeRoute('fardos')"
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
                        $route.path == '/administrador'
                          ? 'bg-[#6B76D1]/40'
                          : '',
                        'flex w-full items-center justify-center space-x-4 p-3 rounded-lg cursor-pointer select-none transition-all duration-300',
                      ]"
                      @click="changeRoute('administrador')"
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
                <div class="absolute text-white bottom-0 p-2">v1.5.1</div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref } from "vue";
import { auth } from "../firebase.js";
import { CogIcon, UserIcon, ArchiveBoxIcon } from "@heroicons/vue/24/outline";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from "@headlessui/vue";
import IconDashboard from "./icons/IconDashboard.vue";
import IconReport from "./icons/IconReport.vue";
import { useUserRol } from "@/stores/user";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps(["openModal"]);
const emits = defineEmits(["closeModal"]);
const closeModal = () => {
  emits("closeModal");
};
const store = useUserRol();
const { customClaim } = storeToRefs(store);

const changeRoute = (route) => {
  router.push({ name: route });
  emits("closeModal");
};
</script>
