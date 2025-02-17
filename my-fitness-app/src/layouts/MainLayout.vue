<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Fitness Tracker
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'workouts' }"
          exact
        >
          <q-item-section avatar>
            <q-icon name="fitness_center" />
          </q-item-section>

          <q-item-section>
            Workouts
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'exercises' }"
          exact
        >
          <q-item-section avatar>
            <q-icon name="sports_gymnastics" />
          </q-item-section>

          <q-item-section>
            Exercise Library
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'progress' }"
          exact
        >
          <q-item-section avatar>
            <q-icon name="monitoring" />
          </q-item-section>

          <q-item-section>
            Progress Tracking
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { EssentialLinkProps } from 'components/EssentialLink.vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
