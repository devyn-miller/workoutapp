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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Types
interface Measurement {
  date: string;
  measurements: {
    chest?: number | null;
    waist?: number | null;
    hips?: number | null;
    biceps?: number | null;
    thighs?: number | null;
  };
}

interface TooltipItem {
  dataIndex: number;
  dataset: {
    label: string;
  };
  formattedValue: string;
}

// Props
const props = defineProps<{
  data: Measurement[];
  selectedMeasurements: string[];
}>();

// Constants
const MEASUREMENT_COLORS = {
  chest: '#1976D2',  // Blue
  waist: '#C62828',  // Red
  hips: '#2E7D32',   // Green
  biceps: '#7B1FA2', // Purple
  thighs: '#F57C00'  // Orange
};

const MEASUREMENT_LABELS = {
  chest: 'Chest',
  waist: 'Waist',
  hips: 'Hips',
  biceps: 'Biceps',
  thighs: 'Thighs'
};

// Computed
const chartData = computed(() => {
  const labels = props.data.map(point => date.formatDate(point.date, 'MMM D'));
  
  const datasets = props.selectedMeasurements.map(measurement => ({
    label: MEASUREMENT_LABELS[measurement as keyof typeof MEASUREMENT_LABELS],
    data: props.data.map(point => point.measurements[measurement as keyof typeof MEASUREMENT_LABELS] || null),
    borderColor: MEASUREMENT_COLORS[measurement as keyof typeof MEASUREMENT_COLORS],
    backgroundColor: MEASUREMENT_COLORS[measurement as keyof typeof MEASUREMENT_COLORS],
    tension: 0.4,
    fill: false
  }));

  return {
    labels,
    datasets
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        title: (items: TooltipItem[]) => {
          if (!items.length) return '';
          const index = items[0].dataIndex;
          return date.formatDate(props.data[index].date, 'MMMM D, YYYY');
        },
        label: (item: TooltipItem) => {
          return `${item.dataset.label}: ${item.formattedValue} cm`;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Centimeters'
      }
    }
  }
}));
</script>