<template>
  <q-page padding>
    <!-- Loading State -->
    <div v-if="loading" class="row justify-center items-center" style="height: 400px">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error State -->
    <q-banner v-else-if="error" class="bg-negative text-white">
      {{ error }}
      <template v-slot:action>
        <q-btn flat color="white" label="Retry" @click="loadWorkout" />
      </template>
    </q-banner>

    <!-- Form -->
    <template v-else>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="primary"
            :to="{ name: 'workouts' }"
            class="q-mr-sm"
          />
          <h1 class="text-h4 q-my-none">
            {{ isEdit ? 'Edit Workout' : 'Create Workout' }}
          </h1>
        </div>
      </div>

      <!-- Form Content -->
      <q-form @submit="onSubmit" class="row q-col-gutter-md">
        <!-- Left Column -->
        <div class="col-12 col-md-8">
          <!-- Basic Info Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Basic Information</div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="form.name"
                    label="Workout Name"
                    :rules="[val => !!val || 'Name is required']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.date"
                    label="Date"
                    type="date"
                    :rules="[val => !!val || 'Date is required']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="form.status"
                    :options="statusOptions"
                    label="Status"
                    :rules="[val => !!val || 'Status is required']"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.notes"
                    type="textarea"
                    label="Notes"
                    outlined
                    dense
                    autogrow
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Exercises Card -->
          <q-card>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Exercises</div>
                <q-btn
                  outline
                  color="primary"
                  icon="add"
                  label="Add Exercise"
                  @click="addExercise"
                />
              </div>

              <!-- Exercise List -->
              <div v-if="form.exercises.length === 0" class="text-center q-pa-lg">
                <q-icon name="fitness_center" size="4em" color="grey-5" />
                <p class="text-h6 text-grey-7">No exercises added</p>
                <p class="text-grey-7">Click "Add Exercise" to start building your workout</p>
              </div>

              <div v-else class="q-gutter-y-md">
                <q-card
                  v-for="(exercise, index) in form.exercises"
                  :key="index"
                  flat
                  bordered
                >
                  <q-card-section>
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="row items-center">
                        <q-btn
                          flat
                          round
                          dense
                          icon="drag_indicator"
                          class="q-mr-sm cursor-move"
                        />
                        <div class="text-subtitle1">Exercise {{ index + 1 }}</div>
                      </div>
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="delete"
                        @click="removeExercise(index)"
                      />
                    </div>

                    <div class="row q-col-gutter-md">
                      <div class="col-12">
                        <ExerciseSelect
                          v-model="exercise.exercise"
                          label="Select Exercise"
                          :rules="[val => !!val || 'Exercise is required']"
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="exercise.notes"
                          label="Exercise Notes"
                          outlined
                          dense
                        />
                      </div>
                    </div>

                    <!-- Sets -->
                    <div class="q-mt-md">
                      <div class="row items-center justify-between q-mb-sm">
                        <div class="text-subtitle2">Sets</div>
                        <q-btn
                          flat
                          dense
                          color="primary"
                          icon="add"
                          label="Add Set"
                          @click="addSet(exercise)"
                        />
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
                        <template v-slot:body="props">
                          <q-tr :props="props">
                            <q-td key="set_number" :props="props">
                              {{ props.row.set_number }}
                            </q-td>
                            <q-td key="weight" :props="props">
                              <q-input
                                v-model.number="props.row.weight"
                                type="number"
                                dense
                                outlined
                                style="width: 80px"
                              />
                            </q-td>
                            <q-td key="reps" :props="props">
                              <q-input
                                v-model.number="props.row.reps"
                                type="number"
                                dense
                                outlined
                                style="width: 80px"
                              />
                            </q-td>
                            <q-td key="rir" :props="props">
                              <q-input
                                v-model.number="props.row.rir"
                                type="number"
                                dense
                                outlined
                                style="width: 80px"
                              />
                            </q-td>
                            <q-td key="set_type" :props="props">
                              <q-select
                                v-model="props.row.set_type"
                                :options="setTypeOptions"
                                dense
                                outlined
                                emit-value
                                map-options
                                style="width: 120px"
                              />
                            </q-td>
                            <q-td key="rest_time" :props="props">
                              <q-input
                                v-model.number="props.row.rest_time"
                                type="number"
                                dense
                                outlined
                                style="width: 80px"
                              />
                            </q-td>
                            <q-td key="actions" :props="props">
                              <q-btn
                                flat
                                round
                                dense
                                color="negative"
                                icon="delete"
                                @click="removeSet(exercise, props.rowIndex)"
                              />
                            </q-td>
                          </q-tr>
                        </template>
                      </q-table>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-4">
          <!-- Summary Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Workout Summary</div>
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Total Exercises</q-item-label>
                    <q-item-label>{{ form.exercises.length }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Total Sets</q-item-label>
                    <q-item-label>{{ totalSets }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Estimated Duration</q-item-label>
                    <q-item-label>{{ estimatedDuration }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Submit Button -->
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-btn
                type="submit"
                color="primary"
                :label="isEdit ? 'Save Changes' : 'Create Workout'"
                class="full-width"
              />
            </div>
            <div class="col-12">
              <q-btn
                flat
                color="primary"
                label="Cancel"
                class="full-width"
                :to="{ name: 'workouts' }"
              />
            </div>
          </div>
        </div>
      </q-form>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { workoutService } from 'src/services';
import ExerciseSelect from 'src/components/ExerciseSelect.vue';
import type { Exercise } from 'src/types/supabase';

// Constants
const TEST_USER_ID = 'dd1b545a-7cfd-47b9-9c63-13fbdce2dd05';

// Types
interface WorkoutExercise {
  exercise: Exercise | null;
  notes?: string;
  sets: {
    set_number: number;
    weight?: number;
    reps?: number;
    rir?: number;
    set_type: 'normal' | 'warmup' | 'dropset' | 'failure';
    rest_time?: number;
    completed: boolean;
  }[];
}

interface WorkoutForm {
  name: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
  notes?: string;
  exercises: WorkoutExercise[];
}

// Setup
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// State
const loading = ref(false);
const error = ref<string | null>(null);

const form = ref<WorkoutForm>({
  name: '',
  date: new Date().toISOString().split('T')[0],
  status: 'planned',
  notes: '',
  exercises: []
});

// Options
const statusOptions = [
  { label: 'Planned', value: 'planned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' }
];

const setTypeOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Warm-up', value: 'warmup' },
  { label: 'Drop Set', value: 'dropset' },
  { label: 'To Failure', value: 'failure' }
];

const setColumns = [
  {
    name: 'set_number',
    label: 'Set',
    field: 'set_number',
    align: 'center' as const
  },
  {
    name: 'weight',
    label: 'Weight (kg)',
    field: 'weight',
    align: 'center' as const
  },
  {
    name: 'reps',
    label: 'Reps',
    field: 'reps',
    align: 'center' as const
  },
  {
    name: 'rir',
    label: 'RIR',
    field: 'rir',
    align: 'center' as const
  },
  {
    name: 'set_type',
    label: 'Type',
    field: 'set_type',
    align: 'center' as const
  },
  {
    name: 'rest_time',
    label: 'Rest (sec)',
    field: 'rest_time',
    align: 'center' as const
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center' as const
  }
];

// Computed
const isEdit = computed(() => !!route.params.id);

const totalSets = computed(() => {
  return form.value.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length;
  }, 0);
});

