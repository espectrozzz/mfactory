<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import TableComponent from "@/components/TableComponent.vue";
import CountrySelectSuspense from "@/components/suspense/CountrySelectSuspense.vue";
import moment from "moment";
import { TransitionRoot } from "@headlessui/vue";

const filtros = reactive({
  fechaInicial: "",
  fechaFinal: "",
});

const tipoReporte = ref("");

const json_fields = ref({});
const disableFechas = ref(true);
const json_data = ref([]);
const showDates = ref(false);
const columns = ref(["", "", ""]);
const rows = ref([]);
const disabledRadio = ref(true);

const country = ref("");
const countriesList = ref([]);
const loadingCountries = ref(true);
const filterByDate = ref("");

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

const setDates = () => {
  if (filterByDate.value === "other") return false;

  const today = moment();
  const todayParsed = today.format("YYYY-MM-DD");

  if (filterByDate.value === "month") {
    filtros.fechaInicial = `${today.format("YYYY")}-${today.format("MM")}-01`;
    filtros.fechaFinal = todayParsed;
  }

  if (filterByDate.value === "today") {
    filtros.fechaInicial = todayParsed;
    filtros.fechaFinal = todayParsed;
  }

};

const consultar = async () => {
  if (tipoReporte.value === "") {
    alert("Se debe de escoger el tipo de reporte.");
    return false;
  }

  rows.value = [];
  json_fields.value = [];
  json_data.value = [];

  switch (tipoReporte.value) {
    case "inventario":
      await getInventario();
      break;
    case "entradaInventario":
      setDates();
      if (!filtros.fechaInicial || !filtros.fechaFinal) {
        alert("Se deben colocar los rangos de fecha.");
        return false;
      }
      await getEntradaInventario();
      break;
    case "salidaInventario":
      setDates();
      if (!filtros.fechaInicial || !filtros.fechaFinal) {
        alert("Se deben colocar los rangos de fecha.");
        return false;
      }
      await getSalidaInventario();
      break;
    case "todo":
      if (!filtros.fechaInicial || !filtros.fechaFinal) {
        alert("Se deben colocar los rangos de fecha.");
        return false;
      }
      break;
  }
};

const analizarTipoReporte = () => {
  switch (tipoReporte.value) {
    case "inventario":
      filtros.fechaInicial = "";
      filtros.fechaFinal = "";
      disableFechas.value = true;
      disabledRadio.value = true;
      filterByDate.value = "";
      break;
    case "entradaInventario":
      disableFechas.value = false;
      if (disabledRadio.value) {
        disabledRadio.value = false;
        filterByDate.value = "month";
      }
      break;
    case "salidaInventario":
      disableFechas.value = false;
      if (disabledRadio.value) {
        disabledRadio.value = false;
        filterByDate.value = "month";
      }
      break;
    case "todo":
      disableFechas.value = false;
      break;
  }
};

// Obtener los movimientos de entrada de inventario

const getEntradaInventario = async () => {
  const date1 = new Date(`${filtros.fechaInicial} 00:00:00`);
  const date2 = new Date(`${filtros.fechaFinal} 23:59:59`);

  const q = query(
    collection(db, "entradas"),
    where("creado", ">=", date1),
    where("creado", "<=", date2),
    where(
      "from",
      country.value ? "==" : "!=",
      country.value ? country.value : ""
    )
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron registros de entrada.");
    return false;
  }

  columns.value = [
    "#",
    "Tipo de fardo",
    "Colaborador",
    "Proveniente de",
    "Fecha/hora escaneo",
    "Movimiento",
  ];

  json_fields.value = {
    "#": "id",
    "Tipo de fardo": "tipoFardo",
    Colaborador: "colaborador",
    "Proveniente de": "provenienteDe",
    Fecha: "fecha",
    Movimiento: "movimiento",
  };

  querySnapshot.forEach((doc) => {
    for (let fardo in doc.data().data) {
      rows.value.push({
        id: rows.value.length + 1,
        data: [
          { type: "text", content: rows.value.length + 1 },
          { type: "text", content: doc.data().data[fardo].tipoFardo },
          { type: "text", content: doc.data().colaborador || "Admin" },
          { type: "text", content: doc.data().from || "No definido" },
          { type: "date", content: doc.data().creado.toDate() },
          { type: "text", content: "Entrada" },
        ],
      });
      json_data.value.push({
        id: rows.value.length,
        tipoFardo: doc.data().data[fardo].tipoFardo,
        colaborador: doc.data().colaborador || "Admin",
        provenienteDe: doc.data().from,
        fecha: convertDate(doc.data().creado.toDate()),
        movimiento: "Entrada",
      });
    }
  });
};

