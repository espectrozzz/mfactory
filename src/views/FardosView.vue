<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import TableComponent from "@/components/TableComponent.vue";
import IconSpinner from "@/components/icons/IconSpinner.vue";
import MessageState from "@/components/MessageState.vue";

const fardo = ref("");
const isLoading = ref(false);
const data = ref([]);
const success = ref(false);

const columns = ["#", "Tipo de fardo", "Colaborador", "Fecha/hora escaneo"];

const tipoFardos = [
  "FARDO VERA",
  "VERA",
  "FARDO SP",
  "SP",
  "FARDO YIREH",
  "YIREH",
  "FARDO OMEGA",
  "OMEGA",
];

const rows = ref([]);

const cleanTipoFardo = () => {
  let cleanFardo = "";

  switch (fardo.value.toLocaleLowerCase().trim()) {
    case "vera" || "fardo vera":
      cleanFardo = "FARDO VERA";
      break;
    case "sp" || "fardo sp":
      cleanFardo = "FARDO SP";
      break;
    case "yireh" || "fardo yireh":
      cleanFardo = "FARDO YIREH";
      break;
      case "omega" || "fardo omega":
      cleanFardo = "FARDO OMEGA";
      break;
  }
  return cleanFardo;
};

const agregarFardo = () => {
  const dateNow = Date.now()
  const isValid = tipoFardos.findIndex(
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
    escaneo: dateNow
  })

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
  if(rows.value.length === 0) {
    alert("No hay fardos para almacenar")
    return false;
  }

  const docRef = await addDoc(collection(db, "fardos"), {
    colaborador: auth.currentUser.displayName,
    uid: auth.currentUser.uid,
    data: data.value,
    creado: serverTimestamp()
  });

  if(docRef.id) {
    success.value = true;
    rows.value = [];
  } 
  isLoading.value = false;
}

</script>

<template>
  <div class="py-10">
    <div class="flex space-x-6">
      <input
        v-model="fardo"
        @keyup.enter="agregarFardo"
        type="text"
        :class="['w-72 rounded-md border-gray-400 hover:bg-gray-100', isLoading ? 'bg-gray-200 hover:bg-gray-200 cursor-not-allowed' : '']"
        placeholder="VERA"
        id="scanner"
        :disabled="isLoading"
        autofocus
      />
      <button
        @click="agregarFardo"
        type="button"
        :class="['bg-blue-500 hover:bg-blue-400 text-white px-4 rounded-md', isLoading ? 'cursor-not-allowed' : '']"
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
    <div>
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
