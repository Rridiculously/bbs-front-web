<template>
  <div>
    <transition
    enter-active-class="animate__animated animate__slideInDown"
    leave-active-class="animate__animated animate__slideOutUp">
    <div class="header"  v-show="showHeader">
        <div class="header-content" :style="{width: proxy.globalInfo.bodyWidth + 'px'}">
            <router-link to="/" class="logo">
                <span v-for="item in logoInfo" :key="item.letter" :style="{color: item.color}">{{ item.letter }}</span>
            </router-link>
            <!-- 板块信息 -->
            <div class="menu-panel">
                <span :class="['menu-item',activePboardId==0?'active':'']" @click="boardClickHnadler(null)">全部</span>
                <template v-for="board in boardList" :key="board.boardId">
                <el-popover
                    placement="bottom-start"
                    :width="200"
                    trigger="hover"
                    v-if="board.children&&board.children.length>0"
                >
                    <template #reference>
                        <span :class="['menu-item',activePboardId==board.boardId?'active':'']" @click="boardClickHnadler(board)">{{ board.boardName }}</span>
                    </template>
                    <div class="sub-board-list">
                        <span :class="['sub-board',activeBoardId==subBoard.boardId?'active':'']"
                        v-for="subBoard in board.children"
                        :key="subBoard.boardId"
                        @click="subBoardClickHandler(subBoard)">{{ subBoard.boardName }}</span>
                    </div>
                </el-popover>
                <span :class="['menu-item',activePboardId==board.boardId?'active':'']" @click="boardClickHnadler(board)" v-else>{{ board.boardName }}</span>
                </template>
            </div>
            <div class="user-info-panel">
                <el-button @click="newPost" type="primary">
                    发帖
                    <el-icon style="margin-left:5px;"><Plus /></el-icon>
                </el-button>
                <el-button @click="goSearch" type="primary" style="margin-left:5px;">
                    搜索
                    <el-icon style="margin-left:10px;"><Search /></el-icon>
                </el-button>
                <el-button-group v-if="!userInfo" style="margin-left:10px;">
                    <el-button type="primary"  @click="loginAndRegister(1)" plain>登录</el-button>
                    <el-button type="primary" @click="loginAndRegister(0)" plain>注册</el-button>
                </el-button-group>
            </div>
            <template v-if="userInfo">
                <div  class="message-info">
                <el-dropdown>
                    <el-badge :value="messageCountInfo.total" :hidden="messageCountInfo.total==0" class="item">
                        <el-icon size="25" @click="gotoMessage('reply')"><BellFilled /></el-icon>
                    </el-badge>
                    <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item class="message-item" @click="gotoMessage('reply')">
                            <span>回复我的</span>
                            <span v-show="messageCountInfo.reply" class="count-tag">{{ messageCountInfo.reply<100?messageCountInfo.reply:'99+' }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item class="message-item" @click="gotoMessage('likePost')">
                            <span>赞了我的帖子</span>
                            <span v-show="messageCountInfo.likePost" class="count-tag">{{ messageCountInfo.likePost<100?messageCountInfo.likePost:'99+' }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item class="message-item" @click="gotoMessage('downloadAttachment')">
                            <span>下载了我的附件&nbsp;&nbsp;&nbsp;</span>
                            <span v-show="messageCountInfo.downloadAttachment" class="count-tag">{{ messageCountInfo.downloadAttachment<100?messageCountInfo.downloadAttachment:'99+' }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item class="message-item" @click="gotoMessage('likeComment')">
                            <span>赞了我的评论</span>
                            <span v-show="messageCountInfo.likeComment" class="count-tag">{{ messageCountInfo.likeComment<100?messageCountInfo.likeComment:'99+' }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item class="message-item" @click="gotoMessage('sys')">
                            <span>系统消息</span>
                            <span v-show="messageCountInfo.sys" class="count-tag">{{ messageCountInfo.sys<100?messageCountInfo.sys:'99+' }}</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                    </template>
                </el-dropdown>
                </div>
                <div  class="avatar">
                    <el-dropdown>
                        <AvatarModule class="avatar" :userId="userInfo.userId"></AvatarModule>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="goUserPage">我的主页</el-dropdown-item>
                                <el-dropdown-item @click="logout">退出</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </template>
        </div>
    </div>
    </transition>
    <DialogModule :show="showDialog" :buttons="buttons" title="标题" @close="showDialog=false">
        这是内容
    </DialogModule>
    <div class="body-content">
        <router-view v-slot="{ Component }">
            <keep-alive :include="['ArticleList', 'UserCenter']">
                <component :is="Component"></component>
            </keep-alive>
        </router-view>

    </div>
    <div class="footer">
        <div class="footer-content"
        :style="{'width':proxy.globalInfo.bodyWidth+'px'}">
            Footer
        </div>
    </div>
    <!-- 登陆注册 -->
    <LoginAndRegister ref="loginRegisterRef"></LoginAndRegister>
  </div>
</template>

<script setup>
import LoginAndRegister from './LoginAndRegister.vue'
import AvatarModule from '@/components/AvatarModule.vue'
import { ref, reactive, getCurrentInstance, onMounted, watch, onBeforeMount, computed } from 'vue'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo.js'
import { useRouter } from 'vue-router'
import { useBoardListStore } from '@/stores/boardList.js'
import { useMessageStore } from '@/stores/message.js'
const boardListStore = useBoardListStore()
const router = useRouter()
const loginUserInfoStore = useLoginUserInfoStore()
const { proxy } = getCurrentInstance()
const messageStore = useMessageStore()
const showHeader = ref(true)
const api = {
    getUserInfo: '/getUserInfo',
    loadBoard: '/board/loadBoard',
    logout: '/logout',
    loadMessageCount: '/ucenter/getMessageCount'
}
const logoInfo = reactive([
    {
        letter: 'E',
        color: '#ec7696'
    },
    {
        letter: 'x',
        color: '#806d9e'
    },
    {
        letter: 'p',
        color: '#7a7374'
    },
    {
        letter: 'i',
        color: '#63bbd0'
    },
    {
        letter: 'l',
        color: '#66c18c'
    },
    {
        letter: 'e',
        color: '#e2d849'
    }
])

// header是否显示的逻辑，效果不是很好，后面再优化
// 监听滚动条
// const getScrollTop = () => {
//     const scrollTop = document.documentElement.scrollTop ||
//     document.body.scrollTop || window.pageYOffset
//     return scrollTop
// }
// const initScroll = () => {
//     let initScrollTop = getScrollTop()
//     window.addEventListener('scroll', () => {
//         const currentScrollTop = getScrollTop()
//         if (currentScrollTop > initScrollTop && currentScrollTop > 240) {
//             showHeader.value = false
//         } else {
//             showHeader.value = true
//         }
//         initScrollTop = getScrollTop()
//     })
// }
onMounted(() => {
    // initScroll()
    const dbItem = localStorage.getItem('loginInfo')
    if (!dbItem) return
    getUserInfo()
    loadMessageCount()
})
// 获取用户信息
const getUserInfo = async () => {
    const result = await proxy.Request({
        url: api.getUserInfo
    })
    if (!result) return
    loginUserInfoStore.setLoginUserInfo(result.data)
}
const userInfo = computed(() => loginUserInfoStore.loginUserInfo)
// 监听用户信息
watch(() => loginUserInfoStore.loginUserInfo, (newVal) => {
    if (newVal && newVal.value) {
        // 如果是登录，就加载消息数量
        loadMessageCount()
    }
}, { immediate: true })
// 监听是否显示登录
watch(() => loginUserInfoStore.showLogin, (newVal) => {
    if (newVal) {
        loginAndRegister(1)
    }
})
// 获取板块信息
const boardList = ref([])
const loadBoard = async () => {
    const result = await proxy.Request({
        url: api.loadBoard
    })
    if (!result) return
    boardList.value = result.data
    boardListStore.setBoardList(result.data)
}
onBeforeMount(() => {
    loadBoard()
})
const buttons = [
    {
        text: '确认',
        type: 'primary'

    }
]
const showDialog = ref(false)
const loginRegisterRef = ref()
const loginAndRegister = (type) => {
    loginRegisterRef.value.showPanel(type)
}

// 点击板块
const boardClickHnadler = (board) => {
    if (!board) {
        router.push('/')
    } else {
        router.push('/forum/' + board.boardId)
    }
}
const subBoardClickHandler = (subBoard) => {
    router.push('/forum/' + subBoard.pBoardId + '/' + subBoard.boardId)
}

// 监听当前活跃的板块
const activePboardId = computed(() => boardListStore.pBoardId)
const activeBoardId = computed(() => boardListStore.boardId)

// 发帖
const newPost = () => {
    if (!loginUserInfoStore.loginUserInfo) {
        proxy.Message.warning('请先登录')
        loginAndRegister(1)
        return
    }
    router.push('/newPost')
}

// 退出
const logout = () => {
    proxy.Confirm('确定要退出吗?', async () => {
        const result = await proxy.Request({
            url: api.logout
        })
        if (!result) return
        loginUserInfoStore.setLoginUserInfo(null)
        localStorage.removeItem('loginInfo')
        proxy.Message.success('退出成功')
        messageStore.setMessageList(null)
        router.push('/')
        // router.go(0)
    })
}
const goUserPage = () => {
    router.push('/user/' + loginUserInfoStore.loginUserInfo.userId)
}

// 转跳消息页面
const gotoMessage = (type) => {
    router.push('/user/message/' + type)
}

const messageCountInfo = ref({})
const loadMessageCount = async () => {
    const result = await proxy.Request({
        url: api.loadMessageCount
    })
    if (!result) return
    messageCountInfo.value = result.data
    messageStore.setMessageList(result.data)
}

const goSearch = () => {
    router.push('/search')
}
</script>

<style lang="scss" scoped>
.header{
    z-index: 10;
    position: fixed;
    top: 0;
    width: 100%;
    background-color: white;
    height: 80px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    .header-content{
        margin: 0 auto;
        height: 100%;
        // background-color: #ec9bad;
        display: flex;
        align-items: center;
        .logo{
            display: block;
            font-size: 28px;
            letter-spacing: 4px;
            text-decoration: none;
        }
        .menu-panel{
            flex: 1;
            .menu-item{
                font-size: 18px;
                font-weight: 540;
                margin-left: 20px;
                cursor: pointer;
                &:hover{
                    color: var(--link);
                }
            }
            .active{
                color: var(--link);
            }
        }
        .user-info-panerl{
            width: 300px;
        }
        .message-info{
            margin-left: 5px;
            .item{
                cursor: pointer;
                &:focus{
                    outline: none;
                }
            }
        }
        .avatar{
            margin-left: 20px;
            &:focus{
                outline: none;
            }
        }
    }
}
.sub-board-list{
    display: flex;
    flex-wrap: wrap;
    .sub-board{
        padding: 0 10px;
        border-radius: 10px;
        margin-right: 10px;
        background-color: #f0f0f0;
        border: 1px solid #c4c4c4;
        margin-top: 10px;
        cursor: pointer;
        &:hover{
            color: var(--link);
            background-color: #fff;
        }
    }
    .active{
        color: var(--link);
        background-color: #fff;
    }
}
.body-content{
    // height: 100vh;
    // overflow: auto;
    // scroll-behavior: smooth;
    padding-top: 10px;
    position: relative;
    min-height: calc(100vh - 200px);
}
.footer{
    background-color: white;
    height: 200px;

    .footer-content{
        margin: 0 auto;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 50px;
    }
}
.message-item{
    // display: flex;
    // justify-content: space-around!important;
    position: relative;
    .count-tag{
        position: absolute;
        right: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        background-color: var(--el-color-danger);
        border-radius: 7px;
        width: 20px;
        height: 14px;
    }
}
</style>
