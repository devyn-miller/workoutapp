<template>
  <q-card class="workout-card">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6">{{ workout.name }}</div>
        <WorkoutStatusBadge :status="workout.status" size="sm" />
      </div>
      <div class="text-subtitle2">
        {{ formatDate(workout.date) }}
      </div>
    </q-card-section>

    <q-card-section>
      <div class="row items-center q-gutter-x-sm">
        <q-icon name="schedule" size="xs" />
        <span>{{ formatDuration(workout.duration) }}</span>
      </div>
      <div v-if="workout.notes" class="q-mt-sm text-grey-7 ellipsis-2-lines">
        {{ workout.notes }}
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <slot name="actions">
        <q-btn
          flat
          color="primary"
          label="View"
          :to="{ name: 'workout-details', params: { id: workout.id }}"
        />
        <q-btn
          flat
          color="primary"
          label="Edit"
          :to="{ name: 'edit-workout', params: { id: workout.id }}"
        />
      </slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { date } from 'quasar';
import WorkoutStatusBadge from './WorkoutStatusBadge.vue';
import type { Database } from 'src/types/supabase';

type Workout = Database['public']['Tables']['workouts']['Row'];

const props = defineProps<{
  workout: Workout;
}>();

const formatDate = (dateStr: string) => {
  return date.formatDate(dateStr, 'MMMM D, YYYY');
};

const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
</script>

<style lang="scss" scoped>
.workout-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 