import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
export const useBoardListStore = defineStore('boardListStore', () => {
    const boardList = reactive({ list: [] })
    const pBoardId = ref(0)
    const boardId = ref(0)
    function getBoardList () {
        return boardList.list
    }
    function getSubBoardList (pBoardId) {
        const board = boardList.list.find(item => item.boardId === pBoardId)
        return board ? board.children : []
    }
    function setBoardList (data) {
        boardList.list = data
    }
    return { getBoardList, setBoardList, getSubBoardList, pBoardId, boardId }
}
)
