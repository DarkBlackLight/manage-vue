<template>
    <div class="default-layout">
        <el-container>
            <Menu/>
            <el-container direction="vertical">
                <Header/>
                <el-main style="background-color: var(--tm-bg-color)">
                    <router-view></router-view>
                </el-main>
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
  