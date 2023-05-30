<template>
    <div class="img-viewer">
        <el-image-viewer
        v-if="previewImgIndex != -1"
        :initial-index="previewImgIndex"
        hide-on-click-modal
        :url-list="props.imagesList"
        @close="closeImgViewer"
        >

        </el-image-viewer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    imagesList: {
        type: Array,
        default: () => []
    }
})
const previewImgIndex = ref(-1)
const show = (index) => {
    // 隐藏滚动条
    console.log(index)
    document.body.style.overflow = 'hidden'
    previewImgIndex.value = index
}
const closeImgViewer = () => {
    document.body.style.overflow = 'auto'
    previewImgIndex.value = -1
}
defineExpose({
    show
})
</script>

<style>

</style>
