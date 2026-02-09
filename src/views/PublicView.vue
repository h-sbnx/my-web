<script setup>
import { reactive } from 'vue'

// 测试公示数据（后续替换为后端接口返回数据）
const publicList = reactive([
  {
    id: 1,
    teamName: "医工先锋队",
    workId: "AHMU2025001",
    workName: "基于物联网的智能输液监控系统设计",
    awardLevel: "一等奖",
    publicTime: "2025-06-10"
  },
  {
    id: 2,
    teamName: "健康守护队",
    workId: "AHMU2025002",
    workName: "便携式心电信号采集与分析装置",
    awardLevel: "二等奖",
    publicTime: "2025-06-10"
  },
  {
    id: 3,
    teamName: "创新医工队",
    workId: "AHMU2025003",
    workName: "基于机器学习的肿瘤影像辅助诊断系统",
    awardLevel: "二等奖",
    publicTime: "2025-06-10"
  },
  {
    id: 4,
    teamName: "生工探索队",
    workId: "AHMU2025004",
    workName: "智能康复手套的设计与实现",
    awardLevel: "三等奖",
    publicTime: "2025-06-10"
  }
])

const getTagType = (level) => {
  switch (level) {
    case '一等奖': return 'danger'
    case '二等奖': return 'warning'
    case '三等奖': return 'primary'
    default: return 'info'
  }
}
</script>

<template>
  <div class="public-page">
    <!--赛事公示-->
    <div class="public-container">
      <h2 class="page-title">赛事公示</h2>
      <el-card class="public-card">
        <el-table
            :data="publicList"
            border
            style="width: 100%"
            class="public-table"
        >
          <el-table-column prop="id" label="序号" width="80" align="center" />
          <el-table-column prop="teamName" label="队伍名称" min-width="200" />
          <el-table-column prop="workId" label="作品ID" width="150" align="center" />
          <el-table-column prop="workName" label="作品名称" min-width="300" />
          <el-table-column prop="awardLevel" label="获奖等级" width="120" align="center">
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.awardLevel)">{{ scope.row.awardLevel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="publicTime" label="公示时间" width="180" align="center" />
        </el-table>

        <div class="public-tip">
          <p>公示时间：2025年6月10日-6月17日</p>
          <p>公示期间如有异议，请联系大赛组委会：0551-6516XXXX（巢老师）</p>
        </div>
      </el-card>
    </div>

  </div>
</template>

<style scoped>
.public-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
}
.public-container {
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
.public-card {
  border: 1px solid #428bca;
  padding: 20px;
}
.public-table {
  --el-table-header-text-color: #fff;
  --el-table-header-bg-color: #c7254e;
  margin-bottom: 20px;
}
.public-tip {
  color: #666;
  line-height: 1.8;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
}
</style>