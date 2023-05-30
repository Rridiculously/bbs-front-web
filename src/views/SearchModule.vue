<template>
    <div class="container-body search-body"
    :style="{'width':proxy.globalInfo.bodyWidth+'px' }">
        <div class="search-panel">
            <input  type="text" @keyup.enter="searchHandler" v-model="keyword"
            placeholder="请输入要搜索的关键词">
            <el-icon @click="searchHandler"><Search /></el-icon>
        </div>
        <div class="result-body">
            <DataList :dataSource="resultListInfo"
            :loading="loading"
            noDataMsg="暂无相关文章"
            v-if="resultListInfo">
                <template #default="{data}">
                    <ArticleListItem :data="data">
                    </ArticleListItem>
                </template>
            </DataList>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import DataList from '@/components/DataList.vue'
import ArticleListItem from '@/views/forum/ArticleListItem.vue'
const { proxy } = getCurrentInstance()
const keyword = ref('')
const resultListInfo = ref({
    list: []
})
const loading = ref(false)
const api = {
    search: '/forum/search'
}
const searchHandler = async () => {
    if (!keyword.value) {
        proxy.Message.warning('请输入关键字')
        return
    }
    loading.value = true
    const result = await proxy.Request({
        url: api.search,
        dataType: 'form',
        params: {
            keyword: keyword.value
        }
    })
    loading.value = false
    if (!result) return
    result.data.list.forEach(element => {
        const regex = new RegExp(keyword.value, 'i')
        element.title = element.title.replace(regex, '<span style="color: #ff9f9f">$&</span>')
    })
    resultListInfo.value = result.data
}
</script>

<style lang="scss" scoped>
.search-body{
    .search-panel{
        padding: 30px 20px;
        background-color: white;
        border-radius: 8px;
        position: relative;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        input{
            position: relative;
            width: 100%;
            height: 34px;
            font-size: 16px;
            border: 0;
            border-bottom: 1px solid #c0c0c0;
            transition: all 0.3s;
            outline: none;
            &:hover{
                border-bottom: 1px solid #ffcece;
            }
        }
        .el-icon{
            font-size: 18px;
            color: #666666;
            position: absolute;
            right: 24px;
            top: 40px;
            cursor: pointer;
        }
    }
    .result-body{
        margin-top: 40px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        min-height: 200px;
    }
}
</style>
