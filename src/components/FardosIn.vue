<template>
  <div class="py-10 px-6 lg:px-0">
    <div class="py-4">
      <button type="button" @click="$router.push({ 'name': 'fardos' })" class="inline-flex justify-center items-center cursor-pointer"><ArrowLeftIcon class="w-5 h-5 mr-2" /> Regresar</button>
    </div>
    <div class="flex space-x-6">
      <input
        v-model="fardo"
        @keyup.enter="agregarFardo"
        type="text"
        :class="[
          'w-72 rounded-md border-gray-400 hover:bg-gray-100',
          isLoading ? 'bg-gray-200 hover:bg-gray-200 cursor-not-allowed' : '',
        ]"
        placeholder="VERA"
        id="scanner"
        :disabled="isLoading"
        autofocus
      />
      <button
        @click="agregarFardo"
        type="button"
        :class="[
          'bg-blue-500 hover:bg-blue-400 text-white px-4 rounded-md',
          isLoading ? 'cursor-not-allowed' : '',
        ]"
        :disabled="isLoading"
        id="agregar"
      >
        Agregar
      </button>
      <MessageState :isShow="success">Se guardó correctamente</MessageState>
    </div>
    <!-- Table -->
    <div class="mt-6">
      <TableComponent :columns="columns" :rows="rows" />
    </div>
    <div class="mt-6 lg:mt-0">
      <button
        @click="enviarFardos"
        type="button"
        class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md min-w-20 max-w-20 min-h-10 max-h-10 relative"
        id="enviar"
      >
        <IconSpinner :isLoading="isLoading" />
        <span v-show="!isLoading">Enviar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline"
import TableComponent from "@/components/TableComponent.vue";
import IconSpinner from "@/components/icons/IconSpinner.vue";
import MessageState from "@/components/MessageState.vue";

const fardo = ref("");
const isLoading = ref(false);
const data = ref([]);
const success = ref(false);

const columns = ["#", "Tipo de fardo", "Colaborador", "Fecha/hora escaneo"];

const tipoFardos = ref([]);

const rows = ref([]);

const cleanTipoFardo = () => {
  let cleanFardo = "";
  switch (fardo.value.toLocaleLowerCase().trim()) {
    case "vera":
    case "fardo vera":
      cleanFardo = "FARDO VERA";
      break;
    case "sp":
    case "fardo sp":
      cleanFardo = "FARDO SP";
      break;
    case "yireh":
    case "fardo yireh":
      cleanFardo = "FARDO YIREH";
      break;
    case "omega":
    case "fardo omega":
      cleanFardo = "FARDO OMEGA";
      break;
  }

  return cleanFardo;
};

const agregarFardo = () => {
  const dateNow = Date.now();
  const isValid = tipoFardos.value.findIndex(
    (e) => fardo.value.toLocaleLowerCase() === e.toLocaleLowerCase()
  );
  const inputElement = document.getElementById("scanner");
  if (isValid === -1) {
    alert("El tipo de fardo no es válido.");
    fardo.value = "";
    return false;
  }

  const cleanFardo = cleanTipoFardo();

  data.value.push({
    id: rows.value.length + 1,
    tipoFardo: cleanFardo,
    escaneo: dateNow,
  });

  rows.value.push({
    id: rows.value.length + 1,
    data: [
      { type: "text", content: rows.value.length + 1 },
      { type: "text", content: cleanFardo },
      { type: "text", content: auth.currentUser.displayName },
      { type: "date", content: dateNow },
    ],
  });

  fardo.value = "";
  inputElement.focus();
};

const enviarFardos = async () => {
  isLoading.value = true;
  if (rows.value.length === 0) {
    alert("No hay fardos para almacenar");
    isLoading.value = false;
    return false;
  }

  const docRef = await addDoc(collection(db, "entradas"), {
    colaborador: auth.currentUser.displayName,
    uid: auth.currentUser.uid,
    data: data.value,
    creado: serverTimestamp(),
  });

  if (docRef.id) {
    success.value = true;
    rows.value = [];
    data.value = [];
  }
  isLoading.value = false;
};

const fetchTipoFardos = async () => {
  const tipoFardosRef = collection(db, "tiposDeFardos");

  const snapshot = await getDocs(tipoFardosRef);

  if(!snapshot.empty) {
    snapshot.forEach((fardo) => {
      tipoFardos.value.push(fardo.data().name)
      console.log(tipoFardos.value)
    })
  }
}

onMounted(() => {
  fetchTipoFardos()
})
</script>
