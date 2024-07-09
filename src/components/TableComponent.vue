<template>
  <div>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table
        class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th v-for="column in columns" scope="col" class="px-6 py-3">
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in handlePagination().rowsFilter.value"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td
              v-for="data in row.data"
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              <div v-if="data.type === 'text'">{{ data.content }}</div>
              <div v-if="data.type === 'status'" class="ml-4">
                <div
                  :class="[
                    'w-3 h-3 rounded-full ',
                    data.content ? 'bg-green-500' : 'bg-red-500',
                  ]"
                ></div>
              </div>
              <div v-if="data.type === 'action'">
                <button
                  type="button"
                  @click="$emit('alertFunc', row)"
                  class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {{ data.content }}
                </button>
              </div>
              <div v-if="data.type === 'date'">
                {{ convertDate(data.content) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Paginación -->
    <div class="flex space-x-6 w-full justify-end mt-3">
      <div
        @click="handlePagination().backPage()"
        class="flex space-x-4 select-none items-center justify-center cursor-pointer hover:text-slate-blue transition-colors duration-200"
      >
        <ChevronLeftIcon class="w-5 h-5 mt-.5" />
        <span>Anterior</span>
      </div>
      <div class="flex text-dark-slate">
        Pag {{ handlePagination().page }} de
        {{
          Math.ceil(rows.length / perPage) === 0
            ? 1
            : Math.ceil(rows.length / perPage)
        }}
      </div>
      <div
        @click="handlePagination().nextPage()"
        class="flex space-x-4 select-none items-center justify-center cursor-pointer hover:text-slate-blue transition-colors duration-200"
      >
        <span>Siguiente</span>
        <ChevronRightIcon class="w-5 h-5 mt-.5" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import moment from "moment";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/vue/24/outline"

const props = defineProps(["columns", "rows"]);
const page = ref(1);
const perPage = 5;

const convertDate = (timestamp) => {
  let formatDate;
  if (timestamp) {
    const date = new Date(timestamp);
    formatDate = moment(date).format("DD/MM/YYYY HH:mm");
  } else {
    formatDate = "";
  }

  return formatDate;
};

// control paginación
function handlePagination() {
  const rowsFilter = computed(() =>
    props.rows.slice((page.value - 1) * perPage, page.value * perPage)
  );

  const nextPage = () => {
    if (page.value !== Math.ceil(props.rows.length / perPage)) {
      page.value += 1;
    }
  };

  const backPage = () => {
    if (page.value !== 1) {
      page.value -= 1;
    }
  };

  const goToPage = (numPage) => {
    page.value = numPage;
  };

  return {
    rowsFilter,
    perPage,
    page,
    nextPage,
    backPage,
    goToPage,
  };
}
</script>
