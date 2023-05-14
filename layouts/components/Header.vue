<template>
  <el-header class="layout-header">
    <el-row align="middle" class="h-100">
      <el-col :span="24">
        <el-page-header :icon="null"
                        @back="authStore.changeStoreConfig('MenuCollapse', !authStore.storeConfig.MenuCollapse)">
          <template #title>
            <div class="row-center">
              <el-icon :size="24" v-if="authStore.storeConfig.MenuCollapse">
                <Expand/>
              </el-icon>
              <el-icon v-else :size="24">
                <Fold/>
              </el-icon>
            </div>
          </template>

          <template #content>
            <div class="">{{ useConfig.globalSettings.full_title }}</div>
          </template>

          <template #extra>
            <el-switch v-model="dark" class="mr-10" @change="changeDark" inline-prompt :active-icon="Sunny"
                       :inactive-icon="Moon"/>

            <el-dropdown trigger="click">
              <el-avatar :size="32"
                         src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="Logout">
                    退出系统
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

          </template>

        </el-page-header>
      </el-col>
    </el-row>
  </el-header>
</template>

<script setup>
import {Fold, Expand, Sunny, Moon} from '@element-plus/icons-vue'
import {useAuth, useConfig} from '../../stores';
import {useRouter} from "vue-router";
import {computed, onMounted} from 'vue';

const authStore = useAuth();
const router = useRouter();

const dark = computed(() => authStore.storeConfig.dark);

const fullTitle = import.meta.env.VITE_FULL_TITLE;

const Logout = () => {
  authStore.logout().finally(() => {
    router.replace('/login');
  })
}

const changeDark = (val) => {
  authStore.changeStoreConfig('dark', !authStore.storeConfig.dark);
  switchDark()
}

const switchDark = () => {
  if (authStore.storeConfig.dark) {
    document.getElementsByTagName('html')[0].classList.add('dark')
  } else {
    document.getElementsByTagName('html')[0].classList.remove('dark')
  }
}

onMounted(() => {
  switchDark()
})
</script>

<style scoped>
.layout-header {
  border-bottom: 1px solid var(--el-border-color);
}
</style>