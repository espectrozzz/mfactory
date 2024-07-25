<template>
  <div>
    <svg ref="barcode" class="hidden"></svg>
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
        <tr v-for="value in data" class="bg-white dark:bg-gray-800">
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
          <td class="px-6 py-4"><button type="button" @click="exportToPDF(value.name)" title="Generar Ticket en PDF">
                <TicketIcon class="w-5 h-5" />
            </button></td>
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
import { TicketIcon } from "@heroicons/vue/24/outline";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";

const barcode = ref(null);
const data = ref([]);
const total = ref(0);

const generateBarcode = (tipoDeFardo) => {
  if (barcode.value) {
    JsBarcode(barcode.value, tipoDeFardo);
  }
};

const exportToPDF = (tipoDeFardo) => {
  generateBarcode(tipoDeFardo);
  const svgElement = barcode.value;
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svg);
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF();

    for (let i = 0; i < 4; i++) {
      const x = 10;
      const y = 10 + i * 80;
      doc.addImage(imgData, "PNG", x, y);
    }
    doc.save(`barcode_${new Date().getTime()}.pdf`);
  };

  img.src = url;
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
        name: fardo.id,
        value: fardo.data().value,
        in_stock: fardo.data().in_stock,
      });
    });
  }
};

await fetchData();
</script>
