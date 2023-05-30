<template>
    <div editor-html>
        <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        :style="{'height': props.height - 160 + 'px', 'overflow-y': 'hidden'}"
        :model-value="modelValue"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="onChange"
      />
    </div>
</template>

<script setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { getCurrentInstance, onBeforeUnmount, ref, shallowRef } from 'vue'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo.js'
const loginUserInfo = useLoginUserInfoStore()
const { proxy } = getCurrentInstance()
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    height: {
        type: Number,
        default: 500
    }
})
const mode = ref('default')
// 浅层响应式
const editorRef = shallowRef()
const toolbarConfig = {
    // 禁止上传视频
    excludeKeys: [
        'uploadVideo'
    ]
}
const editorConfig = {
    placeholder: '请输入内容',
    excludeKeys: [
        'uploadVideo'
    ],
    MENU_CONF: {
        uploadImage: {
            maxFileSize: 3 * 1024 * 1024,
            server: '/api/file/uploadImage',
            fieldName: 'file',
            customInsert (responseData, insertFn) {
                if (responseData.code === 200) {
                    insertFn(proxy.globalInfo.imageUrl + responseData.data.fileName,
                        '', '')
                    return
                } else if (responseData.code === 901) {
                    loginUserInfo.showLogin = true
                    return
                }
                proxy.Message.error(responseData.info)
            }
        }
    }

}
const emits = defineEmits(['update:modelValue'])
const onChange = (editor) => {
    emits('update:modelValue', editor.getHtml())
}
onBeforeUnmount(() => {
    if (editorRef.value) {
        editorRef.value.destroy()
    }
})
const handleCreated = (editor) => {
    editorRef.value = editor
}
</script>

<style lang="scss" scoped>

</style>
