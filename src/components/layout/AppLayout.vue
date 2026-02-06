<template>
  <div class="layout">
    <AppSidebar />
    <div class="layout-main">
      <AppHeader />
      <main class="layout-content">
        <div class="content-container">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';
</script>

<style scoped lang="scss" src="@/assets/styles/layouts/layout.scss"></style>
