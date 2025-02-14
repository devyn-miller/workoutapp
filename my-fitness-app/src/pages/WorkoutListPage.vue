<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Header Section -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <h1 class="text-h4 q-my-none">Workouts</h1>
          <q-btn
            color="primary"
            icon="add"
            label="New Workout"
            :to="{ name: 'create-workout' }"
          />
        </div>

        <!-- Filters -->
        <div class="row q-col-gutter-sm items-center q-mb-md">
          <div class="col-12 col-sm-4">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              label="Status"
              clearable
              outlined
              dense
              emit-value
              map-options
              @update:model-value="loadWorkouts"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              v-model="filters.search"
              label="Search workouts"
              outlined
              dense
              clearable
              debounce="300"
              @update:model-value="loadWorkouts"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="col-12 flex flex-center">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12">
        <q-banner class="bg-negative text-white">
          {{ error }}
          <template v-slot:action>
            <q-btn flat label="Retry" @click="loadWorkouts" />
          </template>
        </q-banner>
      </div>

      <!-- Empty State -->
      <div v-else-if="!workouts.length" class="col-12 flex flex-center">
        <q-banner class="text-center">
          <template v-slot:avatar>
            <q-icon name="fitness_center" color="primary" size="md" />
          </template>
          No workouts found.
          <template v-slot:action>
            <q-btn
              color="primary"
              label="Create Workout"
              :to="{ name: 'create-workout' }"
            />
          </template>
        </q-banner>
      </div>

      <!-- Workout Cards -->
      <template v-else>
        <div
          v-for="workout in workouts"
          :key="workout.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <WorkoutCard :workout="workout" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { workoutService } from 'src/services';
import type { Database } from 'src/types/supabase';
import WorkoutCard from 'src/components/WorkoutCard.vue';

type Workout = Database['public']['Tables']['workouts']['Row'];

// Constants
const TEST_USER_ID = 'dd1b545a-7cfd-47b9-9c63-13fbdce2dd05';

const statusOptions = [
  { label: 'Planned', value: 'planned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

// State
const workouts = ref<Workout[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const filters = ref({
  status: null as string | null,
  search: '' as string,
});

// Methods
const loadWorkouts = async () => {
  loading.value = true;
  error.value = null;

  try {
    workouts.value = await workoutService.getWorkouts(TEST_USER_ID);
  } catch (err) {
    error.value = 'Failed to load workouts. Please try again.';
    console.error('Error loading workouts:', err);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  void loadWorkouts();
});
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