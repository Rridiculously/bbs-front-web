<template>
    <div class="cover" :style="{width: props.width + 'px', height: width + 'px'}">
        <el-image
        :style="{width: width + 'px', height: width + 'px'}"
        loading="lazy" fit="cover"
        :src="cover?proxy.globalInfo.imageUrl + cover:''">
        </el-image>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
    cover: {
        type: String
    },
    width: {
        type: Number,
        default: 70
    }
})
</script>

<style lang="scss">
.cover{
    border-radius: 5px;
    overflow: hidden;
    background-color: white;
}
</style>
