<script setup>
import { ref } from "vue";
import {
  InboxArrowDownIcon,
  PaperAirplaneIcon,
} from "@heroicons/vue/24/outline";
import FardosInventoryTable from "@/components/FardosInventoryTable.vue";
import FardosInventoryTableSuspense from "@/components/suspense/FardosInventoryTableSuspense.vue";
</script>

<template>
  <div class="py-10 px-4 lg:px-0">
    <div class="flex flex-col h-full space-y-14">
      <div class="flex flex-col space-y-4 lg:space-y-0 lg:flex-row items-center justify-around">
        <div
          @click="$router.push({ name: 'fardos-entradas' })"
          class="relative border-2 p-4 min-h-48 min-w-52 rounded-md border-gray-200 shadow-md bg-gradient-to-r from-white to-blue-200/85 hover:to-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
        >
          <h2 class="text-xl font-semibold">Entrada de fardos</h2>
          <InboxArrowDownIcon class="absolute w-8 h-8 bottom-5 right-5" />
        </div>
        <div
          @click="$router.push({ name: 'fardos-salidas' })"
          class="relative border-2 p-4 min-h-48 min-w-52 rounded-md border-gray-200 shadow-md bg-gradient-to-r from-white to-blue-200/85 hover:to-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
        >
          <h2 class="text-xl font-semibold">Salida de fardos</h2>
          <PaperAirplaneIcon class="absolute w-8 h-8 bottom-5 right-5" />
        </div>
      </div>
    </div>
    <!-- Fardos table -->
    <div class="mt-12 px-0 lg:px-28">
      <Suspense>
        <FardosInventoryTable />
        <template #fallback>
          <FardosInventoryTableSuspense />
        </template>
      </Suspense>
    </div>
  </div>
</template>
