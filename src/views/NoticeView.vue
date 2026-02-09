<script setup>
import { ref, reactive } from 'vue'

// 测试通知数据（后续替换为后端接口返回数据）
const noticeList = reactive([
  {
    id: 1,
    title: "关于举办第一届安徽省大学生生物医学工程创新设计大赛的第一轮通知",
    time: "2025-02-10",
    brief: "大赛报名启动、作品要求、时间安排等核心信息",
    content: `
      <p>各相关高校：</p>
      <p>为推动安徽省生物医学工程专业人才培养，提升大学生创新设计能力，决定举办第一届安徽省大学生生物医学工程创新设计大赛，现将有关事项通知如下：</p>
      <h4>一、组织机构</h4>
      <p>主办单位：安徽省教育厅</p>
      <p>承办单位：安徽医科大学生物医学工程学院</p>
      <h4>二、参赛对象</h4>
      <p>安徽省各高校生物医学工程及相关专业全日制本科生</p>
      <h4>三、报名时间</h4>
      <p>2025年3月1日-4月10日</p>
      <h4>四、作品提交</h4>
      <p>请于2025年4月15日前提交完整作品包至指定平台</p>
    `
  },
  {
    id: 2,
    title: "大赛报名截止时间延期通知",
    time: "2025-03-20",
    brief: "因部分高校反馈报名时间紧张，报名截止时间延期至4月15日",
    content: `
      <p>各参赛高校：</p>
      <p>应各高校参赛团队要求，经大赛组委会研究决定，现将第一届安徽省大学生生物医学工程创新设计大赛报名截止时间延期至2025年4月15日，作品提交截止时间不变（4月20日）。</p>
      <p>请各参赛团队合理安排时间，按时完成报名及作品提交。</p>
      <p>大赛组委会</p>
      <p>2025年3月20日</p>
    `
  }
])

// 弹窗控制
const dialogVisible = ref(false)
const currentNotice = reactive({})

// 点击行查看详情
const handleRowClick = (row) => {
  Object.assign(currentNotice, row)
  dialogVisible.value = true
}
</script>

<template>
  <div class="notice-page">
<!--    赛事通知-->
    <div class="notice-container">
      <h2 class="page-title">赛事通知</h2>
      <el-table
          :data="noticeList"
          border
          style="width: 100%"
          @row-click="handleRowClick"
          class="notice-table"
      >
        <el-table-column prop="id" label="序号" width="80" align="center" />
        <el-table-column prop="title" label="通知标题" min-width="400" />
        <el-table-column prop="time" label="发布时间" width="180" align="center" />
        <el-table-column prop="brief" label="内容简介" min-width="300" />
      </el-table>

      <!-- 通知详情弹窗 -->
      <el-dialog
          v-model="dialogVisible"
          title="通知详情"
          width="70%"
          destroy-on-close
      >
        <div class="notice-detail">
          <h3>{{ currentNotice.title }}</h3>
          <p class="detail-time">发布时间：{{ currentNotice.time }}</p>
          <div class="detail-content" v-html="currentNotice.content"></div>
        </div>
      </el-dialog>
    </div>

  </div>
</template>

<style scoped>
.notice-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
}
.notice-container {
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
.notice-table {
  --el-table-header-text-color: #fff;
  --el-table-header-bg-color: #c7254e;
}
.notice-detail {
  padding: 20px 0;
  line-height: 1.8;
}
.detail-time {
  color: #666;
  margin-bottom: 20px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 10px;
}
.detail-content {
  font-size: 16px;
}
</style>