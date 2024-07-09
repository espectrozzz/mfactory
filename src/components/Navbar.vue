<template>
    <div class="w-full h-full pr-44 pl-8 lg:p-0 md:p-0">
      <div class="flex items-center justify-between lg:px-24 md:px-24 w-full h-full">
        <!-- logo -->
        <div class="lg:w-[70%] md:lg:w-[70%] w-[70%]">
          <img src="/src/assets/img/logo_negativo.png" width="120" />
        </div>
        <!-- Menu -->
        <div class="flex items-center w-[20%]">
          <!-- logout -->
          <div
            @click="isOpenConfirm = true"
            class="flex items-center space-x-4 hover:bg-slate-blue/40 p-2 rounded-lg transition-colors duration-300 cursor-pointer font-semibold"
          >
            <IconLogout />
            <span>Salir</span>
          </div>
        </div>
      </div>
      <ModalConfirm :isOpen="isOpenConfirm" @closeModal="isOpenConfirm = false" @confirm="logout">
        <template #message> ¿Desea cerrar sesión? </template>
        <template #button> Salir </template>
      </ModalConfirm>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue"
  import { getAuth, signOut } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  import IconLogout from './icons/IconLogout.vue'
  import ModalConfirm from './ModalConfirm.vue';
  
  const auth = getAuth()
  const router = useRouter()
  const isOpenConfirm = ref(false)
  
  const logout = async () => {
    await signOut(auth)
      .then(() => {
        localStorage.removeItem('token')
        router.push({ name: 'login' })
      })
      .catch((e) => {
        alert('Ocurrió un error, intentalo de nuevo.')
      })
  }
  </script>
  