const estimatedDuration = computed(() => {
  const totalRestTime = form.value.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + (set.rest_time || 60);
    }, 0);
  }, 0);

  // Estimate 30 seconds per set for the actual exercise
  const totalExerciseTime = totalSets.value * 30;
  const totalTimeInSeconds = totalRestTime + totalExerciseTime;

  const minutes = Math.floor(totalTimeInSeconds / 60);
  return `${minutes} minutes`;
});

// Methods
const loadWorkout = async () => {
  if (!isEdit.value) return;

  loading.value = true;
  error.value = null;

  try {
    const workout = await workoutService.getWorkoutById(route.params.id as string);
    
    form.value = {
      name: workout.name,
      date: workout.date,
      status: workout.status,
      notes: workout.notes,
      exercises: workout.exercises.map(ex => ({
        exercise: null, // We'll need to load this from the exercise service
        notes: ex.notes,
        sets: ex.sets
      }))
    };

    // Load exercise details for each workout exercise
    await Promise.all(
      form.value.exercises.map(async (ex, index) => {
        const exerciseData = await workoutService.getExerciseById(
          workout.exercises[index].exercise_id
        );
        ex.exercise = exerciseData;
      })
    );
  } catch (err) {
    error.value = 'Failed to load workout. Please try again.';
    console.error('Error loading workout:', err);
  } finally {
    loading.value = false;
  }
};

const addExercise = () => {
  form.value.exercises.push({
    exercise: null,
    sets: [createDefaultSet(1)]
  });
};

const removeExercise = (index: number) => {
  form.value.exercises.splice(index, 1);
};

const createDefaultSet = (setNumber: number) => ({
  set_number: setNumber,
  weight: undefined,
  reps: undefined,
  rir: undefined,
  set_type: 'normal' as const,
  rest_time: 60,
  completed: false
});

const addSet = (exercise: WorkoutExercise) => {
  exercise.sets.push(
    createDefaultSet(exercise.sets.length + 1)
  );
};

const removeSet = (exercise: WorkoutExercise, index: number) => {
  if (exercise.sets.length > 1) {
    exercise.sets.splice(index, 1);
    // Renumber remaining sets
    exercise.sets.forEach((set, i) => {
      set.set_number = i + 1;
    });
  }
};

const onSubmit = async () => {
  try {
    const workoutData = {
      user_id: TEST_USER_ID,
      name: form.value.name,
      date: form.value.date,
      status: form.value.status,
      notes: form.value.notes,
      duration: parseInt(estimatedDuration.value)
    };

    let workoutId: string;

    if (isEdit.value) {
      const updatedWorkout = await workoutService.updateWorkout(
        route.params.id as string,
        workoutData
      );
      workoutId = updatedWorkout.id;
    } else {
      const newWorkout = await workoutService.createWorkout(workoutData);
      workoutId = newWorkout.id;
    }

    // Handle exercises
    for (const [index, exercise] of form.value.exercises.entries()) {
      if (!exercise.exercise) continue;

      const exerciseData = {
        workout_id: workoutId,
        exercise_id: exercise.exercise.id,
        order: index,
        sets: exercise.sets,
        notes: exercise.notes
      };

      if (isEdit.value) {
        // Update existing exercise
        await workoutService.updateExerciseInWorkout(
          workoutId,
          exercise.exercise.id,
          exerciseData
        );
      } else {
        // Add new exercise
        await workoutService.addExerciseToWorkout(exerciseData);
      }
    }

    $q.notify({
      type: 'positive',
      message: \`Workout \${isEdit.value ? 'updated' : 'created'} successfully\`
    });

    router.push({ name: 'workouts' });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: \`Failed to \${isEdit.value ? 'update' : 'create'} workout. Please try again.\`
    });
    console.error('Error saving workout:', err);
  }
};

// Lifecycle
onMounted(() => {
  loadWorkout();
});
</script>

<style lang="scss" scoped>
.cursor-move {
  cursor: move;
}
</style> 