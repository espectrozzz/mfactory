<template>
    <div class="w-screen lg:h-screen md:h-screen overflow-hidden">
      <div class="flex w-full h-full">
        <!-- Sidebar -->
        <div class="flex justify-center items-center md:w-[18%] lg:w-[18%] h-[60px] lg:h-full md:h-full">
          <div v-if="props.isMobile" class="px-2 relative mt-3">
            <button type="button" @click="openModal = true" class="absolute">
              <span><Bars3Icon class="w-7 h-7" /></span>
            </button>
          </div>
          <Sidebar v-if="!props.isMobile" />
        </div>
        <div class="flex flex-col w-full lg:w-[82%] md:w-[82%]">
          <!-- navbar -->
          <div class="w-full h-[12%]">
            <Navbar />
          </div>
          <!-- rutas -->
          <div class="w-full h-[87%] lg:px-28 md:px-28 pr-8">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import Sidebar from '@/components/Sidebar.vue'
  import Navbar from '@/components/Navbar.vue'
  //import SidebarMobile from '../components/SidebarMobile.vue'
  import { Bars3Icon } from '@heroicons/vue/24/outline'
  
  const props = defineProps(['isMobile'])
  const openModal = ref(false)
  </script>
  