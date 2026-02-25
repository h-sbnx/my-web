<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const uploadForm = reactive({
  workId: ''
})

const queryLoading = ref(false)
const fileListResult = ref([])
const showFileResult = ref(false)
const baseApiUrl = 'http://localhost:8080/api'
const uploadLoading = ref(false)

const uploadRules = {
  workId: [
    { required: true, message: '请输入作品ID', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]+$/, message: '作品ID仅支持字母和数字', trigger: 'blur' }
  ],
  file: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (fileList.value.length === 0) {
          callback(new Error('请选择要上传的文件'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const uploadFormRef = ref(null)
const uploadRef = ref(null)
const fileList = ref([])
const uploadUrl = `${baseApiUrl}/file/upload` // 后端上传接口

const checkWorkIdExists = async () => {
  try {
    const response = await request.get(`${baseApiUrl}/file/queryByWorkId`, {
      params: { workId: uploadForm.workId }
    })
    const res = response.data || response;
    return res.code === 200;
  } catch (error) {
    return false;
  }
}

const validateFileName = (file) => {
  const fileName = file.name
  if (!fileName) {
    ElMessage.error('文件名不能为空！')
    return false
  }
  if (!uploadForm.workId.trim()) {
    ElMessage.error('请先填写作品ID再选择文件！')
    return false
  }
  if (!fileName.startsWith(uploadForm.workId + '_')) {
    ElMessageBox({
      title: '格式提示',
      message: `文件名格式错误！正确格式：${uploadForm.workId}_队伍名称`,
      type: 'warning'
    })
    return false
  }
  const allowedExts = ['.zip', '.rar', '.doc', '.docx', '.pdf']
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  if (!allowedExts.includes(fileExt)) {
    ElMessage.error(`文件格式不支持！仅支持：${allowedExts.join('、')}`)
    return false
  }
  return true
}

const beforeUpload = (file) => {
  const isLt200M = file.size / 1024 / 1024 < 200
  if (!isLt200M) {
    ElMessage.error('文件大小不能超过200MB！')
    return false
  }

  if (!uploadForm.workId.trim()) {
    ElMessage.error('请先填写作品ID！')
    return false
  }

  if (!validateFileName(file)) {
    ElMessage.error('文件名校验失败，请检查文件名格式！')
    return false
  }

  return true
}

const submitUpload = async () => {
  uploadFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完善表单信息！')
      return
    }

    if (fileList.value.length === 0) {
      ElMessage.warning('请先选择文件！')
      return
    }

    const currentFile = fileList.value[0].raw || fileList.value[0]
    if (!validateFileName(currentFile)) {
      ElMessage.error('文件校验不通过，无法上传！')
      return
    }

    uploadLoading.value = true
    const workIdExists = await checkWorkIdExists()
    uploadLoading.value = false

    if (!workIdExists) {
      ElMessage.error('作品ID不存在，无法上传')
      return
    }
    uploadLoading.value = true
    if (uploadRef.value) {
      uploadRef.value.submit()
    }
  })
}

const handleSuccess = (response) => {
  uploadLoading.value = false
  console.log("上传成功返回：", response)

  if (!response) {
    ElMessage.error('上传结果异常，请检查文件状态')
    resetForm()
    return
  }

  if (response.code === 200) {
    ElMessageBox({
      title: '上传成功',
      message: `作品上传成功！\n文件UUID：${response.data || '未返回'}`,
      type: 'success'
    }).then(() => {
      resetForm()
      if (uploadForm.workId?.trim()) {
        queryFileList()
      }
    }).catch(() => {
      resetForm()
    })
  } else {
    ElMessage.error(`上传失败：${response.message || '未知错误'}`)
    fileList.value = []
  }
}

const handleError = (error) => {
  uploadLoading.value = false
  let errorMsg = '网络异常，请重试'

  if (error.response) {
    errorMsg = error.response.data?.message || `请求失败（${error.response.status}）`
  } else if (error.request) {
    errorMsg = '服务器无响应，请检查网络或联系管理员'
  } else {
    errorMsg = `请求异常：${error.message || '未知错误'}`
  }

  ElMessage.error(`上传失败：${errorMsg}`)
  fileList.value = []
}
const resetForm = () => {
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields()
  }
  fileList.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
  fileListResult.value = []
  showFileResult.value = false
  uploadLoading.value = false
  ElMessage.info('表单已重置')
}

const queryFileList = async () => {
  if (!uploadForm.workId.trim()) {
    ElMessage.warning('请先输入作品ID！')
    return
  }

  queryLoading.value = true
  showFileResult.value = false
  fileListResult.value = []

  try {
    const response = await request.get(`${baseApiUrl}/file/queryByWorkId`, {
      params: { workId: uploadForm.workId }
    })

    const res = response.data || response;

    if (res.code === 200) {
      fileListResult.value = res.data || []
      showFileResult.value = true
      if (fileListResult.value.length === 0) {
        ElMessage.info('该作品ID暂无已提交的文件')
      } else {
        ElMessage.success(`查询成功，共找到 ${fileListResult.value.length} 个文件`)
      }
    } else {
      ElMessage.error(`查询失败：${res.message || '服务器返回异常'}`)
    }
  } catch (error) {
    console.error("查询异常详情：", error)
    const errResponse = error.response?.data || error.response || {};
    const errMsg = errResponse.message || '网络异常，查询失败';
    ElMessage.error(`查询失败：${errMsg}`)
  } finally {
    queryLoading.value = false
  }
}

