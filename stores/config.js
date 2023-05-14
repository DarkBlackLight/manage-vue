import settings from '../configs/settings';
import {defineStore} from 'pinia'

export const useConfig = defineStore('config', {
    state: () => ({
        globalState: {
            routerInit: false,
        },
        globalConfig: {
            MenuCollapse: false,
            dark: false,
        },
        globalSettings: settings
    }),
    actions: {
        changeGlobalConfig(key, value) {
            this.globalState[key] = value
        },
        changeGlobalState(key, value) {
            this.globalState[key] = value
        }
    },
    persist: {
        paths: ['globalConfig']
    }
})
