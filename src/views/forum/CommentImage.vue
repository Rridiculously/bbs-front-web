<template>
    <el-image
    class="comment-img"
    :src="props.src"
    :zoom-rate="1.2"
    :preview-src-list="imgList?imgList:[src]"
    :initial-index="0"
    fit="scale-down"
    loading="lazy"
    hide-on-click-modal>

    </el-image>
</template>

<script setup>
const props = defineProps({
    src: {
        type: String,
        default: ''
    },
    imgList: {
        type: Array
    }
})
</script>

<style lang="scss" scoped>
.comment-img {
    height: 80px;
    width: 80px;
    cursor: pointer;
    border-radius: 5px;
    background-color: #eee;
}
</style>
