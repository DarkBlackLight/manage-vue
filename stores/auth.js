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
                this.permissions = response.data.source.permissions
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
                    this.permissions = response.data.source.permissions;
                })
        },
        async login_username(user) {
            await API.Auth.validate_username_password(user)
                .then((response) => {
                    this.user = response.data;
                    this.role = response.data.source.role;
                    this.permissions = response.data.source.permissions;
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
                    this.permissions = response.data.source.permissions;
                })
        },
        setUser(user) {
            this.user = user;
            this.role = user.source.role;
            this.permissions = user.source.permissions;
        },
    },
    persist: {
        paths: ['user']
    }
})
