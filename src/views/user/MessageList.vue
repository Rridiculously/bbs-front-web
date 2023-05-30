<template>
    <div class="container-body message-center"
    :style="{'width':proxy.globalInfo.bodyWidth+'px'}">
        <div class="user-banner">
            <router-link :to="'/'">首页</router-link>
            <el-icon ><ArrowRight /></el-icon>
            <span>消息中心</span>
        </div>
        <div class="content">
            <div class="message-panel">
            <el-tabs :model-value="activeTabName" @tabChange="tabChange">
                <el-tab-pane name="reply">
                    <template #label>
                        <div class="tag-item">
                            <span>回复我的</span>
                            <span v-show="messageCountInfo.reply" class="count-tag">{{ messageCountInfo.reply<100?messageCountInfo.reply:'99+' }}</span>
                        </div>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="likePost">
                    <template #label>
                        <div class="tag-item">
                            <span>赞了我的帖子</span>
                            <span v-show="messageCountInfo.likePost" class="count-tag">{{ messageCountInfo.likePost<100?messageCountInfo.likePost:'99+' }}</span>
                        </div>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="downloadAttachment">
                    <template #label>
                        <div class="tag-item">
                            <span>下载了我的附件&nbsp;&nbsp;&nbsp;</span>
                            <span v-show="messageCountInfo.downloadAttachment" class="count-tag">{{ messageCountInfo.downloadAttachment<100?messageCountInfo.downloadAttachment:'99+' }}</span>
                        </div>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="likeComment">
                    <template #label>
                        <div class="tag-item">
                            <span>赞了我的评论</span>
                            <span v-show="messageCountInfo.likeComment" class="count-tag">{{ messageCountInfo.likeComment<100?messageCountInfo.likeComment:'99+' }}</span>
                        </div>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="sys">
                    <template #label>
                        <div class="tag-item">
                            <span>系统消息</span>
                            <span v-show="messageCountInfo.sys" class="count-tag">{{ messageCountInfo.sys<100?messageCountInfo.sys:'99+' }}</span>
                        </div>
                    </template>
                </el-tab-pane>
            </el-tabs>
            </div>
            <div class="message-list">
                <DataList :dataSource="messageListInfo"
                :loading="loading"
                noDataMsg="暂无消息"
                @changePage="changePage">
                    <template #default="{data}">
                        <!-- 系统消息 -->
                        <div class="message-item sys" v-if="data.messageType==0">
                            <div class="message-content">
                                <span>{{ data.messageContent }}</span>
                                <span><span id="del_msg" @click="delMessage(data.messageId)">删除该通知</span>{{ data.createTime }}</span>
                            </div>
                        </div>
                        <!-- 回复我的 -->
                        <div class="message-item reply" v-if="data.messageType==1">
                            <AvatarModule class="avatar" :userId="data.sendUserId" :width="40"></AvatarModule>
                            <div class="message-content">
                                <div class="info">
                                    <router-link class="nickname" :to="'/user/'+data.sendUserId">{{ data.sendNickName }}</router-link>
                                    <span>回复了我</span>
                                    <router-link class="article-name" :to="'/post/'+data.articleId">{{ data.articleTitle }}</router-link>
                                </div>
                                <div class="msg-content">
                                    <span class="msg">{{ data.messageContent?data.messageContent:'[图片]' }}</span>
                                    <span><span id="del_msg" @click="delMessage(data.messageId)">删除该通知</span>{{ data.createTime }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- 赞了我的帖子 -->
                        <div class="message-item like-post" v-if="data.messageType==2">
                            <AvatarModule class="avatar" :userId="data.sendUserId" :width="40"></AvatarModule>
                            <div class="message-content">
                                <div class="info">
                                    <router-link class="nickname" :to="'/user/'+data.sendUserId">{{ data.sendNickName }}</router-link>
                                    <span>赞了我的{{ data.commentId?'评论':'帖子' }}</span>
                                    <router-link class="article-name" :to="'/post/'+data.articleId">{{ data.articleTitle }}</router-link>
                                </div>
                                <div class="msg-content">
                                    <!-- <span v-if="data.messageContent">{{ data.messageContent }}</span> -->
                                    <span>{{ data.createTime }}</span>
                                    <span id="del_msg" @click="delMessage(data.messageId)" style="margin-right:0;">删除该通知</span>
                                </div>
                            </div>
                        </div>
                        <!-- 赞了我的评论 -->
                        <div class="message-item reply" v-if="data.messageType==3">
                            <AvatarModule class="avatar" :userId="data.sendUserId" :width="40"></AvatarModule>
                            <div class="message-content">
                                <div class="info">
                                    <router-link class="nickname" :to="'/user/'+data.sendUserId">{{ data.sendNickName }}</router-link>
                                    <span>赞了我的评论</span>
                                    <router-link class="article-name" :to="'/post/'+data.articleId">{{ data.articleTitle }}</router-link>
                                </div>
                                <div class="msg-content">
                                    <span class="msg">{{ data.messageContent?data.messageContent:'[图片]' }}</span>
                                    <span><span id="del_msg" @click="delMessage(data.messageId)">删除该通知</span>{{ data.createTime }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- 下载了我的附件 -->
                        <div class="message-item like-post" v-if="data.messageType==4">
                            <AvatarModule class="avatar" :userId="data.sendUserId" :width="40"></AvatarModule>
                            <div class="message-content">
                                <div class="info">
                                    <router-link class="nickname" :to="'/user/'+data.sendUserId">{{ data.sendNickName }}</router-link>
                                    <span>下载了我的附件</span>
                                    <router-link class="article-name" :to="'/post/'+data.articleId">{{ data.articleTitle }}</router-link>
                                </div>
                                <div class="msg-content">
                                    <span>{{ data.createTime }}</span>
                                    <span id="del_msg" @click="delMessage(data.messageId)" style="margin-right:0;">删除该通知</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataList>
            </div>
        </div>
    </div>
</template>

<script setup>
import DataList from '@/components/DataList.vue'
import AvatarModule from '@/components/AvatarModule.vue'
import { getCurrentInstance, ref, watch } from 'vue'
import { useMessageStore } from '@/stores/message.js'
import { useRouter, useRoute } from 'vue-router'
const messageStore = useMessageStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const activeTabName = ref('reply')
const messageCountInfo = ref({})
watch(() => messageStore.messageList, (newVal) => {
    if (newVal) {
        messageCountInfo.value = newVal
    } else {
        messageCountInfo.value = {}
    }
}, { immediate: true })

const api = {
    loadMessageList: '/ucenter/loadMessageList',
    deleteMessage: '/ucenter/deleteMessage'
}
const messageListInfo = ref({})
const loading = ref(false)
const loadMessageList = async (pageNo) => {
    loading.value = true
    const params = {
        pageNo,
        code: activeTabName.value
    }
    const result = await proxy.Request({
        url: api.loadMessageList,
        dataType: 'form',
        params,
        showLoading: false
    })
    loading.value = false
    if (!result) return
    messageListInfo.value = result.data
    // 更新已读
    messageStore.readMessage(activeTabName.value)
}
const tabChange = (type) => {
    router.push('/user/message/' + type)
}
watch(() => route.path, (newVal) => {
    if (newVal.indexOf('/user/message') > -1) {
        activeTabName.value = route.params.type
        messageListInfo.value = {}
        loadMessageList(1)
    }
}, { immediate: true })
const changePage = (pageNo) => {
    loadMessageList(pageNo)
}

const delMessage = async (messageId) => {
    const result = await proxy.Request({
        url: api.deleteMessage,
        params: {
            messageId
        },
        dataType: 'form',
        showLoading: false
    })
    if (!result) return
    proxy.Message.success('删除成功')
    messageListInfo.value.list.forEach((item, index) => {
        if (item.messageId === messageId) {
            messageListInfo.value.list.splice(index, 1)
        }
    })
}
</script>

<style lang="scss" scoped>
#del_msg{
    display: none;
    cursor: pointer;
    user-select: none;
    margin-right: 20px;
    transition: all 0.3s;
    color: #eba083;
    text-decoration: underline;
}
.message-center {
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
    .content{
        border-radius: 10px;
        background-color: #fff;
        box-shadow: 0 0 10px  rgba(0,0,0,.1);
        .message-panel {
        padding: 20px;
        .tag-item {
            position: relative;
            // padding: 0 10px;
            padding: 0 20px;
            font-size: 16px;
            user-select: none;
            .count-tag {
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                right: -10px;
                top: 0px;
                font-size: 14px;
                color: white;
                background-color: #d0b3e9;
                border-radius: 8px;
                width: 22px;
                height: 16px;
                }
            }
        }
        .message-list{
            padding: 0px 20px;

            .message-item{
                margin: 26px 0;
                padding: 20px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 10px 0 rgba(0,0,0,.1);
                background: #f8faff;
                transition: all 0.5s;
                &:hover{
                    background-color: #f6fffc;
                    // transform: scale(1.01);
                    // box-shadow: 0 5px 10px rgba(0,0,0,.2);
                }
                &:hover #del_msg{
                    display: inline-block;
                }
                .message-content{
                    font-size: 16px;
                    a{
                        text-decoration: none;
                        color: inherit;
                    }
                }
            }
            .sys{
                cursor: pointer;
                .message-content{
                    display: flex;
                    justify-content: space-between;
                }
            }
            .reply{
                display: flex;
                .avatar{
                    margin-right: 20px;
                }
                .message-content{
                    width: 100%;
                    .info{
                        position: relative;
                        .nickname{
                            margin-right: 20px;
                            font-weight: 600;
                        }
                        .article-name{
                            position: absolute;
                            right: 0px;
                            font-weight: 600;
                            color: #eba083;
                            text-decoration: underline;
                            &:hover{
                                color: #e6b9a7;
                            }
                        }
                    }
                    .msg-content{
                        margin-top: 10px;
                        display: flex;
                        justify-content: space-between;
                        .msg{
                            padding-left: 10px;
                            border-left: 2px solid pink;
                        }
                    }
                }
            }
            .like-post{
                display: flex;
                .avatar{
                    margin-right: 20px;
                }
                .message-content{
                    width: 100%;
                    .info{
                        position: relative;
                        .nickname{
                            margin-right: 20px;
                            font-weight: 600;
                        }
                        .article-name{
                            position: absolute;
                            right: 0px;
                            font-weight: 600;
                            color: #eba083;
                            text-decoration: underline;
                            &:hover{
                                color: #e6b9a7;
                            }
                        }
                    }
                    .msg-content{
                        margin-top: 10px;
                        display: flex;
                        justify-content: space-between;
                        .msg{
                            padding-left: 10px;
                            border-left: 2px solid pink;
                        }
                    }
                }
            }
        }
    }
}
</style>
