<script setup lang="ts">
  // If 'useQuasar' is not used, remove it:
  import { ref, onMounted } from 'vue';
  import { supabase } from 'src/boot/supabase';

  // ... your code to load exercises

  onMounted(async () => {
    await loadExercises();
  });
</script> 