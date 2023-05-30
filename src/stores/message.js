import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useMessageStore = defineStore('messageStore', () => {
    const messageList = ref(null)
    function setMessageList (data) {
        messageList.value = data
    }
    function readMessage (type) {
        if (messageList.value) {
            messageList.value.total -= messageList.value[type]
            messageList.value[type] = 0
        }
    }
    return { messageList, setMessageList, readMessage }
})
