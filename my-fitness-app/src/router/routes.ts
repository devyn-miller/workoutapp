import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        redirect: '/workouts'
      },
      {
        path: 'workouts',
        name: 'workouts',
        component: () => import('pages/WorkoutListPage.vue')
      },
      {
        path: 'workouts/create',
        name: 'create-workout',
        component: () => import('pages/WorkoutFormPage.vue')
      },
      {
        path: 'workouts/:id',
        name: 'workout-details',
        component: () => import('pages/WorkoutDetailsPage.vue'),
        props: true
      },
      {
        path: 'workouts/:id/edit',
        name: 'edit-workout',
        component: () => import('pages/WorkoutFormPage.vue'),
        props: true
      },
      {
        path: 'exercises',
        name: 'exercises',
        component: () => import('pages/ExerciseLibraryPage.vue')
      },
      {
        path: 'exercises/create',
        name: 'create-exercise',
        component: () => import('pages/ExerciseFormPage.vue')
      },
      {
        path: 'exercises/:id',
        name: 'exercise-details',
        component: () => import('pages/ExerciseDetailsPage.vue'),
        props: true
      },
      {
        path: 'exercises/:id/edit',
        name: 'edit-exercise',
        component: () => import('pages/ExerciseFormPage.vue'),
        props: true
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
