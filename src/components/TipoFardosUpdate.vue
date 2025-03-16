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
                  <p>Editar tipo de fardo</p>
                  <PencilSquareIcon class="w-8" />
                </DialogTitle>
                <div class="mt-6 relative">
                  <form @submit.prevent="updateFardo()">
                    <div class="grid gap-6 mb-6 md:grid-cols-1">
                      <div class="relative">
                        <label
                          for="nombre"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >Nombre</label
                        >
                        <input
                          type="text"
                          v-model="fardoData.nombre"
                          id="nombre"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <p v-for="error of v$.nombre?.$errors" :key="error.$uid">
                          <span class="text-red-400 text-sm absolute"
                            >El nombre es obligatorio</span
                          >
                        </p>
                      </div>
                      <div class="flex justify-between px-8">
                        <button
                          type="button"
                          @click="closeModal()"
                          class="bg-red-500 py-2 text-white rounded-md text-sm hover:bg-red-400 min-w-28 max-w-28"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          class="bg-blue-600 py-2 text-white rounded-md text-sm hover:bg-blue-500 relative min-w-28 max-w-28"
                        >
                          <IconSpinner :isLoading="isLoading" />
                          <span v-show="!isLoading">Actualizar</span>
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
  import { PencilSquareIcon } from "@heroicons/vue/24/outline";
  import { useVuelidate } from "@vuelidate/core";
  import { email, required } from "@vuelidate/validators";
  import IconSpinner from "./icons/IconSpinner.vue";
  import {
    collection,
    query,
    where,
    getDocs,
  } from "firebase/firestore";
  import { db, auth } from "../firebase";
  import { getFunctions, httpsCallable } from "firebase/functions"
  import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
  } from "@headlessui/vue";
  
  const props = defineProps(["isOpen", "fardo"]);
  const functions = getFunctions();
  const emits = defineEmits(["closeModal", "isUpdated"]);
  const verifyEmail = ref(false);
  const isLoading = ref(false);
  const fardoData = reactive({
    nombre: props.fardo.name,
  });
  const rules = {
    nombre: { required },
  };
  const v$ = useVuelidate(rules, fardoData);
  
  const updateFardo = async () => {
   const updateFardo = httpsCallable(functions, 'updateFardo');
    isLoading.value = true;
    const result = await v$.value.$validate();
  
    if (!result || verifyEmail.value) {
      isLoading.value = false;
      return false;
    } 
  
    const data = {
      newName: fardoData.nombre.trim().replace("/", ""),
      id: props.fardo.id,
      uid: auth.currentUser.uid,
    };

    await updateFardo(data).then((result) => {
        emits("isUpdated");
        emits("closeModal");
    }).catch((error) => {
        emits("closeModal");
        console.log(error)
    })
  };
  
  const closeModal = () => {
    v$.value.$reset();
    emits("closeModal");
  };
  </script>
  