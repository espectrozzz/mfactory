<template>
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="emits('closeModal')" class="relative z-10">
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
          <div class="flex min-h-full items-center justify-center p-4 text-center">
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
                class="flex flex-col w-full max-w-xl transform overflow-hidden rounded-2xl bg-white py-6 px-4 lg:px-14 md:px-14 text-left align-middle shadow-xl transition-all"
              >
                <div class="text-center py-8">
                  <slot name="message"></slot>
                </div>
                <div class="flex w-full justify-around lg:justify-between md:justify-between">
                  <button
                    @click="emits('closeModal')"
                    type="submit"
                    class="flex justify-center text-dark-slate border-2 hover:bg-slate-100 px-4 lg:px-12 md:px-12 py-3 rounded-lg hover:bg-slate-blue transition-colors duration-500"
                  >
                    <span> Cancelar </span>
                  </button>
                  <button
                    @click="confirm"
                    type="submit"
                    class="flex justify-center lg:min-w-[160px] md:min-w-[160px] bg-blue-700 text-white px-8 lg:px-12 md:px-12 py-3 rounded-lg hover:bg-blue-500 transition-colors duration-500"
                    :disabled="loadingConfirm"
                  >
                    <IconSpinner v-if="loadingConfirm" />
                    <span v-else> <slot name="button"></slot> </span>
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch } from 'vue'
  import { getFirestore, collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore'
  import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
  import IconSpinner from '@/components/icons/IconSpinner.vue'
  
  const props = defineProps(['isOpen', 'loading'])
  const emits = defineEmits(['closeModal', 'confirm'])
  
  function confirm() {
    emits('confirm')
  }
  
  /*
  watch(loadingConfirm, (value, old) => {
    if(loadingConfirm.value == false) {
      emits("closeModal")
    }
  })
  */
  </script>
  