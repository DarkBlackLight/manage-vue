import settings from '../config/settings';
import {defineStore} from 'pinia'

export const useConfig = defineStore('config', {
    state: () => ({
        globalState: {
            routerInit: false,
        },
        globalConfig: {
            sideMenuCollapse: false,
            darkMode: false,
        },
        globalSettings: settings
    }),
    actions: {
        changeGlobalConfig(key, value) {
            this.globalConfig[key] = value
        },
        changeGlobalState(key, value) {
            this.globalState[key] = value
        }
    },
    persist: {
        paths: ['globalConfig']
    }
})
