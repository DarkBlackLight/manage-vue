import {defineStore} from 'pinia'
import API from '@/api'

export const useAuth = defineStore('auth', {
    state: () => ({
        user: null,
        role: null,
        storeConfig: {
            MenuCollapse: false,
            dark: false,
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
                return true;
            } catch (e) {
                this.user = null;
                this.role = null
                return false;
            }
        },
        async login(user) {
            await API.Auth.validate_email_password(user)
                .then((response) => {
                    this.user = response.data;
                    this.role = response.data.source.role;
                })
        },
        async logout() {
            await API.Auth.logout().finally(() => {
                this.user = null
                this.role = null;
            });
        },
        changeStoreConfig(key, value) {
            this.storeConfig[key] = value
        }
    },
    persist: {
        paths: ['user', 'storeConfig']
    }
})
