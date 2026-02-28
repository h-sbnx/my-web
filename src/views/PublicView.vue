<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus' // 新增：引入消息提示

// 年份列表（从接口加载）
const yearList = ref([])
// 当前选中的年份
const currentYear = ref('')
// 公示列表（按年份加载）- 修复：数组推荐用ref
const publicList = ref([])
// 新增：加载状态
const loading = ref(false)

// 加载所有公示年份
const loadYearList = async () => {
  try {
    loading.value = true
    const res = await request.get('/public/queryAllYears')
    if (res.code === 200) {
      yearList.value = res.data || []
      // 默认选中第一个年份
      if (yearList.value.length > 0) {
        currentYear.value = yearList.value[0]
        // 加载当前年份的公示数据
        loadPublicData(currentYear.value)
      }
    }
  } catch (e) {
    console.error('加载公示年份失败', e)
    ElMessage.error('加载公示年份失败，请刷新重试') // 新增：错误提示
  } finally {
    loading.value = false
  }
}

// 加载指定年份的公示数据（简化逻辑，后端已统一返回files数组）
const loadPublicData = async (year) => {
  if (!year) return
  try {
    loading.value = true
    const res = await request.get('/public/queryByYear', {
      params: { year } // 传递年份参数
    })
    if (res.code === 200) {
      // 修复：直接赋值，无需兼容单文件（后端已处理）
      publicList.value = res.data.map(item => ({
        ...item,
        files: item.files || [] // 兜底为空数组
      }))
    }
  } catch (e) {
    console.error('加载赛事公示数据失败', e)
    ElMessage.error('加载公示数据失败，请刷新重试') // 新增：错误提示
  } finally {
    loading.value = false
  }
}

// 切换年份
const handleYearChange = (year) => {
  currentYear.value = year
  loadPublicData(year)
}

// 页面初始化时加载年份和数据
onMounted(() => {
  loadYearList()
})
// 格式化日期为 YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
// 通用文件预览/下载方法（无需登录，直接访问）
const handleFileOpen = (fileUrl, isDownload = false, fileName = '') => {
  try {
    // 1. 补全文件URL域名（解决相对路径被路由拦截）
    let fullUrl = fileUrl;
    if (!fileUrl.startsWith('http')) {
      fullUrl = `http://localhost:8080${fileUrl}`; // 替换为你的后端实际域名
    }

    // 2. 预览/下载逻辑（无Token，直接访问）
    if (isDownload) {
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName || '文件';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success(`开始下载：${fileName || '文件'}`);
    } else {
      window.open(fullUrl, '_blank'); // 新标签页预览，避免路由拦截
    }
  } catch (error) {
    console.error('文件操作失败：', error);
    ElMessage.error('文件预览/下载失败，请重试');
  }
};
</script>

<template>
  <div class="public-page">
    <!--赛事公示-->
    <div class="public-container">
      <h2 class="page-title">赛事公示</h2>

      <!-- 年份选择器 -->
      <div class="year-selector" style="margin-bottom: 20px;">
        <el-select
            v-model="currentYear"
            placeholder="请选择年份"
            style="width: 200px;"
            @change="handleYearChange"
            :disabled="loading"
        >
        <el-option
            v-for="year in yearList"
            :key="year"
            :label="`${year}年`"
            :value="year"
        />
        </el-select>
      </div>

      <el-card class="public-card">
        <!-- 加载中提示 -->
        <div v-if="loading" style="text-align:center; padding: 40px 0; color: #999;">
          <el-icon><loading /></el-icon> 加载中...
        </div>

        <!-- 空数据提示 -->
        <div v-else-if="publicList.length === 0" class="empty-tip" style="text-align:center; padding: 40px 0; color: #999;">
          暂无{{ currentYear }}年赛事公示数据
        </div>

        <!-- 有数据时显示表格 -->
        <el-table
            v-else
            :data="publicList"
            border
            style="width: 100%"
            class="public-table"
        >
          <el-table-column prop="id" label="序号" width="80" align="center" />
          <el-table-column prop="title" label="公示标题" min-width="300" />
          <el-table-column prop="publicTime" label="公示时间" width="180" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.publicTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="publicType" label="公示类型" width="120" align="center">
            <template #default="scope">
              <el-tag type="info">{{ scope.row.publicType }}</el-tag>
            </template>
          </el-table-column>
          <!-- 公示文件列 - 无需登录直接下载 -->
          <el-table-column label="公示文件" min-width="200" align="center">
            <template #default="scope">
              <div v-if="scope.row.files.length > 0" class="file-list">
                <el-button
                    v-for="(file, idx) in scope.row.files"
                    :key="idx"
                    type="text"
                    size="small"
                    @click="handleFileOpen(file.fileUrl, true, file.fileName || `文件${idx + 1}`)"
                    style="display: block; margin: 4px 0; color: #409eff;"
                >
                  {{ file.fileName || `文件${idx + 1}` }} <i class="el-icon-download"></i>
                </el-button>
              </div>
              <span v-else style="color: #999;">无附件</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 公示提示（保留） -->
        <div v-if="publicList.length > 0" class="public-tip">
          <p>公示时间：{{ currentYear }}年（具体以公示文件为准）</p>
          <p>公示期间如有异议，请联系大赛组委会：0551-6516XXXX（巢老师）</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.public-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
}
.public-container {
  max-width: 1200px;
  width: 95%;
  margin: 30px auto;
  box-sizing: border-box;
}
.page-title {
  color: #c7254e;
  margin-bottom: 20px;
  border-bottom: 2px solid #428bca;
  padding-bottom: 10px;
}
.public-card {
  border: 1px solid #428bca;
  padding: 20px;
}
.public-table {
  --el-table-header-text-color: #fff;
  --el-table-header-bg-color: #c7254e;
  margin-bottom: 20px;
}
.public-tip {
  color: #666;
  line-height: 1.8;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
}
.year-selector {
  display: flex;
  align-items: center;
}
/* 多文件列表样式 */
.file-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
}
.file-list .el-link {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}
</style>