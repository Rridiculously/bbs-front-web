<template>
    <div class="container-body article-list-body"
    :style="{width: proxy.globalInfo.bodyWidth + 'px'}">
        <!-- 二级板块 -->
        <div v-if="pBoardId" class="sub-board">
            <span v-for="item in subBoardList" :key="item.boardId" :class="['board-item',item.boardId==boardId?'active':'']">
                <router-link :to="'/forum/'+item.pBoardId+'/'+item.boardId">{{ item.boardName }}</router-link>
            </span>
        </div>
        <div class="article-panel">
            <div class="top-tab">
                <div :class="['tab', orderType == 0 ? 'active' : '']" @click="changeOrderType(0)">热榜</div>
                <el-divider direction="vertical"></el-divider>
                <div :class="['tab', orderType == 1 ? 'active' : '']" @click="changeOrderType(1)">发布时间</div>
                <el-divider direction="vertical"></el-divider>
                <div :class="['tab', orderType == 2 ? 'active' : '']" @click="changeOrderType(2)">最新</div>
            </div>
            <div class="article-list">
                <DataList :dataSource="articleListInfo" :loading="loading" @changePage="changePage">
                    <template #default="{data}">
                        <ArticleListItem :data="data"></ArticleListItem>
                    </template>
                </DataList>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, getCurrentInstance, watch, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardListStore } from '@/stores/boardList.js'
import { useDeleteArticleBusStore, usePostArticleBusStore } from '@/stores/articleBus.js'
import DataList from '@/components/DataList.vue'
import ArticleListItem from './ArticleListItem.vue'
const boardListStore = useBoardListStore()
const deleteBus = useDeleteArticleBusStore()
const postBus = usePostArticleBusStore()
const route = useRoute()
const { proxy } = getCurrentInstance()
const api = {
    loadArticle: '/forum/loadArticle'
}
const orderType = ref(0)
const changeOrderType = (value) => {
    if (value === orderType.value) return
    orderType.value = value
    loadArticle()
}
// 删除或者发布文章后刷新文章列表
watch(() => deleteBus.deleteArticle, (newVal) => {
    if (newVal) {
        loadArticle()
        deleteBus.deleteArticle = false
    }
})
watch(() => postBus.postArticle, (newVal) => {
    if (newVal) {
        loadArticle()
        postBus.postArticle = false
    }
})
const articleListInfo = ref({})
const loading = ref(false)
// 一级板块
const pBoardId = ref(0)
// 二级板块
const boardId = ref(0)
const loadArticle = async (params) => {
    loading.value = true
    if (!params) {
        params = {
            orderType: orderType.value,
            pageNo: articleListInfo.value.pageNo || 1,
            pBoardId: pBoardId.value,
            boardId: boardId.value
        }
    }
    const result = await proxy.Request({
        dataType: 'form',
        url: api.loadArticle,
        params,
        showLoading: false
    })
    loading.value = false
    if (!result) return
    articleListInfo.value = result.data
}
const changePage = (pageNo) => {
    loadArticle({
        orderType: orderType.value,
        boardId: boardId.value,
        pBoardId: pBoardId.value,
        pageNo
    })
}
onBeforeMount(() => {
    loadArticle()
})

// 监听路由变化
watch(() => route.params, (newVal, oldVal) => {
    // 注意：这里拿到的id是字符串类型，需要转换为数字类型
    const newPBoardId = parseInt(newVal.pBoardId) || 0
    const newBoardId = parseInt(newVal.boardId) || 0
    if (newPBoardId !== pBoardId.value || newBoardId !== boardId.value) {
        pBoardId.value = newPBoardId
        boardId.value = newBoardId
        setSubBoardList()
        loadArticle()
    }
    // pinia中暴露的ref对象，不需要再使用.value
    boardListStore.pBoardId = pBoardId.value
    boardListStore.boardId = boardId.value
}, { deep: true })

const subBoardList = ref([])
const setSubBoardList = () => {
    subBoardList.value = boardListStore.getSubBoardList(pBoardId.value)
}
</script>

<style lang="scss" scoped>
.article-list-body{
    border-radius: 8px;
    overflow: hidden;
    .article-panel{
        background-color: white;
        border-radius: 12px;
        .top-tab{
            display: flex;
            align-items: center;
            margin: 0 18px;
            padding: 10px 20px;
            font-size: 16px;
            border-bottom: 1px solid #ddd;
            .tab{
                cursor: pointer;
                padding: 0 6px;
                &:hover{
                    color: var(--link);
                }
            }
            .active{
                color: var(--link);
            }
        }
    }
    .sub-board{
        padding: 0 0 10px;
        .board-item{
            display: inline-block;
            background-color: #fff;
            border-radius: 15px;
            margin-right: 10px;
            cursor: pointer;
            &:hover{
                background-color: var(--link);
                a{
                    color: white;
                }
            }
            a{
                display: inline;
                padding: 3px 12px;
                text-decoration: none;
                color: #909090;
            }
        }
        .active{
            background-color: var(--link);
            color: white;
            a{
                color: white;
            }
        }
    }
}
</style>
