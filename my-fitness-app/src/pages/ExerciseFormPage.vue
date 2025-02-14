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
            :to="{ name: 'exercises' }"
            class="q-mr-sm"
          />
          <h1 class="text-h4 q-my-none">
            {{ isEdit ? 'Edit Exercise' : 'Create Exercise' }}
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
                    label="Exercise Name"
                    :rules="[val => !!val || 'Name is required']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.description"
                    type="textarea"
                    label="Description"
                    :rules="[val => !!val || 'Description is required']"
                    outlined
                    dense
                    autogrow
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Instructions Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Instructions</div>
              <div
                v-for="(instruction, index) in form.instructions"
                :key="index"
                class="row q-col-gutter-sm items-center q-mb-sm"
              >
                <div class="col">
                  <q-input
                    v-model="form.instructions[index]"
                    :label="'Step ' + (index + 1)"
                    outlined
                    dense
                    :rules="[val => !!val || 'Step is required']"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    round
                    flat
                    color="negative"
                    icon="delete"
                    @click="removeInstruction(index)"
                  />
                </div>
              </div>
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Add Step"
                class="q-mt-sm"
                @click="addInstruction"
              />
            </q-card-section>
          </q-card>

          <!-- Tips Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Tips (Optional)</div>
              <div
                v-for="(tip, index) in form.tips"
                :key="index"
                class="row q-col-gutter-sm items-center q-mb-sm"
              >
                <div class="col">
                  <q-input
                    v-model="form.tips[index]"
                    :label="'Tip ' + (index + 1)"
                    outlined
                    dense
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    round
                    flat
                    color="negative"
                    icon="delete"
                    @click="removeTip(index)"
                  />
                </div>
              </div>
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Add Tip"
                class="q-mt-sm"
                @click="addTip"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-4">
          <!-- Categories Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Categories</div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="form.category"
                    :options="categories"
                    label="Category"
                    :rules="[val => !!val || 'Category is required']"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12">
                  <q-select
                    v-model="form.difficulty"
                    :options="difficulties"
                    label="Difficulty"
                    :rules="[val => !!val || 'Difficulty is required']"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Muscles Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Muscles</div>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="form.muscle_group"
                    :options="muscleGroups"
                    label="Primary Muscle Group"
                    :rules="[val => !!val || 'Primary muscle group is required']"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12">
                  <q-select
                    v-model="form.secondary_muscles"
                    :options="muscleGroups"
                    label="Secondary Muscles"
                    outlined
                    dense
                    multiple
                    emit-value
                    map-options
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Equipment Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Equipment</div>
              <q-select
                v-model="form.equipment"
                :options="equipmentOptions"
                label="Required Equipment"
                outlined
                dense
                multiple
                use-chips
                new-value-mode="add"
              />
            </q-card-section>
          </q-card>

          <!-- Image Upload Card -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Exercise Image</div>
              <q-file
                v-model="imageFile"
                label="Upload Image"
                outlined
                dense
                accept="image/*"
                @update:model-value="onImageSelected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <q-img
                v-if="imagePreview"
                :src="imagePreview"
                class="q-mt-sm"
                style="max-height: 200px"
              />
            </q-card-section>
          </q-card>

          <!-- Submit Button -->
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-btn
                type="submit"
                color="primary"
                :label="isEdit ? 'Save Changes' : 'Create Exercise'"
                class="full-width"
              />
            </div>
            <div class="col-12">
              <q-btn
                flat
                color="primary"
                label="Cancel"
                class="full-width"
                :to="{ name: 'exercises' }"
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
import { supabase } from 'src/boot/supabase';

// Types
interface ExerciseForm {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  muscle_group: string;
  secondary_muscles: string[];
  equipment: string[];
  instructions: string[];
  tips: string[];
  image_url?: string;
}

// Setup
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const form = ref<ExerciseForm>({
  name: '',
  description: '',
  category: '',
  difficulty: '',
  muscle_group: '',
  secondary_muscles: [],
  equipment: [],
  instructions: [''],
  tips: []
});

// Computed
const isEdit = computed(() => !!route.params.id);

// Options
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

const equipmentOptions = [
  'Barbell',
  'Dumbbell',
  'Kettlebell',
  'Resistance Band',
  'Pull-up Bar',
  'Bench',
  'Yoga Mat',
  'None (Bodyweight)'
];

// Methods
const loadExercise = async () => {
  if (!isEdit.value) return;

  loading.value = true;
  error.value = null;

  try {
    const { data, error: err } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', route.params.id)
      .single();

    if (err) throw err;

    // Populate form with existing data
    form.value = {
      name: data.name,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
      muscle_group: data.muscle_group,
      secondary_muscles: data.secondary_muscles || [],
      equipment: data.equipment || [],
      instructions: data.instructions,
      tips: data.tips || [],
      image_url: data.image_url
    };

    if (data.image_url) {
      imagePreview.value = data.image_url;
    }
  } catch (err) {
    error.value = 'Failed to load exercise. Please try again.';
    console.error('Error loading exercise:', err);
  } finally {
    loading.value = false;
  }
};

const onImageSelected = (file: File) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Date.now()}.\${fileExt}\`;
  const filePath = \`exercise-images/\${fileName}\`;

  const { error: uploadError } = await supabase.storage
    .from('exercises')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('exercises')
    .getPublicUrl(filePath);

  return publicUrl;
};

const addInstruction = () => {
  form.value.instructions.push('');
};

const removeInstruction = (index: number) => {
  if (form.value.instructions.length > 1) {
    form.value.instructions.splice(index, 1);
  }
};

const addTip = () => {
  form.value.tips.push('');
};

const removeTip = (index: number) => {
  form.value.tips.splice(index, 1);
};

const onSubmit = async () => {
  try {
    let imageUrl = form.value.image_url;

    // Upload image if a new one was selected
    if (imageFile.value) {
      imageUrl = await uploadImage(imageFile.value);
    }

    const exerciseData = {
      ...form.value,
      image_url: imageUrl,
      is_system: false
    };

    if (isEdit.value) {
      const { error: updateError } = await supabase
        .from('exercises')
        .update(exerciseData)
        .eq('id', route.params.id);

      if (updateError) throw updateError;

      $q.notify({
        type: 'positive',
        message: 'Exercise updated successfully'
      });
    } else {
      const { error: insertError } = await supabase
        .from('exercises')
        .insert(exerciseData);

      if (insertError) throw insertError;

      $q.notify({
        type: 'positive',
        message: 'Exercise created successfully'
      });
    }

    router.push({ name: 'exercises' });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: \`Failed to \${isEdit.value ? 'update' : 'create'} exercise. Please try again.\`
    });
    console.error('Error saving exercise:', err);
  }
};

// Lifecycle
onMounted(() => {
  loadExercise();
});
</script> 