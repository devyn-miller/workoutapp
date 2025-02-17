<script setup lang="ts">
const chartOptions = {
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