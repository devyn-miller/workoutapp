<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        :to="{ name: 'progress' }"
        class="q-mr-sm"
      />
      <h1 class="text-h4 q-my-none">{{ isEdit ? 'Edit Progress' : 'Log Progress' }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row justify-center items-center" style="height: 400px">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error State -->
    <q-banner v-else-if="error" class="bg-negative text-white">
      {{ error }}
      <template v-slot:action>
        <q-btn flat color="white" label="Retry" @click="loadProgress" />
      </template>
    </q-banner>

    <template v-else>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Basic Info -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Basic Information</div>
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.date"
                  type="date"
                  label="Date"
                  :rules="[val => !!val || 'Date is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.notes"
                  type="textarea"
                  label="Notes"
                  hint="Optional notes about your progress"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Metrics -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Metrics</div>
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.metrics.weight"
                  type="number"
                  label="Weight (kg)"
                  step="0.1"
                  :rules="[
                    val => !val || (val >= 20 && val <= 300) || 'Weight must be between 20 and 300 kg'
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.metrics.body_fat"
                  type="number"
                  label="Body Fat %"
                  step="0.1"
                  :rules="[
                    val => !val || (val >= 1 && val <= 50) || 'Body fat must be between 1% and 50%'
                  ]"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Measurements -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Measurements (cm)</div>
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.metrics.measurements.chest"
                  type="number"
                  label="Chest"
                  step="0.1"
                  :rules="[
                    val => !val || (val >= 50 && val <= 200) || 'Chest must be between 50 and 200 cm'
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.metrics.measurements.waist"
                  type="number"
                  label="Waist"
                  step="0.1"
                  :rules="[
                    val => !val || (val >= 50 && val <= 200) || 'Waist must be between 50 and 200 cm'
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.metrics.measurements.hips"
                  type="number"
                  label="Hips"
                  step="0.1"
                  :rules="[
                    val => !val || (val >= 50 && val <= 200) || 'Hips must be between 50 and 200 cm'
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.metrics.measurements.biceps"
                  type="number"
                  label="Biceps"
                  step="0.1"
                  :rules="[
                    val => !val || (val >= 20 && val <= 60) || 'Biceps must be between 20 and 60 cm'
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <q-input
                  v-model.number="form.metrics.measurements.thighs"
                  type="number"
                  label="Thighs"
                  step="0.1"
                  :rules="[
                    val => !val || (val >= 30 && val <= 100) || 'Thighs must be between 30 and 100 cm'
                  ]"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Progress Photos -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Progress Photos</div>
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-subtitle2 q-mb-sm">Front View</div>
                <q-file
                  v-model="photoFiles.front"
                  label="Upload Photo"
                  accept="image/*"
                  @update:model-value="onPhotoSelected('front', $event)"
                >
                  <template v-slot:prepend>
                    <q-icon name="photo_camera" />
                  </template>
                </q-file>
                <q-img
                  v-if="form.photos.front"
                  :src="form.photos.front"
                  class="q-mt-sm"
                  style="max-height: 200px"
                />
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-subtitle2 q-mb-sm">Side View</div>
                <q-file
                  v-model="photoFiles.side"
                  label="Upload Photo"
                  accept="image/*"
                  @update:model-value="onPhotoSelected('side', $event)"
                >
                  <template v-slot:prepend>
                    <q-icon name="photo_camera" />
                  </template>
                </q-file>
                <q-img
                  v-if="form.photos.side"
                  :src="form.photos.side"
                  class="q-mt-sm"
                  style="max-height: 200px"
                />
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-subtitle2 q-mb-sm">Back View</div>
                <q-file
                  v-model="photoFiles.back"
                  label="Upload Photo"
                  accept="image/*"
                  @update:model-value="onPhotoSelected('back', $event)"
                >
                  <template v-slot:prepend>
                    <q-icon name="photo_camera" />
                  </template>
                </q-file>
                <q-img
                  v-if="form.photos.back"
                  :src="form.photos.back"
                  class="q-mt-sm"
                  style="max-height: 200px"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Form Actions -->
        <div class="row justify-end q-gutter-sm">
          <q-btn
            flat
            color="primary"
            label="Cancel"
            :to="{ name: 'progress' }"
          />
          <q-btn
            type="submit"
            color="primary"
            :label="isEdit ? 'Save Changes' : 'Log Progress'"
            :loading="saving"
          />
        </div>
      </q-form>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { date } from 'quasar';
import { progressService } from 'src/services';
import type { Progress } from 'src/types/supabase';

// Constants
const TEST_USER_ID = 'dd1b545a-7cfd-47b9-9c63-13fbdce2dd05';

// Router
const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const photoFiles = ref({
  front: null as File | null,
  side: null as File | null,
  back: null as File | null
});

const form = ref<Partial<Progress>>({
  date: date.formatDate(new Date(), 'YYYY-MM-DD'),
  metrics: {
    weight: null,
    body_fat: null,
    measurements: {
      chest: null,
      waist: null,
      hips: null,
      biceps: null,
      thighs: null
    }
  },
  photos: {
    front: null,
    side: null,
    back: null
  },
  notes: ''
});

// Computed
const isEdit = computed(() => !!route.params.id);

// Methods
const loadProgress = async () => {
  if (!isEdit.value) return;

  loading.value = true;
  error.value = null;

  try {
    const progress = await progressService.getProgressById(route.params.id as string);
    if (progress) {
      form.value = {
        ...progress,
        date: date.formatDate(progress.date, 'YYYY-MM-DD')
      };
    }
  } catch (err) {
    error.value = 'Failed to load progress entry. Please try again.';
    console.error('Error loading progress:', err);
  } finally {
    loading.value = false;
  }
};

const onPhotoSelected = async (type: 'front' | 'side' | 'back', file: File | null) => {
  if (!file) {
    form.value.photos![type] = null;
    return;
  }

  try {
    const url = await progressService.uploadProgressPhoto(TEST_USER_ID, file);
    form.value.photos![type] = url;
  } catch (err) {
    console.error('Error uploading photo:', err);
    // TODO: Show error notification
  }
};

const onSubmit = async () => {
  saving.value = true;

  try {
    if (isEdit.value) {
      await progressService.updateProgress(route.params.id as string, form.value);
    } else {
      await progressService.createProgress({
        ...form.value,
        user_id: TEST_USER_ID
      } as Progress);
    }
    await router.push({ name: 'progress' });
  } catch (err) {
    console.error('Error saving progress:', err);
    // TODO: Show error notification
  } finally {
    saving.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await loadProgress();
  } catch (err) {
    console.error('Error in onMounted:', err);
  }
});
</script> 