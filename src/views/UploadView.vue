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

// 新增：文件名格式校验（作品ID_队伍名称）
const validateFileName = (file) => {
  const fileName = file.name
  // 必须包含作品ID前缀
  if (!fileName.startsWith(uploadForm.workId + '_')) {
    ElMessage.error(`文件名格式错误！应为：${uploadForm.workId}_队伍名称`);
    return false
  }
  return true
}

const beforeUpload = (file) => {
  // 1. 校验文件大小
  const isLt200M = file.size / 1024 / 1024 < 200
  if (!isLt200M) {
    ElMessage.error('文件大小不能超过200MB！')
    return false
  }

  // 2. 校验作品ID是否填写
  if (!uploadForm.workId) {
    ElMessage.error('请先填写作品ID！')
    return false
  }

  // 3. 校验文件名格式
  if (!validateFileName(file)) {
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

// 上传成功回调（适配后端返回格式：{code, message, data}）
const handleSuccess = (response) => {
  if (response.code === 200) {
    ElMessage.success(`作品上传成功！作品ID：${response.data}`)
    resetForm()
  } else {
    ElMessage.error(`上传失败：${response.message}`)
  }
}

// 上传失败回调
const handleError = (error) => {
  // 解析后端返回的错误信息
  let errorMsg = '网络异常，请重试'
  if (error.response && error.response.data) {
    errorMsg = error.response.data.message || errorMsg
  }
  ElMessage.error(`上传失败：${errorMsg}`)
}

// 重置表单
const resetForm = () => {
  uploadFormRef.value.resetFields()
  fileList.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}
</script>

<template>
  <div class="upload-page">
    <!-- 作品提交 -->
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
            <div slot="tip" class="el-upload__tip">
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