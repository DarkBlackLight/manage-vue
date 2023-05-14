import app_settings from '@/config/settings'
import _ from "lodash-es"

const default_settings = {
    fullTitle: '管理系统',
    shortTitle: 'KrTech',
    layout: {
        sideMenu: {
            width: '180px'
        }
    }
}


const settings = _.merge(app_settings, default_settings)

export default settings;