<template>
  <q-chip
    :color="statusColor"
    text-color="white"
    :size="size"
  >
    {{ formatStatus(status) }}
  </q-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'planned' | 'in_progress' | 'completed';
  size?: 'sm' | 'md' | 'lg';
}>();

const statusColor = computed(() => {
  const colors = {
    planned: 'blue',
    in_progress: 'orange',
    completed: 'green',
  };
  return colors[props.status];
});

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};
</script> 