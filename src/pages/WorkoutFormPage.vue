<script setup lang="ts">
  // ... other code

  const saveWorkout = async () => {
    try {
      // ... workout saving logic

      $q.notify({
        type: 'positive',
        message: `Workout ${isEdit.value ? 'updated' : 'created'} successfully`
      });

      await router.push({ name: 'workouts' });
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: `Failed to ${isEdit.value ? 'update' : 'create'} workout. Please try again.`
      });
      console.error('Error saving workout:', err);
    }
  };

  // ... remaining code
</script> 