<template>
  <el-aside class="layout-aside" :width="authStore.storeConfig.MenuCollapse ? '64px' : '180px'">
    <div class="layout-aside-header row-align-center">
      <img src="../../../public/favicon.ico">
      <h3 v-if="!authStore.storeConfig.MenuCollapse">INFSHOP</h3>
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
import {ref, onMounted, markRaw} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {
  Grid, Handbag, HomeFilled, UserFilled, Shop,
  Setting, ShoppingCart, Box, Ticket
} from '@element-plus/icons-vue'

import {useAuth} from '../../stores/auth';

const router = useRouter();
const route = useRoute();

const defaultActive = ref('')

const authStore = useAuth();
// 导航列表
const list = ref([])

const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}

const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}

onMounted(() => {
  defaultActive.value = route.path.split('/')[1] ? '/' + route.path.split('/')[1] : '/'
  list.value = [
    {
      name: '信息总览',
      icon: markRaw(HomeFilled),
      path: '/',
      children: []
    },
    {
      name: '商品管理',
      icon: markRaw(Handbag),
      path: '/products',
      children: []
    },
    {
      name: '分类管理',
      icon: markRaw(Grid),
      path: '/categories',
      children: []
    },
    {
      name: '商户管理',
      icon: markRaw(Shop),
      path: '/shops',
      children: []
    },
    {
      name: '库存管理',
      icon: markRaw(Box),
      children: [
        {
          name: '仓库管理',
          path: '/warehouses',
        },
        {
          name: '库存商品',
          path: '/warehouse_items',
        },
        {
          name: '入库转移',
          path: '/movements',
        },
      ]
    },
    {
      name: '订单管理',
      icon: markRaw(ShoppingCart),
      path: '/orders',
      children: []
    },
    {
      name: '优惠劵管理',
      icon: markRaw(Ticket),
      path: '/coupons',
      children: []
    },

    {
      name: '人员管理',
      icon: markRaw(UserFilled),
      children: [
        {
          name: '用户管理',
          path: '/admins',
        },
        {
          name: '客户管理',
          path: '/customers',
        }
      ]
    },
    {
      name: '系统设置',
      icon: markRaw(Setting),
      children: [
        {
          name: '付款方式',
          path: '/payment_methods',
        },
        {
          name: '配送方式',
          path: '/delivery_methods',
        },
        {
          name: '税率管理',
          path: '/taxes',
        },
      ]
    },
  ]
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