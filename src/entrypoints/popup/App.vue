<template>
  <div class="wrap">
    <UApp>
      <UContainer>
        <span class="text-primary">VostExt {{ version }}</span>
      </UContainer>
    </UApp>
  </div>
</template>

<script lang="ts" setup>
const version = ref(APP_VERSION);
</script>

<style scoped>
.wrap {
  padding: 1rem;
}
</style>
