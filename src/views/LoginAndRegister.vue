<template>
  <div>
    <DialogModule
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="closeHandler">
      <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      >
        <el-form-item prop="email">
          <el-input
          clearable
          size="large"
          placeholder="请输入邮箱"
          maxlength="100"
          v-model="formData.email">
          <!-- 给input前加内容 -->
          <template #prefix>
            <el-icon size="18"><Message /></el-icon>
          </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="emailCode" v-if="opType == 0 || opType == 2">
          <div style="width: 100%; display:flex;justify-content: space-between;">
            <el-input
          clearable
          size="large"
          placeholder="请输入验证码"
          v-model="formData.emailCode">
          <template #prefix>
            <el-icon size="18"><Key /></el-icon>
          </template>
          </el-input>

          <el-button style="margin-left:5px"
            :disabled="reSendMail.show" size="large"
            @click="showSendEmailCodeDialog" type="primary">获取邮箱验证码</el-button>
          </div>
          <div style="width: 100%; display:flex;justify-content: space-between;">
            <el-popover
            placement="left-start"
            :width="200"
            trigger="hover"
          >
          <div>
            <p>1.在垃圾箱中查找邮箱验证码</p>
            <p>2.在邮箱中设置邮件地址白名单</p>
            <p>3.点击重新发送邮件</p>
          </div>
            <template #reference>
              <el-link @click="resend" type="primary">未收到验证码</el-link>
            </template>
          </el-popover>
          <el-link v-if="reSendMail.show" type="primary">{{ reSendMail.countDown }}秒后重新发送</el-link>
          </div>
        </el-form-item>
        <el-form-item prop="nickName" v-if="opType == 0">
          <el-input
          clearable
          size="large"
          placeholder="请输入昵称"

          v-model="formData.nickName">
          <template #prefix>
            <el-icon size="18"><UserFilled /></el-icon>
          </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" v-if="opType == 1">
          <el-input
          clearable
          size="large"
          show-password
          placeholder="请输入密码"
          v-model="formData.password">
          <template #prefix>
            <el-icon size="18"><Lock /></el-icon>
          </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="registerPassword" v-if="opType == 0 || opType == 2">
          <el-input
          clearable
          size="large"
          show-password
          placeholder="请输入密码"
          v-model="formData.registerPassword">
          <template #prefix>
            <el-icon size="18"><Lock /></el-icon>
          </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="reRegisterPassword" v-if="opType == 0 || opType == 2">
          <el-input
          clearable
          size="large"
          show-password
          placeholder="请确认密码"
          v-model="formData.reRegisterPassword">
          <template #prefix>
            <el-icon size="18"><Lock /></el-icon>
          </template>
          </el-input>
        </el-form-item>
        <!-- 登录验证码 -->
        <el-form-item prop="checkCode">
          <div class="checkcode-panel">
            <el-input
          size="large"
          placeholder="请输入验证码"
          v-model="formData.checkCode"
          @keyup.enter="login">
          <template #prefix>
            <el-icon size="18"><CircleCheck /></el-icon>
          </template>
          </el-input>
          <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode(0)">
          </div>
          <el-link v-if="opType == 0" type="primary" href="javascript:void(0)" @click="showPanel(1)">已有账号</el-link>
          <el-link v-if="opType == 2" type="primary" href="javascript:void(0)" @click="showPanel(1)">去登录</el-link>
        </el-form-item>
        <el-form-item v-if="opType == 1">
          <div class="remember-panel">
            <el-checkbox v-model="formData.memory">记住我</el-checkbox>
          </div>
          <div class="no-account">
            <el-link type="primary" href="javascript:void(0)" @click="showPanel(2)">忘记密码</el-link>
            <el-link type="primary" href="javascript:void(0)" @click="showPanel(0)">没有账号</el-link>

          </div>
        </el-form-item>
        <el-form-item v-if="opType == 0">
          <el-button size="large" style="width:100%;" @click="registe" type="primary">注册</el-button>
        </el-form-item>
        <el-form-item v-if="opType == 1">
          <el-button size="large" style="width:100%;" @click="login" type="primary">登录</el-button>
        </el-form-item>
        <el-form-item v-if="opType == 2">
          <el-button size="large" style="width:100%;" @click="resetPwd" type="primary">重置密码</el-button>
        </el-form-item>
      </el-form>
    </DialogModule>
    <DialogModule
      :show="dialogForSendMailConfig.show"
      :title="dialogForSendMailConfig.title"
      width="500px"
      :buttons="dialogForSendMailConfig.buttons"
      :showCancel="false"
      @close="dialogForSendMailConfig.show = false"
    >
    <el-form
      :model="formDataForSendMail"
      ref="formDataForSendMailRef"
      label-width="80px"
      @submit.prevent
    >
      <el-form-item label="邮箱">
        {{ formData.email }}
      </el-form-item>
      <el-form-item label="验证码" prop="checkCode" >
        <div class="checkcode-panel">
            <el-input
          size="large"
          placeholder="请输入验证码"
          v-model="formDataForSendMail.checkCode"
          >
          <template #prefix>
            <el-icon size="18"><CircleCheck /></el-icon>
          </template>
          </el-input>
          <img :src="checkCodeForSendMailUrl" class="check-code" @click="changeCheckCode(1)">
        </div>
      </el-form-item>
    </el-form>
    </DialogModule>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import md5 from 'js-md5'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo.js'
