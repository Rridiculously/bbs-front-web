<template>
    <div class="attachment-selector">
        <div  v-if="modelValue" class="file-show">
            <div class="file-name" :title="props.modelValue.name">
                {{ modelValue.name }}
            </div>
            <el-icon @click="delFile"><DeleteFilled /></el-icon>
        </div>
        <el-upload
        v-else
        name="file"
        :show-file-list="false"
        accept=".zip,.rar,.mp3,.flac,.wav"
        :multiple="false"
        :http-request="selectFile">
            <el-button type="primary">选择文件</el-button>
        </el-upload>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    }
})
const emits = defineEmits(['update:modelValue'])
const selectFile = async (fileInfo) => {
    if (fileInfo.file.size > proxy.globalInfo.maxFileSize) {
        proxy.Message.warning('文件大小不能超过' + proxy.globalInfo.maxFileSize / (1024 * 1024) + 'M')
        return
    }
    emits('update:modelValue', fileInfo.file)
}
const delFile = () => {
    emits('update:modelValue', null)
}
</script>

<style lang="scss" scoped>
.attachment-selector{
    width: 100%;
    .file-show{
        display: flex;
        align-items: center;
        .file-name{
            color: var(--link);
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .el-icon{
            margin-right: 10px;
            font-size: 16px;
            cursor: pointer;
            color: #aaa;
        }
    }
}
</style>
