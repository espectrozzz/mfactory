<template>
  <div class="flex flex-col lg:flex-row space-y-6 lg:space-y-0 justify-around">
    <svg ref="barcode" class="hidden"></svg>
    <div>
      <div
        class="flex flex-col space-y-6 border-2 p-6 lg:w-96 max-w-96 h-60 rounded-md shadow-md relative"
      >
        <label for="tipoDeFardo" class="text-lg">Nuevo tipo de fardo</label>

        <input
          v-model="tipoDeFardo"
          type="text"
          class="w-full rounded-md border-gray-400 hover:bg-gray-100"
          name="tipoDeFardo"
          id="tipoDeFardo"
        />
        <button
          type="button"
          @click="guardarTipoFardo"
          class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md"
          id="guardar"
        >
          Guardar
        </button>
        <div class="absolute bottom-2 left-0">
          <MessageState :is-show="isSuccess"
            >Tipo de fardo guardado correctamente.</MessageState
          >
        </div>
      </div>
    </div>
    <div
      class="flex flex-col space-y-4 border-2 rounded-md p-6 w-72 max-w-72 h-72 shadow-md overflow-hidden relative"
    >
      <h2 class="text-lg">Tipos de fardos</h2>
      <ul class="overflow-y-auto">
        <li
          v-for="item in listaTipoDeFardos"
          class="flex items-center justify-between border-2 rounded-md p-1 mb-2"
        >
          <div class="truncate w-3/4">
            <p :title="item.name">{{ item.name }}</p>
          </div>
          <div class="flex space-x-2">
            <button type="button" @click="exportToPDF(item.name)" title="Generar Ticket en PDF">
                <TicketIcon class="w-5 h-5" />
            </button>
            <button type="button" @click="eliminarFardo(item.id)" title="Eliminar fardo">
              <TrashIcon class="w-5 h-5 text-red-500" />
            </button>
          </div>
        </li>
      </ul>
      <MessageState class="absolute bottom-2 inset-x-7 m-auto w-48" :is-show="isSuccessDelete">Fardo eliminado</MessageState>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { TrashIcon, TicketIcon } from "@heroicons/vue/24/outline";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query
} from "firebase/firestore";
import MessageState from "./MessageState.vue";
import Barcode from "./Barcode.vue";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";

const tipoDeFardo = ref("");
const listaTipoDeFardos = ref([]);
const isSuccess = ref(false);
const isSuccessDelete = ref(false);
const ean13Code = ref("1234567890128");
const barcode = ref(null);
const q = query(collection(db, "tiposDeFardos"));

const fetchData = async () => {
  listaTipoDeFardos.value = [];
  const fardosSnapshot = await getDocs(collection(db, "tiposDeFardos"));
  if (!fardosSnapshot.empty) {
    fardosSnapshot.forEach((item) => {
      listaTipoDeFardos.value.push({
        id: item.id,
        ...item.data(),
      });
    });
  }
};

onSnapshot(q, (querySnapshot) => {
  fetchData();
})


const generateBarcode = (tipoDeFardo) => {
  if (barcode.value) {
    JsBarcode(barcode.value, tipoDeFardo);
  }
};

const eliminarFardo = async (docId) => {
  console.log("docId", docId)
  await deleteDoc(doc(db, "tiposDeFardos", docId)).then(() => {
    isSuccessDelete.value = true;
    setTimeout(() => {
      isSuccessDelete.value = false
    }, 5000)
  })
}
 
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

const guardarTipoFardo = async () => {
  if (tipoDeFardo.value === "" || tipoDeFardo.value.length < 6) {
    alert("El tipo de fardo no está permitido.");
    return false;
  }

  try {
    const docRef = await addDoc(collection(db, "tiposDeFardos"), {
      name: tipoDeFardo.value,
      uid: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      created_at: serverTimestamp(),
    });
    tipoDeFardo.value = "";
    isSuccess.value = true;
    setTimeout(() => {
      isSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.log("error al guardar el tipo de fardo", error);
  }
};
</script>
