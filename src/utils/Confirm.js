import { ElMessageBox } from 'element-plus'
const confirm = (message, okCallback) => {
    ElMessageBox.confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        lockScroll: false
    }).then(() => {
        okCallback()
    }).catch(() => {
        // 取消
    })
}
export default confirm
