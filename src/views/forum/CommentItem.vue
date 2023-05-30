<template>
    <div class="comment-item">
        <AvatarModule :userId="commentData.userId" :width="50"></AvatarModule>
        <div class="comment-info">
            <div class="nick-name">
                <span class="name" @click="gotoUcenter(commentData.userId)">{{ commentData.nickName }}</span>
                <span v-if="authorId === commentData.userId" class="tag-author">作者</span>
            </div>
            <div class="comment-content">
                <div class="comment-text">
                    <span v-if="commentData.topType === 1" class="tag tag-top">置顶</span>
                    <span v-if="commentData.status ==0" class="tag no-audit"> 待审核 </span>
                    <span v-html="commentData.content"></span>
                </div>
                <!-- 将 . 替换为 _. 获取缩略图 -->
                <!-- imgList传递原图，点开查看才加载 -->
                <CommentImage v-if="commentData.imgPath"
                :src="proxy.globalInfo.imageUrl + commentData.imgPath.replace('.','_.')"
                :imgList="[proxy.globalInfo.imageUrl + commentData.imgPath]"></CommentImage>
            </div>
            <div class="op-panel">
                <div class="time">{{ commentData.postTime }}</div>
                <div :class="['like',commentData.likeType==1?'liked':'']" @click="doLike(commentData)">
                    <el-icon><Star /></el-icon>{{ commentData.goodCount==0?'点赞':commentData.goodCount }}
                </div>
                <div class="reply" @click="showReply(commentData, 0)"><el-icon><ChatDotSquare /></el-icon>{{ commentData.children&&commentData.children.length>0?commentData.children.length:'评论' }}</div>
                <el-dropdown v-if="commentData.userId===currentUserId || currentUserId === authorId">
                    <el-icon><MoreFilled /></el-icon>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-if="currentUserId==authorId" @click="opTop">{{ commentData.topType==0?'设为置顶':'取消置顶' }}</el-dropdown-item>
                            <el-dropdown-item v-if="commentData.userId===currentUserId" @click="delComment(commentData, 0)">删除评论</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="comment-sub-list" v-if="commentData.children">
                <div class="comment-sub-item"
                v-for="item in commentData.children"
                :key="item.commentId">
                    <AvatarModule :userId="item.userId" :width="30"></AvatarModule>
                    <div class="comment-sub-info">
                        <div class="nick-name">
                            <span class="name" @click="gotoUcenter(item.userId)">{{ item.nickName }}</span>
                            <span v-if="authorId === item.userId" class="tag-author">作者</span>
                            <span>回复</span>
                            <span @click="gotoUcenter(item.replyUserId)" class="reply-name">@{{ item.replyNickName }}: </span>
                            <span class="sub-content" v-html="item.content"></span>
                        </div>
                        <div class="op-panel">
                        <div class="time">{{ item.postTime }}</div>
                        <div class="address">&nbsp;·&nbsp;{{ item.userIpAddress }}</div>
                        <div :class="['like',item.likeType==1?'liked':'']" @click="doLike(item)">
                            <el-icon><Star /></el-icon>
                            {{ item.goodCount==0?'点赞':item.goodCount }}
                        </div>
                        <div class="reply" @click="showReply(item, 1)"><el-icon><ChatDotSquare /></el-icon>回复</div>
                        <el-dropdown v-if="item.userId===currentUserId">
                        <el-icon><MoreFilled /></el-icon>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="delComment(item, 1)">删除评论</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        </div>
                    </div>
                </div>
            </div>
            <div class="reply-info" v-if="commentData.showReply">
                <CommentPost
                :articleId="articleId"
                :avatarWidth="50"
                :userId="currentUserId"
                :showInsertImg="false"
                :placeholder="placeholderInfo"
                :pCommentId="pCommentId"
                :replyUserId="replyUserId"
                @postCommentFinish="postCommentFinish">
                </CommentPost>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import CommentImage from '@/views/forum/CommentImage.vue'
