<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal()" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="flex justify-between items-center text-lg font-medium leading-6 text-gray-900"
              >
                <p>Agregar nuevo colaborador</p>
                <UserPlusIcon class="w-8" />
              </DialogTitle>
              <div class="mt-6 relative">
                <form @submit.prevent="createUser()">
                  <div class="grid gap-6 mb-6 md:grid-cols-1">
                    <div class="relative">
                      <label
                        for="nombre"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Nombre/s</label
                      >
                      <input
                        type="text"
                        v-model="userData.nombre"
                        id="nombre"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Julio Ricardo"
                      />
                      <p v-for="error of v$.nombre?.$errors" :key="error.$uid">
                        <span class="text-red-400 text-sm absolute"
                          >El nombre es obligatorio</span
                        >
                      </p>
                    </div>
                    <div class="relative">
                      <label
                        for="apellido_paterno"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Apellido paterno</label
                      >
                      <input
                        type="text"
                        v-model="userData.apellido_paterno"
                        id="apellido_paterno"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Rodriguez"
                      />
                      <p
                        v-for="error of v$.apellido_paterno?.$errors"
                        :key="error.$uid"
                      >
                        <span class="text-red-400 text-sm absolute"
                          >El apellido paterno es obligatorio</span
                        >
                      </p>
                    </div>
                    <div class="relative">
                      <label
                        for="apellido_materno"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Apellido materno</label
                      >
                      <input
                        type="text"
                        v-model="userData.apellido_materno"
                        id="apellido_materno"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Martinez"
                      />
                      <p
                        v-for="error of v$.apellido_materno?.$errors"
                        :key="error.$uid"
                      >
                        <span class="text-red-400 text-sm absolute"
                          >El apellido materno es obligatorio</span
                        >
                      </p>
                    </div>
                    <div class="relative">
                      <label
                        for="email"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Correo</label
                      >
                      <input
                        type="email"
                        v-model="userData.email"
                        id="email"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="correo@correo.com"
                      />
                      <p v-for="error of v$.email?.$errors" :key="error.$uid">
                        <span class="text-red-400 text-sm absolute"
                          >El correo es obligatorio</span
                        >
                      </p>
                      <p v-if="verifyEmail">
                        <span class="text-red-400 text-sm absolute"
                          >El correo ya existe</span
                        >
                      </p>
                    </div>

                    <div class="relative">
                      <label
                        for="rol"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Rol</label
                      >
                      <select
                        v-model="userData.rol"
                        id="countries"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="" selected disabled>
                          Selecciona rol
                        </option>
                        <option value="admin">Administrador</option>
                        <option value="colaborador">Colaborador</option>
                        <option value="reporteador">Reporteador</option>
                      </select>
                      <p v-for="error of v$.rol?.$errors" :key="error.$uid">
                        <span class="text-red-400 text-sm absolute"
                          >El rol es obligatorio</span
                        >
                      </p>
                    </div>
                    <div class="flex justify-between px-8">
                      <button
                        type="button"
                        @click="closeModal()"
                        class="bg-red-500 py-2 px-8 text-white rounded-md text-sm hover:bg-red-400 min-w-28 max-w-28"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        class="bg-blue-600 py-2 px-8 text-white rounded-md text-sm hover:bg-blue-500 relative min-w-28 max-w-28"
                      >
                        <IconSpinner :isLoading="isLoading" />
                        <span v-show="!isLoading">Agregar</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { reactive, ref } from "vue";
import { UserPlusIcon } from "@heroicons/vue/24/outline";
import { useVuelidate } from "@vuelidate/core";
import { email, required } from "@vuelidate/validators";
import IconSpinner from "./icons/IconSpinner.vue";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const props = defineProps(["isOpen"]);
const emits = defineEmits(["closeModal", "isCreated"]);
const verifyEmail = ref(false);
const isLoading = ref(false);
const userData = reactive({
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  rol: "",
});
const rules = {
  nombre: { required },
  apellido_paterno: { required },
  apellido_materno: { required },
  email: { required, email },
  rol: { required },
};
const v$ = useVuelidate(rules, userData);

const createUser = async () => {
  isLoading.value = true;
  const result = await v$.value.$validate();
  verifyEmail.value = await validateEmail();
  if (!result || verifyEmail.value) {
    isLoading.value = false;
    return false;
  } 

  try {
    const docRef = await addDoc(collection(db, "colaboradores"), {
      nombre: userData.nombre.trim(),
      apellido_paterno: userData.apellido_paterno.trim(),
      apellido_materno: userData.apellido_materno.trim(),
      email: userData.email.trim(),
      rol: userData.rol,
      activo: true,
      fecha_creacion: serverTimestamp(),
    });
    isLoading.value = false;
    emits("isCreated");
    closeModal();
  } catch (error) {
    console.log("Error al agregar el documento: ", error);
    isLoading.value = false;
  }
  
};

const validateEmail = async () => {
  try {
    const colRef = collection(db, "colaboradores");

    const q = query(colRef, where("email", "==", userData.email));

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? false : true;
  } catch (error) {
    console.log("Error al verificar correo: ", error);
    return true;
  }
};

const closeModal = () => {
  Object.assign(userData, {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    rol: "",
  });
  v$.value.$reset();
  emits("closeModal");
};
</script>
