<script setup>
import { ref } from "vue";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import Colaboradores from "@/components/Colaboradores.vue";
import TiposDeFardos from "@/components/TiposDeFardos.vue";

const categories = ref(["Colaboradores", "Tipos de fardos"]);
</script>

<template>
  <div class="py-10 px-4 lg:px-0">
    <TabGroup>
      <TabList class="flex space-x-1 rounded-xl bg-gray-300 p-1">
        <Tab
          v-for="category in categories"
          as="template"
          :key="category"
          v-slot="{ selected }"
        >
          <button
            :class="[
              'w-full rounded-md py-2.5 text-sm font-medium leading-5',
              'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
              selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-gray-200 hover:bg-white/[0.12] hover:text-white',
            ]"
          >
            {{ category }}
          </button>
        </Tab>
      </TabList>

      <TabPanels class="mt-2">
        <TabPanel
          :class="[
            'rounded-xl bg-white p-3',
            'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
          ]"
        >
          <Colaboradores />
        </TabPanel>
        <TabPanel
          :class="[
            'rounded-xl bg-white p-3',
            'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none ',
          ]"
        >
          <Suspense>
            <TiposDeFardos />
          </Suspense>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>
