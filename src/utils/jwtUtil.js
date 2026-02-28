/**
 * JWT Token解析工具
 */
export const parseToken = (token) => {
    if (!token) return null
    try {
        const payload = token.split('.')[1]
        const decoded = atob(payload)
        return JSON.parse(decoded)
    } catch (e) {
        console.error('Token解析失败：', e)
        return null
    }
}

/**
 * 检查Token是否过期
 */
export const isTokenExpired = (token) => {
    const decoded = parseToken(token)
    if (!decoded || !decoded.exp) return true
    const now = Date.now() / 1000
    return decoded.exp < now
}

export default {
    parseToken,
    isTokenExpired
}