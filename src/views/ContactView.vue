<script setup>
</script>

<template>
  <div class="contact-page">
    <div class="contact-container">
      <h2 class="page-title">联系方式</h2>
      <el-row :gutter="20" class="contact-content">

        <el-col class="contact-right">
          <el-card class="contact-card">
            <el-descriptions column="1" border class="contact-desc">
              <el-descriptions-item label="大赛组委会办公室">
                <el-row :gutter="10" class="contact-item">
                  <el-col :span="8"><strong>地址：</strong></el-col>
                  <el-col :span="16">安徽医科大学（梅山路校区）尚学西楼423</el-col>
                </el-row>
                <el-row :gutter="10" class="contact-item">
                  <el-col :span="8"><strong>邮编：</strong></el-col>
                  <el-col :span="16">230032</el-col>
                </el-row>
              </el-descriptions-item>

              <el-descriptions-item label="赛事咨询">
                <el-row :gutter="10" class="contact-item">
                  <el-col :span="8"><strong>负责人：</strong></el-col>
                  <el-col :span="16">巢春燕老师</el-col>
                </el-row>
                <el-row :gutter="10" class="contact-item">
                  <el-col :span="8"><strong>联系电话：</strong></el-col>
                  <el-col :span="16">15256540495（工作日9:00-17:00）</el-col>
                </el-row>
                <el-row :gutter="10" class="contact-item">
                  <el-col :span="8"><strong>电子邮箱：</strong></el-col>
                  <el-col :span="16">chaocy@ahmu.edu.cn</el-col>
                </el-row>
                <el-row :gutter="10" class="contact-item">
                  <el-col :span="8"><strong>QQ交流群：</strong></el-col>
                  <el-col :span="16">XXXXXX</el-col>
                </el-row>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
}
.contact-container {
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
.contact-content {
  justify-content: center;
  align-items: flex-start;
}

.contact-right {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}
.contact-card {
  border: 1px solid #428bca;
}
.contact-card :deep(.el-card__header) {
  background-color: #c7254e;
  color: #fff;
  font-weight: bold;
}
.contact-desc {
  --el-descriptions-label-color: #333;
  --el-descriptions-content-color: #666;
}
.contact-item {
  line-height: 2;
  margin: 5px 0;
}
</style>