const { proxy } = getCurrentInstance()
const loginUserInfoStore = useLoginUserInfoStore()
const api = {
    checkCode: '/api/checkCode',
    sendMail: '/sendEmailCode',
    register: '/register',
    login: '/login',
    resetPwd: '/resetPwd'
}
// 关闭登录框时更新仓库状态
const closeHandler = () => {
    loginUserInfoStore.showLogin = false
    dialogConfig.show = false
}
const reSendMail = reactive({
    show: false,
    isWaitting: false,
    countDown: 30,
    intervalId: 1
})
// 限制半分钟才能再次发送
const resend = () => {
    reSendMail.show = true
    if (reSendMail.countDown < 30) {
        return
    }
    reSendMail.intervalId = setInterval(() => {
        reSendMail.countDown--
        if (reSendMail.countDown === 0) {
            reSendMail.countDown = 30
            reSendMail.show = false
            clearInterval(reSendMail.intervalId)
        }
    }, 1000)
}
const checkCodeUrl = ref('')
const checkCodeForSendMailUrl = ref('')
// 验证码切换
const changeCheckCode = (type) => {
    if (type === 0) {
    // 加上时间戳，防止浏览器缓存
        checkCodeUrl.value = api.checkCode + '?type=' + type + '&time=' + new Date().getTime()
    } else {
        checkCodeForSendMailUrl.value = api.checkCode + '?type=' + type + '&time=' + new Date().getTime()
    }
}
const formDataForSendMail = reactive({
    checkCode: ''
})
const formData = reactive({})
const formDataRef = ref()
const dialogConfig = reactive({
    show: false,
    title: '标题'
})

const formDataForSendMailRef = ref()
// 发送邮箱验证码二级弹窗控制
const showSendEmailCodeDialog = () => {
// 验证邮箱是否正确,elementui的表单验证
    formDataRef.value.validateField('email', (valid) => {
        if (!valid) {
            return
        }
        dialogForSendMailConfig.show = true
        nextTick(() => {
            changeCheckCode(1)
            formDataForSendMail.checkCode = ''
        })
    })
}

