<template>
  <div class="py-10 px-6 lg:px-0">
    <div class="w-full text-center">
      <h2 class="text-2xl">Salida De Fardos</h2>
    </div>
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
        <Combobox v-model="selected">
          <div class="relative mt-1">
            <div
              class="relative w-full input-headless cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
            >
              <ComboboxInput
                class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                :displayValue="(fardo) => fardo.name"
                @change="query2 = $event.target.value"
              />
              <ComboboxButton
                class="absolute inset-y-0 right-0 flex items-center pr-2"
              >
                <ChevronUpDownIcon
                  class="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </ComboboxButton>
            </div>
            <TransitionRoot
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              @after-leave="query2 = ''"
            >
              <ComboboxOptions
                class="absolute mt-1 max-h-60 w-full overflow-auto z-50 rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              >
                <div
                  v-if="filteredFardo.length === 0 && query2 !== ''"
                  class="relative cursor-default select-none px-4 py-2 text-gray-700"
                >
                  No hay coincidencias
                </div>

                <ComboboxOption
                  v-for="fardo in filteredFardo"
                  as="template"
                  :key="fardo.id"
                  :value="fardo"
                  v-slot="{ selected, active }"
                >
                  <li
                    class="relative cursor-default select-none py-2 pl-10 pr-4"
                    :class="{
                      'bg-blue-500 text-white': active,
                      'text-gray-900': !active,
                    }"
                  >
                    <span
                      class="block truncate"
                      :class="{
                        'font-medium': selected,
                        'font-normal': !selected,
                      }"
                    >
                      {{ fardo.name }}
                    </span>
                    <span
                      v-if="selected"
                      class="absolute inset-y-0 left-0 flex items-center pl-3"
                      :class="{
                        'text-white': active,
                        'text-blue-600': !active,
                      }"
                    >
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </TransitionRoot>
          </div>
        </Combobox>
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
          <option v-for="country in countriesList" :value="country">
            {{ country }}
          </option>
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
import { ref, onMounted, computed } from "vue";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import TableComponent from "@/components/TableComponent.vue";
import IconSpinner from "@/components/icons/IconSpinner.vue";
import MessageState from "@/components/MessageState.vue";
import CountrySelectSuspense from "@/components/suspense/CountrySelectSuspense.vue";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";


let selected = ref("");
let query2 = ref("");

const fardo = ref("");
const isLoading = ref(false);
const data = ref([]);
const success = ref(false);
const countriesList = ref([]);
const country = ref("");
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

let filteredFardo = computed(() =>
  query2.value === ""
    ? tipoFardos.value
    : tipoFardos.value.filter((fardo) =>
        fardo.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query2.value.toLowerCase().replace(/\s+/g, ""))
      )
);

const rows = ref([]);

const agregarFardo = async () => {
  const dateNow = Date.now();
  const inputElement = document.querySelector(".input-headless > input");
  const docRef = doc(db, "inventory", selected.value.id)

  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("El tipo de fardo no es válido.");
    fardo.value = "";
    return false;
  }

  //const cleanFardo = cleanTipoFardo();

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
      tipoFardo: docSnap.data().name,
      fardoId: docSnap.id,
      value: data.value[index].value + 1,
      escaneo: dateNow,
    };
    rows.value[index] = {
      id: rows.value[index].id,
      data: [
        { type: "text", content: rows.value[index].id },
        { type: "text", content: docSnap.data().name },
        { type: "text", content: auth.currentUser.displayName },
        { type: "date", content: dateNow },
        { type: "text", content: data.value[index].value },
        { type: "text", content: docSnap.data().value },
      ],
    };
  } else {
    data.value.push({
      id: docSnap.id,
      tipoFardo: docSnap.data().name,
      fardoId: docSnap.id,
      value: 1,
      escaneo: dateNow,
    });

    rows.value.push({
      id: rows.value.length + 1,
      data: [
        { type: "text", content: rows.value.length + 1 },
        { type: "text", content: docSnap.data().name },
        { type: "text", content: auth.currentUser.displayName },
        { type: "date", content: dateNow },
        { type: "text", content: 1 },
        { type: "text", content: docSnap.data().value },
      ],
    });
  }

  selected.value = "";
  inputElement.focus();
};

const enviarFardos = async () => {
  isLoading.value = true;
  if (rows.value.length === 0) {
    alert("No hay fardos para almacenar");
    isLoading.value = false;
    return false;
  }
  if (!country.value) {
    alert("Escoger el país de destino");
    isLoading.value = false;
    return false;
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
      tipoFardos.value.push({
        id: fardo.id,
        ...fardo.data()
      });
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
  console.log(data.value, docSnap);
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
  
  const inputElement = document.querySelector(".input-headless > input");
  inputElement.focus();
  inputElement.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
      agregarFardo();
    }
  })
    
});
</script>
