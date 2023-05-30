<template>
    <DialogModule
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="450px"
    :showCancel="false"
    @close="dialogConfig.show=false">
        <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="40px">
            <el-form-item label="昵称" prop="nickName">
                {{ formData.nickName }}
            </el-form-item>
            <el-form-item label="头像" prop="avatar">
                <CoverUpload  :imageUrlPreFix="proxy.globalInfo.avatarUrl"
                v-model="formData.avatar"></CoverUpload>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
                <el-radio-group v-model="formData.sex">
                    <el-radio :label="0">女</el-radio>
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="-1">不展示</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="简介" prop="signature">
                <el-input clearable placeholder="请输入简介"
                v-model="formData.personDescription"
                type="textarea"
                :rows="4"
                :maxlength="100"
                resize="none"
                show-word-limit>
                </el-input>
            </el-form-item>
        </el-form>
    </DialogModule>
</template>

<script setup>
import DialogModule from '@/components/DialogModule.vue'
import CoverUpload from '@/components/CoverUpload.vue'
import { ref, getCurrentInstance, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const api = {
    updateUserInfo: 'ucenter/updateUserInfo'
}
const router = useRouter()
const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref(null)
const rules = {}
const dialogConfig = reactive({
    show: false,
    title: '编辑个人信息',
    buttons: [
        {
            text: '取消',
            type: 'default',
            click: () => {
                dialogConfig.show = false
            }
        },
        {
            text: '确定',
            type: 'primary',
            click: () => {
                updateUserInfoHandler()
                dialogConfig.show = false
            }
        }
    ]
})
const showEditorUserInfoDialog = (userInfo) => {
    dialogConfig.show = true
    nextTick(() => {
        formDataRef.value.clearValidate()
        // 快速深拷贝
        formData.value = JSON.parse(JSON.stringify(userInfo))
        formData.value.avatar = {
            imageUrl: userInfo.userId
        }
    })
}
// 将展示编辑用户信息的方法暴露出去
defineExpose({
    showEditorUserInfoDialog
})

const emit = defineEmits(['updateUserInfo'])
const updateUserInfoHandler = async (userInfo) => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }
        const params = {
            nickName: formData.value.nickName,
            sex: formData.value.sex,
            personDescription: formData.value.personDescription
        }
        if (formData.value.avatar instanceof File) {
            params.avatar = formData.value.avatar
        }
        const result = await proxy.Request({
            url: api.updateUserInfo,
            dataType: 'form',
            params
        })
        if (!result) {
            return
        }
        dialogConfig.show = false
        // 如果更换了头像，则刷新页面
        if (params.avatar instanceof File) {
            router.go()
        } else {
            emit('updateUserInfo', formData.value.userId)
        }
        proxy.Message.success('修改成功')
    })
}
</script>

<style lang="scss" scoped>

</style>
