import app_translations from '@/config/i18n'
import _ from "lodash-es"

const default_translations = {
    en: {
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
            submit: 'Submit'
        },
    },
    zh: {
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
            submit: '提交'
        },
    }
}

const translations = _.merge(app_translations, default_translations)

export default translations;