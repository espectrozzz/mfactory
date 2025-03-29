<template>
  <div>
    <div class="hidden">
      <QRCodeVue3
      v-if="qrShow"
      ref="qr"
      :width="200"
      :height="200"
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
import QRCodeVue3 from "qrcode-vue3";

const barcode = ref(null);
const data = ref([]);
const total = ref(0);
const qrShow = ref(false);
const qrData = ref("");

const generateBarcode = (tipoDeFardo) => {
  if (barcode.value) {
    JsBarcode(barcode.value, tipoDeFardo);
  }
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
    });
  }
};

const exportToPDF = (tipoDeFardo) => {
  qrData.value = tipoDeFardo;
  qrShow.value = true;
  let canvas = "";
  let x, y = 0
  const doc = new jsPDF();
  doc.setFontSize(5);
  doc.text(tipoDeFardo, 3, 25, { angle: 90, renderingMode: "stroke" });
  setTimeout(() => {
    canvas = document.querySelector(".qr-class");
    x = 18;
    y = 8;
    doc.addImage(canvas, "PNG", x,y, 18,10, "SLOW", "NONE", 90);
      
    doc.save(`qrcode_${new Date().getTime()}.pdf`);
    qrData.value = "";
    qrShow.value = false;
  }, 200)
};

await fetchData();
</script>
