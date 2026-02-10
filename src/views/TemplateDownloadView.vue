<script setup>
import { ElMessage } from 'element-plus'

// 模板下载函数
const downloadTemplate = (fileName) => {
  try {
    const templateUrl = `${import.meta.env.BASE_URL}templates/${encodeURIComponent(fileName)}`;
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    ElMessage.error(`《${fileName}》下载失败：${error.message}`);
    console.error('下载错误：', error);
  }
};
</script>

<template>
  <div class="template-page">
<!--模板下载-->
    <div class="template-container">
      <h2 class="page-title">竞赛模板下载</h2>
      <el-card class="template-card">
        <el-descriptions column="1" border class="template-desc">

          <!-- 附件1：报名表（重复提供下载） -->
          <el-descriptions-item label="参赛报名表（附件1）">
            <div class="template-item">
              <el-button
                  type="primary"
                  icon="el-icon-download"
                  @click="downloadTemplate('参赛报名表（附件1）.doc')"
              >
                下载模板
              </el-button>
            </div>
          </el-descriptions-item>
          <!-- 附件2：推荐参赛表 -->
          <el-descriptions-item label="推荐参赛表（附件2）">
            <div class="template-item">
              <el-button
                  type="primary"
                  icon="el-icon-download"
                  @click="downloadTemplate('推荐参赛表（附件2）.docx')"
              >
                下载模板
              </el-button>
            </div>
          </el-descriptions-item>
          <!-- 附件3：项目设计报告模板 -->
          <el-descriptions-item label="项目设计报告模板（附件3）">
            <div class="template-item">
              <el-button
                  type="primary"
                  icon="el-icon-download"
                  @click="downloadTemplate('项目设计报告模板（附件3）.docx')"
              >
                下载模板
              </el-button>
            </div>
          </el-descriptions-item>

        </el-descriptions>

        <div class="template-tip">
          <h4>下载说明：</h4>
          <ul>
            <li>模板文件均为Word格式，下载后可直接编辑</li>
            <li>推荐参赛表需经指导教师签字、单位盖章后，扫描为PDF格式随作品提交</li>
            <li>项目设计报告需按模板结构完整填写，作品ID号需与报名后获取的一致</li>
          </ul>
        </div>
      </el-card>
    </div>

  </div>
</template>

<style scoped>
.template-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
}
.template-container {
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
.template-card {
  border: 1px solid #428bca;
  padding: 20px;
}
.template-desc {
  --el-descriptions-label-color: #333;
  --el-descriptions-content-color: #666;
}
.template-item {
  margin: 15px 0;
  line-height: 2;
}
.template-tip {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #ccc;
  color: #666;
}
.template-tip ul {
  padding-left: 20px;
  line-height: 1.8;
  margin-top: 10px;
}
</style>