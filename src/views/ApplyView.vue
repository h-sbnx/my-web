<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 1. 基础配置（保持不变）
const workId = ref('')
const queryWorkId = ref('')
const queryResult = ref(null)
const queryLoading = ref(false)
const showQueryResult = ref(false)
const tempPhotoFiles = ref({})

// 2. 表单数据（保持不变）
const applyForm = reactive({
  groupType: '',
  teamName: '',
  projectName: '',
  school: '',
  major: '',
  members: [
    {
      name: '', gender: '', college: '', majorGrade: '', studentType: '',
      phone: '', email: '', photoList: []
    }
  ],
  teacher1: {
    name: '', gender: '', position: '', title: '', unit: '', email: '', phone: ''
  },
  teacher2: {
    name: '', gender: '', position: '', title: '', unit: '', email: '', phone: ''
  }
})

// 3. 表单校验规则（保持不变）
const applyRules = {
  groupType: [{ required: true, message: '请选择参赛组别', trigger: 'change' }],
  teamName: [{ required: true, message: '请输入队伍名称', trigger: 'blur' }],
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  school: [{ required: true, message: '请输入报名学校', trigger: 'blur' }],
  major: [{ required: true, message: '请输入参赛专业', trigger: 'blur' }],
  members: [
    {
      required: true,
      validator: (rule, value, callback) => {
        let memberValid = true
        value.forEach((member, index) => {
          if (!member.name) {
            callback(new Error(`第${index+1}名队员姓名不能为空`))
            memberValid = false
          } else if (!member.phone || !/^1[3-9]\d{9}$/.test(member.phone)) {
            callback(new Error(`第${index+1}名队员手机号不能为空且格式正确`))
            memberValid = false
          } else if (!member.gender || !member.college || !member.majorGrade || !member.studentType) {
            callback(new Error(`请完善第${index+1}名队员的所有必填信息`))
            memberValid = false
          } else if (member.photoList.length === 0) {
            callback(new Error(`第${index+1}名队员需上传学生证照片`))
            memberValid = false
          }
        })
        if (!memberValid) return

        if (value.length < 1) {
          callback(new Error('参赛队员至少需要1人'))
          return
        }

        let teacherCount = 0
        if (applyForm.teacher1.name) teacherCount++
        if (applyForm.teacher2.name) teacherCount++
        if (teacherCount < 1) {
          callback(new Error('至少需要填写1位指导教师的姓名'))
          return
        }

        const totalCount = value.length + teacherCount
        if (totalCount > 5) {
          callback(new Error(`队员(${value.length}人)+指导教师(${teacherCount}人)总人数不能超过5人`))
          return
        }

        callback()
      },
      trigger: 'change'
    }
  ],
  'teacher1.name': [{ required: true, message: '请输入指导教师1姓名', trigger: 'blur' }],
  'teacher1.gender': [{ required: true, message: '请选择指导教师1性别', trigger: 'change' }],
  'teacher1.unit': [{ required: true, message: '请输入指导教师1单位', trigger: 'blur' }],
  'teacher1.phone': [
    { required: true, message: '请输入指导教师1电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const applyFormRef = ref(null)
const photoUploadUrl = '/file/upload' // 保持不变

// 4. 增删队员（保持不变）
const addMember = () => {
  const teacherCount = (applyForm.teacher1.name ? 1 : 0) + (applyForm.teacher2.name ? 1 : 0)
  if (applyForm.members.length + teacherCount >= 5) {
    ElMessage.warning('队员+指导教师总人数不能超过5人，无法新增队员')
    return
  }
  if (applyForm.members.length >= 5) {
    ElMessage.warning('每队最多5名队员')
    return
  }
  applyForm.members.push({
    name: '', gender: '', college: '', majorGrade: '', studentType: '',
    phone: '', email: '', photoList: []
  })
}

const removeMember = (index) => {
  ElMessageBox.confirm(
      '确定要删除该队员吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    applyForm.members.splice(index, 1)
    delete tempPhotoFiles.value[index]
    ElMessage.success('队员删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 5. 照片上传（保持不变）
const handlePhotoUpload = async (file, index) => {
  if (!file) {
    ElMessage.error('请选择要上传的照片')
    return false
  }
  tempPhotoFiles.value[index] = file
  applyForm.members[index].photoList = [{ name: file.name, url: URL.createObjectURL(file) }]
  ElMessage.success('照片已选择，提交时会自动上传')
  return true
}

// 6. 批量上传照片（修复响应解析）
const uploadAllPhotos = async () => {
  if (Object.keys(tempPhotoFiles.value).length === 0) return true

  try {
    for (const [index, file] of Object.entries(tempPhotoFiles.value)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('workId', workId.value)

      // 关键：直接使用 request.post，路径不带 /api（request 已配置）
      const response = await request.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // 精准解析：直接取 response.data（后端返回的 {code, data, message}）
      const res = response.data

      if (res.code !== 200) {
        throw new Error(`第${Number(index)+1}名队员照片上传失败：${res.message || '服务器异常'}`)
      }
      applyForm.members[index].photoList = [res.data]
    }
    return true
  } catch (error) {
    ElMessage.error(error.message || '照片批量上传失败')
    return false
  }
}

// 7. 提交报名（核心修复：精准解析响应 + 错误捕获）
const submitApply = () => {
  applyFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完善表单必填信息')
      return
    }

    try {
      ElMessage.info('正在生成作品ID...')
      // 步骤1：生成作品ID（路径：/team/generateWorkId，request 会拼接为 /api/team/generateWorkId）
      const idResponse = await request.get('/team/generateWorkId')
      const idRes = idResponse.data // 直接取后端返回的响应体

      if (idRes.code !== 200) {
        ElMessage.error(`作品ID生成失败：${idRes.message || '服务器返回异常'}`)
        return
      }
      workId.value = idRes.data

      // 步骤2：批量上传照片
      ElMessage.info('正在上传队员照片...')
      const uploadSuccess = await uploadAllPhotos()
      if (!uploadSuccess) return

      // 步骤3：提交报名信息
      ElMessage.info('正在提交报名信息...')
      const submitResponse = await request.post('/team/add', {
        ...applyForm,
        workId: workId.value
      })
      const submitRes = submitResponse.data

      if (submitRes.code === 200) {
        ElMessageBox({
          title: '提交成功',
          message: `报名成功！\n您的作品ID为：${submitRes.data}\n请妥善保存该ID用于后续作品提交和查询`,
          type: 'success',
          confirmButtonText: '确定'
        }).then(() => {
          resetForm()
        }).catch(() => {
          resetForm()
        })
        queryWorkId.value = workId.value
        tempPhotoFiles.value = {}
      } else {
        ElMessage.error(`报名失败：${submitRes.message || '服务器返回异常'}`)
      }
    } catch (error) {
      console.error("报名提交异常详情：", error) // 打印完整错误，便于排查
      // 精准捕获错误信息：优先取后端返回的 message，其次是网络错误
      const errMsg = error.response?.data?.message || error.message || '网络异常，报名失败'
      ElMessage.error(`报名失败：${errMsg}`)
    }
  })
}

// 8. 重置表单（保持不变）
const resetForm = () => {
  applyFormRef.value.resetFields()
  applyForm.members = [
    {
      name: '', gender: '', college: '', majorGrade: '', studentType: '',
      phone: '', email: '', photoList: []
    }
  ]
  applyForm.teacher1 = {
    name: '', gender: '', position: '', title: '', unit: '', email: '', phone: ''
  }
  applyForm.teacher2 = {
    name: '', gender: '', position: '', title: '', unit: '', email: '', phone: ''
  }
  workId.value = ''
  tempPhotoFiles.value = {}
}

// 9. 查询报名信息（修复响应解析）
const queryTeamInfo = async () => {
  if (!queryWorkId.value) {
    ElMessage.warning('请输入作品ID后查询')
    return
  }

  queryLoading.value = true
  showQueryResult.value = false
  queryResult.value = null

  try {
    const response = await request.get('/team/queryByWorkId', {
      params: { workId: queryWorkId.value }
    })
    const res = response.data

    if (res.code === 200) {
      queryResult.value = res.data
      showQueryResult.value = true
      ElMessage.success('查询报名信息成功')
    } else {
      ElMessage.error(`查询失败：${res.message || '服务器返回异常'}`)
    }
  } catch (error) {
    console.error("查询报名信息异常：", error)
    const errResponse = error.response?.data || {}
    const errMsg = errResponse.message || '网络异常，查询失败'
    ElMessage.error(`查询失败：${errMsg}`)
  } finally {
    queryLoading.value = false
  }
}

const clearQueryResult = () => {
  queryWorkId.value = ''
  queryResult.value = null
  showQueryResult.value = false
}
</script>

<template>
  <div class="apply-page">
    <div class="query-container">
      <div class="apply-container">
        <h2 class="page-title">查询报名信息</h2>
        <el-card class="apply-card query-card">
          <el-form inline class="query-form">
            <el-form-item label="作品ID">
              <el-input
                  v-model="queryWorkId"
                  placeholder="请输入作品ID查询报名信息"
                  clearable
                  class="query-input"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                  type="primary"
                  @click="queryTeamInfo"
                  :loading="queryLoading"
              >
                查询
              </el-button>
              <el-button @click="clearQueryResult">清空</el-button>
            </el-form-item>
          </el-form>

          <div v-if="showQueryResult && queryResult" class="query-result">
            <h3 class="result-title">报名信息详情</h3>
            <el-descriptions :column="2" border class="result-desc">
              <el-descriptions-item label="作品ID">{{ queryResult.workId }}</el-descriptions-item>
              <el-descriptions-item label="参赛组别">{{ queryResult.groupType }}</el-descriptions-item>
              <el-descriptions-item label="队伍名称">{{ queryResult.teamName }}</el-descriptions-item>
              <el-descriptions-item label="项目名称">{{ queryResult.projectName }}</el-descriptions-item>
              <el-descriptions-item label="报名学校">{{ queryResult.school }}</el-descriptions-item>
              <el-descriptions-item label="参赛专业">{{ queryResult.major }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{ queryResult.createTime }}</el-descriptions-item>
            </el-descriptions>

            <div class="result-section">
              <h4 class="section-title">队员信息</h4>
              <el-table
                  :data="queryResult.members"
                  border
                  style="width: 100%"
                  empty-text="暂无队员信息"
                  class="result-table"
              >
                <el-table-column label="序号" align="center" width="80">
                  <template #default="scope">{{ scope.$index + 1 }}</template>
                </el-table-column>
                <el-table-column label="姓名" prop="name" width="120" />
                <el-table-column label="性别" prop="gender" width="100" />
                <el-table-column label="学院" prop="college" min-width="150" />
                <el-table-column label="专业/年级" prop="majorGrade" min-width="180" />
                <el-table-column label="学生类型" prop="studentType" width="120" />
                <el-table-column label="手机号码" prop="phone" min-width="150" />
                <el-table-column label="电子邮箱" prop="email" min-width="200" />
              </el-table>
            </div>

            <div class="result-section">
              <h4 class="section-title">指导教师信息</h4>
              <el-card v-if="queryResult.teacher1" class="teacher-card-result">
                <h5>指导教师1</h5>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="姓名">{{ queryResult.teacher1.name }}</el-descriptions-item>
                  <el-descriptions-item label="性别">{{ queryResult.teacher1.gender }}</el-descriptions-item>
                  <el-descriptions-item label="职务">{{ queryResult.teacher1.position || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="职称">{{ queryResult.teacher1.title || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="单位">{{ queryResult.teacher1.unit }}</el-descriptions-item>
                  <el-descriptions-item label="手机号码">{{ queryResult.teacher1.phone }}</el-descriptions-item>
                  <el-descriptions-item label="电子邮箱" :span="2">{{ queryResult.teacher1.email || '-' }}</el-descriptions-item>
                </el-descriptions>
              </el-card>
              <el-card v-if="queryResult.teacher2 && queryResult.teacher2.name" class="teacher-card-result" style="margin-top: 10px;">
                <h5>指导教师2</h5>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="姓名">{{ queryResult.teacher2.name }}</el-descriptions-item>
                  <el-descriptions-item label="性别">{{ queryResult.teacher2.gender }}</el-descriptions-item>
                  <el-descriptions-item label="职务">{{ queryResult.teacher2.position || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="职称">{{ queryResult.teacher2.title || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="单位">{{ queryResult.teacher2.unit }}</el-descriptions-item>
                  <el-descriptions-item label="手机号码">{{ queryResult.teacher2.phone }}</el-descriptions-item>
                  <el-descriptions-item label="电子邮箱" :span="2">{{ queryResult.teacher2.email || '-' }}</el-descriptions-item>
                </el-descriptions>
              </el-card>
              <div v-if="!queryResult.teacher1 && !queryResult.teacher2" class="empty-tip">暂无指导教师信息</div>
            </div>
          </div>

          <div v-if="showQueryResult && !queryResult" class="empty-result">
            未查询到该作品ID的报名信息，请检查作品ID是否正确
          </div>
        </el-card>
      </div>
    </div>

    <div class="apply-container">
      <h2 class="page-title">大赛报名表</h2>
      <el-card class="apply-card">
        <el-form
            :model="applyForm"
            :rules="applyRules"
            ref="applyFormRef"
            label-width="120px"
            class="apply-form"
        >
          <el-form-item label="参赛组别" prop="groupType">
            <el-select v-model="applyForm.groupType" placeholder="请选择参赛组别" class="form-select">
              <el-option label="A、医学诊疗技术与器械组" value="A" />
              <el-option label="B、生物医学信息工程组" value="B" />
              <el-option label="C、生物材料与组织工程组" value="C" />
              <el-option label="D、其他" value="D" />
            </el-select>
          </el-form-item>

          <el-form-item label="队伍名称" prop="teamName">
            <el-input v-model="applyForm.teamName" placeholder="请输入队伍名称（不超过20字）" class="form-input" />
          </el-form-item>
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="applyForm.projectName" placeholder="请输入参赛项目名称" class="form-input" />
          </el-form-item>
          <el-form-item label="报名学校" prop="school">
            <el-input v-model="applyForm.school" placeholder="如：安徽医科大学" class="form-input" />
          </el-form-item>
          <el-form-item label="参赛专业" prop="major">
            <el-input v-model="applyForm.major" placeholder="如：生物医学工程、医学信息工程" class="form-input" />
          </el-form-item>

          <el-form-item label="队员信息" prop="members">
            <div class="member-table-wrap">
              <el-table
                  :data="applyForm.members"
                  border
                  style="width: 100%"
                  class="member-table"
              >
                <el-table-column label="序号" align="center" width="80">
                  <template #default="scope">{{ scope.$index + 1 }}</template>
                </el-table-column>
                <el-table-column label="姓名" prop="name" width="120">
                  <template #default="scope">
                    <el-input v-model="scope.row.name" placeholder="请输入姓名" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="性别" prop="gender" width="100">
                  <template #default="scope">
                    <el-select v-model="scope.row.gender" placeholder="请选择" size="small">
                      <el-option label="男" value="男" />
                      <el-option label="女" value="女" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="学院" prop="college" min-width="150">
                  <template #default="scope">
                    <el-input v-model="scope.row.college" placeholder="请输入学院" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="专业/年级" prop="majorGrade" min-width="180">
                  <template #default="scope">
                    <el-input v-model="scope.row.majorGrade" placeholder="如：医学信息工程/2023级" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="学生类型" prop="studentType" width="120">
                  <template #default="scope">
                    <el-select v-model="scope.row.studentType" placeholder="请选择" size="small">
                      <el-option label="本科" value="本科" />
                      <el-option label="硕" value="硕" />
                      <el-option label="博" value="博" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="手机号码" prop="phone" min-width="150">
                  <template #default="scope">
                    <el-input v-model="scope.row.phone" placeholder="请输入手机号" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="电子邮箱" prop="email" min-width="200">
                  <template #default="scope">
                    <el-input v-model="scope.row.email" placeholder="请输入电子邮箱" size="small" />
                  </template>
                </el-table-column>
                <el-table-column label="学生证照片" prop="studentIdPhoto" min-width="200">
                  <template #default="scope">
                    <el-upload
                        class="upload-photo"
                        :action="photoUploadUrl"
                        :file-list="scope.row.photoList"
                        :limit="1"
                        :auto-upload="true"
                        :http-request="(uploadOptions) => handlePhotoUpload(uploadOptions.file, scope.$index)"
                        accept="image/*"
                    >
                      <el-button size="mini" type="primary">上传照片</el-button>
                    </el-upload>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="scope">
                    <el-button
                        type="danger"
                        size="mini"
                        @click="removeMember(scope.$index)"
                        :disabled="applyForm.members.length <= 1"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <el-button type="primary" size="small" @click="addMember" style="margin-top: 10px">
              添加队员
            </el-button>
            <div class="form-tip">
              注：每队最少1人，最多5人，指导老师最多2人；每人需上传学生证照片（清晰可辨）
            </div>
          </el-form-item>

          <el-form-item label="指导教师1" prop="teacher1.name">
            <el-card shadow="hover" class="teacher-card">
              <el-form :model="applyForm.teacher1" label-width="100px">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="applyForm.teacher1.name" placeholder="请输入指导教师姓名" size="small" />
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                  <el-select v-model="applyForm.teacher1.gender" placeholder="请选择" size="small">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
                <el-form-item label="职务" prop="position">
                  <el-input v-model="applyForm.teacher1.position" placeholder="如：教授、讲师" size="small" />
                </el-form-item>
                <el-form-item label="职称" prop="title">
                  <el-input v-model="applyForm.teacher1.title" placeholder="如：博士生导师" size="small" />
                </el-form-item>
                <el-form-item label="单位" prop="unit">
                  <el-input v-model="applyForm.teacher1.unit" placeholder="如：安徽医科大学生物医学工程学院" size="small" />
                </el-form-item>
                <el-form-item label="电子邮箱" prop="email">
                  <el-input v-model="applyForm.teacher1.email" placeholder="请输入电子邮箱" size="small" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="applyForm.teacher1.phone" placeholder="请输入手机号码" size="small" />
                </el-form-item>
              </el-form>
            </el-card>
          </el-form-item>

          <el-form-item label="指导教师2（可选）" prop="teacher2.name">
            <el-card shadow="hover" class="teacher-card">
              <el-form :model="applyForm.teacher2" label-width="100px">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="applyForm.teacher2.name" placeholder="请输入指导教师姓名" size="small" />
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                  <el-select v-model="applyForm.teacher2.gender" placeholder="请选择" size="small">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
                <el-form-item label="职务" prop="position">
                  <el-input v-model="applyForm.teacher2.position" placeholder="如：教授、讲师" size="small" />
                </el-form-item>
                <el-form-item label="职称" prop="title">
                  <el-input v-model="applyForm.teacher2.title" placeholder="如：博士生导师" size="small" />
                </el-form-item>
                <el-form-item label="单位" prop="unit">
                  <el-input v-model="applyForm.teacher2.unit" placeholder="如：安徽医科大学生物医学工程学院" size="small" />
                </el-form-item>
                <el-form-item label="电子邮箱" prop="email">
                  <el-input v-model="applyForm.teacher2.email" placeholder="请输入电子邮箱" size="small" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="applyForm.teacher2.phone" placeholder="请输入手机号码" size="small" />
                </el-form-item>
              </el-form>
            </el-card>
          </el-form-item>

          <el-form-item class="form-btn-group">
            <el-button type="primary" size="default" @click="submitApply">提交报名</el-button>
            <el-button size="default" @click="resetForm">重置表单</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.apply-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
  overflow-x: hidden;
  background-color: #f5f7fa;
  padding-bottom: 30px;
}
.apply-container {
  max-width: 1200px;
  width: 95%;
  margin: 30px auto;
  box-sizing: border-box;
  @media (max-width: 768px) {
    margin: 15px auto;
    width: 98%;
  }
}
/* 新增：查询模块样式 */
.query-container {
  background-color: #fff;
  padding-top: 20px;
}
.query-card {
  margin-top: 10px;
}
.query-form {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}
.query-input {
  width: 300px;
  @media (max-width: 768px) {
    width: 100%;
  }
}
.query-result {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #e6e6e6;
}
.result-title {
  font-size: 16px;
  color: #c7254e;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #428bca;
}
.result-section {
  margin-top: 20px;
}
.section-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}
.result-desc {
  margin-bottom: 15px;
}
.result-table {
  --el-table-header-text-color: #fff;
  --el-table-header-bg-color: #428bca;
  font-size: 12px;
  @media (max-width: 768px) {
    font-size: 11px;
  }
}
.teacher-card-result {
  padding: 10px;
}
.empty-result, .empty-tip {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}
/* 原有样式 */
.page-title {
  color: #c7254e;
  margin-bottom: 20px;
  border-bottom: 2px solid #428bca;
  padding-bottom: 10px;
  font-size: 20px;
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 15px;
    padding-bottom: 8px;
  }
}
.apply-card {
  border: 1px solid #428bca;
  padding: 20px;
  background-color: #fff;
  @media (max-width: 768px) {
    padding: 10px;
  }
}
.teacher-card {
  margin-top: 10px;
  padding: 15px;
  border-color: #e6f7ff;
  @media (max-width: 768px) {
    padding: 10px;
    margin-top: 8px;
  }
}
.member-table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 10px;
  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
}
.member-table {
  --el-table-header-text-color: #fff;
  --el-table-header-bg-color: #428bca;
  @media (max-width: 768px) {
    font-size: 12px;
  }
}
:deep(.member-table .el-table__cell) {
  padding: 8px 5px;
  @media (max-width: 768px) {
    padding: 6px 3px;
  }
}
:deep(.apply-form .el-form-item__label) {
  @media (max-width: 768px) {
    width: 80px !important;
    font-size: 12px;
  }
}
:deep(.teacher-card .el-form-item__label) {
  @media (max-width: 768px) {
    width: 70px !important;
    font-size: 12px;
  }
}
:deep(.teacher-card .el-input__inner) {
  width: 100%;
  min-width: 200px;
}
:deep(.el-input__inner::placeholder) {
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.upload-photo .el-upload--picture-card {
  display: none;
}
.form-tip {
  color: #c7254e;
  font-size: 12px;
  margin-top: 5px;
  line-height: 1.5;
  margin-left: 10px;
  @media (max-width: 768px) {
    font-size: 11px;
    margin-left: 5px;
    margin-top: 3px;
  }
}
:deep(.form-input), :deep(.form-select) {
  width: 100%;
  @media (max-width: 768px) {
    font-size: 12px;
  }
}
:deep(.el-form-item.form-btn-group) {
  width: 100% ;
  margin-left: 0;
  margin-right: 0 ;
  padding-left: 0 ;
  padding-right: 0 ;
}
.form-btn-group {
  width: 100% ;
  display: flex ;
  flex-direction: row ;
  justify-content: flex-start ;
  align-items: center ;
  gap: 0 ;
  margin-top: 15px ;
  margin-left: 120px;
}
:deep(.form-btn-group .el-button) {
  padding: 10px 20px ;
  font-size: 14px ;
  margin: 0 ;
}
@media (max-width: 768px) {
  .form-btn-group {
    flex-direction: column ;
    align-items: stretch ;
    gap: 12px;
    margin-left: 0 ;
  }
  :deep(.form-btn-group .el-button) {
    width: 100%;
    padding: 12px 0 ;
    text-align: center ;
  }
}
:deep(.el-form-item) {
  margin-bottom: 18px;
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
}
:deep(.el-input), :deep(.el-select) {
  @media (max-width: 768px) {
    font-size: 12px;
  }
}
:deep(.el-button--small) {
  @media (max-width: 768px) {
    padding: 5px 10px;
  }
}
:deep(.el-button--mini) {
  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>