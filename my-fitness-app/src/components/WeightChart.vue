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
    weight: number;
  }>;
}

const props = defineProps<Props>();

const chartData = computed(() => ({
  labels: props.data.map(entry => date.formatDate(entry.date, 'MMM D')),
  datasets: [
    {
      label: 'Weight (kg)',
      data: props.data.map(entry => entry.weight),
      borderColor: '#1976D2',
      backgroundColor: '#1976D2',
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
        callback: (value: number) => \`\${value} kg\`
      }
    }
  }
};
</script> 