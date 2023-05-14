<template>
  <el-aside class="layout-aside" :width="authStore.storeConfig.MenuCollapse ? '64px' : '180px'">
    <div class="layout-aside-header row-align-center">
      <img src="../../../../public/favicon.ico">
      <h3 v-if="!authStore.storeConfig.MenuCollapse">{{ shortTitle}}</h3>
    </div>
    <el-menu class="layout-menu" :default-active="defaultActive" :collapse-transition="false" router
             :collapse="authStore.storeConfig.MenuCollapse" @open="handleOpen" @close="handleClose">
      <template v-for="(item, index) in list">
        <template v-if="item.children.length > 0">
          <el-sub-menu :index="`${item.name}`">
            <template #title>
              <el-icon>
                <component :is="item.icon"/>
              </el-icon>
              <span>{{ item.name }}</span>
            </template>
            <template v-for="(item_children, c_index) in item.children">
              <el-menu-item :index="`${item_children.path}`">{{ item_children.name }}</el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="`${item.path}`">
            <el-icon>
              <component :is="item.icon"/>
            </el-icon>
            <template #title>{{ item.name }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </el-aside>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'

import {useAuth} from '../../stores/auth';
import menus from '@/configs/menus';

const route = useRoute();

const defaultActive = ref('')

const authStore = useAuth();

const shortTitle = import.meta.env.VITE_SHORT_TITLE;

const filterMenu = (mu, permissions) => mu
    .filter(m => !m.permission || m.permission(permissions))
    .map(m => m.children ? ({...m, children: filterMenu(m.children, permissions)}) : m)

// 导航列表
const list = ref(filterMenu(menus, authStore.permissions.map(i => {
  return i.permission.subject
})))

const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}

const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}

onMounted(() => {
  defaultActive.value = route.path.split('/')[1] ? '/' + route.path.split('/')[1] : '/'
})

</script>

<style lang="scss" scoped>
.layout-aside {
  height: 100%;
  transition: width 0.3s ease;
}

.layout-menu {
  height: calc(100vh - 59px);
}

.layout-aside-header {
  width: 100%;
  height: 59px;

  justify-content: center;

  h3 {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 10px;
  }
}

.layout-aside-footer {
  height: 50px;
}
</style>