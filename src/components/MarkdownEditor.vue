<template>
    <div>
        <VMEditor
        :model-value="props.modelValue"
        :height="height - 120 + 'px'"
        :disabled-menus="[]"
        :include-level="[1,2,3,4,5,6]"
        @upload-image="uploadImageHandler"
        @change="change"
        @save="save"></VMEditor>
    </div>
</template>

<script setup>
import VMEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'
import '@kangc/v-md-editor/lib/plugins/highlight-lines/highlight-lines.css'
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
VMEditor.use(githubTheme, {
    Hljs: hljs
})
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
const emits = defineEmits(['update:modelValue', 'htmlContent', 'save'])
const change = (markdownContent, htmlContent) => {
    emits('update:modelValue', markdownContent)
    emits('htmlContent', htmlContent)
}

const uploadImageHandler = async (event, insertImage, files) => {
    console.log(files[0])
    const result = await proxy.Request({
        url: '/file/uploadImage',
        dataType: 'form',
        params: {
            file: files[0]
        }
    })
    if (!result) return
    const url = proxy.globalInfo.imageUrl + result.data.fileName
    insertImage({
        url,
        desc: '图片'
    })
}
const save = () => {
    emits('save')
    proxy.Message.success('保存成功')
}
</script>

<style>

</style>
