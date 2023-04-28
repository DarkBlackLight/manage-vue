import axios from 'axios'
import pluralize from 'pluralize'
import {useAuth} from '../stores/auth'
import {ElMessage} from 'element-plus'

import _ from "lodash-es";

const BASE_URL = 'http://localhost:3000/api/admin'
const REQUEST_TIMEOUT = 60000

const service = axios.create({
    baseURL: BASE_URL, timeout: REQUEST_TIMEOUT
})

const request = (options) => {
    let {url, method, params, data} = options

    let headers = {}

    if (method === 'upload') {
        headers['Content-Type'] = 'multipart/form-data'
        method = 'POST'
    } else {
        headers['Content-Type'] = 'application/json'
    }

    const auth = useAuth();

    if (auth.user && auth.user.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`
    }

    return service({
        url: url, method, params, data, headers: headers,
        transformRequest: [function (data, headers) {
            if (headers['Content-Type'] === 'multipart/form-data') {
                let formData = new FormData()
                for (let key in data) {
                    formData.append(key, data[key])
                }
                return formData
            } else {
                return JSON.stringify(data)
            }
        }]
    }).then((response) => response.data).catch((error) => {
        if (error.response && error.response.data.data) {
            ElMessage.error(error.response.data.data)
        } else {
            ElMessage.error(error.message)
        }

        throw error;
    })
}

export const Service = {
    get: (url, params = {}, options = {}) => request({url: url, params: params, method: 'get', ...options}),
    post: (url, data = {}, options = {}) => request({url: url, data: data, method: 'post', ...options}),
    put: (url, data = {}, options = {}) => request({url: url, data: data, method: 'put', ...options}),
    delete: (url, options = {}) => request({url: url, method: 'delete', ...options}),
    upload: (url, data = {}, options = {}) => request({url: url, data: data, method: 'upload', ...options})
}

export const Resources = (resources, others = {}) => ({
    all: (params) => Service.get(`${resources}`, params),
    get: (id) => Service.get(`${resources}/${id}`),
    delete: (id) => Service.delete(`${resources}/${id}`),
    create: (data) => Service.post(`${resources}`, {[pluralize.singular(resources)]: data}),
    update: (data) => Service.put(`${resources}/${data.id}`, {[pluralize.singular(resources)]: _.omit(data, 'id')}), ...others
})

export const Auth = {
    current: () => Service.get('/auth/current'),
    validate_email_password: (user) => Service.post('/auth/validate_email_password', {user}),
    logout: () => Service.delete('/auth/logout')
}

export const Storage = {
    upload: (file) => Service.upload('/storage/upload', {storage: file})
}
