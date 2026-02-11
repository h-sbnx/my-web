<script setup>
import { ref, reactive, computed } from 'vue'
// 模拟按年份分组的通知数据
const noticeData = reactive({
 2026: [
    {
      id: 1,
      title: "关于举办第一届安徽省大学生生物医学工程创新设计大赛的第一轮通知",
      time: "2026-02-10",
      fileUrl: "/templates/2025第一轮通知.pdf",
      fileName: "2025第一届安徽省大学生生物医学工程创新设计大赛第一轮通知"
    },
    {
      id: 2,
      title: "大赛报名截止时间延期通知",
      time: "2026-03-20",
      fileUrl: "/templates/2025延期通知.pdf",
      fileName: "2025大赛报名截止时间延期通知"
    }
  ],
})
// 当前选中的年份
const currentYear = ref("2026")
// 当前年份对应的通知列表（计算属性）
const currentYearNotices = computed(() => noticeData[currentYear.value] || [])
// 当前选中的通知与索引
const currentNotice = ref(null)
const currentNoticeIndex = ref(-1)
// 年份切换事件
const handleYearChange = (year) => {
  currentYear.value = year
  currentNotice.value = null
}
// 通知项点击事件
const handleNoticeClick = (item, index) => {
  currentNotice.value = item
  currentNoticeIndex.value = index
}
// 上一个/下一个通知导航
const navigateNotice = (type) => {
  if (type === "prev" && currentNoticeIndex.value > 0) {
    currentNoticeIndex.value--
  } else if (type === "next" && currentNoticeIndex.value < currentYearNotices.value.length - 1) {
    currentNoticeIndex.value++
  }
  currentNotice.value = currentYearNotices.value[currentNoticeIndex.value]
}
</script>

<template>
  <div class="notice-page">

    <div class="notice-container">
      <div class="notice-sidebar">
        <div class="sidebar-title">赛事通知</div>
        <el-menu
            default-active="2026"
            class="year-menu"
            @select="handleYearChange"
        >
          <el-menu-item index="2026">2026年通知</el-menu-item>
          <el-menu-item index="2025">2025年通知</el-menu-item>
        </el-menu>
      </div>

      <div class="notice-content">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/notice' }">赛事通知</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentYear }}年通知</el-breadcrumb-item>
        </el-breadcrumb>

        <div v-if="!currentNotice" class="notice-list-wrap">
          <el-list class="notice-list">
            <el-list-item
                v-for="(item, index) in currentYearNotices"
                :key="item.id"
                @click="handleNoticeClick(item, index)"
                class="notice-item"
            >
              <template #default>
                <span class="notice-title">{{ item.title }}</span>
                <span class="notice-time">{{ item.time }}</span>
              </template>
            </el-list-item>
          </el-list>
        </div>

        <div v-else class="notice-detail-wrap">
          <h3 class="detail-title">{{ currentNotice.title }}</h3>
          <div class="detail-content">
            <a
                :href="currentNotice.fileUrl"
                target="_blank"
                class="pdf-link"
            >
              {{ currentNotice.fileName }}.pdf
            </a>
          </div>

          <div class="nav-buttons">
            <el-button
                type="text"
                @click="navigateNotice('prev')"
                :disabled="currentNoticeIndex === 0"
            >
              上一个
            </el-button>
            <el-button
                type="text"
                @click="navigateNotice('next')"
                :disabled="currentNoticeIndex === currentYearNotices.length - 1"
            >
              下一个
            </el-button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.notice-page {
  width: 100%;
  min-height: 100vh;
  font-family: "微软雅黑";
  overflow-x: hidden;
}

.notice-container {
  width: 90%;
  max-width: 1200px;
  margin: 30px auto;
  display: flex;
  gap: 20px;
  @media (max-width: 768px) {
    width: 98%;
    margin: 15px auto;
    flex-direction: column;
    gap: 15px;
  }
}

.notice-sidebar {
  width: 200px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 100%;
  }
}

.sidebar-title {
  background-color: #C7254E;
  color: #FFFFFF;
  padding: 12px 15px;
  font-weight: bold;
  font-size: 16px;
  border-radius: 2px 2px 0 0;
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 14px;
  }
}
.year-menu {
  border: 1px solid #E6E6E6;
  border-top: none;
  background-color: #FFFFFF;
}
.year-menu :deep(.el-menu-item) {
  padding-left: 20px !important;
  height: 42px;
  line-height: 42px;
  color: #283747;
  @media (max-width: 768px) {
    height: 38px;
    line-height: 38px;
    font-size: 13px;
    padding-left: 15px !important;
  }
}
.year-menu :deep(.el-menu-item.is-active) {
  background-color: #F8E0E6;
  color: #C7254E;
  font-weight: 500;
}
.year-menu :deep(.el-menu-item:hover) {
  background-color: #F8E0E6;
}
.notice-content {
  flex: 1;
  border: 1px solid #E6E6E6;
  padding: 20px;
  background-color: #FFFFFF;
  border-radius: 2px;
  @media (max-width: 768px) {
    padding: 10px;
  }
}
:deep(.el-breadcrumb) {
  background-color: #C7254E;
  color: #FFFFFF;
  padding: 10px 15px;
  margin-bottom: 25px;
  border-radius: 2px;
  @media (max-width: 768px) {
    padding: 8px 10px;
    margin-bottom: 15px;
    font-size: 13px;
  }
}
:deep(.el-breadcrumb__item__inner) {
  color: #FFFFFF !important;
}
:deep(.el-breadcrumb__separator) {
  color: #FFFFFF !important;
  margin: 0 8px;
}

.notice-list-wrap {
  border-top: 1px solid #E6E6E6;
  margin-top: 10px;
}
.notice-item {
  border-bottom: 1px dashed #E6E6E6;
  padding: 12px 0;
  cursor: pointer;
  color: #283747;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 768px) {
    padding: 10px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
.notice-item:hover {
  background-color: #F8E0E6;
  padding-left: 8px;
  transition: padding-left 0.2s ease;
}
.notice-title {
  display: inline-block;
  width: 78%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  margin-right: 15px;
  @media (max-width: 768px) {
    width: 100%;
    font-size: 13px;
    margin-right: 0;
  }
}
.notice-time {
  flex-shrink: 0;
  color: #666666;
  font-size: 14px;
  white-space: nowrap;
  @media (max-width: 768px) {
    font-size: 12px;
    width: 100%;
    text-align: left;
    color: #999;
  }
}
.notice-detail-wrap {
  padding: 20px 0;
  @media (max-width: 768px) {
    padding: 10px 0;
  }
}
.detail-title {
  color: #C7254E;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #F8E0E6;
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 20px;
    padding: 0 10px 10px;
  }
}
.pdf-link {
  display: block;
  text-align: center;
  color: #283747;
  font-size: 16px;
  text-decoration: underline;
  margin: 20px 0;
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 0 10px;
    margin: 15px 0;
  }
}
.pdf-link:hover {
  color: #C7254E;
  text-decoration: none;
}
.nav-buttons {
  text-align: right;
  margin-top: 40px;
  @media (max-width: 768px) {
    margin-top: 20px;
    font-size: 13px;
  }
}
.nav-buttons :deep(.el-button) {
  color: #283747;
  font-size: 14px;
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 5px 8px;
  }
}
.nav-buttons :deep(.el-button:hover) {
  color: #C7254E;
}
.nav-buttons :deep(.el-button:disabled) {
  color: #999999;
  cursor: not-allowed;
}
</style>