// Obtener los movimientos de salida de inventario

const getSalidaInventario = async () => {
  const date1 = new Date(`${filtros.fechaInicial} 00:00:00`);
  const date2 = new Date(`${filtros.fechaFinal} 23:59:59`);

  const q = query(
    collection(db, "salidas"),
    where("creado", ">=", date1),
    where("creado", "<=", date2),
    where(
      "destiny",
      country.value ? "==" : "!=",
      country.value ? country.value : ""
    )
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("No se encontraron registros de salida.");
    return false;
  }

  columns.value = [
    "#",
    "Tipo de fardo",
    "Colaborador",
    "Cantidad",
    "Destino",
    "Fecha/hora escaneo",
    "Movimiento",
  ];

  json_fields.value = {
    "#": "id",
    "Tipo de fardo": "tipoFardo",
    Colaborador: "colaborador",
    Cantidad: "cantidad",
    Destino: "destino",
    Fecha: "fecha",
    Movimiento: "movimiento",
  };

  querySnapshot.forEach((doc) => {
    for (let fardo in doc.data().data) {
      rows.value.push({
        id: rows.value.length + 1,
        data: [
          { type: "text", content: rows.value.length + 1 },
          { type: "text", content: doc.data().data[fardo].tipoFardo },
          { type: "text", content: doc.data().colaborador || "Admin" },
          { type: "text", content: doc.data().data[fardo].value },
          { type: "text", content: doc.data().destiny },
          { type: "date", content: doc.data().creado.toDate() },
          { type: "text", content: "Salida" },
        ],
      });
      json_data.value.push({
        id: rows.value.length,
        tipoFardo: doc.data().data[fardo].tipoFardo,
        colaborador: doc.data().colaborador || "Admin",
        cantidad: doc.data().data[fardo].value,
        destino: doc.data().destiny,
        fecha: convertDate(doc.data().creado.toDate()),
        movimiento: "Salida",
      });
    }
  });
};

// Obtener el inventario
const getInventario = async () => {
  const snapshot = await getDocs(collection(db, "inventory"));

  if (!snapshot.empty) {
    columns.value = ["#", "Tipo de fardo", "Stock", "Ultima actualización"];
    snapshot.forEach((value) => {
      rows.value.push({
        id: rows.value.length + 1,
        data: [
          { type: "text", content: rows.value.length + 1 },
          { type: "text", content: value.data().name },
          { type: "text", content: value.data().value },
          {
            type: "date",
            content: value.data().hasOwnProperty("updated_at")
              ? value.data().updated_at.toDate()
              : "",
          },
        ],
      });
      // Preparar datos para exportar a excel
      json_fields.value = {
        "#": "id",
        "Tipo de fardo": "tipoFardo",
        Stock: "stock",
        "Fecha ultima actualizacion": "fecha",
      };
      json_data.value.push({
        id: rows.value.length,
        tipoFardo: value.data().name,
        stock: value.data().value,
        fecha: value.data().hasOwnProperty("updated_at")
          ? convertDate(value.data()?.updated_at.toDate())
          : "",
      });
    });
  }
};

onMounted(() => {
  fetchCountries();
});

watch(filterByDate, (newValue) => {
  showDates.value = newValue === "other" ? true : false;
});
</script>

