export default {
    sizeToStr: (size) => {
        let result
        if (size < 0.1 * 1024) {
            // 小于0.1KB，显示B
            result = size.toFixed(2) + 'B'
        } else if (size < 0.1 * 1024 * 1024) {
            // 小于0.1MB，显示KB
            result = (size / 1024).toFixed(2) + 'KB'
        } else if (size < 0.1 * 1024 * 1024 * 1024) {
            // 小于0.1GB，显示MB
            result = (size / 1024 / 1024).toFixed(2) + 'MB'
        } else {
            // 大于0.1GB，显示GB
            result = (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
        }
        return result
    }
}
