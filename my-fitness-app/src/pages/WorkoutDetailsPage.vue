<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Loading State -->
      <div v-if="loading" class="col-12 flex flex-center">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12">
        <q-banner class="bg-negative text-white">
          {{ error }}
          <template v-slot:action>
            <q-btn flat label="Retry" @click="loadWorkout" />
          </template>
        </q-banner>
      </div>

      <template v-else-if="workout">
        <!-- Header -->
        <div class="col-12">
          <div class="row items-center q-mb-md">
            <q-btn
              flat
              round
              icon="arrow_back"
              :to="{ name: 'workouts' }"
              class="q-mr-sm"
            />
            <div class="column">
              <h1 class="text-h4 q-my-none">{{ workout.name }}</h1>
              <div class="row items-center q-gutter-x-md q-mt-sm">
                <WorkoutStatusBadge :status="workout.status" />
                <div class="row items-center q-gutter-x-xs">
                  <q-icon name="event" size="xs" />
                  <span>{{ formatDate(workout.date) }}</span>
                </div>
                <div class="row items-center q-gutter-x-xs">
                  <q-icon name="schedule" size="xs" />
                  <span>{{ formatDuration(workout.duration) }}</span>
                </div>
              </div>
            </div>
            <q-space />
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="edit"
                label="Edit"
                :to="{ name: 'edit-workout', params: { id: workout.id }}"
              />
              <q-btn
                color="negative"
                icon="delete"
                label="Delete"
                @click="confirmDelete"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="workout.notes" class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">Notes</div>
              <p class="q-mt-sm">{{ workout.notes }}</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Exercises -->
        <div class="col-12">
          <h2 class="text-h5 q-mb-md">Exercises</h2>
          
          <div v-if="!workout.exercises?.length" class="text-center q-pa-lg">
            <p class="text-grey-7">No exercises added to this workout.</p>
          </div>

          <template v-else>
            <q-list bordered separator>
              <q-expansion-item
                v-for="exercise in workout.exercises"
                :key="exercise.id"
                group="exercises"
                :label="getExerciseName(exercise.exercise_id)"
                :caption="`${exercise.sets.length} sets`"
              >
                <q-card>
                  <q-card-section>
                    <div v-if="exercise.notes" class="q-mb-md">
                      {{ exercise.notes }}
                    </div>

                    <q-table
                      :rows="exercise.sets"
                      :columns="setColumns"
                      row-key="set_number"
                      dense
                      flat
                      hide-pagination
                      :pagination="{ rowsPerPage: 0 }"
                    >
                      <template v-slot:body-cell-completed="props">
                        <q-td :props="props">
                          <q-checkbox
                            v-model="props.row.completed"
                            @update:model-value="updateSetCompletion(exercise, props.row)"
                          />
                        </q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </template>
        </div>
      </template>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this workout?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteWorkout" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { date } from 'quasar';
import { workoutService, exerciseService } from 'src/services';
import WorkoutStatusBadge from 'src/components/WorkoutStatusBadge.vue';
import type { Database } from 'src/types/supabase';

type Workout = Database['public']['Tables']['workouts']['Row'] & {
  exercises: Database['public']['Tables']['workout_exercises']['Row'][];
};

const props = defineProps<{
  id: string;
}>();

const route = useRoute();
const router = useRouter();

const workout = ref<Workout | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showDeleteDialog = ref(false);
const deleting = ref(false);

const setColumns = [
  {
    name: 'set_number',
    label: '#',
    field: 'set_number',
    align: 'left',
  },
  {
    name: 'set_type',
    label: 'Type',
    field: 'set_type',
    format: (val: string) => val.charAt(0).toUpperCase() + val.slice(1),
  },
  {
    name: 'reps',
    label: 'Reps',
    field: 'reps',
  },
  {
    name: 'weight',
    label: 'Weight',
    field: 'weight',
  },
  {
    name: 'completed',
    label: 'Done',
    field: 'completed',
  },
];

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

const getExerciseName = async (exerciseId: string): Promise<string> => {
  try {
    const exercise = await exerciseService.getExerciseById(exerciseId);
    return exercise.name;
  } catch (err) {
    console.error('Error loading exercise name:', err);
    return 'Unknown Exercise';
  }
};

const loadWorkout = async () => {
  loading.value = true;
  error.value = null;

  try {
    workout.value = await workoutService.getWorkoutById(props.id);
  } catch (err) {
    error.value = 'Failed to load workout';
    console.error('Error loading workout:', err);
  } finally {
    loading.value = false;
  }
};

const updateSetCompletion = async (
  exercise: Workout['exercises'][0],
  set: typeof exercise.sets[0]
) => {
  try {
    await workoutService.updateExerciseInWorkout(workout.value!.id, exercise.id, {
      ...exercise,
      sets: exercise.sets.map(s => 
        s.set_number === set.set_number ? { ...s, completed: set.completed } : s
      ),
    });
  } catch (err) {
    console.error('Error updating set completion:', err);
    // Revert the change if it failed
    set.completed = !set.completed;
  }
};

const confirmDelete = () => {
  showDeleteDialog.value = true;
};

const deleteWorkout = async () => {
  deleting.value = true;
  try {
    await workoutService.deleteWorkout(props.id);
    router.push({ name: 'workouts' });
  } catch (err) {
    console.error('Error deleting workout:', err);
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
  }
};

onMounted(() => {
  loadWorkout();
});
</script> 