const previewFile = (file) => {
  if (!file || !file.fileUuid) {
    ElMessage.error('文件信息不存在，无法预览')
    return
  }
  const fileExt = file.originalFileName.substring(file.originalFileName.lastIndexOf('.')).toLowerCase()
  const downloadUrl = `${baseApiUrl}/file/download?fileUuid=${file.fileUuid}`

  if (fileExt === '.pdf') {
    window.open(downloadUrl, '_blank')
  }
  else if (['.doc', '.docx', '.zip', '.rar'].includes(fileExt)) {
    ElMessageBox.confirm(
        `是否下载文件：${file.originalFileName}`,
        '文件下载',
        {
          confirmButtonText: '下载',
          cancelButtonText: '取消'
        }
    ).then(() => {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.originalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('开始下载文件')
    }).catch(() => {
      ElMessage.info('已取消下载')
    })
  }
  else {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = file.originalFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const formatFileSize = (size) => {
  if (!size || size <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let formattedSize = size

  while (formattedSize >= 1024 && unitIndex < units.length - 1) {
    formattedSize /= 1024
    unitIndex++
  }

  return `${formattedSize.toFixed(2)} ${units[unitIndex]}`
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const handleFileChange = (uploadFile, uploadFiles) => {
  if (uploadFiles.length > 0) {
    const currentFile = uploadFiles[0].raw || uploadFiles[0]
    if (!validateFileName(currentFile)) {
      uploadRef.value?.clearFiles()
      fileList.value = []
      return
    }
  }
  fileList.value = uploadFiles
}
</script>

<template>
  <div class="upload-page">
    <div class="upload-container">
      <h2 class="page-title">作品提交</h2>
      <el-card class="upload-card">
        <el-form
            :model="uploadForm"
            :rules="uploadRules"
            ref="uploadFormRef"
            label-width="100px"
            class="upload-form"
        >
          <el-form-item label="作品ID：" prop="workId">
            <div class="workid-input-group">
              <el-input
                  v-model="uploadForm.workId"
                  placeholder="请输入作品ID"
              />
              <el-button
                  type="info"
                  @click="queryFileList"
                  :loading="queryLoading"
                  style="margin-left: 10px;"
              >
                查询已提交作品
              </el-button>
            </div>
          </el-form-item>

          <el-form-item v-if="showFileResult" label="已提交作品：">
            <div class="file-result-container">
              <el-table
                  :data="fileListResult"
                  border
                  style="width: 100%"
                  empty-text="暂无已提交的作品文件"
                  class="file-table"
              >
                <el-table-column label="序号" align="center" width="80">
                  <template #default="scope">{{ scope.$index + 1 }}</template>
                </el-table-column>
                <el-table-column label="文件名" prop="originalFileName" min-width="200">
                  <template #default="scope">
                    <span class="file-name">{{ scope.row.originalFileName }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="文件大小" align="center" width="120">
                  <template #default="scope">{{ formatFileSize(scope.row.fileSize) }}</template>
                </el-table-column>
                <el-table-column label="文件类型" align="center" width="120">
                  <template #default="scope">
                    {{ scope.row.fileType || scope.row.originalFileName.substring(scope.row.originalFileName.lastIndexOf('.')) }}
                  </template>
                </el-table-column>
                <el-table-column label="上传时间" align="center" width="200">
                  <template #default="scope">{{ formatDateTime(scope.row.uploadTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="120">
                  <template #default="scope">
                    <el-button
                        type="primary"
                        size="small"
                        @click="previewFile(scope.row)"
                    >
                      预览/下载
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>

          <el-form-item label="作品文件：" prop="file">
            <el-upload
                class="upload-demo"
                ref="uploadRef"
                :action="uploadUrl"
                :data="{ workId: uploadForm.workId }"
                :file-list="fileList"
                :before-upload="beforeUpload"
                :on-success="handleSuccess"
                :on-error="handleError"
                :on-change="handleFileChange"
                :limit="1"
                :auto-upload="false"
                accept=".zip,.rar,.doc,.docx,.pdf"
            >
              <el-button type="primary">选择文件</el-button>
              <div slot="tip" class="el-upload__tip">
                支持格式：zip/rar、doc/docx、pdf<br/>
                单个文件不超过200MB，文件命名格式：作品ID_队伍名称<br/>
              </div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                @click="submitUpload"
                :loading="uploadLoading"
            >
              提交作品
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
  background-color: #f5f7fa;
  padding-bottom: 30px;
}
.upload-container {
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
.upload-card {
  border: 1px solid #428bca;
  padding: 20px;
  background-color: #fff;
}
.upload-form {
  margin-top: 20px;
}
.el-upload__tip {
  color: #c7254e;
  margin-top: 10px;
  line-height: 1.5;
  margin-left: 8px;
}

.workid-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
@media (max-width: 768px) {
  .workid-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  .workid-input-group .el-button {
    margin-left: 0 !important;
    margin-top: 10px;
  }
}

.file-result-container {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
.file-table {
  --el-table-header-text-color: #fff;
  --el-table-header-bg-color: #428bca;
  font-size: 12px;
}
.file-name {
  color: #428bca;
  cursor: pointer;
}
.file-name:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .file-table {
    font-size: 11px;
  }
  :deep(.file-table .el-table__cell) {
    padding: 8px 5px;
  }
}
</style>