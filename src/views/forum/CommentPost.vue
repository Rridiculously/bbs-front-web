<template>
    <div class="post-comment">
        <AvatarModule class="user-avatar" :width="avatarWidth" :userId="userId"></AvatarModule>
        <div class="input-content">
            <el-input
        class="comment-input"
        v-model="textarea"
        maxlength="300"
        :placeholder="placeholder"
        show-word-limit
        rows="3"
        :autofocus="true"
        type="textarea"
        resize="none">
        </el-input>
        <div class="insert-img" v-if="showInsertImg">
            <div class="pre-image" v-if="commentImage">
                <CommentImage :src="commentImage" class="pre-image-item"></CommentImage>
                <el-icon @click="removeCommentImg"><Close /></el-icon>
            </div>
            <el-upload v-else
            class="upload-img"
            name="file"
            :show-file-list="false"
            accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
            :multiple="false"
            :http-request="selectImg">
                <el-icon><PictureFilled /></el-icon>
            </el-upload>
        </div>
        </div>
        <div @click="postCommentHandler" class="send-btn">发布</div>
    </div>
</template>

<script setup>
import AvatarModule from '@/components/AvatarModule.vue'
import CommentImage from '@/views/forum/CommentImage.vue'
import { ref, getCurrentInstance } from 'vue'
import { useLoginUserInfoStore } from '@/stores/loginUserInfo'
const { proxy } = getCurrentInstance()
const loginUserInfoStore = useLoginUserInfoStore()
const props = defineProps({
    articleId: {
        type: String
    },
    avatarWidth: {
        type: Number
    },
    userId: {
        type: String,
        default: ''
    },
    showInsertImg: {
        type: Boolean,
        default: true
    },
    placeholder: {
        type: String,
        default: '请文明发言发言噢 ヾ(≧▽≦*)o'
    },
    pCommentId: {
        type: Number
    },
    replyUserId: {
        type: String
    }
})
const emits = defineEmits(['postCommentFinish'])
const api = {
    postComment: '/comment/postComment'
}
const textarea = ref('')

// 评论图片部分
const commentImage = ref(null)
const imgStream = ref(null)
const selectImg = (fileInfo) => {
    // 获取到File对象
    const file = fileInfo.file
    const img = new FileReader()
    img.readAsDataURL(file)
    img.onload = ({ target }) => {
        const imgData = target.result
        commentImage.value = imgData
        imgStream.value = file
        console.log(file)
    }
}
// 移除评论图片
const removeCommentImg = () => {
    commentImage.value = null
    imgStream.value = null
}
// 发布评论
const postCommentHandler = async () => {
    if (!loginUserInfoStore.loginUserInfo) {
        proxy.Message.warning('请先登录噢 ヾ(≧▽≦*)o')
        loginUserInfoStore.showLogin = true
        return
    }
    const tempContent = textarea.value.trim()
    if (!tempContent && !imgStream.value) {
        // 针对一级评论
        if (!props.replyUserId) {
            proxy.Message.warning('至少发布一条评论或者图片噢 ヾ(≧▽≦*)o')
        } else {
            proxy.Message.warning('评论不能为空噢 ヾ(≧▽≦*)o')
        }
        return
    }

    // 如果要发评论，至少1个字符，无论是否带图片
    if (tempContent.length < 1 && tempContent.length > 0) {
        proxy.Message.warning('评论内容不能少于1个字符噢 ヾ(≧▽≦*)o')
        return
    }
    const params = {
        articleId: props.articleId,
        pCommentId: props.pCommentId
    }
    if (props.replyUserId) {
        params.replyUserId = props.replyUserId
    }
    if (tempContent) {
        params.content = tempContent
    }
    if (imgStream.value) {
        params.image = imgStream.value
    }
    const result = await proxy.Request({
        url: api.postComment,
        params,
        dataType: 'form',
        showLoading: false
    })
    if (!result) return
    proxy.Message.success('评论成功噢 ヾ(≧▽≦*)o')
    emits('postCommentFinish', result.data)
    removeCommentImg()
    textarea.value = ''
}
</script>

<style lang="scss" scoped>
.post-comment{
    display: flex;
    .user-avatar{
        margin-right: 20px;
    }
    .input-content{
        flex: 1;
        align-items: center;
        position: relative;
        .comment-input{
            height: 60px;
            &:deep(.el-textarea__inner){
                height: 60px;
            }
        }
        .insert-img{
            .pre-image{
                margin-top: 10px;
                position: relative;
                display: inline-block;

                .el-icon{
                    font-size: 16px;
                    position: absolute;
                    right: -8px;
                    top: -8px;
                    color: rbg(121,121,121);
                    background-color: rgba( #000000,0.05);
                    border-radius: 50%;
                    cursor: pointer;
                }
            }
            .el-upload{
                position: absolute;
                left: 0px;
                top: 65px;
            }
            .el-icon{
                font-size: 20px;
                color: #a2a2a2;
            }
        }
    }
    .send-btn{
        width: 70px;
        height: 60px;
        margin-left: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        background-color: #409eff;
        color: #fff;
        cursor: pointer;
        &:hover{
            background-color: #66b1ff;
        }
    }
}
</style>
