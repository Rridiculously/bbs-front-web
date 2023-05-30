import axios from 'axios'
import { ElLoading } from 'element-plus'
import Message from './Message'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo'
const loginUserInfoStore = useLoginUserInfoStore()
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8'
const contentTypeJson = 'application/json;charset=UTF-8'
const instance = axios.create({
    baseURL: '/api',
    timeout: 10 * 1000
})
let loading = null
instance.interceptors.request.use((config) => {
    if (config.showLoading) {
        loading = ElLoading.service({
            lock: true,
            text: '加载中',
            background: 'rgb(225,225,225)'
        })
    }
    return config
}, (error) => {
    // 很少进入这里，基本上是网络问题或者浏览器问题
    if (loading) {
        loading.close()
    }
    Message.error('请求发送失败')
    return Promise.reject(error)
})
instance.interceptors.response.use((response) => {
    // 任何2xx范围内的状态码都会进入这里
    const { showLoading, errorCallback, sessionTimeoutCallback, successCallback, showError = true } = response.config
    if (showLoading && loading) {
        loading.close()
    }
    const responseData = response.data
    if (responseData.code === 200) {
        if (successCallback) {
            successCallback(responseData)
        }
        return responseData
        // 901表示登录超时,即session失效
    } else if (responseData.code === 901) {
        // loginUserInfoStore.setLoginUserInfo(null)
        // loginUserInfoStore.showLogin = true
        if (sessionTimeoutCallback) {
            sessionTimeoutCallback(responseData)
        } else {
            loginUserInfoStore.loginUserInfo = null
            loginUserInfoStore.showLogin = true
        }
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
            showError: false,
            msg: '登录超时'
        })
    } else {
        if (errorCallback) {
            errorCallback(responseData)
        }
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
            showError,
            msg: responseData.info
        })
    }
    // 任何超过2xx的状态码都会进入这里
}, (error) => {
    loading.close()
    return Promise.reject(error)
})

const request = (config) => {
    let { url, params, dataType, showLoading = true, errorCallback, sessionTimeoutCallback, successCallback } = config
    let headers
    if (dataType === 'form') {
        headers = {
            'Content-Type': contentTypeForm,
            'X-Requested-With': 'XMLHttpRequest'
        }
        const formData = new FormData()
        for (const key in params) {
            formData.append(key, params[key])
        }
        params = formData
    } else {
        headers = {
            'Content-Type': contentTypeJson,
            'X-Requested-With': 'XMLHttpRequest'
        }
    }
    // axios中，第三个参数是config，第二个参数是data，config主要是一些配置，给拦截器用的
    // 这里拿到的返回值即为拦截器中的return的对象
    return instance.post(url, params, {
        headers,
        showLoading,
        errorCallback,
        sessionTimeoutCallback,
        successCallback
    }).catch((error) => {
        if (error.showError) {
            Message.error(error.msg)
        }
        return Promise.reject(error)
    })
}
export default request
