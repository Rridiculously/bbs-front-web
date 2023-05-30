<template>
    <div class="article-item">
        <div class="article-item-inner">
            <div class="article-body">
                <div class="user-info">
                    <AvatarModule class="avatar" :userId = props.data.userId :width="30"></AvatarModule>
                    <router-link :to="'/user/' + data.userId" class="a-link">{{ data.nickName }}</router-link>
                    <el-divider direction="vertical"></el-divider>
                    <div class="post-time">{{ data.postTime }}</div>
                    <!-- <div class="address">&nbsp;·&nbsp;{{ data.userIpAddress }}</div> -->
                    <el-divider direction="vertical"></el-divider>
                    <router-link :to="'/forum/'+data.pBoardId" class="a-link">{{ data.pBoardName }}</router-link>
                    <template v-if="data.boardId">
                        &nbsp;/&nbsp;
                        <router-link :to="'/forum/'+data.pBoardId+'/'+data.boardId" class="a-link">{{ data.boardName }}</router-link>
                    </template>
                    <div class="edit" @click="goEdit(data.articleId)" v-show="showEdit"><el-icon><EditPen /></el-icon>编辑</div>
                </div>
                <div class="title-info" @click="goArticle">
                    <span v-show="data.topType==1" class="top">置顶</span>
                    <span v-show="data.status==0" class="no-audit">待审核</span>
                    <span class="title" v-html="data.title"></span>
                    <div class="summary">{{ data.summary }}</div>
                </div>
                <div class="article-info">
                    <el-icon><View /></el-icon>
                    <span>{{ data.readCount }}</span>
                    <!-- 没找到点赞图标，用星星凑合 -->
                    <el-icon><Star /></el-icon>
                    <span>{{ data.goodCount === 0 ? '点赞' : data.goodCount }}</span>
                    <el-icon><ChatDotSquare /></el-icon>
                    <span>{{ data.commentCount }}</span>
                </div>
            </div>
            <div class="cover" v-show="data.cover">
                <CoverModule :cover="data.cover" :width="120"></CoverModule>
            </div>
        </div>
    </div>
</template>

<script setup>
import AvatarModule from '@/components/AvatarModule.vue'
import CoverModule from '@/components/CoverModule.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, computed } from 'vue'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo'
const router = useRouter()
const route = useRoute()
const loginUserInfoStore = useLoginUserInfoStore()
// defineProps 中定义的属性，可以在模板中直接使用
const props = defineProps({
    data: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const goArticle = () => {
    router.push('/post/' + props.data.articleId)
}
// computed返回ref
const loginUserInfo = computed(() => {
    return loginUserInfoStore.loginUserInfo
})
const showEdit = ref(false)
const changeEditType = () => {
    if (route.path.indexOf('/user/') === 0 &&
        loginUserInfo.value &&
        loginUserInfo.value.userId === route.params.userId &&
        props.data.userId === loginUserInfo.value.userId) {
        showEdit.value = true
    } else {
        showEdit.value = false
    }
}
watch(() => props.data, changeEditType, { immediate: true })
watch(() => loginUserInfo.value, changeEditType, { immediate: true })

const goEdit = (articleId) => {
    router.push('/editPost/' + articleId)
}
</script>

<style lang="scss" scoped>
.article-item {
    &:hover{
        background-color: #f2fffc8c;
    }
    padding: 5px 18px 0;
    .article-item-inner {
       padding: 10px;
       display: flex;
        border-bottom: 1px solid #ddd;
        .article-body {
            flex: 1;
            .user-info {
                font-size: 16px;
                display: flex;
                align-items: center;
                .avatar{
                    margin-right: 14px;
                }
                .edit{
                    display: flex;
                    align-items: center;
                    color: var(--link);
                    margin-left: 16px;
                    font-size: 14px;
                    cursor: pointer;
                    &:hover{
                        text-decoration: underline;
                    }
                }
            }
            .a-link{
                text-decoration: none;
                color: #000000;
                font-weight: 540;
                &:hover{
                    color: var(--link);
                }
            }
            .title-info{
                display: block;
                margin: 16px 0;
                cursor: pointer;
                text-decoration: none;
                .top{
                    border-radius: 4px;
                    border: 1px solid #f56c6c;
                    color: #f56c6c;
                    font-size: 12px;
                    padding: 1px 2px;
                    font-weight: normal;
                }
                .no-audit{
                    border-radius: 4px;
                    border: 1px solid #858585;
                    color: #858585;
                    font-size: 12px;
                    padding: 1px 2px;
                    font-weight: normal;
                }
                .title{
                    font-size: 18px;
                    color: black;
                    font-weight: 560;
                }
            }
            .summary{
                margin-top: 10px;
                margin-bottom: 10px;
                font-size: 16px;
            }
            span{
                margin-right: 10px;
            }
            .article-info{
                display: flex;
                align-items: center;
                .el-icon{
                    margin-right: 4px;
                }
                span{
                    display: block;
                    margin-right: 20px;
                }
            }
        }
    }
}

</style>
