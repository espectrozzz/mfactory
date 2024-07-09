<script setup>
import { ref, reactive } from "vue";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import TableComponent from "@/components/TableComponent.vue";
import moment from "moment";

const filtros = reactive({
  fechaInicial: "",
  fechaFinal: "",
});

const json_fields = {
  "#": "id",
  "Tipo de fardo": "tipoFardo",
  Colaborador: "colaborador",
  Fecha: "fecha",
};

const json_data = ref([]);

const columns = ["#", "Tipo de fardo", "Colaborador", "Fecha/hora escaneo"];
const rows = ref([]);

const convertDate = (timestamp) => {
  let formatDate;
  if (timestamp) {
    const date = new Date(timestamp);
    formatDate = moment(date).format("DD/MM/YYYY HH:mm");
  } else {
    formatDate = "";
  }

  return formatDate;
};

const consultar = async () => {
  if (!filtros.fechaInicial || !filtros.fechaFinal) {
    alert("Se deben colocar los rangos de fecha.");
    return false;
  }

  rows.value = [];
  const date1 = new Date(`${filtros.fechaInicial} 00:00:00`);
  const date2 = new Date(`${filtros.fechaFinal} 23:59:59`);

  const q = query(
    collection(db, "fardos"),
    where("creado", ">=", date1),
    where("creado", "<=", date2)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron fardos");
    return false;
  }

  querySnapshot.forEach((doc) => {
    for (let fardo in doc.data().data) {
      rows.value.push({
        id: rows.value.length + 1,
        data: [
          { type: "text", content: rows.value.length + 1 },
          { type: "text", content: doc.data().data[fardo].tipoFardo },
          { type: "text", content: doc.data().colaborador },
          { type: "date", content: doc.data().creado.toDate() },
        ],
      });
      json_data.value.push({
        id: rows.value.length,
        tipoFardo: doc.data().data[fardo].tipoFardo,
        colaborador: doc.data().colaborador,
        fecha: convertDate(doc.data().creado.toDate()),
      });
    }
  });
};
</script>

<template>
  <div class="py-10">
    <!-- Filtros -->
    <div class="flex space-x-4 p-4 border rounded-md shadow-md">
      <!-- Fecha inicial -->
      <div class="flex flex-col">
        <label for="fechaInicial" class="text-sm text-gray-600 mb-1"
          >Fecha inicial</label
        >
        <input
          type="date"
          v-model="filtros.fechaInicial"
          id="fechaInicial"
          class="w-72 rounded-md border-gray-400 hover:bg-gray-100"
          placeholder="Fecha inicial"
        />
      </div>
      <!-- Fecha final -->
      <div class="flex flex-col">
        <label for="fechaFinal" class="text-sm text-gray-600 mb-1"
          >Fecha final</label
        >
        <input
          type="date"
          v-model="filtros.fechaFinal"
          id="fechaFinal"
          class="w-72 rounded-md border-gray-400 hover:bg-gray-100"
          placeholder="Fecha final"
        />
      </div>
      <div class="flex items-end">
        <button
          type="button"
          @click="consultar"
          id="buscar"
          class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md min-w-20 max-w-20 min-h-10 max-h-10 relative"
        >
          Buscar
        </button>
      </div>
      <div class="flex items-end">
        <download-excel
          v-if="rows.length > 0"
          class="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md min-w-22 max-w-22 min-h-10 max-h-10 relative cursor-pointer"
          :data="json_data"
          :fields="json_fields"
          worksheet="Datos"
          :name="`fardos_${new Date().getTime()}.xls`"
        >
          Exportar
        </download-excel>
      </div>
    </div>
    <!-- Table -->
    <div class="mt-12">
      <div class="flex justify-end mb-2">
        <span class="mr-2">Datos encontrados:</span> <strong>{{ rows.length }}</strong>
      </div>
      <TableComponent :columns="columns" :rows="rows" />
    </div>
  </div>
</template>
