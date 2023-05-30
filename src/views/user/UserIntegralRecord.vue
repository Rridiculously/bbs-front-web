<template>
    <DialogModule
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="450px"
    :showCancel="false"
    @close="closePanel">
        <div class="container">
            <el-form
            :model="formData"
            :rules="rules"
            ref="formDataRef"
            label-width="40px">
                <el-form-item label="日期">
                    <el-date-picker
                    v-model="formData.createTimeRange"
                    type="daterange"
                    range-separator="~"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    @change="loadRecord"></el-date-picker>
                </el-form-item>
            </el-form>
            <div class="date-item">
                <div class="record-type">类型</div>
                <div class="integral">积分</div>
                <div class="create-time">日期</div>
            </div>
            <DataList
            :loading="loading"
            :dataSource="recordInfo"
            noDataMsg="暂无相关记录"
            @changePage="changePage"
            :loadingItemRows="1"
            :skeletonSize="5">
                <template #default="{ data }">
                    <div class="data-item">
                        <div class="record-type">{{ data.operTypeName }}</div>
                        <div :class="['integral', data.integral>0?'add':'reduce']">{{ data.integral }}</div>
                        <div class="create-time">{{ data.createTime }}</div>
                    </div>
                </template>
            </DataList>
        </div>
    </DialogModule>
</template>

<script setup>
import DialogModule from '@/components/DialogModule.vue'
import DataList from '@/components/DataList.vue'
import { ref, getCurrentInstance, reactive } from 'vue'
const api = {
    loadUserIntegralRecord: '/ucenter/loadUserIntegralRecord'
}
const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref(null)
const rules = {}
const loading = ref(false)
const closePanel = () => {
    formDataRef.value.resetFields()
    dialogConfig.show = false
}
const dialogConfig = reactive({
    show: false,
    title: '积分记录',
    buttons: [
        {
            text: '关闭',
            type: 'default',
            click: closePanel
        }
    ]
})
const showRecord = () => {
    dialogConfig.show = true
    loadRecord()
}
// 将展示积分框的方法暴露出去
defineExpose({
    showRecord
})

const recordInfo = ref({})
const loadRecord = async (userInfo) => {
    loading.value = true
    const params = {
        pageNo: recordInfo.value.pageNo ? recordInfo.value.pageNo : 1
    }
    if (formData.value.createTimeRange) {
        params.createTimeStart = formData.value.createTimeRange[0]
        params.createTimeEnd = formData.value.createTimeRange[1]
    }
    const result = await proxy.Request({
        url: api.loadUserIntegralRecord,
        params,
        dataType: 'form',
        showLoading: false
    })
    loading.value = false
    if (!result) return
    recordInfo.value = result.data
}
const changePage = (pageNo) => {
    recordInfo.value.pageNo = pageNo
    loadRecord()
}
</script>

<style lang="scss" scoped>
.container{
    padding: 10px 5px;
    .date-item{
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        margin: 20px 0px;
    }
    .data-item{
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        border-radius: 8px;
        margin: 10px 0;
        padding: 8px 10px;
        box-shadow: 0 0 4px rgba(194, 194, 194, 0.288);
        transition: all 0.2s;
        &:hover{
            background-color: #ececec;
        }
        .record-type{
            width: 130px;
        }
        .add{
            color: rgb(255, 102, 102);
        }
        .reduce{
            color: rgb(90, 196, 90);
        }
    }
}
</style>
