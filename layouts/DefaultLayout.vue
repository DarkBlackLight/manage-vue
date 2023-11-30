<template>
  <div class="default-layout">
    <el-container>
      <Menu/>
      <el-container direction="vertical">
        <Header/>
        <router-view></router-view>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>

import {RouterView} from 'vue-router'
import Menu from './components/Menu.vue'
import Header from './components/Header.vue'

</script>

<style lang="scss" scoped>
.default-layout {
  width: 100%;
  height: 100%;
}

.el-container {
  height: 100%;
}
</style>
  