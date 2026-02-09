<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <Header />

    <main class="app-main">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.app-main {
  flex: 1;
  padding: 20px 0;
  width: 100%;
}
</style>