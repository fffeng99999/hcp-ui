<template>
  <header class="header">
    <div class="logo">
      <span class="logo-mark">HCP</span>
      <span class="logo-text">HCP‑Bench 控制台</span>
    </div>
    <div class="header-right">
      <span class="env-tag">DEV</span>
      <span class="user-name">ZLF</span>
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped>
.header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #001529;
  color: #fff;
}
.logo {
  display: flex;
  align-items: center;
}
.logo-mark {
  background: #00b2a9;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 8px;
  font-weight: 600;
}
.logo-text {
  font-size: 16px;
  font-weight: 500;
}
.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}
.env-tag {
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
}
</style>
