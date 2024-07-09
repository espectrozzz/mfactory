<script setup>
import { ref, reactive } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const chartDataSemanal = reactive({
  labels: ["FARDO VERA", "FARDO SP", "FARDO YIREH", "FARDO OMEGA"],
  datasets: [
    { label: "Semanal", backgroundColor: ['#f87979', '#E85E41', '#E87B41', '#E841A5'], data: [40, 20, 12, 15] },
  ],
});

const chartDataMensual = reactive({
  labels: ["FARDO VERA", "FARDO SP", "FARDO YIREH", "FARDO OMEGA"],
  datasets: [
    { label: "Mensual", backgroundColor: ['#f87979', '#E85E41', '#E87B41', '#E841A5'], data: [80, 40, 24, 30] },
  ],
});

const chartOptions = reactive({
  responsive: true,
});
</script>

<template>
  <div class="py-10 grid grid-cols-2 gap-10">
    <div>
      <Bar id="my-chart-id" :options="chartOptions" :data="chartDataSemanal" />
    </div>
    <div>
      <Bar id="my-chart-id" :options="chartOptions" :data="chartDataMensual" />
    </div>
  </div>
</template>
