<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <h1 class="text-h4 q-my-none">Progress Tracking</h1>
      <q-btn
        color="primary"
        icon="add"
        label="Log Progress"
        :to="{ name: 'create-progress' }"
      />
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
      <!-- Metrics Overview -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card>
            <q-card-section>
              <div class="text-subtitle2 text-grey-7">Current Weight</div>
              <div class="text-h5">
                {{ latestMetrics.weight ? latestMetrics.weight + ' kg' : 'Not recorded' }}
              </div>
              <div class="text-caption text-grey">
                {{ weightChange > 0 ? '+' : ''}}{{ weightChange }} kg this month
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card>
            <q-card-section>
              <div class="text-subtitle2 text-grey-7">Body Fat %</div>
              <div class="text-h5">
                {{ latestMetrics.body_fat ? latestMetrics.body_fat + '%' : 'Not recorded' }}
              </div>
              <div class="text-caption text-grey">
                {{ bodyFatChange > 0 ? '+' : ''}}{{ bodyFatChange }}% this month
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card>
            <q-card-section>
              <div class="text-subtitle2 text-grey-7">Measurements Updated</div>
              <div class="text-h5">
                {{ lastMeasurementDate ? formatDate(lastMeasurementDate) : 'Never' }}
              </div>
              <div class="text-caption text-grey">
                {{ measurementsRecorded }} measurements recorded
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card>
            <q-card-section>
              <div class="text-subtitle2 text-grey-7">Progress Photos</div>
              <div class="text-h5">{{ totalPhotos }}</div>
              <div class="text-caption text-grey">
                Last updated {{ lastPhotoDate ? formatDate(lastPhotoDate) : 'Never' }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Charts -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6">Weight Progress</div>
              <div class="chart-container">
                <WeightChart
                  v-if="weightChartData.length"
                  :data="weightChartData"
                />
                <div v-else class="text-grey text-center q-pa-md">
                  No weight data recorded yet
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6">Body Fat Progress</div>
              <div class="chart-container">
                <BodyFatChart
                  v-if="bodyFatChartData.length"
                  :data="bodyFatChartData"
                />
                <div v-else class="text-grey text-center q-pa-md">
                  No body fat data recorded yet
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Progress Entries -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">Progress History</div>
              
              <q-table
                :rows="progressEntries"
                :columns="columns"
                row-key="id"
                :pagination="{ rowsPerPage: 10 }"
              >
                <!-- Date Column -->
                <template v-slot:body-cell-date="props">
                  <q-td :props="props">
                    {{ formatDate(props.value) }}
                  </q-td>
                </template>

                <!-- Metrics Column -->
                <template v-slot:body-cell-metrics="props">
                  <q-td :props="props">
                    <div class="row q-gutter-x-sm">
                      <q-chip
                        v-if="props.row.metrics.weight"
                        dense
                        color="primary"
                        text-color="white"
                      >
                        {{ props.row.metrics.weight }} kg
                      </q-chip>
                      <q-chip
                        v-if="props.row.metrics.body_fat"
                        dense
                        color="secondary"
                        text-color="white"
                      >
                        {{ props.row.metrics.body_fat }}% BF
                      </q-chip>
                    </div>
                  </q-td>
                </template>

                <!-- Measurements Column -->
                <template v-slot:body-cell-measurements="props">
                  <q-td :props="props">
                    <div v-if="props.row.metrics.measurements" class="text-caption">
                      <template v-for="(value, key) in props.row.metrics.measurements" :key="key">
                        <span v-if="value">{{ formatMeasurement(key, value) }}</span>
                      </template>
                    </div>
                    <div v-else class="text-grey">No measurements</div>
                  </q-td>
                </template>

                <!-- Photos Column -->
                <template v-slot:body-cell-photos="props">
                  <q-td :props="props">
                    <div v-if="hasPhotos(props.row.photos)" class="row q-gutter-x-xs">
                      <template v-for="(url, type) in filteredPhotos(props.row.photos)" :key="type">
                        <q-btn
                          flat
                          dense
                          round
                          icon="photo"
                          @click="showPhoto(url)"
                        />
                      </template>
                    </div>
                    <div v-else class="text-grey">No photos</div>
                  </q-td>
                </template>

                <!-- Actions Column -->
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      :to="{ name: 'edit-progress', params: { id: props.row.id }}"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      color="negative"
                      icon="delete"
                      @click="confirmDelete(props.row)"
                    />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Photo Dialog -->
    <q-dialog v-model="photoDialog.show">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Progress Photo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-img
            :src="photoDialog.url"
            style="max-height: 80vh"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this progress entry?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Delete"
            color="negative"
            @click="deleteProgress"
            :loading="deleteDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date } from 'quasar';
import { progressService } from 'src/services';
import type { Progress } from 'src/types/supabase';
import WeightChart from 'src/components/WeightChart.vue';
import BodyFatChart from 'src/components/BodyFatChart.vue';

// Constants
const TEST_USER_ID = 'dd1b545a-7cfd-47b9-9c63-13fbdce2dd05';

// State
const loading = ref(false);
const error = ref<string | null>(null);
const progressEntries = ref<Progress[]>([]);
const photoDialog = ref({
  show: false,
  url: ''
});
const deleteDialog = ref({
  show: false,
  loading: false,
  entry: null as Progress | null
});

// Table configuration
const columns = [
  {
    name: 'date',
    required: true,
    label: 'Date',
    align: 'left',
    field: 'date',
    sortable: true
  },
  {
    name: 'metrics',
    required: true,
    label: 'Metrics',
    align: 'left',
    field: row => row.metrics
  },
  {
    name: 'measurements',
    label: 'Measurements',
    align: 'left',
    field: row => row.metrics.measurements
  },
  {
    name: 'photos',
    label: 'Photos',
    align: 'left',
    field: 'photos'
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'right'
  }
];

// Computed
const latestMetrics = computed(() => {
  if (!progressEntries.value.length) return {};
  return progressEntries.value[0].metrics;
});

const weightChange = computed(() => {
  if (progressEntries.value.length < 2) return 0;
  const latest = progressEntries.value[0].metrics.weight || 0;
  const previous = progressEntries.value[1].metrics.weight || 0;
  return +(latest - previous).toFixed(1);
});

const bodyFatChange = computed(() => {
  if (progressEntries.value.length < 2) return 0;
  const latest = progressEntries.value[0].metrics.body_fat || 0;
  const previous = progressEntries.value[1].metrics.body_fat || 0;
  return +(latest - previous).toFixed(1);
});

const lastMeasurementDate = computed(() => {
  const entry = progressEntries.value.find(
    entry => entry.metrics.measurements && Object.values(entry.metrics.measurements).some(v => v)
  );
  return entry?.date;
});

const measurementsRecorded = computed(() => {
  return progressEntries.value.filter(
    entry => entry.metrics.measurements && Object.values(entry.metrics.measurements).some(v => v)
  ).length;
});

const totalPhotos = computed(() => {
  return progressEntries.value.reduce((total, entry) => {
    return total + (entry.photos ? Object.values(entry.photos).filter(url => url).length : 0);
  }, 0);
});

const lastPhotoDate = computed(() => {
  const entry = progressEntries.value.find(
    entry => entry.photos && Object.values(entry.photos).some(url => url)
  );
  return entry?.date;
});

// Chart data
const weightChartData = computed(() => {
  return progressEntries.value
    .filter(entry => entry.metrics.weight)
    .map(entry => ({
      date: entry.date,
      weight: entry.metrics.weight!
    }))
    .reverse();
});

const bodyFatChartData = computed(() => {
  return progressEntries.value
    .filter(entry => entry.metrics.body_fat)
    .map(entry => ({
      date: entry.date,
      bodyFat: entry.metrics.body_fat!
    }))
    .reverse();
});

// Methods
const loadProgress = async () => {
  loading.value = true;
  error.value = null;

  try {
    progressEntries.value = await progressService.getProgress(TEST_USER_ID);
  } catch (err) {
    error.value = 'Failed to load progress entries. Please try again.';
    console.error('Error loading progress:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  return date.formatDate(dateStr, 'MMMM D, YYYY');
};

const formatMeasurement = (key: string, value: number) => {
  const labels = {
    chest: 'Chest',
    waist: 'Waist',
    hips: 'Hips',
    biceps: 'Biceps',
    thighs: 'Thighs'
  };
  return `${labels[key]}: ${value}cm `;
};

const hasPhotos = (photos: Progress['photos']) => {
  return photos && Object.values(photos).some(url => url);
};

const showPhoto = (url: string) => {
  photoDialog.value = {
    show: true,
    url
  };
};

const confirmDelete = (entry: Progress) => {
  deleteDialog.value = {
    show: true,
    loading: false,
    entry
  };
};

const deleteProgress = async () => {
  if (!deleteDialog.value.entry) return;

  deleteDialog.value.loading = true;

  try {
    await progressService.deleteProgress(deleteDialog.value.entry.id);
    await loadProgress();
  } catch (err) {
    console.error('Error deleting progress entry:', err);
  } finally {
    deleteDialog.value = {
      show: false,
      loading: false,
      entry: null
    };
  }
};

const filteredPhotos = (photos: Progress['photos']) => {
  if (!photos) return [];
  return Object.entries(photos).filter(([_, url]) => url);
};

// Lifecycle
onMounted(() => {
  loadProgress();
});
</script>

<style lang="scss" scoped>
.chart-container {
  height: 300px;
  margin-top: 1rem;
}
</style> 