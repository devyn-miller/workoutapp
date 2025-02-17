<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const handleNavigation = async () => {
    await router.push({ name: 'exercises' });
  };
</script> 