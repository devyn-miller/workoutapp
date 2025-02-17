<script setup lang="ts">
  // ... other code

  const formatMeasurement = (key: keyof typeof labels, value: number) => {
    // Corrected template literal syntax:
    return `${labels[key]}: ${value}cm `;
  };

  // ... other code
</script> 