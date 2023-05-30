<template>
    <div class="container-body ucenter"
    :style="{'width': proxy.globalInfo.bodyWidth + 'px'}">
        <div class="user-banner">
            <router-link :to="'/'">首页</router-link>
            <el-icon ><ArrowRight /></el-icon>
            <span>个人中心</span>
        </div>
        <div class="ucenter-panel">
            <div class="user-side">
                <div class="avatar-panel">
                    <div class="avatar-bg">
                        <span class="edit"
                        v-if="loginUserInfo&&loginUserInfo.userId==userInfo.userId"
                        @click="editUserInfo"><el-icon><Edit /></el-icon>修改资料</span>
                    </div>
                    <div class="avatar-info" :style="{'background-color': bgColor}">
                            <AvatarModule
                            class="avatar"
                            :userId="userInfo.userId"
                            :width="65"
                            :addLink="false"></AvatarModule>
                        <div class="info">
                            <div class="name">{{ userInfo.nickName }}
                                <span>
                                    <el-icon v-if="userInfo.sex===0" style="color:pink"><Female /></el-icon>
                                    <el-icon v-if="userInfo.sex===1" style="color:#afb1ff"><Male /></el-icon>
                                </span></div>
                                <!-- 只有当查看的是自己的主页，并且自己没有设置描述，才会触发编辑个性签名 -->
                            <div class="desc" v-if="userInfo.personDescription||!loginUserInfo||loginUserInfo.userId!==userInfo.userId">{{ userInfo.personDescription }}</div>
                            <div v-else @click="editUserInfo" class="edit-desc">编辑个性签名</div>
                        </div>
                    </div>
                </div>
                <div class="user-extend-panel">
                    <div class="info-item" style="cursor:pointer" @click="showUserIntegralRecord">
                        <div class="label"><el-icon><Coin /></el-icon>积分</div>
                        <div class="value">{{ userInfo.currentIntegral }}</div>
                    </div>
                    <div class="info-item">
                        <div class="label"><el-icon><Star /></el-icon>获赞</div>
                        <div class="value">{{ userInfo.likeCount }}</div>
                    </div>
                    <div class="info-item">
                        <div class="label"><el-icon><Edit /></el-icon>发帖</div>
                        <div class="value">{{ userInfo.postCount }}</div>
                    </div>
                    <div class="info-item">
                        <div class="label"><el-icon><CollectionTag /></el-icon>加入</div>
                        <div class="value">{{ userInfo.joinTime }}</div>
                    </div>
                    <div class="info-item">
                        <div class="label"><el-icon><Calendar /></el-icon>最后登录</div>
                        <div class="value">{{ userInfo.lastLoginTime }}</div>
                    </div>
                </div>
            </div>
            <div class="article-panel">
                <el-tabs :model-value="activeTabName" @tab-change="changeTab">
                    <el-tab-pane label="发 帖" :name="0"></el-tab-pane>
                    <el-tab-pane label="评 论" :name="1"></el-tab-pane>
                    <el-tab-pane label="点 赞" :name="2"></el-tab-pane>
                </el-tabs>
                <div class="article-list">
                    <DataList
                    :dataSource="articleListInfo"
                    :loading="loading" :noDataMsg="'暂无相关文章'"
                    @changePage="changePage">
                        <template #default="{data}">
                            <ArticleListItem :data="data"></ArticleListItem>
                        </template>
                    </DataList>
                </div>
            </div>
        </div>
        <UserinfoEditor ref="userinfoEditorRef" @updateUserInfo="getUserInfo"></UserinfoEditor>
        <UserIntegralRecord ref="userIntegralRef"></UserIntegralRecord>
    </div>
</template>

<script setup>
import AvatarModule from '@/components/AvatarModule.vue'
import DataList from '@/components/DataList.vue'
import UserinfoEditor from '@/views/user//UserinfoEditor.vue'
import ArticleListItem from '@/views/forum/ArticleListItem.vue'
import UserIntegralRecord from '@/views/user/UserIntegralRecord.vue'
import { getCurrentInstance, ref, onBeforeMount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const loginUserInfoStore = useLoginUserInfoStore()
const api = {
    getUserInfo: '/ucenter/getUserInfo',
    loadUserArticle: '/ucenter/loadUserArticle'
}
const userInfo = ref({})
const getUserInfo = async (userId) => {
    const result = await proxy.Request({
        url: api.getUserInfo,
        dataType: 'form',
        params: {
            userId
        },
        errorCallbac: () => {
            router.push('/')
        }
    })
    if (!result) return
    userInfo.value = result.data
    getMainColor()
}
// 使用计算属性代替watch监听
const loginUserInfo = computed(() => loginUserInfoStore.loginUserInfo)
onBeforeMount(() => {
    const userId = route.params.userId
    if (userId) {
        getUserInfo(userId)
        loadArticleList(userId)
    }
})
watch(() => route.params.userId, (userId) => {
    if (userId && userId !== userInfo.value.userId) {
        getUserInfo(userId)
        loadArticleList(userId)
    }
})
// 计算头像背景颜色
const bgColor = ref('#bbb')
const getMainColor = () => {
    const img = new Image()
    img.src = proxy.globalInfo.avatarUrl + userInfo.value.userId + '?thumbnail=true'
    img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let r = 0; let g = 0; let b = 0
        // 每隔32位取一次像素点，计算平均值
        for (let i = 0; i < imageData.length; i += 32) {
            r += imageData[i]
            g += imageData[i + 1]
            b += imageData[i + 2]
        }
        r = Math.floor(r / (imageData.length / 24))
        g = Math.floor(g / (imageData.length / 24))
        b = Math.floor(b / (imageData.length / 24))
        // 将RGB颜色值转换为十六进制色值
        bgColor.value = '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0')
    }
}

