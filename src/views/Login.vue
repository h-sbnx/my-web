<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useRouter } from 'vue-router'
import { isTokenExpired } from '@/utils/jwtUtil'

const router = useRouter()
const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.username) return ElMessage.warning('请输入管理员账号')
  if (!loginForm.password) return ElMessage.warning('请输入管理员密码')

  loading.value = true
  try {
    const res = await request.post('/admin/login', {
      username: loginForm.username,
      password: loginForm.password
    })

    if (res.code !== 200) {
      ElMessage.error(res.message || '登录失败，请检查账号密码')
      return
    }

    const { token, user } = res.data || {}
    if (!token || !user) {
      ElMessage.error('登录失败：未获取到登录凭证')
      return
    }

    localStorage.setItem('adminToken', token)
    localStorage.setItem('adminUser', JSON.stringify(user))

    ElMessage.success('登录成功！')
    const redirect = router.currentRoute.query?.redirect || '/admin'
    await router.replace(redirect)
  } catch (error) {
    let errorMsg = '账号或密码错误'
    if (error.response) {
      if (error.response.status === 404) {
        errorMsg = '登录接口不存在，请检查后端地址'
      } else if (error.response.status === 500) {
        errorMsg = '服务器错误，请联系管理员'
      } else {
        errorMsg = error.response.data?.message || '登录失败'
      }
    }
    ElMessage.error(`登录失败：${errorMsg}`)
  } finally {
    loading.value = false
  }
}

const initPage = async () => {
  const token = localStorage.getItem('adminToken')
  if (token && !isTokenExpired(token)) {
    try {
      await ElMessageBox.confirm(
          '检测到您已登录，是否直接进入管理后台？',
          '登录状态检测',
          {
            confirmButtonText: '进入后台',
            cancelButtonText: '重新登录',
            type: 'info'
          }
      )

      await router.replace('/admin')
    } catch (err) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    }
  }
}

onMounted(() => {
  initPage()
})
</script>

<template>
  <div class="admin-login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>大赛管理系统 - 管理员登录</h2>
        <p>请输入管理员账号密码登录后台</p>
      </div>

      <el-form :model="loginForm" class="login-form" @keyup.enter="handleLogin">
        <el-form-item label="账号" required>
          <el-input
              v-model="loginForm.username"
              placeholder="请输入管理员账号"
              prefix-icon="el-icon-user"
              size="large"
              autofocus
          />
        </el-form-item>

        <el-form-item label="密码" required>
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入管理员密码"
              prefix-icon="el-icon-lock"
              size="large"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              class="login-btn"
              @click="handleLogin"
              :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.admin-login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #409eff, #67c23a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "微软雅黑";
}

.login-card {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #1f2d3d;
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
}

.login-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 30px 20px;
  }
}
</style>