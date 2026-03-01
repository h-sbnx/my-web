<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const yearList = ref([])
const currentYear = ref('')
const publicList = ref([])
const loading = ref(false)

const loadYearList = async () => {
  try {
    loading.value = true
    const res = await request.get('/public/queryAllYears')
    if (res.code === 200) {
      yearList.value = res.data || []
      if (yearList.value.length > 0) {
        currentYear.value = yearList.value[0]
        loadPublicData(currentYear.value)
      }
    }
  } catch (e) {
    console.error('加载公示年份失败', e)
    ElMessage.error('加载公示年份失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

const loadPublicData = async (year) => {
  if (!year) return
  try {
    loading.value = true
    const res = await request.get('/public/queryByYear', {
      params: { year }
    })
    if (res.code === 200) {
      publicList.value = res.data.map(item => ({
        ...item,
        files: item.files || []
      }))
    }
  } catch (e) {
    console.error('加载赛事公示数据失败', e)
    ElMessage.error('加载公示数据失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

const handleYearChange = (year) => {
  currentYear.value = year
  loadPublicData(year)
}

onMounted(() => {
  loadYearList()
})
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const handleFileOpen = (fileUrl, isDownload = false, fileName = '') => {
  try {
    let fullUrl = fileUrl;
    if (!fileUrl.startsWith('http')) {
      fullUrl = `http://116.62.235.114:8080${fileUrl}`; // 替换为你的后端实际域名
    }

    if (isDownload) {
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName || '文件';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success(`开始下载：${fileName || '文件'}`);
    } else {
      window.open(fullUrl, '_blank')
    }
  } catch (error) {
    console.error('文件操作失败：', error);
    ElMessage.error('文件预览/下载失败，请重试');
  }
};
</script>

<template>
  <div class="public-page">
    <div class="public-container">
      <h2 class="page-title">赛事公示</h2>

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
        <div v-if="loading" style="text-align:center; padding: 40px 0; color: #999;">
          <el-icon><loading /></el-icon> 加载中...
        </div>
        <div v-else-if="publicList.length === 0" class="empty-tip" style="text-align:center; padding: 40px 0; color: #999;">
          暂无{{ currentYear }}年赛事公示数据
        </div>

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