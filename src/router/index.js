import { createRouter, createWebHistory } from 'vue-router'
import { useBoardListStore } from '@/stores/boardList'
import pinia from '@/stores/store.js'
const boardListStore = useBoardListStore(pinia)
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'layout',
            component: () => import('@/views/LayoutModule.vue'),
            children: [
                {
                    path: '/',
                    name: 'article',
                    component: () => import('@/views/forum/ArticleList.vue')
                }, {
                    path: '/forum/:pBoardId',
                    name: 'forum',
                    component: () => import('@/views/forum/ArticleList.vue')
                }, {
                    path: '/forum/:pBoardId/:boardId',
                    name: 'subforum',
                    component: () => import('@/views/forum/ArticleList.vue')
                }, {
                    path: '/post/:articleId',
                    name: 'articleDetail',
                    component: () => import('@/views/forum/ArticleDetail.vue')
                }, {
                    path: '/user/:userId',
                    name: 'user',
                    component: () => import('@/views/user/UserCenter.vue')
                }, {
                    path: '/newPost',
                    name: 'newPost',
                    component: () => import('@/views/forum/EditPost.vue')
                }, {
                    path: '/editPost/:articleId',
                    name: 'editPost',
                    component: () => import('@/views/forum/EditPost.vue')
                }, {
                    path: '/user/message/:type',
                    name: 'message',
                    component: () => import('@/views/user/MessageList.vue')
                }, {
                    path: '/search',
                    name: 'search',
                    component: () => import('@/views/SearchModule.vue')
                }
            ]
        }, {
            path: '/:pathMatch(.*)*',
            name: 'error',
            component: () => import('@/views/ErrorPage.vue')
        }
    ]
})
// 根据路由设置当前版块
router.beforeEach((to, from, next) => {
    if (to.path.indexOf('user') > -1) {
        boardListStore.boardId = -1
        boardListStore.pBoardId = -1
    }
    if (to.path === '/') {
        boardListStore.boardId = 0
        boardListStore.pBoardId = 0
    }
    next()
})
export default router
