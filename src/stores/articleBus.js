import { defineStore } from 'pinia'
import { ref } from 'vue'
// 主要用于删除文章时，通知文章列表更新
export const useDeleteArticleBusStore = defineStore('deleteBus', () => {
    const deleteArticle = ref(false)

    return { deleteArticle }
})

export const usePostArticleBusStore = defineStore('postBus', () => {
    const postArticle = ref(false)
    return { postArticle }
})