<template>
  <div class="py-10 px-4 overflow-y-auto">
    <!-- Filtros -->
    <div class="flex flex-col space-y-4 p-4 border rounded-md shadow-md">
      <div
        class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6 lg:w-3/4"
      >
        <!-- Tipo reporte -->
        <div class="flex w-full lg:w-1/3 flex-col">
          <label for="tipoReporte" class="text-sm text-gray-600 mb-1"
            >Tipo de reporte</label
          >
          <select
            v-model="tipoReporte"
            @change="analizarTipoReporte"
            id="tipoReporte"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="" selected disabled>
              Escoge un tipo de reporte
            </option>
            <option value="inventario" selected>Inventario</option>
            <option value="salidaInventario" selected>
              Salida de inventario
            </option>
            <option value="entradaInventario" selected>
              Entrada de inventario
            </option>
          </select>
        </div>
        <div class="flex w-full lg:w-1/3 flex-col">
          <label
            for="countries"
            class="text-sm text-gray-600 mb-1 font-semibold"
            >País destino</label
          >
          <CountrySelectSuspense v-if="loadingCountries" />
          <select
            v-else
            :disabled="disableFechas"
            v-model="country"
            id="countries"
            class="bg-gray-50 border border-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="" selected>TODOS</option>
            <option v-for="country in countriesList" :value="country">
              {{ country }}
            </option>
          </select>
        </div>
      </div>
      <div
        :class="[
          'flex flex-col lg:flex-row md:flex-row gap-3 transition-all duration-300',
          disabledRadio ? 'text-slate-300' : 'text-gray-900',
        ]"
      >
        <!-- filter by days -->
        <div class="flex items-center select-none">
          <input
            v-model="filterByDate"
            :disabled="disabledRadio"
            id="search-1"
            type="radio"
            value="month"
            name="default-radio"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            for="search-1"
            class="ms-2 text-sm font-medium dark:text-gray-300"
            >Mensual</label
          >
        </div>
        <div class="flex items-center select-none">
          <input
            v-model="filterByDate"
            :disabled="disabledRadio"
            id="search-2"
            type="radio"
            value="today"
            name="default-radio"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            for="search-2"
            class="ms-2 text-sm font-medium dark:text-gray-300"
            >Hoy</label
          >
        </div>
        <div class="flex items-center select-none">
          <input
            v-model="filterByDate"
            :disabled="disabledRadio"
            id="search-4"
            type="radio"
            value="other"
            name="default-radio"
            class="w-4 h-4 selec text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            for="search-4"
            class="ms-2 text-sm font-medium dark:text-gray-300"
            >Otro</label
          >
        </div>
      </div>
      <div>
        <TransitionRoot
          :show="showDates"
          class="flex flex-wrap gap-y-5 lg:gap-y-0 gap-x-5 w-full"
          enter="transition-opacity duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity duration-150"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <!-- Fecha inicial -->
          <div class="flex w-full lg:w-fit flex-col">
            <label for="fechaInicial" class="text-sm text-gray-600 mb-1"
              >Fecha inicial</label
            >
            <input
              type="date"
              v-model="filtros.fechaInicial"
              id="fechaInicial"
              :disabled="disableFechas"
              :class="[
                'lg:w-full rounded-md border-gray-400 hover:bg-gray-100',
                disableFechas
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-transparent',
              ]"
              placeholder="Fecha inicial"
            />
          </div>
          <!-- Fecha final -->
          <div class="flex w-full lg:w-fit flex-col">
            <label for="fechaFinal" class="text-sm text-gray-600 mb-1"
              >Fecha final</label
            >
            <input
              type="date"
              v-model="filtros.fechaFinal"
              id="fechaFinal"
              :disabled="disableFechas"
              :class="[
                'lg:w-full rounded-md border-gray-400 hover:bg-gray-100',
                disableFechas
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-transparent',
              ]"
              placeholder="Fecha final"
            />
          </div>
        </TransitionRoot>
      </div>
      <div class="flex space-x-6 lg:w-3/4">
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
            type="xlsx"
            :name="`fardos_${new Date().getTime()}.xlsx`"
          >
            Exportar
          </download-excel>
        </div>
      </div>
    </div>
    <!-- Table -->
    <div class="mt-12">
      <div class="flex justify-end mb-2">
        <span class="mr-2">Datos encontrados:</span>
        <strong>{{ rows.length }}</strong>
      </div>
      <TableComponent :columns="columns" :rows="rows" />
    </div>
  </div>
</template>
