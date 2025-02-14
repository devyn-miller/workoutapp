<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <h1 class="text-h4 q-my-none">Exercise Library</h1>
      <q-btn
        color="primary"
        icon="add"
        label="Create Exercise"
        :to="{ name: 'create-exercise' }"
      />
    </div>

    <!-- Search and Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          placeholder="Search exercises..."
          @update:model-value="filterExercises"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-select
          v-model="selectedCategory"
          :options="categories"
          dense
          outlined
          label="Category"
          emit-value
          map-options
          clearable
          @update:model-value="filterExercises"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-select
          v-model="selectedDifficulty"
          :options="difficulties"
          dense
          outlined
          label="Difficulty"
          emit-value
          map-options
          clearable
          @update:model-value="filterExercises"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-select
          v-model="selectedMuscleGroup"
          :options="muscleGroups"
          dense
          outlined
          label="Muscle Group"
          emit-value
          map-options
          clearable
          @update:model-value="filterExercises"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-btn-toggle
          v-model="viewMode"
          spread
          no-caps
          toggle-color="primary"
          :options="[
            { label: 'Grid', value: 'grid', icon: 'grid_view' },
            { label: 'List', value: 'list', icon: 'view_list' }
          ]"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row justify-center items-center" style="height: 400px">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error State -->
    <q-banner v-else-if="error" class="bg-negative text-white">
      {{ error }}
      <template v-slot:action>
        <q-btn flat color="white" label="Retry" @click="loadExercises" />
      </template>
    </q-banner>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-md">
      <div
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="exercise-card">
          <q-img
            :src="exercise.image_url || 'default-exercise.png'"
            :ratio="16/9"
            basic
          >
            <div class="absolute-bottom text-subtitle2 text-center bg-black-4">
              {{ exercise.name }}
            </div>
          </q-img>
          <q-card-section>
            <div class="row items-center q-gutter-x-sm">
              <q-chip
                dense
                :color="getDifficultyColor(exercise.difficulty)"
                text-color="white"
              >
                {{ exercise.difficulty }}
              </q-chip>
              <q-chip dense color="grey-7" text-color="white">
                {{ exercise.category }}
              </q-chip>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="View Details"
              :to="{ name: 'exercise-details', params: { id: exercise.id }}"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- List View -->
    <q-list v-else bordered separator>
      <q-item
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        :to="{ name: 'exercise-details', params: { id: exercise.id }}"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-avatar rounded>
            <q-img :src="exercise.image_url || 'default-exercise.png'" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ exercise.name }}</q-item-label>
          <q-item-label caption>
            {{ exercise.category }} | {{ exercise.muscle_group }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-chip
            dense
            :color="getDifficultyColor(exercise.difficulty)"
            text-color="white"
          >
            {{ exercise.difficulty }}
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- No Results -->
    <div
      v-if="!loading && !error && filteredExercises.length === 0"
      class="row justify-center items-center q-pa-lg"
    >
      <div class="text-center">
        <q-icon name="search_off" size="4em" color="grey-5" />
        <p class="text-h6 text-grey-7">No exercises found</p>
        <p class="text-grey-7">Try adjusting your search or filters</p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';

// Types
interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  muscle_group: string;
  image_url?: string;
}

// State
const loading = ref(false);
const error = ref<string | null>(null);
const exercises = ref<Exercise[]>([]);
const searchQuery = ref('');
const selectedCategory = ref<string | null>(null);
const selectedDifficulty = ref<string | null>(null);
const selectedMuscleGroup = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');

// Options for filters
const categories = [
  { label: 'Strength', value: 'strength' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'Flexibility', value: 'flexibility' },
  { label: 'Balance', value: 'balance' }
];

const difficulties = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' }
];

const muscleGroups = [
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Legs', value: 'legs' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Arms', value: 'arms' },
  { label: 'Core', value: 'core' }
];

// Computed
const filteredExercises = computed(() => {
  let filtered = [...exercises.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(exercise =>
      exercise.name.toLowerCase().includes(query) ||
      exercise.description.toLowerCase().includes(query)
    );
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(exercise =>
      exercise.category.toLowerCase() === selectedCategory.value?.toLowerCase()
    );
  }

  // Apply difficulty filter
  if (selectedDifficulty.value) {
    filtered = filtered.filter(exercise =>
      exercise.difficulty.toLowerCase() === selectedDifficulty.value?.toLowerCase()
    );
  }

  // Apply muscle group filter
  if (selectedMuscleGroup.value) {
    filtered = filtered.filter(exercise =>
      exercise.muscle_group.toLowerCase() === selectedMuscleGroup.value?.toLowerCase()
    );
  }

  return filtered;
});

// Methods
const loadExercises = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: err } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (err) throw err;

    exercises.value = data;
  } catch (err) {
    error.value = 'Failed to load exercises. Please try again.';
    console.error('Error loading exercises:', err);
  } finally {
    loading.value = false;
  }
};

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    beginner: 'positive',
    intermediate: 'warning',
    advanced: 'negative'
  };
  return colors[difficulty.toLowerCase()] || 'grey';
};

// Lifecycle
onMounted(() => {
  loadExercises();
});
</script>

<style lang="scss" scoped>
.exercise-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  .q-card__section {
    flex-grow: 1;
  }
}
</style> 