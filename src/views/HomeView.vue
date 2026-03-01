<script setup>
const getNoticeUrl = (fileName) => {
  return `${import.meta.env.BASE_URL}templates/${encodeURIComponent(fileName)}`;
};
</script>

<template>
  <div class="home-page">
    <div  class="banner-container">
      <div class="banner-text">
        <h1>医工科创·守护健康</h1>
        <p>第一届安徽省大学生生物医学工程创新设计大赛</p>
      </div>
    </div>

    <div class="home-modules">
      <div class="module-item">
        <el-card header="大赛通知" class="module-card">
          <el-list>
            <el-list-item>
              <a :href="getNoticeUrl('关于举办第一届安徽省大学生生物医学工程创新设计大赛的第一轮通知.docx')" target="_blank">关于举办第一届安徽省大学生生物医学工程创新设计大赛的第一轮通知</a>
            </el-list-item>
            <br><br>
          </el-list>
        </el-card>
      </div>

      <div class="module-item">
        <el-card header="赛事流程" class="module-card">
          <el-timeline>
            <el-timeline-item timestamp="即日起" placement="top">报名启动</el-timeline-item>
            <el-timeline-item timestamp="2026.05.01" placement="top">作品提交截止</el-timeline-item>
            <el-timeline-item timestamp="2026.05.10" placement="top">初赛评审</el-timeline-item>
            <el-timeline-item timestamp="2026.06.18" placement="top">决赛答辩</el-timeline-item>
            <el-timeline-item timestamp="2025.06.19" placement="top">结果公示</el-timeline-item>
          </el-timeline>
        </el-card>
      </div>

      <div class="module-item">
        <el-card header="参赛要求" class="module-card">
          <el-descriptions column="1" border>
            <el-descriptions-item label="参赛对象">安徽省内各高校本硕博全日制在读学生</el-descriptions-item>
            <el-descriptions-item label="作品要求">围绕医疗仪器、智能医学信息处理、生物材料相关领域，需贴合生物医学工程学科特点，具备创新性与实际应用价值</el-descriptions-item>
            <el-descriptions-item label="组队要求">以团队形式参赛，团队人数控制在5人以内，最多2名指导教师,鼓励跨学科专业组队，不可跨校组队</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.banner-container {
  margin-bottom: 50px;
  width: 100%;
  height: 400px;
  background-image: url('@/assets/image/Home.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #2196F3;
  background-blend-mode: overlay;
  position: relative;
  @media (max-width: 768px) {
    height: 200px;
  }
}
.banner-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFFFFF;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  width: 95%;
  line-height: 1.2;
  z-index: 1;
}
.banner-text h1 {
  font-size: 100px;
  margin-bottom: 15px;
  line-height: 1.1;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 60px;
  }
  @media (max-width: 480px) {
    font-size: 45px;
  }
}
.banner-text p {
  font-size: 36px;
  line-height: 1.2;
  @media (max-width: 768px) {
    font-size: 24px;
  }
  @media (max-width: 480px) {
    font-size: 18px;
  }
}

.home-modules {
  width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}
.module-item {
  width: 100%;
}
.module-card {
  border: 1px solid #428bca;
}
.module-card :deep(.el-card__header) {
  background-color: #c7254e;
  color: #fff;
  font-weight: bold;
}
@media (max-width: 768px) {
  .home-modules {
    width: 95%;
    gap: 20px;
  }
}
</style>