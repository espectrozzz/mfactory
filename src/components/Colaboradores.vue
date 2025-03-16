<script setup>
import { ref } from "vue";
import { UserPlusIcon } from "@heroicons/vue/24/outline";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import TableComponent from "@/components/TableComponent.vue";
import AddUserModal from "@/components/AddUserModal.vue";
import UpdateUserModal from "@/components/UpdateUserModal.vue";
import MessageState from "@/components/MessageState.vue";

const isOpenCreateUser = ref(false);
const isOpenUpdateUser = ref(false);
const loading = ref(false);
const messageState = ref("");

const columns = [
  "Nombre del colaborador",
  "Fecha creación",
  "Fecha modificación",
  "Estatus",
  "",
];

const showMessageState = ref(false);
const data = ref();
const rows = ref([]);

// Methods

const fetchData = async () => {
  loading.value = true;
  const colaboradoresRef = query(
    collection(db, "colaboradores"),
    orderBy("fecha_creacion")
  );
  rows.value = [];

  onSnapshot(colaboradoresRef, (querySnapshot) => {
    rows.value = [];
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        rows.value.push({
          id: doc.id,
          data: [
            {
              type: "text",
              content: `${doc.data().nombre} ${doc.data().apellido_paterno} ${
                doc.data().apellido_materno
              }`,
            },
            { type: "date", content: doc.data().fecha_creacion.toDate() },
            {
              type: "date",
              content: doc.data()?.fecha_modificacion
                ? doc.data().fecha_creacion.toDate()
                : "",
            },
            { type: "status", content: doc.data().activo },
            { type: "action", content: "Editar", emit: "updateUser" },
          ],
        });
        console.log(doc.id, doc.data());
      });
    }
  });
  loading.value = false;
};

fetchData();

const openAddUserModal = () => {
  isOpenCreateUser.value = true;
};

const openUpdateUserModal = () => {
  isOpenUpdateUser.value = true;
};

const closeAddUserModal = () => {
  isOpenCreateUser.value = false;
};

const closeUpdateUserModal = () => {
  isOpenUpdateUser.value = false;
};

const isCreated = () => {
  messageState.value = "Se agregó correctamente al colaborador.";
  showMessageState.value = true;
  setTimeout(() => {
    showMessageState.value = false;
  }, 5000);
};

const isUpdated = () => {
  messageState.value = "Se actualizó correctamente al colaborador.";
  showMessageState.value = true;
  setTimeout(() => {
    showMessageState.value = false;
  }, 5000);
}

const updateUser = (dataClick) => {
  data.value = dataClick;
  openUpdateUserModal();
};
</script>

<template>
  <div>
    <!-- Actión menu -->
    <div class="flex items-center pb-6">
      <!-- Agregar usuario -->
      <button
        type="button"
        @click="openAddUserModal"
        class="bg-blue-600 p-2 text-white rounded-md text-sm inline-flex"
        title="agregar usuario"
      >
        <UserPlusIcon class="w-5 mr-2" /> Agregar colaborador
      </button>
      <MessageState :isShow="showMessageState">{{ messageState }}</MessageState>
    </div>
    <!-- Table -->
    <div>
      <div v-if="loading">Loading...</div>
      <TableComponent
        v-if="!loading"
        :columns="columns"
        :rows="rows"
        @alertFunc="updateUser"
      />
    </div>
    <!-- Modals -->
    <AddUserModal
      :isOpen="isOpenCreateUser"
      @closeModal="closeAddUserModal"
      @isCreated="isCreated"
    />
    <Suspense>
      <UpdateUserModal
        v-if="isOpenUpdateUser"
        :isOpen="isOpenUpdateUser"
        :data="data"
        @closeModal="closeUpdateUserModal"
        @isUpdated="isUpdated"
      />
    </Suspense>
  </div>
</template>
