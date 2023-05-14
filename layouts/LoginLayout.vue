<template>
  <div class="w-100 h-100 login-page" @keydown.enter="onEnter">

    <el-row class="h-100" justify="center" align="middle">
      <el-col :span="8" :xs="20" :sm="14" :md="10" :lg="8">

        <el-card class="login-card" style="border-radius: 0;" shadow="always">
          <template #header>
            <div class="login-header column-center">
              <img class="logo-image" :src="configStore.globalSettings.logoPath" alt="" srcset="">
              <h3 class="mt-6">登陆</h3>
            </div>
          </template>

          <el-row>
            <el-col :span="24">
              <el-form label-position="left" label-width="80px" :hide-required-asterisk="true"
                       :model="formValue"
                       :rules="rules" ref="form">
                <el-form-item label="用户名" prop="email">
                  <el-input size="large" v-model="formValue.email"/>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input type="password" size="large" :show-password="true"
                            v-model="formValue.password"/>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>

          <div class="column-center">
            <el-button type="primary" size="large" @click="Login(form)">登录</el-button>
            <!--            <el-link>忘记密码</el-link>-->
          </div>

        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {useAuth, useConfig} from '../stores';
import {ref, reactive} from "vue";

const authStore = useAuth();
const configStore = useConfig();

const router = useRouter();

const form = ref();

const logoPath = import.meta.env.VITE_PATH

const rules = reactive({
  email: [
    {
      required: true, message: '请输入用户名', trigger: 'submit'
    }
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'submit'},
    {min: 6, message: '最低长度6个字符', trigger: 'blur'}
  ]
});

const formValue = reactive({
  email: '',
  password: ''
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

</script>

<style lang="scss" scoped>
.login-page {
  background-image: url('../../../public/images/background.jpg');
  background-size: cover;
  background-position: center;
}

.foot {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
}

.logo-image {
  width: 75px;
  height: 75px;
}
</style>
  