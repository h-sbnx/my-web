<script setup>
</script>

<template>
  <div class="home-page">
<!--    首页-->
    <el-carousel height="400px" indicator-position="bottom" class="home-carousel">
      <el-carousel-item>
        <div class="carousel-item">
          <img src="@/assets/image/ca2e82be-83ef-4ad4-9f32-f28dc4876e99.png" alt="大赛主题图" class="carousel-img" />
          <div class="carousel-text">
            <h1>医工科创 守护健康</h1>
            <p>第一届安徽省大学生生物医学工程创新设计大赛</p>
          </div>
        </div>
      </el-carousel-item>
      <el-carousel-item>
        <div class="carousel-item">
          <img src="@/assets/image/college-logo.png" alt="安医大生工学院" class="carousel-img" />
          <div class="carousel-text">
            <h1>安徽医科大学生物医学工程学院</h1>
            <p>以赛促学 · 以赛促创</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 核心模块（卡片布局） -->
    <div class="home-modules">
      <div class="module-item">
        <el-card header="大赛通知" class="module-card">
          <el-list>
            <el-list-item>
              <a :href="`${import.meta.env.BASE_URL}templates/${encodeURIComponent('关于举办第一届安徽省大学生生物医学工程创新设计大赛的第一轮通知.doc')}`" target="_blank">关于举办第一届安徽省大学生生物医学工程创新设计大赛的第一轮通知</a>
            </el-list-item>
            <br><br>
<!--            <el-list-item>-->
<!--              <a href="#/notice">大赛报名截止时间延期通知</a>-->
<!--            </el-list-item>-->
          </el-list>
        </el-card>
      </div>

      <div class="module-item">
        <el-card header="赛事流程" class="module-card">
          <el-timeline>
            <el-timeline-item timestamp="2025.03.01" placement="top">报名启动</el-timeline-item>
            <el-timeline-item timestamp="2025.04.15" placement="top">作品提交截止</el-timeline-item>
            <el-timeline-item timestamp="2025.05.10" placement="top">初赛评审</el-timeline-item>
            <el-timeline-item timestamp="2025.06.01" placement="top">决赛答辩</el-timeline-item>
            <el-timeline-item timestamp="2025.06.10" placement="top">结果公示</el-timeline-item>
          </el-timeline>
        </el-card>
      </div>

      <div class="module-item">
        <el-card header="参赛要求" class="module-card">
          <el-descriptions column="1" border>
            <el-descriptions-item label="参赛对象">安徽省内各高校本硕博全日制在读学生（决赛时已毕业的学生不能参赛）</el-descriptions-item>
            <el-descriptions-item label="作品要求">围绕生物医学工程领域创新设计，包含完整设计方案、原型或仿真结果</el-descriptions-item>
            <el-descriptions-item label="组队要求">以团队形式参赛，团队人数控制在5人以内，最多2名指导教师,鼓励跨学科专业组队，不可跨校组队，各院校参赛队数不限</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <div class="module-item">
        <el-card header="赛事奖励" class="module-card">
          <el-descriptions column="1" border>
            <el-descriptions-item label="奖项设置">设一等奖、二等奖、三等奖，另设优秀指导教师奖</el-descriptions-item>
<!--        <el-descriptions-item label="奖励权益">获奖作品可推荐至省级创新创业大赛，优秀团队可获学院科研项目支持</el-descriptions-item>-->
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

/* 轮播图样式 */
.home-carousel {
  margin-bottom: 50px;
  width: 100%;
}
.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
}
.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}
.carousel-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #050505;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.carousel-text h1 {
  font-size: 40px;
  margin-bottom: 20px;
  @media (max-width: 768px) {
    font-size: 28px;
  }
}
.carousel-text p {
  font-size: 20px;
  @media (max-width: 768px) {
    font-size: 16px;
  }
}

/* 模块布局 */
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
  .home-carousel {
    height: 250px !important;
  }
}
</style>