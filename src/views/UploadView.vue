<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
// 表单数据上传
const uploadForm = reactive({
  workId: ''
})

// 表单验证
const uploadRules = {
  workId: [{ required: true, message: '请输入作品ID', trigger: 'blur' }],
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

// 表单/上传组件引用
const uploadFormRef = ref(null)
const uploadRef = ref(null)
const fileList = ref([])
const uploadUrl = 'http://localhost:8080/api/comp/file/upload' // 后端上传接口

const beforeUpload = (file) => {
  const isLt200M = file.size / 1024 / 1024 < 200
  if (!isLt200M) {
    ElMessage.error('文件大小不能超过200MB！')
    return false
  }
  return true
}

// 提交上传
const submitUpload = () => {
  uploadFormRef.value.validate((valid) => {
    if (valid) {
      if (fileList.value.length === 0) {
        ElMessage.warning('请先选择文件！')
        return
      }
      uploadRef.value.submit() // 手动触发上传
    } else {
      ElMessage.error('请完善表单信息！')
    }
  })
}

// 上传成功回调
const handleSuccess = (response) => {
  ElMessage.success(`作品上传成功！文件存储路径：${response.data.filePath}`)
  resetForm()
}

// 上传失败回调
const handleError = (error) => {
  ElMessage.error(`上传失败：${error.message || '网络异常'}`)
}

// 重置表单
const resetForm = () => {
  uploadFormRef.value.resetFields()
  fileList.value = []
  uploadRef.value.clearFiles()
}
</script>

<template>
  <div class="upload-page">
<!--    作品提交-->
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
            <el-input
                v-model="uploadForm.workId"
                placeholder="请输入报名成功后获取的作品ID"
            />
          </el-form-item>

          <el-form-item label="作品文件：" prop="file">
            <el-upload
                class="upload-demo"
                ref="uploadRef"
                :action="uploadUrl"
                :headers="{'Content-Type': 'multipart/form-data'}"
                :data="{ workId: uploadForm.workId }"
                :file-list="fileList"
                :before-upload="beforeUpload"
                :on-success="handleSuccess"
                :on-error="handleError"
                :limit="1"
                :auto-upload="false"
                accept=".zip,.rar,.doc,.docx,.pdf"
            >
              <el-button type="primary">选择文件</el-button>
              <div slot="tip" class="el-upload__tip" >
                支持格式：zip/rar、doc/docx、pdf<br/>
                单个文件不超过200MB，文件命名格式：作品ID_队伍名称<br/>
              </div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitUpload">提交作品</el-button>
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
</style>