<template>
    <div class="position-r h-100">
        <div class="position-a content">
            <img src="../assets/images/404.png" class="w-100">
            <h3 style="color: #909399">{{ t('error.404_message') }}</h3>
            <el-button type="primary" @click="onBack">{{ t('error.return_to_homepage') }}</el-button>
        </div>
    </div>
</template>

<script setup>
import {useI18n} from 'vue-i18n'
import {useRouter} from "vue-router";

const {t} = useI18n()
const router = useRouter();

const onBack = () => {
    router.replace('/');
}
</script>

<style lang="scss" scoped>
.content {
    width: 400px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}
</style>