import AvatarModule from '@/components/AvatarModule.vue'
import CommentPost from '@/views/forum/CommentPost.vue'
import { useRouter } from 'vue-router'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo'
const router = useRouter()
const loginUserInfoStore = useLoginUserInfoStore()
const { proxy } = getCurrentInstance()
const props = defineProps({
    articleId: {
        type: String
    },
    commentData: {
        type: Object,
        default: () => {}
    },
    authorId: {
        type: String,
        default: ''
    },
    currentUserId: {
        type: String
    }
})
const api = {
    doLike: '/comment/doLike',
    changeTopType: '/comment/changeTopType',
    delComment: '/comment/delComment'
}
const emits = defineEmits(['hiddenAllReply', 'replySecondaryFinished', 'hiddenReply', 'showReply', 'reloadComment', 'delComment'])
// 父评论统一为一级评论，子评论统一为二级评论
const pCommentId = ref(props.commentData.commentId)
const replyUserId = ref(0)
// 显示评论框
const placeholderInfo = ref(null)
const selectedCommentId = ref(0)
const showReply = (curData, isSub) => {
    if (!loginUserInfoStore.loginUserInfo) {
        loginUserInfoStore.showLogin = true
        return
    }

    // 两次点击同一个评论，隐藏评论框
    if (curData.commentId === selectedCommentId.value) {
        emits('hiddenReply', props.commentData.commentId)
        selectedCommentId.value = 0
        return
    }
    // 其余情况，显示评论框
    replyUserId.value = curData.userId
    emits('hiddenAllReply')
    if (isSub) {
        emits('showReply', props.commentData.commentId)
    } else {
        curData.showReply = true
    }
    placeholderInfo.value = '回复 @' + curData.nickName + ' :'
    selectedCommentId.value = curData.commentId
}
// 评论发布完成，更新数据
const postCommentFinish = (resultData) => {
    emits('replySecondaryFinished', resultData)
}
const gotoUcenter = (userId) => {
    console.log(userId)
    router.push('/user/' + userId)
}

const doLike = async (comment) => {
    const result = await proxy.Request({
        url: api.doLike,
        dataType: 'form',
        params: {
            commentId: comment.commentId
        },
        showLoading: false
    })
    if (!result) return
    if (comment.likeType === 1) {
        comment.likeType = 0
        comment.goodCount--
        return
    }
    comment.goodCount++
    comment.likeType = 1
}

// 评论置顶/取消置顶
const opTop = async () => {
    const result = await proxy.Request({
        url: api.changeTopType,
        dataType: 'form',
        params: {
            commentId: props.commentData.commentId,
            topType: props.commentData.topType === 1 ? 0 : 1
        },
        showLoading: false
    })
    if (!result) return
    emits('reloadComment')
}

// 删除评论
const delComment = async (comment, isSub) => {
    proxy.Confirm('确定删除该评论吗？', async () => {
        const result = await proxy.Request({
            url: api.delComment,
            showLoading: false,
            dataType: 'form',
            params: {
                commentId: comment.commentId
            }
        })
        if (!result) return
        emits('delComment', comment, isSub)
        proxy.Message.success('删除成功')
    })
}
</script>

<style lang="scss" scoped>
.liked{
    color: #6ca1f7;
}
.comment-item{
    display: flex;
    margin-bottom: 10px;
    padding-top: 15px;
    .comment-info{
        padding-bottom: 20px;
        margin-left: 15px;
        flex: 1;
        border-bottom: 1px solid #ddd;
        .nick-name{
            .name{
                font-size: 14px;
                color: var(--text2);
                margin-right: 5px;
                cursor: pointer;
            }
            .tag-author{
                font-size: 12px;
                border-radius: 3px;
                color: white;
                background-color: var(--pink);
            }
        }
        .comment-content{
            margin-top: 5px;
            .comment-text{
                margin: 5px;
                margin-bottom: 10px;
                .tag{
                    margin-right: 10px;
                    border-radius: 4px;
                    padding: 0px 2px;
                    font-size: 12px;
                }
                .tag-top{
                    color: var(--pink);
                    border: 1px solid var(--pink);
                }
                .no-audit{
                    color: gray;
                    border: 1px solid gray;
                }
            }
        }
        .op-panel{
            margin-top: 5px;
            display: flex;
            font-size: 14px;
            color: var(--text2);
            align-items: center;
            user-select: none;
            .el-icon {
                margin-right: 2px;
            }
            .like{
                margin-left: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
            }
            .reply{
                margin-left: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
            }
            .el-dropdown{
                margin-left: 15px;
                .el-icon{
                    transform: rotate(90deg);
                    &:focus{
                        outline: none;
                    }
                }
            }
        }
        .comment-sub-list{
            margin-top: 10px;
            .comment-sub-item{
                margin-top: 30px;
                display: flex;
                font-size: 14px;
                .comment-sub-info{
                    .nick-name{
                        margin: 0 10px;
                        .tag-author{
                            margin-right: 10px;
                        }
                        .reply-name{
                            cursor: pointer;
                            color: #6ca1f7;
                        }
                    }
                    .op-panel{
                        font-style: 12px;
                        margin-left: 10px;
                    }
                }
            }
        }
        .reply-info{
            margin-top: 10px;
        }
    }
}
</style>
