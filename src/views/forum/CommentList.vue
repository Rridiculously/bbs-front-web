<template>
    <div class="comment-body">
        <div class="comment-title">
            <div class="title">评论<span class="count">{{ commentList.totalCount }}</span></div>
            <div class="tab">
                <span :class="[orderType==0?'active':'']" @click="changeOrderType(0)">热榜</span>
                <el-divider direction="vertical"></el-divider>
                <span :class="[orderType==1?'active':'']" @click="changeOrderType(1)">最新</span>
            </div>
        </div>
        <!-- 发评论 -->
        <div class="comment-form-panel">
            <CommentPost
            :articleId="props.articleId"
            :avatarWidth="60"
            :pCommentId="0"
            :userId="loginUserInfo.userId"
            :showInsertImg="true"
            @postCommentFinish="postCommentFinish"></CommentPost>
        </div>
        <div class="comment-list">
            <DataList :dataSource="commentList" :loading="loading" :skeletonSize="commentList.list?commentList.list.length:1">
                <template #default="{data}">
                    <CommentItem
                    :articleId="articleId"
                    :commentData="data"
                    :authorId="authorId"
                    :currentUserId="loginUserInfo.userId"
                    @hiddenAllReply="hiddenAllReply"
                    @hiddenReply="hiddenReply"
                    @showReply="showReply"
                    @replySecondaryFinished="replySecondaryFinished"
                    @reloadComment="loadComment"
                    @delComment="delComment"></CommentItem>
                </template>
            </DataList>
        </div>
    </div>
</template>

<script setup>
import CommentPost from '@/views/forum/CommentPost.vue'
import DataList from '@/components/DataList.vue'
import CommentItem from '@/views/forum/CommentItem.vue'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo'
import { getCurrentInstance, ref, watch } from 'vue'
const { proxy } = getCurrentInstance()
const loginUserInfoStore = useLoginUserInfoStore()
const loginUserInfo = ref(loginUserInfoStore.loginUserInfo || {})
watch(loginUserInfoStore, (val) => {
    console.log(val)
    if (!val) {
        loginUserInfo.value = {}
    } else {
        loginUserInfo.value = val.loginUserInfo
    }
})
const api = {
    loadComment: '/comment/loadComment',
    postComment: '/comment/postComment',
    doLike: '/comment/doLike',
    changeTopType: '/comment/changeTopType'
}
const props = defineProps({
    articleId: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    }
})
const emits = defineEmits(['updateCommentCount'])
// 获取评论
const commentList = ref({})
const orderType = ref(0)
const loading = ref(false)
const loadComment = async () => {
    const params = {
        pageNo: 1,
        pageSize: 10,
        articleId: props.articleId,
        orderType: orderType.value
    }
    loading.value = true
    const result = await proxy.Request({
        url: api.loadComment,
        dataType: 'form',
        params,
        showLoading: false
    })
    loading.value = false
    if (!result) return
    commentList.value = result.data
}
loadComment()
// 隐藏所有回复框
const hiddenAllReply = () => {
    commentList.value.list.forEach(item => {
        item.showReply = false
    })
}
// 隐藏某个回复框
const hiddenReply = (commentId) => {
    commentList.value.list.forEach(item => {
        if (item.commentId === commentId) {
            item.showReply = false
        }
    })
}
const showReply = (commentId) => {
    commentList.value.list.forEach(item => {
        if (item.commentId === commentId) {
            item.showReply = true
        }
    })
}
// 评论发布完成，更新数据
const postCommentFinish = (resultData) => {
    // 找到第一个非置顶的评论,将新发布的评论插入到这个评论的前面
    const idx = commentList.value.list.findIndex((item, index) => {
        return item.topType === 0
    })
    commentList.value.list.splice(idx, 0, resultData)
    commentList.value.totalCount++
    emits('updateCommentCount', commentList.value.totalCount)
}
// 二级评论发布完成，更新数据
const replySecondaryFinished = (resultData) => {
    commentList.value.list.forEach((item, index) => {
        if (item.commentId === resultData[0].pCommentId) {
            console.log(resultData[0])
            item.children = resultData
            item.showReply = false
        }
    })
}

// 切换排序
const changeOrderType = (type) => {
    orderType.value = type
    loadComment()
}

const delComment = (comment, isSub) => {
    if (isSub) {
        commentList.value.list.forEach(item => {
            if (item.commentId === comment.pCommentId) {
                item.children.forEach((subItem, index) => {
                    if (subItem.commentId === comment.commentId) {
                        item.children.splice(index, 1)
                    }
                })
            }
        })
    } else {
        commentList.value.list.forEach((item, index) => {
            if (item.commentId === comment.commentId) {
                commentList.value.list.splice(index, 1)
                commentList.value.totalCount--
            }
        })
    }
}
</script>

<style lang="scss" scoped>
.comment-body{
    .comment-title{
        display: flex;
        align-items: center;
        .title{
            font-size: 20px;
        }
        .count{
            margin-left: 10px;
            margin-right: 26px;
            font-size: 14px;
        }
        .tab{
            user-select: none;
            span{
                cursor: pointer;
            }
            .active{
                color: #6ca1f7;
            }
        }
    }
    .comment-form-panel{
        margin-top: 26px;
        margin-bottom: 35px;
    }
}
</style>
