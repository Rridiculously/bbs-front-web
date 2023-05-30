import { ref } from 'vue'
import { defineStore } from 'pinia'
export const useLoginUserInfoStore = defineStore('loginUserInfo', () => {
    const loginUserInfo = ref(null)
    const showLogin = ref(false)
    function setLoginUserInfo (data) {
        loginUserInfo.value = data
    }
    return { loginUserInfo, setLoginUserInfo, showLogin }
})
