<template>
  <div class="py-10 px-6 lg:px-0">
    <div class="py-4">
      <button
        type="button"
        @click="$router.push({ name: 'fardos' })"
        class="inline-flex justify-center items-center cursor-pointer"
      >
        <ArrowLeftIcon class="w-5 h-5 mr-2" /> Regresar
      </button>
    </div>

    <div class="flex space-x-6 max-h-11 items-center">
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
          'bg-blue-500 hover:bg-blue-400 text-white px-4 rounded-md h-9',
          isLoading ? 'cursor-not-allowed' : '',
        ]"
        :disabled="isLoading"
        id="agregar"
      >
        Agregar
      </button>
      <div class="flex items-center space-x-4">
        <label for="countries" class="text-sm text-gray-600 mb-1 font-semibold"
          >País destino</label
        >
        <CountrySelectSuspense v-if="loadingCountries" />
        <select
          v-else
          v-model="country"
          id="countries"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="" disabled selected>Seleccionar país</option>
          <option v-for="country in countriesList" :value="country">{{ country }}</option>
        </select>
      </div>
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
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import TableComponent from "@/components/TableComponent.vue";
import IconSpinner from "@/components/icons/IconSpinner.vue";
import MessageState from "@/components/MessageState.vue";
import CountrySelectSuspense from "@/components/suspense/CountrySelectSuspense.vue"

const fardo = ref("");
const isLoading = ref(false);
const data = ref([]);
const success = ref(false);
const countriesList = ref([]);
const country = ref("")
const loadingCountries = ref(true);

const columns = [
  "#",
  "Tipo de fardo",
  "Colaborador",
  "Fecha/hora escaneo",
  "Cantidad",
  "Stock disponible",
];

const tipoFardos = ref([]);

const rows = ref([]);

const cleanTipoFardo = () => {
  let cleanFardo = "";

  cleanFardo = fardo.value.toUpperCase().trim();

  return cleanFardo;
};

const agregarFardo = async () => {
  const dateNow = Date.now();
  const inputElement = document.getElementById("scanner");
  const docRef = doc(db, "inventory", fardo.value.toUpperCase().trim());

  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("El tipo de fardo no es válido.");
    fardo.value = "";
    return false;
  }

  const cleanFardo = cleanTipoFardo();

  const existencia = validarExistencia(docSnap);

  if (!existencia) {
    alert("No hay stock en el tipo de fardo.");
    fardo.value = "";
    return false;
  }

  const cantidadDisponible = validarCantidadDisponible(docSnap);

  if (!cantidadDisponible) {
    alert("No hay más stock en el tipo de fardo.");
    fardo.value = "";
    return false;
  }

  const index = data.value.findIndex((value) => value.id === docSnap.id);

  if (index !== -1) {
    data.value[index] = {
      id: docSnap.id,
      tipoFardo: docSnap.id,
      value: data.value[index].value + 1,
      escaneo: dateNow,
    };
    rows.value[index] = {
      id: rows.value[index].id,
      data: [
        { type: "text", content: rows.value[index].id },
        { type: "text", content: cleanFardo },
        { type: "text", content: auth.currentUser.displayName },
        { type: "date", content: dateNow },
        { type: "text", content: data.value[index].value },
        { type: "text", content: docSnap.data().value },
      ],
    };
  } else {
    data.value.push({
      id: docSnap.id,
      tipoFardo: docSnap.id,
      value: 1,
      escaneo: dateNow,
    });

    rows.value.push({
      id: rows.value.length + 1,
      data: [
        { type: "text", content: rows.value.length + 1 },
        { type: "text", content: cleanFardo },
        { type: "text", content: auth.currentUser.displayName },
        { type: "date", content: dateNow },
        { type: "text", content: 1 },
        { type: "text", content: docSnap.data().value },
      ],
    });
  }

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
  if(!country.value) {
    alert("Escoger el país de destino")
  }

  const docRef = await addDoc(collection(db, "salidas"), {
    colaborador: auth.currentUser.displayName,
    uid: auth.currentUser.uid,
    data: data.value,
    destiny: country.value,
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

  if (!snapshot.empty) {
    snapshot.forEach((fardo) => {
      tipoFardos.value.push(fardo.data().name);
    });
  }
};

const fetchCountries = async () => {
  const countriesRef = collection(db, "countries");

  const snapshot = await getDocs(countriesRef);

  if (!snapshot.empty) {
    snapshot.forEach((country) => {
      countriesList.value.push(country.data().name);
    });
  }

  loadingCountries.value = false;
};

const validarExistencia = (docSnap) => {
  if (docSnap.data().value === 0) {
    return false;
  }
  return true;
};

const validarCantidadDisponible = (docSnap) => {
  const e = data.value.findIndex((value) => value.id === docSnap.id);

  if (e !== -1) {
    if (data.value[e].value + 1 > docSnap.data().value) {
      return false;
    }
  }

  return true;
};

onMounted(() => {
  fetchTipoFardos();
  fetchCountries();
});
</script>
