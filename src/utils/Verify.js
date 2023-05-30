
const regs = {
    email: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    password: /^[\w|\S]{6,30}$/,
    number: /^\+?[0-9]\d*$/

}
const Verify = (rule, value, reg, callback) => {
    if (value) {
        if (reg.test(value)) {
            callback()
        } else {
            callback(new Error(rule.message))
        }
    } else {
        callback()
    }
}
export default {
    email: (rule, value, callback) => {
        return Verify(rule, value, regs.email, callback)
    },
    password: (rule, value, callback) => {
        return Verify(rule, value, regs.password, callback)
    },
    number: (rule, value, callback) => {
        return Verify(rule, value, regs.number, callback)
    },
    integral: (rule, value, callback) => {
        return Verify(rule, value, regs.integral, callback)
    }
}
