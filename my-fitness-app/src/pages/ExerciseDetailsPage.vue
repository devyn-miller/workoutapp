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
        <q-btn flat color="white" label="Retry" @click="loadExercise" />
      </template>
    </q-banner>

    <!-- Exercise Details -->
    <template v-else-if="exercise">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="primary"
            :to="{ name: 'exercises' }"
            class="q-mr-sm"
          />
          <h1 class="text-h4 q-my-none">{{ exercise.name }}</h1>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            v-if="!exercise.is_system"
            outline
            color="primary"
            icon="edit"
            label="Edit"
            :to="{ name: 'edit-exercise', params: { id: exercise.id }}"
          />
          <q-btn
            v-if="!exercise.is_system"
            outline
            color="negative"
            icon="delete"
            label="Delete"
            @click="confirmDelete"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="row q-col-gutter-md">
        <!-- Left Column -->
        <div class="col-12 col-md-8">
          <!-- Image -->
          <q-card class="q-mb-md">
            <q-img
              :src="exercise.image_url || 'default-exercise.png'"
              :ratio="16/9"
              style="max-height: 400px"
            />
          </q-card>

          <!-- Description -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Description</div>
              <p class="q-mt-sm">{{ exercise.description }}</p>
            </q-card-section>
          </q-card>

          <!-- Instructions -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Instructions</div>
              <ol class="q-mt-sm">
                <li
                  v-for="(step, index) in exercise.instructions"
                  :key="index"
                  class="q-mb-sm"
                >
                  {{ step }}
                </li>
              </ol>
            </q-card-section>
          </q-card>

          <!-- Tips -->
          <q-card v-if="exercise.tips && exercise.tips.length">
            <q-card-section>
              <div class="text-h6">Tips</div>
              <ul class="q-mt-sm">
                <li
                  v-for="(tip, index) in exercise.tips"
                  :key="index"
                  class="q-mb-sm"
                >
                  {{ tip }}
                </li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-4">
          <!-- Quick Info -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Exercise Details</div>
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Category</q-item-label>
                    <q-item-label>
                      <q-chip
                        dense
                        color="grey-7"
                        text-color="white"
                      >
                        {{ exercise.category }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Difficulty</q-item-label>
                    <q-item-label>
                      <q-chip
                        dense
                        :color="getDifficultyColor(exercise.difficulty)"
                        text-color="white"
                      >
                        {{ exercise.difficulty }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Primary Muscle Group</q-item-label>
                    <q-item-label>
                      <q-chip
                        dense
                        color="primary"
                        text-color="white"
                      >
                        {{ exercise.muscle_group }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="exercise.secondary_muscles && exercise.secondary_muscles.length">
                  <q-item-section>
                    <q-item-label caption>Secondary Muscles</q-item-label>
                    <q-item-label>
                      <div class="row q-gutter-x-sm q-gutter-y-xs">
                        <q-chip
                          v-for="muscle in exercise.secondary_muscles"
                          :key="muscle"
                          dense
                          outline
                          color="primary"
                        >
                          {{ muscle }}
                        </q-chip>
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="exercise.equipment && exercise.equipment.length">
                  <q-item-section>
                    <q-item-label caption>Equipment Needed</q-item-label>
                    <q-item-label>
                      <div class="row q-gutter-x-sm q-gutter-y-xs">
                        <q-chip
                          v-for="item in exercise.equipment"
                          :key="item"
                          dense
                          outline
                        >
                          {{ item }}
                        </q-chip>
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Related Exercises -->
          <q-card v-if="relatedExercises.length">
            <q-card-section>
              <div class="text-h6">Related Exercises</div>
              <q-list dense>
                <q-item
                  v-for="related in relatedExercises"
                  :key="related.id"
                  :to="{ name: 'exercise-details', params: { id: related.id }}"
                  clickable
                  v-ripple
                >
                  <q-item-section>
                    <q-item-label>{{ related.name }}</q-item-label>
                    <q-item-label caption>
                      {{ related.category }} | {{ related.muscle_group }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this exercise?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteExercise" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
  secondary_muscles?: string[];
  equipment?: string[];
  instructions: string[];
  tips?: string[];
  image_url?: string;
  is_system: boolean;
}

// Setup
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const exercise = ref<Exercise | null>(null);
const relatedExercises = ref<Exercise[]>([]);
const showDeleteDialog = ref(false);

// Methods
const loadExercise = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', route.params.id)
      .single();

    if (exerciseError) throw exerciseError;
    exercise.value = exerciseData;

    // Load related exercises (same muscle group or category)
    const { data: relatedData, error: relatedError } = await supabase
      .from('exercises')
      .select('*')
      .neq('id', route.params.id)
      .or(`muscle_group.eq.${exerciseData.muscle_group},category.eq.${exerciseData.category}`)
      .limit(5);

    if (relatedError) throw relatedError;
    relatedExercises.value = relatedData;
  } catch (err) {
    error.value = 'Failed to load exercise details. Please try again.';
    console.error('Error loading exercise:', err);
  } finally {
    loading.value = false;
  }
};

const confirmDelete = () => {
  showDeleteDialog.value = true;
};

const deleteExercise = async () => {
  try {
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exercise.value?.id);

    if (deleteError) throw deleteError;

    $q.notify({
      type: 'positive',
      message: 'Exercise deleted successfully'
    });

    await router.push({ name: 'exercises' });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to delete exercise. Please try again.'
    });
    console.error('Error deleting exercise:', err);
  } finally {
    showDeleteDialog.value = false;
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
onMounted(async () => {
  try {
    await loadExercise();
  } catch (err) {
    console.error('Error in onMounted:', err);
  }
});
</script>

<style lang="scss" scoped>
ol, ul {
  margin: 0;
  padding-left: 1.5rem;
}
</style> 