<template>
    <div class="edit-post">
        <el-form
        class="post-panel"
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="60px"
        @submit.prevent
        >
        <div class="post-editor">
            <el-card>
                <template #header>
                    <div class="post-edit-title">
                        <span>正文</span>
                        <div class="change-editor-type" @click="changeEditor">
                            <el-icon><Sort /></el-icon>
                            <span>切换为{{ editorType===1?'富文本':'markdown' }}编辑器</span>
                        </div>
                    </div>
                </template>
            </el-card>
            <MarkdownEditor
            v-if="editorType === 1"
            :height="markdownHeight"
            v-model="formData.markdownContent"
            @save="save"
            @htmlContent="setHtmlContent"></MarkdownEditor>
            <HtmlEditor
            v-else
            :height="HtmlEditorHeight"
            v-model="formData.content"></HtmlEditor>
        </div>
        <div class="post-setting">
            <el-card>
                <template #header>
                    <span>设置</span>
                </template>
            </el-card>
            <!--input输入-->
            <el-form-item label="标题" prop="title">
                <el-input clearable
                placeholder="请输入标题"
                type="textarea"
                :rows="2"
                :resize="'none'"
                v-model.trim="formData.title"></el-input>
            </el-form-item>
            <el-form-item prop="boardIds" label="板块">
                <el-cascader
                placeholder="请选择板块"
                :options="boardList"
                :props="boardProps"
                clearable
                v-model="formData.boardIds"
                :style="{'width':'100%'}">
                </el-cascader>
            </el-form-item>
            <el-form-item prop="cover" label="封面">
                <CoverUpload v-model="formData.cover"></CoverUpload>
            </el-form-item>
            <el-form-item prop="summary" label="摘要">
                <el-input
                clearable
                placeholder="提示信息"
                type="textarea"
                :rows="5"
                :maxlength="200"
                resize="none"
                show-word-limit
                v-model="formData.summary">
                </el-input>
            </el-form-item>
            <el-form-item prop="attachment" label="附件">
                <AttachmentSelector v-model="formData.attachment"></AttachmentSelector>
            </el-form-item>
            <el-form-item v-if="formData.attachment" prop="integral" label="积分">
                <el-input
                clearable
                placeholder="请输入积分"
                v-model="formData.integral">
                </el-input>
                <span class="tips">附件下载所需积分 (0表示无需积分)</span>
            </el-form-item>
            <el-form-item>
                <el-button @click="postHandler" type="primary" :style="{'width':'100%'}">保存</el-button>
            </el-form-item>
        </div>
        </el-form>
    </div>
</template>

<script setup>
import { ref, getCurrentInstance, onBeforeUnmount, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { usePostArticleBusStore } from '@/stores/articleBus.js'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import HtmlEditor from '@/components/HtmlEditor.vue'
import CoverUpload from '@/components/CoverUpload.vue'
import AttachmentSelector from '@/components/AttachmentSelector.vue'

// const props = defineProps({
//     articleId: {
//         type: String,
//         default: null
//     }
// })

const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref(null)
const route = useRoute()
const router = useRouter()
const postBus = usePostArticleBusStore()
const rules = {
    title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
        { max: 150, message: '标题太长', trigger: 'blur' }
    ],
    boardIds: [
        { required: true, message: '请选择板块', trigger: 'change' }
    ],
    content: [
        { required: true, message: '请输入内容', trigger: 'blur' }
    ],
    summary: [
        { message: '请输入摘要', trigger: 'blur' }
    ],
    integral: [
        { required: true, message: '请输入积分', trigger: 'blur' },
        { validator: proxy.Verify.number, trigger: 'change', message: '积分必须为数字值' }
    ]
}
// 板块选择配置
const boardProps = {
    multiple: false,
    checkStrictly: true,
    value: 'boardId',
    label: 'boardName'
}
const api = {
    loadBoard: '/forum/loadBoard4Post',
    postArticle: '/forum/postArticle',
    articleDetail4Update: '/forum/articleDetail4Update',
    updateArticle: '/forum/updateArticle'
}
// 设置编辑器的高度
const markdownHeight = window.innerHeight - 80
const HtmlEditorHeight = window.innerHeight - 80

// 加载板块列表
const boardList = ref([])
const loadBoardList = async () => {
    const result = await proxy.Request({
        url: api.loadBoard
    }).catch(err => {
        console.log(err)
    })
    if (!result) return
    boardList.value = result.data
}
loadBoardList()

const articleId = ref(null)

