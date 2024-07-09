<template>
  <TransitionRoot appear :show="isShow" as="template">
    <TransitionChild
      as="template"
      enter="duration-300 ease-out"
      enter-from="opacity-0 scale-95"
      enter-to="opacity-100 scale-100"
      leave="duration-200 ease-in"
      leave-from="opacity-100 scale-100"
      leave-to="opacity-0 scale-95"
    >
      <p class="ml-5 text-green-500 inline-flex bg-green-100 rounded-md p-1">
        <InformationCircleIcon class="w-5 mr-2" /> <slot></slot>
      </p>
    </TransitionChild>
  </TransitionRoot>
</template>

<script setup>
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import { TransitionRoot, TransitionChild } from "@headlessui/vue";
const props = defineProps(["isShow"]);
</script>
