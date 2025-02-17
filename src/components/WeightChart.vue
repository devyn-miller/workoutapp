<script setup lang="ts">
// ... other code

const chartOptions = {
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: (value: number) => `${value} kg`
      }
    }
  }
};

// ... other code
</script>

<!-- Removed any trailing reference comments --> 