// 加载文章列表
const activeTabName = ref(0)
const changeTab = (type) => {
    activeTabName.value = type
    loadArticleList(userInfo.value.userId)
}
const loading = ref(false)
const articleListInfo = ref({})
const loadArticleList = async (userId) => {
    loading.value = true
    const result = await proxy.Request({
        url: api.loadUserArticle,
        dataType: 'form',
        params: {
            userId,
            type: activeTabName.value,
            pageNo: articleListInfo.value.pageNo ? articleListInfo.value.pageNo : 1
        },
        showLoading: false
    })
    if (!result) return
    articleListInfo.value = result.data
    loading.value = false
}
const changePage = (pageNo) => {
    articleListInfo.value.pageNo = pageNo
    loadArticleList(userInfo.value.userId)
}

// 修改用户信息
const userinfoEditorRef = ref(null)
const editUserInfo = () => {
    userinfoEditorRef.value.showEditorUserInfoDialog(userInfo.value)
}

// 积分记录
const userIntegralRef = ref(null)
const showUserIntegralRecord = () => {
    if (!loginUserInfo.value || loginUserInfo.value.userId !== userInfo.value.userId) {
        return
    }
    userIntegralRef.value.showRecord()
}
</script>

<style lang="scss" scoped>
.container-body{
    .user-banner{
        display: flex;
        align-items: center;
        font-size: 16px;
        margin-bottom: 10px;
        a{
            color: var(--color-text);
            text-decoration: none;
            &:hover{
                color: var(--link);
            }
        }
        .el-icon{
            margin: 0 6px;
        }
        span{
            cursor: pointer;
            user-select: none;
        }
    }
    .ucenter-panel{
        display: flex;
        .user-side{
            // overflow: hidden;
            width: 330px;
            margin-right: 10px;
            .avatar-panel{
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0px 0px 10px #acacac;
                .avatar-bg{
                    background-image: url(https://pic2.imgdb.cn/item/63b19faa2bbf0e7994bb22fb.jpg);
                    background-size: cover;
                    height: 300px;
                    position: relative;
                    .edit{
                        position: absolute;
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        margin-top: 6px;
                        margin-left: 10px;
                        color: rgb(255, 255, 255);
                        text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.5);
                        &:hover{
                            text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.6);
                        }
                    }
                }
                .avatar-info{
                    display: flex;
                    align-items: center;
                    height: 160px;
                    background-color: #a08c8d;
                    padding: 20px;
                    .avatar{
                        flex-shrink: 0;
                        border-radius: 50%;
                        overflow: hidden;
                        border: 3px solid white;
                    }
                    .info{
                        margin-left: 20px;
                        margin-right: 20px;
                        .name{
                            display: flex;
                            align-items: center;
                            color: white;
                            font-size: 24px;
                            .el-icon{
                                margin-left: 10px;
                                padding-top: 20px;
                                font-weight: bold;
                            }
                        }
                        .desc{
                            max-width: 180px;
                            overflow: hidden;
                            color: white;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            font-size: 15px;
                        }
                        .edit-desc{
                            color: white;
                            cursor: pointer;
                            &:hover{
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }
            .user-extend-panel{
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0px 0px 10px #acacac;
                // height: 200px;
                margin-top: 20px;
                background-color: white;
                .info-item{
                    font-size: 16px;
                    color: #666;
                    transition: all 0.2s;
                    user-select: none;
                    .label{
                        display: flex;
                        align-items: center;
                        .el-icon{
                            margin-right: 4px;
                        }
                    }
                    &:hover{
                        background-color: #eee;
                    }
                    padding: 10px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
            }
        }
        .article-panel{
            border-radius: 8px;
            box-shadow: 0px 0px 12px #bdbdbd;
            flex: 1;
            padding: 20px;
            // height: 1000px;
            background-color: white;
            .el-tab-pane{
                letter-spacing: 5px;
            }
        }
    }
}
</style>
