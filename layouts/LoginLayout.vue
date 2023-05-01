<template>
  <div class="w-100 h-100 login-page" @keydown.enter="onEnter">

    <el-row class="h-100" justify="center" align="middle">
      <el-col :span="8" :xs="16" :sm="13" :md="10" :lg="8">

        <el-card class="login-card">
          <template #header>
            <div class="login-header column-center">
              <img class="logo-image" src="../../../public/favicon.ico" alt="" srcset="">
              <!-- <el-avatar shape="circle" :size="75" :src="'../../public/favicon.ico'" /> -->
              <h3 class="mt-6">XXX后台管理系统</h3>
              <!-- <h2>登录</h2> -->
            </div>
          </template>

          <el-row>

            <el-col :span="24">
              <el-form label-position="left" label-width="80px" :hide-required-asterisk="true" :model="formValue"
                       :rules="rules" ref="form">
                <el-form-item label="用户名" prop="email">
                  <el-input size="large" v-model="formValue.email"/>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input type="password" size="large" :show-password="true" v-model="formValue.password"/>
                </el-form-item>
              </el-form>
            </el-col>

            <!-- <el-col :span="10">
              <div class="logo-box h-100 row-center">
                <el-avatar shape="circle" :size="100" :src="'../../public/favicon.ico'" />
              </div>
            </el-col> -->

          </el-row>
          <div class="foot">
            <el-button type="primary" size="large" @click="Login(form)">登录</el-button>
            <el-link>忘记密码</el-link>
          </div>

        </el-card>

      </el-col>
    </el-row>

  </div>

  <!--<h1>Login Page</h1>
  <el-button type="primary" @click="Login">Login</el-button> -->
</template>

<script setup>
import {useRouter} from "vue-router";
import {useAuth} from '../stores/auth';
import {ref, reactive} from "vue";

const authStore = useAuth();
const router = useRouter();

const form = ref();

const rules = reactive({
  email: [
    {required: true, message: '请输入用户名', trigger: 'submit'}
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
  // Login(form);
}

</script>

<style lang="scss" scoped>
.login-page {
  background-image: url('../../../public/images/background.jpg');
  background-size: cover;
  background-position: center;
}

.foot {
  // border-top: 1px solid var(--el-border-color-light);
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
}

.logo-image {
  width: 75px;
  height: 75px;
}
</style>
  