<template>
  <div>
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th scope="col" class="px-6 py-3 rounded-s-lg">Tipo de fardo</th>
          <th scope="col" class="px-6 py-3">Cantidad existente</th>
          <th scope="col" class="px-6 py-3">En stock</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="value in data" class="bg-white dark:bg-gray-800">
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {{ value.name }}
          </th>
          <td class="px-6 py-4">{{ value.value }}</td>
          <td class="px-6 py-4">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                value.in_stock ? 'bg-green-500' : 'bg-red-500',
              ]"
            ></div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="font-semibold text-gray-900 dark:text-white">
          <th scope="row" class="px-6 py-3 text-base">Total</th>
          <td class="px-6 py-3">{{ total }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "../firebase";
import { getDocs, collection } from "firebase/firestore";

const data = ref([]);
const total = ref(0);

const fetchData = async () => {
  const docRef = collection(db, "inventory");

  const snapshot = await getDocs(docRef);

  if (!snapshot.empty) {
    snapshot.forEach((fardo) => {
      if (fardo.data().in_stock) {
        total.value += fardo.data().value;
      }
      data.value.push({
        name: fardo.id,
        value: fardo.data().value,
        in_stock: fardo.data().in_stock,
      });
    });
  }
};

await fetchData();
</script>
