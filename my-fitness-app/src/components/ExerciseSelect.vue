<template>
  <q-select
    v-model="selectedExercise"
    :options="exercises"
    :loading="loading"
    option-label="name"
    option-value="id"
    emit-value
    map-options
    :label="label"
    :error="!!error"
    :error-message="error"
    @filter="filterExercises"
    clearable
    use-input
    input-debounce="300"
  >
    <template v-slot:option="{ itemProps, opt, selected }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label>{{ opt.name }}</q-item-label>
          <q-item-label caption>
            {{ opt.category }} | {{ opt.difficulty_level }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-chip
            size="sm"
            :color="opt.is_system ? 'primary' : 'secondary'"
            text-color="white"
          >
            {{ opt.is_system ? 'System' : 'Custom' }}
          </q-chip>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No exercises found
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { exerciseService } from 'src/services';
import type { Database } from 'src/types/supabase';

type Exercise = Database['public']['Tables']['exercises']['Row'];

const props = withDefaults(defineProps<{
  modelValue?: string;
  label?: string;
  userId?: string;
}>(), {
  label: 'Select Exercise',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const exercises = ref<Exercise[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const selectedExercise = ref(props.modelValue);

watch(selectedExercise, (newValue) => {
  emit('update:modelValue', newValue);
});

const loadExercises = async (searchTerm?: string) => {
  loading.value = true;
  error.value = null;

  try {
    if (searchTerm) {
      exercises.value = await exerciseService.searchExercises(searchTerm, {
        userId: props.userId,
      });
    } else {
      exercises.value = await exerciseService.getExercises({
        userId: props.userId,
      });
    }
  } catch (err) {
    error.value = 'Failed to load exercises';
    console.error('Error loading exercises:', err);
  } finally {
    loading.value = false;
  }
};

const filterExercises = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      loadExercises();
    } else {
      loadExercises(val);
    }
  });
};

onMounted(() => {
  loadExercises();
});
</script> 