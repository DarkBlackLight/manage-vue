import app_settings from '@/configs/settings'

const default_settings = {
    full_title: '管理系统',
    short_title: 'KrTech',
    layout: {
        side_menu: {
            width: '180px'
        }
    }
}


const settings = _.merge(app_settings, default_settings)

export default settings;