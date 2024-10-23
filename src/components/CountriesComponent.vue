<template>
  <div class="flex flex-col lg:flex-row space-y-6 lg:space-y-0 justify-around">
    <div>
      <div
        class="flex flex-col space-y-6 border-2 p-6 lg:w-96 max-w-96 h-60 rounded-md shadow-md relative"
      >
        <label for="newCountry" class="text-lg">Nuevo país</label>

        <input
          v-model="newCountry"
          @keyup.enter="addNewCountry"
          type="text"
          class="w-full rounded-md border-gray-400 hover:bg-gray-100"
          name="newCountry"
          id="newCountry"
        />
        <button
          type="button"
          @click="addNewCountry"
          class="bg-blue-500 relative hover:bg-blue-400 text-white px-4 py-2 rounded-md min-h-10 max-h-10"
          id="guardar"
        >
          <IconSpinner :isLoading="loading" />
          <span v-show="!loading">Guardar</span>
        </button>
        <div class="absolute bottom-2 left-0">
          <MessageState :is-show="isSuccess"
            >País guardado correctamente.</MessageState
          >
        </div>
      </div>
    </div>
    <div
      class="flex flex-col space-y-4 border-2 rounded-md p-6 w-72 max-w-72 h-72 shadow-md overflow-hidden relative"
    >
      <h2 class="text-lg">Países</h2>
      <ul class="overflow-y-auto">
        <li
          v-for="item in countriesList"
          class="flex items-center justify-between border-2 rounded-md p-1 mb-2"
        >
          <div class="truncate w-3/4">
            <p :title="item.name">{{ item.name }}</p>
          </div>
          <div class="flex space-x-2">
            <button
              type="button"
              @click="deleteCountryModal({ id: item.id, name: item.name })"
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
        >País eliminado</MessageState
      >
      <ModalConfirm
        :isOpen="isOpenConfirm"
        @closeModal="isOpenConfirm = false"
        @confirm="deleteCountry"
      >
        <template #message> ¿Está seguro de eliminar el país {{ objectToDelete.name }}? </template>
        <template #button> Si, eliminar </template>
      </ModalConfirm>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, reactive } from "vue";
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
  query,
} from "firebase/firestore";
import MessageState from "./MessageState.vue";
import ModalConfirm from "@/components/ModalConfirm.vue";
import IconSpinner from "./icons/IconSpinner.vue";

const newCountry = ref("");
const countriesList = ref([]);
const isOpenConfirm = ref(false);
const isSuccess = ref(false);
const isSuccessDelete = ref(false);
const q = query(collection(db, "countries"));
const loading = ref(false);
const objectToDelete = reactive({
    id: "",
    name: ""
});

const fetchData = async () => {
  countriesList.value = [];
  const countriesSnapshot = await getDocs(collection(db, "countries"));
  if (!countriesSnapshot.empty) {
    countriesSnapshot.forEach((item) => {
      countriesList.value.push({
        id: item.id,
        ...item.data(),
      });
    });
  }
};

onSnapshot(q, (querySnapshot) => {
  fetchData();
});

const deleteCountry = async () => {
  await deleteDoc(doc(db, "countries", objectToDelete.id)).then(() => {
    isSuccessDelete.value = true;
    objectToDelete.value = {};
    isOpenConfirm.value = false;
    setTimeout(() => {
      isSuccessDelete.value = false;
    }, 5000);
  });
};

const deleteCountryModal = (docObject) => {
    objectToDelete.id = docObject.id;
    objectToDelete.name = docObject.name;
    isOpenConfirm.value = true;
}

const addNewCountry = async () => {
  loading.value = true;
  if (newCountry.value === "" || newCountry.value.length < 3) {
    alert("El país no está permitido.");
    loading.value = false;
    return false;
  }

  try {
    const docRef = await addDoc(collection(db, "countries"), {
      name: newCountry.value.toUpperCase().trim().replace("/", ""),
      uid: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      created_at: serverTimestamp(),
    });
    newCountry.value = "";
    isSuccess.value = true;
    loading.value = false;
    setTimeout(() => {
      isSuccess.value = false;
    }, 5000);
  } catch (error) {
    console.log("error al guardar el país", error);
    loading.value = false;
  }
};
</script>
