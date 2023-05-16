<template>
    <el-row class="h-100">
        <el-col :lg="12" class="hidden-md-and-down login-left p-20">
            <div class="position-r h-100 w-100">
                <div class="position-a d-flex" style="top: 0;left: 0">
                    <img :src="configStore.globalSettings.logoPath" style="height: 75px">
                    <h2 style="color: white">{{ configStore.globalSettings.shortTitle }}</h2>
                </div>
                <div class="position-a login-img">
                    <img src="../assets/images/login-img.png" class="w-100">
                    <h1 style="color: white;margin: 0">{{ configStore.globalSettings.fullTitle }}</h1>
                    <h4 style="color: white;">{{ configStore.globalSettings.description }}</h4>
                </div>
            </div>
        </el-col>
        <el-col :lg="12" class="login-right">
            <div class="d-flex hidden-lg-and-up">
                <img :src="configStore.globalSettings.logoPath" style="height: 75px">
                <h2 style="color: white">{{ configStore.globalSettings.shortTitle }}</h2>
            </div>
            <el-card shadow="never" @keydown.enter="onEnter" class="login-card" v-if="formCard">
                <h2>{{ t('login.sign_in') }}</h2>
                <el-form label-position="top" :hide-required-asterisk="true"
                         :model="formValue"
                         :rules="rules" ref="form">
                    <el-form-item :label="t('login.email')" prop="email">
                        <el-input size="large" v-model="formValue.email" clearable/>
                    </el-form-item>
                    <el-form-item :label="t('login.password')" prop="password">
                        <el-input type="password" size="large" :show-password="true"
                                  v-model="formValue.password" clearable/>
                    </el-form-item>
                    <div class="text-end mb-20">
                        <el-link>{{ t('login.forget_password') }}</el-link>
                    </div>
                    <el-form-item>
                        <el-button type="primary" size="large" @click="Login(form)" class="w-100">
                            {{ t('login.sign_in') }}
                        </el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="large" class="w-100" @click="onSwitch('register')">{{
                                t('login.register')
                            }}
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <el-card shadow="never" class="register-card" v-if="!formCard">
                <h2>{{ t('login.register') }}</h2>
                <el-form label-position="top" :hide-required-asterisk="true"
                         :model="registerFormValue"
                         :rules="registerRules" ref="registerForm">
                    <el-form-item :label="t('login.email')" prop="email">
                        <el-input size="large" v-model="registerFormValue.email" clearable/>
                    </el-form-item>
                    <el-form-item :label="t('login.password')" prop="password">
                        <el-input type="password" size="large" :show-password="true"
                                  v-model="registerFormValue.password" clearable/>
                    </el-form-item>
                    <el-form-item :label="t('login.confirm_password')" prop="password_confirmation">
                        <el-input type="password" size="large" :show-password="true"
                                  v-model="registerFormValue.password_confirmation" clearable/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size="large" class="w-100">
                            {{ t('login.register') }}
                        </el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="large" class="w-100" @click="onSwitch('login')">{{
                                t('login.go_to_login')
                            }}
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup>
import 'element-plus/theme-chalk/display.css'
import {useRouter} from "vue-router";
import {useAuth, useConfig} from '../stores';
import {ref, reactive} from "vue";
import {useI18n} from 'vue-i18n'

const authStore = useAuth();
const configStore = useConfig();
const router = useRouter();
const {t} = useI18n()

const formCard = ref(true);

const form = ref();
const rules = reactive({
    email: [
        {
            required: true, message: t('login.email_reminder'), trigger: 'submit'
        }
    ],
    password: [
        {required: true, message: t('login.password_reminder'), trigger: 'submit'},
        {min: 6, message: t('login.password_length_prompt'), trigger: 'blur'}
    ]
});
const formValue = reactive({
    email: '',
    password: ''
});

const registerForm = ref();
const registerRules = reactive({
    email: [
        {
            required: true, message: t('login.email_reminder'), trigger: 'submit'
        }
    ],
    password: [
        {required: true, message: t('login.password_reminder'), trigger: 'submit'},
        {min: 6, message: t('login.password_length_prompt'), trigger: 'blur'}
    ],
    password_confirmation: [
        {required: true, message: t('login.password_reminder'), trigger: 'submit'},
        {min: 6, message: t('login.password_length_prompt'), trigger: 'blur'}
    ]
});
const registerFormValue = reactive({
    email: '',
    password: '',
    password_confirmation: ''
});

const Login = async (formEl) => {
    await formEl.validate((valid, fields) => {
        if (!valid) return false;
        authStore.login(formValue).then(() => {
            router.replace('/');
        });
    });
}

const onEnter = () => {
    if (formValue.email && formValue.password) Login(form.value);
}

const onSwitch = (type) => {
    if (type === 'register') {
        formCard.value = false
    } else {
        formCard.value = true
    }
}
</script>

<style lang="scss" scoped>
.login-left {
    background-color: #293146;
}

.login-img {
    width: 400px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
}

.login-right {
    display: flex;
    align-items: center;
    justify-items: center;
    text-align: center;
    padding: 20px;
}

.login-card {
    margin: auto;
    width: 500px;
}

.register-card {
    margin: auto;
    width: 500px;
}

@media only screen and (max-width: 1199px) {
    .login-right {
        background-color: #293146;
        flex-direction: column;
    }
}

@media only screen and (max-width: 600px) {
    .login-card {
        width: 100%;
    }

    .register-card {
        width: 100%;
    }
}
</style>