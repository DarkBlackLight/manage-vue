import app_translations from '@/configs/i18n'
import _ from "lodash-es"

const default_translations = {
    en: {
        resources: {
            actions: 'Actions'
        },
    },
    zh: {
        resources: {
            actions: '操作'
        },
    }
}

const translations = _.merge(app_translations, default_translations)

export default translations;