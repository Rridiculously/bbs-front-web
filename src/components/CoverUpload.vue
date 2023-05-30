<template>
    <div class="cover-upload">
        <el-upload
        name="file"
        :show-file-list="false"
        accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.GIF,.gif,.bmp,.BMP"
        :multiple="false"
        :http-request="uploadImage">
        <div class="cover-upload-btn">
            <template v-if="localPreview">
                <img :src="localFile" alt="">
            </template>
            <template v-else>
                <img
                :src="(imageUrlPreFix?imageUrlPreFix:proxy.globalInfo.imageUrl)+modelValue.imageUrl"
                v-if="props.modelValue && modelValue.imageUrl">
                <el-icon v-else><Plus /></el-icon>
            </template>
        </div>
        </el-upload>
    </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
    imageUrlPreFix: {
        type: String,
        default: ''
    },
    modelValue: {
        type: Object,
        default: null
    }
})

const localPreview = ref(false)
const localFile = ref()

const emits = defineEmits(['update'])
const uploadImage = async (fileInfo) => {
    const file = fileInfo.file
    const img = new FileReader()
    img.readAsDataURL(file)
    img.onload = ({ target }) => {
        localFile.value = target.result
    }
    localPreview.value = true
    emits('update:modelValue', file)
}
</script>

<style lang="scss" scoped>
.cover-upload{
    .cover-upload-btn{
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background-color: #f7f7f7;
        overflow: hidden;
        .el-icon{
            font-size: 40px;
            color: #999;
        }
        img{
            height: 100%;
            width: 100%;
            object-fit: scale-down;
        }
    }
}
</style>
