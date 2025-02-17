<script setup lang="ts">
  // ... other code

  const saveProgress = async () => {
    try {
      // ... progress saving logic
      await router.push({ name: 'progress' });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  onMounted(async () => {
    await loadProgress();
  });
</script> 