<template>
  <Line
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { date } from 'quasar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: Array<{
    date: string;
    bodyFat: number;
  }>;
}

const props = defineProps<Props>();

const chartData = computed(() => ({
  labels: props.data.map(entry => date.formatDate(entry.date, 'MMM D')),
  datasets: [
    {
      label: 'Body Fat %',
      data: props.data.map(entry => entry.bodyFat),
      borderColor: '#9C27B0',
      backgroundColor: '#9C27B0',
      tension: 0.4
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: (value: number) => `${value}%`
      }
    }
  }
};
</script> 