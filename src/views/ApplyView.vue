<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
// 数据采集
const applyForm = reactive({
  groupType: '',
  teamName: '',
  projectName: '',
  school: '',
  major: '',
  //学生信息
  members: [
    {
      name: '', gender: '', college: '', majorGrade: '', studentType: '',
      phone: '', email: '', photoList: []
    }
  ],
  // 指导教师信息
  teacher1: {
    name: '', gender: '', position: '', title: '', unit: '', email: '', phone: ''
  },
  teacher2: {
    name: '', gender: '', position: '', title: '', unit: '', email: '', phone: ''
  }
})

// 表单验证
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
        const valid = value.every(member =>
            member.name && member.gender && member.college && member.majorGrade &&
            member.studentType && member.phone && member.photoList.length > 0
        )
        valid ? callback() : callback(new Error('请完善所有队员信息（含学生证照片）'))
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
// 照片上传路径（实际项目需替换为后端接口）
const photoUploadUrl = 'http://localhost:8080/api/comp/file/uploadPhoto'

// 增删队员
const addMember = () => {
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
  applyForm.members.splice(index, 1)
}

// 处理学生证照片上传
const handlePhotoChange = (uploadFile, index) => {
  applyForm.members[index].photoList = uploadFile.fileList
}

// 提交报名
const submitApply = () => {
  applyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await request.post('/team/add', applyForm)
        if (res.data.code === 200) {
          ElMessage.success(`报名成功！您的作品ID为：${res.data.data.workId}`)
          resetForm()
        } else {
          ElMessage.error(res.data.msg || '报名失败，请重试')
        }
      } catch (error) {
        ElMessage.error('网络异常，报名失败')
      }
    } else {
      ElMessage.error('请完善表单必填信息')
    }
  })
}

// 重置表单
const resetForm = () => {
  applyFormRef.value.resetFields()
  applyForm.members = [
    {
      name: '', gender: '', college: '', majorGrade: '', studentType: '',
      phone: '', email: '', photoList: []
    }
  ]
  applyForm.teacher2 = {
    name: '', gender: '', position: '', title: '', unit: '', email: '', phone: ''
  }
}
</script>

<template>
  <div class="apply-page">
    <!--报名入口-->
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
        <!-- 基础信息 -->
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

        <!-- 队员信息表格 -->
        <el-form-item label="队员信息" prop="members">
          <!-- 移动端表格外层加滚动容器 -->
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
                      :auto-upload="false"
                      accept="image/*"
                      @change="(uploadFile) => handlePhotoChange(uploadFile, scope.$index)"
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
            注：每队最少1人，最多5人；每人需上传学生证照片（清晰可辨）
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