// 加载文章详情或者读取草稿
const getArticleDetail = async () => {
    // 加载文章详情
    if (articleId.value) {
        console.log('编辑文章')
        const result = await proxy.Request({
            url: api.articleDetail4Update,
            dataType: 'form',
            params: {
                articleId: articleId.value
            },
            showError: false,
            // 重写错误回调
            errorCallback: (error) => {
                ElMessageBox.alert(error.info, '提示', {
                    confirmButtonText: '确定',
                    'show-close': false,
                    callback: () => {
                        router.go(-1)
                    }
                })
            }
        })
        if (!result) return
        const articleInfo = result.data.forumArticle
        editorType.value = articleInfo.editorType
        articleInfo.boardIds = [articleInfo.pBoardId]
        if (articleInfo.boardId) {
            articleInfo.boardIds.push(articleInfo.boardId)
        }
        if (articleInfo.cover) {
            articleInfo.cover = {
                imageUrl: articleInfo.cover
            }
        }
        if (result.data.attachment) {
            articleInfo.attachment = {
                name: result.data.attachment.fileName
            }
            articleInfo.integral = result.data.attachment.integral
        }
        // editorType.value = articleInfo.editorType
        console.log(articleInfo)
        formData.value = articleInfo
    } else {
        // 读取草稿，如果后期板块选择有变化，需要重新加载，这个逻辑以后再写
        const tmpArticle = localStorage.getItem('editorData')
        formData.value = tmpArticle ? JSON.parse(tmpArticle) : {}
    }
}

// 标记文章是否成功发布(仅标记新增)
const postFlag = ref(false)
// 挂载之前，判断是编辑还是新增
onBeforeMount(() => {
    console.log(route.path)
    if (route.path.indexOf('/editPost/') === 0) {
        articleId.value = route.params.articleId
    }
    getArticleDetail()
})
// 编辑器类型  0 富文本 1 markdown
const editorType = ref(1)
const changeEditor = () => {
    console.log(formData.value.content)
    if (editorType.value === 0) {
        if (formData.value.content !== '<p><br></p>') {
            proxy.Confirm('富文本转为markdown可能会丢失内容,确认要切换吗?', () => {
                editorType.value = 1
            })
            return
        }
        editorType.value = 1
    } else {
        editorType.value = 0
    }
}

onBeforeUnmount(() => {
    // 保存编辑器数据, 附件不保存
    // 并且只保存新增文章的数据，修改不保存
    if (!articleId.value && !postFlag.value) {
        formData.value.attachment = null
        console.log('保存编辑器数据')
        localStorage.setItem('editorData', JSON.stringify(formData.value))
    }
})

// markdown编辑器内容改变，同步到formData
const setHtmlContent = (htmlContent) => {
    formData.value.content = htmlContent
}

// 提交文章
const postHandler = () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) return
        const params = {}
        Object.assign(params, formData.value)
        if (params.boardIds.length === 1) {
            params.pBoardId = params.boardIds[0]
        } else if (params.boardIds.length === 2) {
            params.pBoardId = params.boardIds[0]
            params.boardId = params.boardIds[1]
        }
        delete params.boardIds
        params.editorType = editorType.value

        // 去除图片后判断内容是否为空
        // const contentText = params.content.replace(/<(?!img)>/g, '')
        if (params.content === '<p><br></p>') {
            proxy.Message.warning('文章内容不能为空')
            return
        }

        // 如果cover是字符串，说明没有修改封面，不需要上传封面
        if (!(params.cover instanceof File)) {
            params.cover = null
        }
        params.attachmentType = 0
        // 如果attachment不是文件，而且不为空，说明原本有附件，但是没有修改
        if (!(params.attachment instanceof File) && params.attachment) {
            params.attachment = null
            params.attachmentType = 1
        }
        // 如果是文件，说明是新增附件
        if (params.attachment instanceof File) {
            params.attachmentType = 1
        }
        if (params.attachmentType === 0) {
            params.attachment = null
        }
        const result = await proxy.Request({
            url: articleId.value ? api.updateArticle : api.postArticle,
            dataType: 'form',
            params
        })
        if (!result) return
        proxy.Message.success('保存成功')
        // 如果是新增文章,并且成功发送了，则清除草稿
        if (!articleId.value) {
            localStorage.removeItem('editorData')
            postFlag.value = true
        }
        postBus.postArticle = true
        router.push('/post/' + result.data)
    })
}
const save = () => {
    if (articleId.value) {
        // 如果是编辑文章，单独保存
        localStorage.setItem(articleId.value, JSON.stringify(formData.value))
        return
    }
    localStorage.setItem('editorData', JSON.stringify(formData.value))
}
</script>

<style lang="scss" scoped>
.edit-post{
    margin-top: 80px;
    .post-panel{
        display: flex;
        .post-editor{
            flex: 1;
            .post-edit-title{
                display: flex;
                justify-content: space-between;
                align-items: center;
                .change-editor-type{
                    display: flex;
                    align-items: center;
                    color: var(--link);
                    font-size: 14px;
                    cursor: pointer;
                    user-select: none;
                    .el-icon{
                        transform: rotate(90deg);
                    }
                }
            }
        }
        .post-setting{
            width: 450px;
            margin-left: 10px;
            background-color: white;
            .el-card{
                margin-bottom: 10px;
            }
            .el-form-item{
                padding-right: 10px;
            }
            .tips{
                color: #888;
            }
        }
    }
}
</style>
