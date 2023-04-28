import axios from 'axios'
import {useAuth} from '../stores/auth'
import {ElMessage} from 'element-plus'

import _ from "lodash-es";

const API_URL = `${import.meta.env.VITE_API_URL}`
const REQUEST_TIMEOUT = 60000

const service = axios.create({
    baseURL: API_URL, timeout: REQUEST_TIMEOUT
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

const Request = {
    get: (url, params = {}, options = {}) => request({url: url, params: params, method: 'get', ...options}),
    post: (url, data = {}, options = {}) => request({url: url, data: data, method: 'post', ...options}),
    put: (url, data = {}, options = {}) => request({url: url, data: data, method: 'put', ...options}),
    delete: (url, options = {}) => request({url: url, method: 'delete', ...options}),
    upload: (url, data = {}, options = {}) => request({url: url, data: data, method: 'upload', ...options})
}

const Resources = function (resources, resource, others = {}) {
    return ({
        all: (params) => Request.get(`${resources}`, params),
        get: (id) => Request.get(`${resources}/${id}`),
        delete: (id) => Request.delete(`${resources}/${id}`),
        create: (data) => Request.post(`${resources}`, {[resource]: data}),
        update: (data) => Request.put(`${resources}/${data.id}`, {[resource]: _.omit(data, 'id')}), ...others
    })
}

const Auth = {
    current: () => Request.get('/auth/current'),
    validate_email_password: (user) => Service.post('/auth/validate_email_password', {user}),
    logout: () => Request.delete('/auth/logout')
}

const Storage = {
    upload: (file) => Request.upload('/storage/upload', {storage: file})
}

export default {Auth, Storage, Resources, Request}
