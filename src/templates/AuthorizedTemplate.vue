<template>
  <div class="w-screen h-screen md:h-screen overflow-hidden">
    <div class="flex w-full h-full">
      <!-- Sidebar -->
      <div
        class="flex justify-center items-center md:w-[18%] lg:w-[18%] h-[60px] lg:h-full md:h-full"
      >
        <Sidebar v-if="!props.isMobile" />
        <SidebarMobile v-else :openModal="openModal" @closeModal="openModal = false" />
      </div>
      <div class="flex flex-col w-full lg:w-[82%] md:w-[82%]">
        <!-- navbar -->
        <div class="w-full relative max-h-[15%] min-h-[15%] lg:h-full overflow-hidden">
          <div v-if="props.isMobile" class="px-2 absolute mt-6">
            <button type="button" @click="openModal = true" class="absolute">
              <span><Bars3Icon class="w-7 h-7" /></span>
            </button>
          </div>
          <Navbar />
        </div>
        <!-- rutas -->
        <div class="h-[87%] lg:px-28 md:px-28 lg:pr-8 overflow-y-auto">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import SidebarMobile from '@/components/SiderbarMobile.vue'
import { Bars3Icon } from "@heroicons/vue/24/outline";

const props = defineProps(["isMobile"]);
const openModal = ref(false);
</script>
