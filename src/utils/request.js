import axios from 'axios'
const request = axios.create({
    baseURL: 'http://localhost:8080/api/comp', // 后端接口前缀
    timeout: 10000,
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
})
export default request