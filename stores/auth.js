import {defineStore} from 'pinia'
import API from '@/api'

export const useAuth = defineStore('auth', {
    state: () => ({
        user: null,
        role: null,
        permissions: [],
        storeConfig: {
            MenuCollapse: false,
            dark: false,
        },
        globalState: {
            routerInit: false,
        }
    }),
    actions: {
        async current() {
            if (!this.user)
                return false;

            try {
                let response = await API.Auth.current();
                this.user = response.data;
                this.role = response.data.source.role
                this.permissions = response.data.source.admin_permissions
                return true;
            } catch (e) {
                this.user = null;
                this.role = null;
                this.permissions = []
                return false;
            }
        },
        async login(user) {
            await API.Auth.validate_email_password(user)
                .then((response) => {
                    this.user = response.data;
                    this.role = response.data.source.role;
                    this.permissions = response.data.source.admin_permissions;
                })
        },
        async logout() {
            await API.Auth.logout().finally(() => {
                this.user = null;
                this.role = null;
                this.permissions = [];
            });
        },
        changeStoreConfig(key, value) {
            this.storeConfig[key] = value
        },
        changeGlobalState(key, value) {
            this.globalState[key] = value
        }
    },
    persist: {
        paths: ['user', 'storeConfig']
    }
})
