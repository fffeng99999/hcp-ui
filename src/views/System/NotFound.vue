<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 50px;
  background-color: var(--ios-bg-primary);
  height: 100vh;
  color: var(--ios-text-primary);
}
</style>