<template>
    <div class="container-body article-detail-body"
    :style="{width:proxy.globalInfo.bodyWidth+'px'}">
        <div class="board-info">
            <router-link :to="'/'">首页</router-link>
            <el-icon ><ArrowRight /></el-icon>
            <router-link :to="'/forum/'+articleInfo.pBoardId">{{ articleInfo.pBoardName }}</router-link>
            <el-icon v-if="articleInfo.boardId" ><ArrowRight /></el-icon>
            <router-link v-if="articleInfo.boardId" :to="'/forum/'+articleInfo.pBoardId+'/'+articleInfo.boardId">{{ articleInfo.boardName }}</router-link>
            <el-icon ><ArrowRight /></el-icon>
            <span>{{ articleInfo.title }}</span>
        </div>
        <!-- 文章详情 -->
        <div class="detail-container" :style="{width:proxy.globalInfo.bodyWidth-300+'px'}">
            <!-- 文章内容 -->
            <div class="article-detail">
                <div class="title">{{ articleInfo.title }}
                    <el-tag v-if="!articleInfo.status" type="info">待审核</el-tag>
                </div>
                <div class="user-info">
                    <AvatarModule :userId="articleInfo.userId" :width="46"></AvatarModule>
                    <div class="user-info-detail">
                        <router-link class="nick-name" :to="'/user/'+articleInfo.userId">{{ articleInfo.nickName }}</router-link>
                        <div class="time-info">
                            <span>{{ articleInfo.postTime }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>{{ articleInfo.userIpAddress }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <el-icon :class="[liked?'liked':'']" @click="doLikeHandler"><Star /></el-icon>
                            <span>{{ articleInfo.goodCount === 0 ? '点赞' : articleInfo.goodCount }}</span>
                            <el-icon @click="goPosition('view-comment')"><ChatDotSquare /></el-icon>
                            <span>{{ articleInfo.commentCount }}</span>
                            <el-icon><View /></el-icon>
                            <span>{{ articleInfo.readCount }}</span>
                            <template
                            v-if="loginUserInfoStore.loginUserInfo&&loginUserInfoStore.loginUserInfo.userId==articleInfo.userId">
                                <span class="edit" @click="goEdit"><el-icon><EditPen /></el-icon>编辑</span>
                                <el-dropdown >
                                <el-icon class="more"><MoreFilled /></el-icon>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="deleteArticle(articleInfo.articleId)">删除文章</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                                </el-dropdown>
                            </template>
                        </div>
                    </div>
                </div>
                <div id="detail" v-html="articleInfo.content"></div>
            </div>
            <!-- 附件 -->
            <!-- id作为点击转跳的锚点 -->
            <div class="attachment-panel" v-if="attachment"
                id="view-attachment">
                <div class="title">附件</div>
                <div class="attachment-info">
                    <div class="file-name item" @click="downloadAttachment(attachment.fileId)"><el-icon><FolderOpened /></el-icon>{{ attachment.fileName }}</div>
                    <div class="size item">{{ proxy.Utils.sizeToStr(attachment.fileSize) }}</div>
                    <div class="item">需要<span class="integral">{{ attachment.integral }}</span>积分</div>
                    <div class="download-count item">已下载{{ attachment.downloadCount }}次</div>
                    <div class="download-btn item">
                        <el-button type="primary" size="small" @click="downloadAttachment(attachment.fileId)">下载</el-button>
                    </div>
                </div>
            </div>
            <!-- 评论 -->
            <div class="comment-panel" id="view-comment" v-if="articleInfo.status">
                <CommentList
                v-if="articleInfo.articleId"
                :articleId="articleInfo.articleId"
                :authorId="articleInfo.userId"
                @updateCommentCount="updateCommentCount"></CommentList>
            </div>
            <!-- 左侧快捷操作 -->
            <div class="quick-panel" :style="{left: quickPanelLeft+'px'}">
                <el-badge :value="articleInfo.goodCount" type="info" :hidden="articleInfo.goodCount==0">
                    <div class="quick-item" @click="doLikeHandler">
                        <el-icon v-if="likeLoading" class="is-loading"><Loading /></el-icon>
                        <el-icon v-else :class="[liked?'liked':'']"><StarFilled /></el-icon>
                    </div>
                </el-badge>
                <el-badge :value="articleInfo.commentCount" type="info" :hidden="articleInfo.commentCount==0">
                    <div class="quick-item" @click="goPosition('view-comment')">
                            <el-icon><Comment /></el-icon>
                    </div>
                </el-badge>
                <!-- 附件 -->
                <div v-if="attachment" class="quick-item" @click="goPosition('view-attachment')">
                    <el-icon><Management /></el-icon>
                </div>
            </div>
            <!-- 目录 -->
            <div class="toc-panel">
                <div class="top-container">
                    <div class="toc-title">
                        目录
                    </div>
                    <div class="toc-list">
                        <template v-if="tocArray.length == 0">
                            <div class="no-toc">未解析到目录</div>
                        </template>
                        <template v-else>
                            <div v-for="(toc,index) in tocArray"
                            :key="index"
                            :class="['toc-item', toc.id==anchorId?'active':'']"
                            @click="gotoAnchor(toc)">
                                <span
                                :style="{'padding-left': toc.level*15+'px'}">{{ toc.title }}</span>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <ImageViewer ref="imagePreviewRef" :imagesList="previewImgList"></ImageViewer>
    </div>
</template>

<script setup>
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { ref, getCurrentInstance, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo.js'
import { useBoardListStore } from '@/stores/boardList.js'
import { useDeleteArticleBusStore } from '@/stores/articleBus.js'
import AvatarModule from '@/components/AvatarModule.vue'
import ImageViewer from '@/components/ImageViewer.vue'
import CommentList from './CommentList.vue'
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const loginUserInfoStore = useLoginUserInfoStore()
const deleteBus = useDeleteArticleBusStore()
const boardListStore = useBoardListStore()
const api = {
    getArticleDetail: '/forum/getArticleDetail',
    doLike: '/forum/doLike',
    getUserDownloadInfo: '/forum/getUserDownloadInfo',
    attachmentDownload: '/api/forum/attachmentDownload',
    deleteArticle: '/forum/deleteArticle'
}
const articleInfo = ref({})
const attachment = ref({})
// 标注是否点赞
const likeLoading = ref(false)
const liked = ref(false)
const getArticleDetail = async (articleId) => {
    const result = await proxy.Request({
        url: api.getArticleDetail,
        dataType: 'form',
        params: {
            articleId
        }
    })
    if (!result) return
    articleInfo.value = result.data.forumArticle
    liked.value = result.data.haveLike
    boardListStore.pBoardId = result.data.forumArticle.pBoardId
    boardListStore.boardId = result.data.forumArticle.boardId
    attachment.value = result.data.attachment
    setImagePreview()
    highlightCode()
    generateToc()
}
getArticleDetail(route.params.articleId)
// 点赞逻辑
const doLikeHandler = async () => {
    if (!articleInfo.value.status) {
        // 未审核的帖子不能点赞
        proxy.Message.warning('未审核通过，再等等吧＞︿＜')
        return
    }
    // 没有登录，先登录
    if (!loginUserInfoStore.loginUserInfo) {
        proxy.Message.error('请先登录')
        loginUserInfoStore.showLogin = true
        return
    }
    likeLoading.value = true
    const result = await proxy.Request({
        url: api.doLike,
        dataType: 'form',
        showLoading: false,
        params: {
            articleId: articleInfo.value.articleId
        }
    })
    likeLoading.value = false
    if (!result) return
    // 这里因为后端接口没有返回点赞数，所以只能前端自己计算
    liked.value = !liked.value
    if (liked.value) {
        articleInfo.value.goodCount++
    } else {
        articleInfo.value.goodCount--
    }
}

// 计算快捷操作定位
const quickPanelLeft = ref((window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 100)
const reCalcQuickPanelLeft = () => {
    quickPanelLeft.value = (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 100
}
window.addEventListener('resize', reCalcQuickPanelLeft)

const goPosition = (domId) => {
    // 自动滚动到Id为domId的元素
    const dom = document.getElementById(domId)
    window.scroll({
        top: dom.offsetTop,
        behavior: 'smooth'
    })
}

const downloadAttachment = async (fileId) => {
    // 下载附件
    if (!loginUserInfoStore.loginUserInfo) {
        proxy.Message.error('请先登录')
        loginUserInfoStore.showLogin = true
        return
    }
    const downloadInfo = await proxy.Request({
        url: api.getUserDownloadInfo,
        dataType: 'form',
        params: {
            fileId
        }
    })
    if (!downloadInfo) return
    if (downloadInfo.data.haveDownload || loginUserInfoStore.loginUserInfo.userId === articleInfo.value.userId || attachment.value.integral === 0) {
        // 已经下载过了，或者为作者本人，需要0积分,直接下载
        // 下载
        // document.location.href = api.attachmentDownload + '?fileId=' + fileId
        // 另一种方式，新开窗口下载
        window.open(api.attachmentDownload + '?fileId=' + fileId)
        // fetch方式下载
        // fetch(api.attachmentDownload + '?fileId=' + fileId)
        attachment.value.downloadCount++
    } else {
        // 没有下载过，先扣积分
        if (downloadInfo.data.userIntegral < attachment.value.integral) {
            proxy.Message.warning('你的积分不足')
            return
        }
        proxy.Confirm(`你还有${downloadInfo.data.userIntegral}积分，当前下载会扣除${attachment.value.integral}，确定下载吗？`,
            () => {
                // 确认的回调函数
                document.location.href = api.attachmentDownload + '?fileId=' + fileId
                attachment.value.downloadCount++
            })
    }
}
const imagePreviewRef = ref(null)
const previewImgList = ref([])
// 拿到数据后，设置图片预览
const setImagePreview = () => {
    // 图片预览
    nextTick(() => {
        const imgNodeList = document.querySelectorAll('#detail img')
        const imgList = []
        imgNodeList.forEach((item, index) => {
            item.addEventListener('click', () => {
                imagePreviewRef.value.show(index)
            })
            imgList.push(item.src)
        })
        previewImgList.value = imgList
    })
}
// 代码高亮
const highlightCode = () => {
    // nextTick保证dom已经渲染完毕,否则拿不到dom
    nextTick(() => {
        const blocks = document.querySelectorAll('pre code')
        blocks.forEach((block) => {
            hljs.highlightElement(block)
        })
    })
}

const updateCommentCount = (count) => {
    // 更新评论数
    articleInfo.value.commentCount = count
}

const goEdit = () => {
    // 去编辑
    router.push({
        path: '/editPost/' + articleInfo.value.articleId
    })
}
// 获取目录
const tocArray = ref([])
const generateToc = () => {
    nextTick(() => {
        const tocTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        const contentDom = document.querySelector('#detail')
        const children = contentDom.children
        for (let i = 0; i < children.length; i++) {
            const item = children[i]
            if (tocTags.includes(item.tagName.toLowerCase())) {
                item.id = 'toc-' + i
                tocArray.value.push({
                    id: item.id,
                    title: item.innerText,
                    level: Number.parseInt(item.tagName.toLowerCase().substring(1)),
                    offsetTop: item.offsetTop + 200
                })
            }
        }
        // 更新页面后立即更新目录
        nextTick(() => {
            scrollListener()
        })
    })
}
const anchorId = ref('')
const gotoAnchor = (item) => {
    anchorId.value = item.id
    // 滚动到指定位置
    document.documentElement.scrollTop = item.offsetTop
}

// 滚动监听定位目录
const scrollListener = () => {
    const scrollTop = document.documentElement.scrollTop
    tocArray.value.find((item, index) => {
        if (scrollTop <= item.offsetTop) {
            anchorId.value = item.id
            return true
        }
        return false
    })
}
onMounted(() => {
    window.addEventListener('scroll', scrollListener)
})
onBeforeUnmount(() => {
    window.removeEventListener('scroll', scrollListener)
})

const deleteArticle = (articleId) => {
    // 删除文章
    proxy.Confirm('确定删除吗？', async () => {
        const res = await proxy.Request({
            url: api.deleteArticle,
            dataType: 'form',
            params: {
                articleId
            }
        })
        if (res) {
            proxy.Message.success('删除成功')
            // 发送消息，让首页刷新
            deleteBus.deleteArticle = true
            router.push({
                path: '/'
            })
        }
    })
}
</script>

<style lang="scss" scoped>
.scroller{
    scroll-behavior: smooth;
}
.article-detail-body{
    .board-info{
        display: flex;
        align-items: center;
        font-size: 16px;
        a{
            color: var(--color-text);
            text-decoration: none;
            &:hover{
                color: var(--link);
            }
        }
        .el-icon{
            font-size: 16px;
            margin: 0 6px;
        }
    }
    .detail-container{
        margin-top: 10px;
        position: relative;
        .article-detail{
            background-color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 15px rgba(0,0,0,0.1);
            .title{
                display: flex;
                align-items: center;
                font-size: 34px;
                font-weight: bold;
                .el-tag{
                    margin-left: 14px;
                    cursor: pointer;
                }
            }
            .user-info{
                margin-top: 20px;
                display: flex;
                align-items: center;
                padding-bottom: 30px;
                border-bottom: 1px solid #cfcfcf;
                margin-bottom: 20px;
                .user-info-detail{
                    margin-left: 14px;
                    .nick-name{
                        text-decoration: none;
                        color: #4e5956;
                        &:hover{
                            color: var(--link);
                        }
                    }
                    .liked{
                        color: #6ca1f7;
                    }
                    .time-info{
                        display: flex;
                        align-items: center;
                        user-select: none;
                        .el-icon{
                            cursor: pointer;
                            margin-left: 10px;
                            margin-right:3px;
                        }
                        .edit{
                            display: flex;
                            align-items: center;
                            &:hover{
                                color: var(--link);
                                text-decoration: underline;
                                cursor: pointer;
                            }
                        }
                        .more{
                            transform: rotate(90deg);
                            &:focus{
                                outline: none;
                            }
                        }
                    }
                }
            }
            #detail{
                // 深度选择器，对scoped样式生效
                &:deep(img){
                    max-width: 100%;
                    cursor: pointer;
                }
            }
        }
        .attachment-panel{
            background-color: white;
            margin-top: 20px;
            padding: 20px;
            color: gray;
            border-radius: 8px;
            box-shadow: 0px 0px 15px rgba(0,0,0,0.1);
            .title{
                font-size: 18px;
            }
            .attachment-info{
                display: flex;
                align-items: center;
                font-size: 16px;
                .item{
                    margin-right: 20px;
                }
                .el-icon{
                    font-size: 20px;
                    margin-right: 6px;
                }
                .file-name{
                    cursor: pointer;
                    color: #6ca1f7;
                    display: flex;
                    align-items: center;
                }
                .integral{
                    color: rgb(255, 71, 71);
                    padding: 0 3px;
                }
            }
        }
        .comment-panel{
            border-radius: 8px;
            margin-top: 20px;
            box-shadow: 0px 0px 15px rgba(0,0,0,0.1);
            padding: 20px;
            background-color: #fff;
        }
        .quick-panel{
            position: fixed;
            top: 200px;
            .el-badge{
                display: block;
                user-select: none;
            }
            .liked{
                color: #6ca1f7;
            }
            .quick-item{
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #fff;
                border-radius: 50%;
                margin-bottom: 30px;
                box-shadow: 2px 2px 5px rgba(0,0,0,0.08);
                cursor: pointer;
                .el-icon{
                        font-size: 30px;
                }
            }
        }
        // 利用父元素绝对定位，来确定子元素的位置，再利用子元素的fixed定位，来实现滚动时，子元素固定不动
        .toc-panel{
            position: absolute;
            right: -15px;
            top: 0px;
            // height: 400px;
            // width: 250px;
            .top-container{
                position: fixed;
                background-color: white;
                width: 285px;
                border-radius: 8px;
                box-shadow: 0 0 12px rgba(0,0,0,0.1);
            }
            .toc-title{
                border-bottom: 1px solid #ddd;
                padding: 12px 15px;
            }
            .toc-list{
                max-height: calc(100vh - 300px);
                overflow: auto;
                .no-toc{
                    text-align: center;
                    color: #5f5d5d;
                    line-height: 80px;
                    font-size: 14px;
                }
                .toc-item{
                    padding-right: 10px;
                    cursor: pointer;
                    line-height: 40px;
                    overflow: hidden;
                    white-space: nowrap;
                    color: #555666;
                    font-size: 14px;
                    border-left: 2px solid #fff;
                    transition: all 0.2s;
                    &:hover{
                        background-color: #f5f5f5;
                        border-left: 2px solid #6ca1f7;
                    }
                }
                .active{
                    border-left: 2px solid #6ca1f7;
                    transition: all 0.2s;
                }
            }
        }
    }

}

</style>
