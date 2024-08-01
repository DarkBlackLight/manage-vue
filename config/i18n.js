import app_translations from '@/config/i18n'
import _ from "lodash-es"

const default_translations = {
    en: {
        error: {
            return_to_homepage: 'Return to homepage',
            '404_message': 'Sorry, the page you visited does not exist.',
            '500_message': 'Sorry, the server reported an error.'
        },
        login: {
            sign_in: 'Sign in',
            username: 'Username',
            email: 'Email',
            password: 'Password',
            register: 'Register',
            forget_password: 'Forget password',
            email_reminder: 'Please enter your email address',
            password_reminder: 'Please input a password',
            password_length_prompt: 'Minimum length of 6 characters',
            log_out: 'Log out',
            confirm_password: 'Confirm Password',
            go_to_login: 'Existing account? Go to login',
            name: 'name',
            name_reminder: 'Please enter a name'
        },
        resources: {
            actions: 'Actions',
            search: 'Search',
            reset: 'Reset',
            new: 'New',
            delete: 'Delete',
            delete_message: 'Successfully deleted!',
            success_message: 'Successfully submitted!',
            delete_prompt: 'Are you sure you want to delete this resource?',
            add: 'Add',
            submit: 'Submit',
            edit: 'Edit',
            back: 'Back'
        },
    },
    zh: {
        error: {
            return_to_homepage: '返回首页',
            '404_message': '抱歉，您访问的页面不存在。',
            '500_message': '抱歉，服务器报告错误。'
        },
        login: {
            sign_in: '登录',
            username: '用户名',
            email: '邮箱',
            password: '密码',
            register: '注册',
            forget_password: '找回密码',
            email_reminder: '请输入邮箱',
            password_reminder: '请输入密码',
            password_length_prompt: '最低长度6个字符',
            log_out: '退出登录',
            confirm_password: '确认密码',
            go_to_login: '已有账号？去登录',
            name: '名称',
            name_reminder: '请输入名称'
        },
        resources: {
            actions: '操作',
            search: '搜索',
            reset: '重置',
            new: '新建',
            delete: '删除',
            delete_message: '删除成功！',
            success_message: '提交成功!',
            delete_prompt: '确定要删除该资源吗?',
            add: '添加',
            submit: '提交',
            edit: '编辑',
            back: '返回'
        },
    }
}

const translations = _.merge(app_translations, default_translations)

export default translations;