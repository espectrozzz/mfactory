<template>
  <div class="flex flex-col space-y-4">
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
   
    <div>
      <div
        class="flex flex-col space-y-6 border-2 p-6 lg:w-96 max-w-96 h-60 rounded-md shadow-md relative"
      >
        <label for="tipoDeFardo" class="text-lg">Nuevo tipo de fardo</label>

        <input
          v-model="tipoDeFardo"
          @keyup.enter="guardarTipoFardo"
          type="text"
          class="w-full rounded-md border-gray-400 hover:bg-gray-100"
          name="tipoDeFardo"
          id="tipoDeFardo"
        />
        <button
          type="button"
          @click="guardarTipoFardo"
          class="bg-blue-500 relative hover:bg-blue-400 text-white px-4 py-2 rounded-md min-h-10 max-h-10"
          id="guardar"
        >
          <IconSpinner :isLoading="loading" />
           <span v-show="!loading">Guardar</span>
        </button>
        <div class="absolute bottom-2 left-0">
          <MessageState :is-show="isSuccess"
            >Tipo de fardo guardado correctamente.</MessageState
          >
        </div>
      </div>
    </div>
    <div
      class="flex flex-col space-y-4 border-2 rounded-md p-6 w-82 max-w-82 h-72 shadow-md overflow-hidden relative"
    >
      <h2 class="text-lg">Tipos de fardos</h2>
      <ul class="overflow-y-auto">
        <li
          v-for="item in listaTipoDeFardos"
          class="flex items-center justify-between border-2 rounded-md p-1 mb-2"
        >
          <div class="truncate w-5/6">
            <p :title="item.name">{{ item.name }}</p>
          </div>
          <div class="flex space-x-2">
            <button
              type="button"
              @click="openUpdateFardo(item.id, item.name)"
              title="Editar nombre"
            >
              <PencilSquareIcon class="w-5 h-5" />
            </button>
            <button
              type="button"
              @click="exportToPDF(item.name)"
              title="Generar Ticket en PDF"
            >
              <TicketIcon class="w-5 h-5" />
            </button>
            <button
              type="button"
              @click="modalDeleteFardo(item.id)"
              title="Eliminar fardo"
            >
              <TrashIcon class="w-5 h-5 text-red-500" />
            </button>
          </div>
        </li>
      </ul>
      <MessageState
        class="absolute bottom-2 inset-x-7 m-auto w-48"
        :is-show="isSuccessDelete"
        >Fardo eliminado</MessageState
      >
    </div>
    <ModalConfirm :is-open="isOpen" :loading="loadingDelete" @closeModal="isOpen = false" @confirm="eliminarFardo">
      <template v-slot:message>
        <span>¿Estás seguro de eliminar el fardo?</span>
      </template>
      <template v-slot:button>
        <span>Eliminar</span>
      </template>
    </ModalConfirm>
    <TipoFardosUpdate v-if="showUpdateFardo" :is-open="showUpdateFardo" :fardo="fardoSelectedUpdated" @closeModal="showUpdateFardo = false" />
  </div>
</template>

<script setup>
import { reactive, ref, watchEffect, useTemplateRef} from "vue";
import { TrashIcon, TicketIcon, PencilSquareIcon } from "@heroicons/vue/24/outline";
import { db, auth, functions } from "../firebase";
import { httpsCallable } from "firebase/functions"
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import MessageState from "./MessageState.vue";
import Barcode from "./Barcode.vue";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import IconSpinner from "./icons/IconSpinner.vue";
import ModalConfirm from "./ModalConfirm.vue";
import TipoFardosUpdate from "./TipoFardosUpdate.vue";
import QRCodeVue3 from "qrcode-vue3";

const qrShow = ref(false);
const qrData = ref("");
const tipoDeFardo = ref("");
const listaTipoDeFardos = ref([]);
const isSuccess = ref(false);
const isSuccessDelete = ref(false);
const ean13Code = ref("1234567890128");
const barcode = ref(null);
const q = query(collection(db, "tiposDeFardos"));
const loading = ref(false);
const loadingDelete = ref(false);
const isOpen = ref(false);
const fardoSelected = ref("");
const fardoSelectedUpdated = reactive({
  id: "",
  name: ""
})
const showUpdateFardo = ref(false);

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
});

const modalDeleteFardo = (docId) => {
  fardoSelected.value = docId;
  isOpen.value = true;
}

const eliminarFardo = async () => {
  loadingDelete.value = true;
  await deleteDoc(doc(db, "tiposDeFardos", fardoSelected.value)).then(() => {
    isSuccessDelete.value = true;
    loadingDelete.value = false;
    isOpen.value = false;
    fardoSelected.value = "";
    setTimeout(() => {
      isSuccessDelete.value = false;
    }, 5000);
  }).catch((error) => {
    console.log(error);
    loadingDelete.value = false;
    fardoSelected.value = "";
  });
};

const exportToPDF = (tipoDeFardo) => {
  qrData.value = tipoDeFardo;
  qrShow.value = true;
  let canvas = "";
  const doc = new jsPDF();
  doc.text(tipoDeFardo, 105, 20, { align: 'center' })
  setTimeout(() => {
    canvas = document.querySelector(".qr-class");
    for (let i = 0; i < 6; i++) {
      const x = i % 2 === 0 ? 120 : 20;
      const y = i <= 1 ? 40 : i <= 3 ? 120 : 200;
      doc.addImage(canvas, "PNG", x, y);
    }
      
    doc.save(`qrcode_${new Date().getTime()}.pdf`);
    qrData.value = "";
    qrShow.value = false;
  }, 200)
};

const guardarTipoFardo = async () => {
  const guardarTipoFardo = httpsCallable(functions, "createFardo");
  loading.value = true;
  if (tipoDeFardo.value === "" || tipoDeFardo.value.length < 6 || tipoDeFardo.value.length > 25) {
    alert("El tipo de fardo no está permitido.");
    loading.value = false;
    return false;
  }

  const data = {
    name: tipoDeFardo.value.toUpperCase().trim().replace("/", ""),
    uid: auth.currentUser.uid,
    userName: auth.currentUser.displayName,
  }

  await guardarTipoFardo(data).then((result) => {
    console.log(result);
    tipoDeFardo.value = "";
    isSuccess.value = true;
    loading.value = false;
    setTimeout(() => {
      isSuccess.value = false;
    }, 5000);
  }).catch((error) => {
    loading.value = false;
    console.log(error);
  })

  /*
  try {
    await addDoc(collection(db, "tiposDeFardos"), {
      name: tipoDeFardo.value.toUpperCase().trim().replace("/", ""),
      uid: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      created_at: serverTimestamp(),
    });
    tipoDeFardo.value = "";
    isSuccess.value = true;
    loading.value = false;
    setTimeout(() => {
      isSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.log("error al guardar el tipo de fardo", error);
    loading.value = false;
  }
    */
};

const openUpdateFardo = (id, name) => {
  showUpdateFardo.value = true;
  fardoSelected.value = id;
  fardoSelectedUpdated.id = id;
  fardoSelectedUpdated.name = name;

}
</script>
