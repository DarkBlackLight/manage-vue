<template>
  <el-header class="layout-header">
    <el-row align="middle" class="h-100">
      <el-col :span="24">
        <el-page-header :icon="null"
                        @back="configStore.changeGlobalConfig('sideMenuCollapse', !configStore.globalConfig.sideMenuCollapse)">

          <template #title>
            <div class="row-center">
              <el-icon :size="24" v-if="configStore.globalConfig.sideMenuCollapse">
                <Expand/>
              </el-icon>
              <el-icon v-else :size="24">
                <Fold/>
              </el-icon>
            </div>
          </template>

          <template #content>
            <div class="">{{ configStore.globalSettings.fullTitle }}</div>
          </template>

          <template #extra>
            <el-switch class="mr-10"
                       :modalValue="configStore.globalConfig.darkMode"
                       @change="changeDarkMode" inline-prompt
                       :active-icon="Sunny"
                       :inactive-icon="Moon"/>

            <el-dropdown trigger="click">
              <el-avatar :size="32"
                         src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>

              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="Logout">
                      {{ t('login.log_out') }}
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
import {onMounted} from 'vue';
import {useI18n} from 'vue-i18n'

const authStore = useAuth();
const configStore = useConfig();

const {t} = useI18n()

const router = useRouter();

const Logout = () => {
  authStore.logout().finally(() => {
    router.replace('/login');
  })
}

const changeDarkMode = () => {
  configStore.changeGlobalConfig('darkMode', !configStore.globalConfig.darkMode);
  setupDarkMode()
}

const setupDarkMode = () => {
  if (configStore.globalConfig.darkMode) {
    document.getElementsByTagName('html')[0].classList.add('dark')
  } else {
    document.getElementsByTagName('html')[0].classList.remove('dark')
  }
}

onMounted(() => {
  setupDarkMode()
})

</script>

<style scoped>
.layout-header {
  border-bottom: 1px solid var(--el-border-color);
}
</style>