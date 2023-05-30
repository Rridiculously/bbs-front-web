<template>
    <div class="avatar"
    :style="{width: props.width + 'px', height: props.width + 'px'}">
        <el-image
        v-if="props.userId"
        :style="{width: props.width + 'px', height: props.width + 'px', 'border-radius': '50%'}"
        :src="proxy.globalInfo.avatarUrl + props.userId + '?thumbnail=true'"
        :zoom-rate="1.2"
        fit="cover"
        loading="lazy"
        :preview-src-list="srcList"
        :initial-index="0"
        hide-on-click-modal
        @click="goTocenter"
        ></el-image>
        <div v-else class="no-login">未登录</div>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
// import { useRouter } from 'vue-router'
// const router = useRouter()
const { proxy } = getCurrentInstance()
const props = defineProps({
    userId: {
        type: String,
        default: ''
    },
    width: {
        type: Number,
        default: 50
    },
    addLink: {
        type: Boolean,
        default: true
    }
})

// 如果不为头像添加点击链接，则头像具有可放大功能
const srcList = ref([])
if (!props.addLink) {
    srcList.value.push(proxy.globalInfo.avatarUrl + props.userId)
    watch(() => props.userId, (newVal, oldVal) => {
        srcList.value[0] = (proxy.globalInfo.avatarUrl + newVal)
    })
}
const goTocenter = () => {
    if (props.addLink) {
        // router.push({
        //     path: '/user/' + props.userId
        // })
        window.open('/user/' + props.userId, '_blank')
    }
}
</script>

<style lang="scss" scoped>
.avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #f0f0f0;
    cursor: pointer;
    // 防止父元素flex导致宽高失效
    flex-shrink: 0;
    .el-image{
        flex-shrink: 0;
    }
    .no-login {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