// 二级弹窗发送邮箱验证码函数
const sendEmailCode = async () => {
    if (formDataForSendMail.checkCode === '') {
        proxy.Message.error('请输入验证码')
    } else {
        const result = await proxy.Request({
            url: api.sendMail,
            dataType: 'form',
            // 发邮件功能后端有问题，没返回，暂时不做后端验证
            params: {
                email: formData.email,
                checkCode: formDataForSendMail.checkCode,
                type: opType.value === 0 ? 0 : 1
            }
            // errorCallback: () => {
            //     changeCheckCode(1)
            // }
            // successCallback: () => {
            //     proxy.Message.success('发送成功,请注意查收')
            //     resend()
            //     dialogForSendMailConfig.show = false
            // }
        })
        if (!result) return
        proxy.Message.success('发送成功,请注意查收')
        resend()
        dialogForSendMailConfig.show = false
    }
}
// 注册提交表单函数
const registe = () => {
    formDataRef.value.validate(async (valid) => {
        if (valid) {
            await proxy.Request({
                url: api.register,
                dataType: 'form',
                params: {
                    email: formData.email,
                    nickName: formData.nickName,
                    password: md5(formData.registerPassword),
                    // password: formData.registerPassword,
                    emailCode: formData.emailCode,
                    checkCode: formData.checkCode
                },
                successCallback: () => {
                    proxy.Message.success('注册成功,请登录')
                    showPanel(1)
                },
                errorCallback: () => {
                    changeCheckCode(0)
                }
            }).catch((error) => {
                console.log(error)
            })
        } else {
            return false
        }
    })
}
// 登录提交表单函数
const login = () => {
    formDataRef.value.validate(async (valid) => {
        if (valid) {
            const result = await proxy.Request({
                url: api.login,
                dataType: 'form',
                params: {
                    email: formData.email,
                    password: md5(formData.password),
                    checkCode: formData.checkCode,
                    rememberMe: formData.memory ? true : 0
                },
                successCallback: (response) => {
                    proxy.Message.success('登录成功')
                    dialogConfig.show = false
                    loginUserInfoStore.setLoginUserInfo(response.data)
                },
                errorCallback: () => {
                    changeCheckCode(0)
                }
            })
            if (!result) return
            localStorage.setItem('loginInfo', 'true')
        } else {
            return false
        }
    })
}
// 重置密码提交表单函数
const resetPwd = () => {
    formDataRef.value.validate(async (valid) => {
        if (valid) {
            await proxy.Request({
                url: api.resetPwd,
                dataType: 'form',
                params: {
                    email: formData.email,
                    emailCode: formData.emailCode,
                    password: md5(formData.registerPassword),
                    // password: formData.registerPassword,
                    checkCode: formData.checkCode
                },
                successCallback: () => {
                    proxy.Message.success('重置密码成功,请登录')
                    showPanel(1)
                },
                errorCallback: () => {
                    changeCheckCode(0)
                }
            }).catch((error) => {
                console.log(error)
            })
        } else {
            proxy.Message.error('请检查表单是否填写正确')
            return false
        }
    })
}
const dialogForSendMailConfig = reactive({
    show: false,
    title: '发送邮箱验证码',
    buttons: [
        {
            text: '发送验证码',
            type: 'primary',
            click: () => {
                sendEmailCode()
            }
        }
    ]
})

// 0：注册  1：登录 2： 重置密码
const opType = ref(0)
const showPanel = (type) => {
    opType.value = type
    if (opType.value === 0) {
        dialogConfig.title = '注册'
    } else if (opType.value === 1) {
        dialogConfig.title = '登录'
        changeCheckCode(0)
    } else if (opType.value === 2) {
        dialogConfig.title = '重置密码'
    }
    dialogConfig.show = true
    nextTick(() => {
        changeCheckCode(0)
        formDataRef.value.resetFields()
    })
}
defineExpose({ showPanel })

const checkRePassword = (rule, value, callback) => {
    if (value !== formData.registerPassword) {
        callback(new Error(rule))
    } else {
        callback()
    }
}
const rules = {
    email: [
        { required: true, message: '请输入邮箱' },
        { validator: proxy.Verify.email, message: '请输入正确的邮箱' }
    ],
    password: [
        { required: true, message: '请输入密码' },
        { validator: proxy.Verify.password, message: '密码至少6位，不超过30位' }
    ],
    emailCode: [
        { require: true, message: '请输入邮箱验证码' }
    ],
    nickName: [
        { required: true, message: '请输入昵称' },
        { max: 30, message: '昵称最长30' }
    ],
    checkCode: [
        { required: true, message: '请输入图片验证码' }
    ],
    reRegisterPassword: [
        { required: true, message: '请输入密码' },
        { validator: checkRePassword, message: '两次输入的密码不相同' }
    ],
    registerPassword: [
        { required: true, message: '请输入密码' },
        { validator: proxy.Verify.password, message: '密码至少6位，不超过30位' }
    ]

}
</script>

<style lang="scss" scoped>
.checkcode-panel{
  display: flex;
  align-items: center;
  img{
    margin-left: 5px;
    cursor: pointer;
    height: 38px;
  }
}
.remember-panel{
  width: 100%;
}
.no-account{

  display: flex;
  width: 100%;
  justify-content: space-between;
}
.el-form-item{
  align-items: center;
}
</style>
