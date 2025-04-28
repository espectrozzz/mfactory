<template>
  <div>
    <div class="flex flex-col lg:flex-row mb-5 gap-y-4 lg:gap-x-4">
      <div>
        <input
          v-model="filter"
          type="text"
          @keyup.enter="search"
          class="bg-gray-50 border w-full lg:w-80 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Buscar..."
        />
      </div>
      <div>
        <button
          type="button"
          id="search"
          @click="search"
          class="bg-blue-500 w-full hover:bg-blue-400 text-white px-4 py-2 rounded-md min-w-20 lg:max-w-20 min-h-10 max-h-10 relative"
        >
          Buscar
        </button>
      </div>
      <div
        v-show="data.length !== dataFilter.length"
        class="flex justify-center"
      >
        <button
          type="button"
          id="reload"
          @click="reload"
          class="flex justify-center items-center w-full"
        >
          <ArrowPathIcon
            class="w-5 h-5 transition-all duration-300 hover:rotate-90"
          />
        </button>
      </div>
    </div>
    <div class="hidden">
      <QRCodeVue3
        v-if="qrShow"
        ref="qr"
        :width="108"
        :height="70"
        imgclass="qr-class"
        :value="qrData"
        :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
        :dotsOptions="{
          type: 'classy',
          color: '#26249a',
          gradient: {
            type: 'linear',
            rotation: 0,
            colorStops: [
              { offset: 0, color: '#26249a' },
              { offset: 1, color: '#26249a' },
            ],
          },
        }"
      />
    </div>
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
          <th scope="col" class="px-6 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="value in handlePagination().rowsFilter.value"
          class="bg-white dark:bg-gray-800"
        >
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            {{ value.name }}
          </th>
          <td class="px-6 py-4 font-medium">{{ value.value }}</td>
          <td class="px-6 py-4">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                value.in_stock ? 'bg-green-500' : 'bg-red-500',
              ]"
            ></div>
          </td>
          <td class="px-6 py-4">
            <button
              type="button"
              @click="exportToPDF(value.name)"
              title="Generar Ticket en PDF"
            >
              <TicketIcon class="w-5 h-5" />
            </button>
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
        Math.ceil(dataFilter.length / perPage) === 0
          ? 1
          : Math.ceil(dataFilter.length / perPage)
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
</template>

<script setup>
import { ref, computed } from "vue";
import { db } from "../firebase";
import { getDocs, collection } from "firebase/firestore";
import { TicketIcon } from "@heroicons/vue/24/outline";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import QRCodeVue3 from "qrcode-vue3";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

const barcode = ref(null);
const data = ref([]);
const dataFilter = ref([]);
const total = ref(0);
const qrShow = ref(false);
const qrData = ref("");
const page = ref(1);
const perPage = 10;
const filter = ref("");

const search = () => {
  page.value = 1;
  dataFilter.value = data.value.filter((value, index) => {
    console.log("TOFILTER", {
      comparar: value.name.toLocaleLowerCase(),
      con: filter.value.toLocaleLowerCase(),
    });
    if (
      value.name.toLocaleLowerCase().includes(filter.value.toLocaleLowerCase())
    ) {
      return value;
    }
  });
};

const reload = () => {
  page.value = 1;
  filter.value = "";
  dataFilter.value = data.value;
};

const fetchData = async () => {
  const docRef = collection(db, "inventory");

  const snapshot = await getDocs(docRef);

  if (!snapshot.empty) {
    snapshot.forEach((fardo) => {
      if (fardo.data().in_stock) {
        total.value += fardo.data().value;
      }
      data.value.push({
        id: fardo.id,
        name: fardo.data().name,
        value: fardo.data().value,
        in_stock: fardo.data().in_stock,
      });
      dataFilter.value = data.value;
    });
  }
};

const exportToPDF = (tipoDeFardo) => {
  qrData.value = tipoDeFardo;
  qrShow.value = true;
  let canvas = "";
  let x,
    y = 0;
  const doc = new jsPDF();
  doc.setFontSize(5);
  doc.text(tipoDeFardo, 3, 25, { angle: 90, renderingMode: "stroke" });
  setTimeout(() => {
    canvas = document.querySelector(".qr-class");
    x = 18;
    y = 8;
    doc.addImage(canvas, "PNG", x, y, 18, 10, "SLOW", "NONE", 90);

    doc.save(`qrcode_${new Date().getTime()}.pdf`);
    qrData.value = "";
    qrShow.value = false;
  }, 200);
};

// control paginación
function handlePagination() {
  const rowsFilter = computed(() =>
    dataFilter.value.slice((page.value - 1) * perPage, page.value * perPage)
  );

  const nextPage = () => {
    if (page.value !== Math.ceil(dataFilter.value.length / perPage)) {
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

await fetchData();
</script>
