import {defineStore} from 'pinia'
import API from '@/api'

export const useAuth = defineStore('auth', {
    state: () => ({
        user: null,
        role: null,
        permissions: [],
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
        async login_username(user) {
            await API.Auth.validate_username_password(user)
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
        async register(user) {
            await API.Auth.register(user)
                .then((response) => {
                    this.user = response.data;
                    this.role = response.data.source.role;
                    this.permissions = response.data.source.admin_permissions;
                })
        },
        setUser(user) {
            this.user = user.data;
            this.role = user.data.source.role;
            this.permissions = user.data.source.admin_permissions;
        },
    },
    persist: {
        paths: ['user']
    }
})
