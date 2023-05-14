import app_settings from '@/config/settings'
import _ from "lodash-es"

const default_settings = {
    fullTitle: '管理系统',
    shortTitle: 'KrTech',
    logoPath: '/public/images/logo.jpg',
    layout: {
        sideMenu: {
            width: '180px'
        }
    }
}


const settings = _.merge(default_settings, app_settings)

export default settings;