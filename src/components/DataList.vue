<template>
    <NoData v-if="!loading&&dataSource.list!=null&&dataSource.list.length==0" :msg="noDataMsg"></NoData>
    <div v-if="loading">
        <el-skeleton v-for="(item, index) in skeletonList" :key="index" :rows="loadingItemRows" animated style="padding:18px">
        </el-skeleton>
    </div>
    <div v-else v-for="item in props.dataSource.list" :key="item.articleId">
        <slot :data="item"></slot>
    </div>
    <div v-if="dataSource && dataSource.list && dataSource.list.length>0" class="pagenation">
        <el-pagination background layout="prev, pager, next"
        :page-count="parseInt(dataSource.pageTotal)"
        :hide-on-single-page="true"
        :current-page="parseInt(dataSource.pageNo)"
        @update:current-page="handlePageNoChange"/>
    </div>
</template>

<script setup>
import NoData from '@/components/NoData.vue'
import { ref, watch } from 'vue'
const props = defineProps({
    dataSource: {
        type: Object
    },
    loading: {
        type: Boolean,
        default: false
    },
    noDataMsg: {
        type: String,
        default: '空空如也'
    },
    skeletonSize: {
        type: Number,
        default: 0
    },
    loadingItemRows: {
        type: Number,
        default: 2
    }
})
const emits = defineEmits(['changePage'])
// 控制骨架数量
const skeletonList = ref(10)
if (!props.skeletonSize) {
    watch(() => props.dataSource, (newVal) => {
        if (newVal && newVal.list) {
            skeletonList.value = new Array(newVal.list.length)
        }
    })
} else {
    skeletonList.value = new Array(props.skeletonSize)
}
const handlePageNoChange = (pageNo) => {
    emits('changePage', pageNo)
}

</script>

<style lang="scss" scoped>
.pagenation{
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
