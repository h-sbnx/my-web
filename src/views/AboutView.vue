<script setup>
</script>

<template>
  <div class="about-page">
<!--    赛事相关介绍-->
    <div class="about-container">
      <h2 class="page-title">关于大赛</h2>
      <el-row :gutter="20" class="about-content">

        <el-col  class="about-right">
          <el-card class="about-card" header="赛事组织机构">
            <el-descriptions column="1" border>
              <el-descriptions-item label="主办单位">安徽省生物医学工程学会</el-descriptions-item>
              <el-descriptions-item label="承办单位">安徽医科大学生物医学工程学院</el-descriptions-item>
              <el-descriptions-item label="协办单位">中国科技大学生命科学与医学部-生物医学工程学院、合肥工业大学仪器科学与光电工程学院<br>蚌埠医科大学医学影像学院、皖南医学院医学影像学院</el-descriptions-item>
              <el-descriptions-item label="组委会">主任：XXX <br/>副主任：XXX </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="about-card" header="参赛对象及要求" style="margin-top: 20px">
            <el-row :gutter="20">
              <el-col :span="12">
                <h4>参赛对象</h4>
                <ul class="about-list">
                  <li>安徽省内各高校本硕博全日制在读学生（决赛时已毕业的学生不能参赛）</li>
                  <li>以团队形式参赛，团队人数控制在5人以内，最多2名指导教师</li>
                  <li>鼓励跨学科专业组队，不可跨校组队，各院校参赛队数不限</li>
                </ul>
              </el-col>
              <el-col :span="12">
                <h4>作品要求</h4>
                <ul class="about-list">
                  <li>竞赛作品选题主要为医疗仪器、智能医学信息处理、生物材料相关领域</li>
                  <li>参赛队应尽可能设计并制作出能够反映生物医学工程学科特点的参赛作品</li>
                  <li>参赛作品需为原创，无知识产权纠纷，严禁抄袭</li>
                </ul>
              </el-col>
            </el-row>
          </el-card>

          <el-card class="about-card" header="赛事流程" style="margin-top: 20px">
            <el-timeline>
              <el-timeline-item label="报名阶段">
                各参赛团队通过大赛官网完成报名，提交队伍及指导教师信息
              </el-timeline-item>
              <el-timeline-item  label="作品提交阶段">
                各队伍提交相关作品材料
              </el-timeline-item>
              <el-timeline-item  label="初赛评审阶段">
                专家评审组对作品进行初审，遴选出三等奖作品并公示晋级决赛的队伍。
              </el-timeline-item>
              <el-timeline-item  label="决赛答辩阶段">
                进入决赛的队伍前往安徽医科大学进行现场PPT汇报与作品展示，专家现场评审打分
              </el-timeline-item>
              <el-timeline-item  label="结果公示阶段">
                公示获奖名单，接受异议申诉
              </el-timeline-item>
              <el-timeline-item  label="颁奖仪式">
                举办颁奖仪式，颁发获奖证书及奖品
              </el-timeline-item>
            </el-timeline>
          </el-card>

          <el-card class="about-card" header="赛事奖励" style="margin-top: 20px">
            <el-descriptions column="1" border>
              <el-descriptions-item label="奖项设置">
                <ul class="about-list">
                  <li>一等奖：参赛队伍总数的10%，颁发证书+奖励</li>
                  <li>二等奖：参赛队伍总数的20%，颁发证书+奖励</li>
                  <li>三等奖：参赛队伍总数的30%，颁发证书+奖励</li>
                </ul>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<style scoped>
.about-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
}
.about-container {
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
.about-content {
  align-items: flex-start;
}
.about-right {
  width: 100%;
}
.about-card {
  border: 1px solid #428bca;
}
.about-card :deep(.el-card__header) {
  background-color: #c7254e;
  color: #fff;
  font-weight: bold;
}
.about-list {
  line-height: 1.8;
  margin: 10px 0;
  padding-left: 20px;
}
</style>