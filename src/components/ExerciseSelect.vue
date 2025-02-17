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
    <template v-slot:option="{ itemProps, opt }">
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

<script lang="ts">
import { ref, onMounted, watch } from 'vue';
import { exerciseService } from 'src/services';
import type { Exercise } from 'src/types/supabase';

const props = defineProps<{
  modelValue: Exercise | null;
  label?: string;
  userId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Exercise | null): void;
}>();

const exercises = ref<Exercise[]>([]);
const loading = ref(false);
const error = ref<string | undefined>(undefined);

const selectedExercise = ref<Exercise | null>(props.modelValue);

watch(selectedExercise, (newValue: Exercise | null) => {
  emit('update:modelValue', newValue);
});

const filterExercises = async (
  searchTerm: string,
  update: (options: Exercise[]) => void
) => {
  try {
    const result = searchTerm
      ? await exerciseService.searchExercises(searchTerm, { userId: props.userId! })
      : await exerciseService.getExercises({ userId: props.userId! });
    update(result);
  } catch {
    error.value = 'Failed to load exercises';
    update([]);
  }
};

const loadExercises = async (searchTerm?: string) => {
  loading.value = true;
  await filterExercises(searchTerm || '', (options) => {
    exercises.value = options;
  });
  loading.value = false;
};

onMounted(() => {
  void loadExercises();
});
</script> 