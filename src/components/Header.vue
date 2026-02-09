<script setup>
// 无需额外逻辑，仅依赖路由跳转
</script>

<template>
  <header class="header-container">
    <!-- 左侧徽标区域 -->
    <div class="logo-area">
      <img src="@/assets/image/school-logo.png" alt="安徽医科大学校徽" class="logo-img" />
      <img src="@/assets/image/school-name.png" alt="安徽医科大学校名" class="school-name" />
    </div>

    <!-- 右侧菜单栏 -->
    <nav class="nav-menu">
      <router-link
          to="/"
          class="nav-item"
          active-class="active-nav"
          exact
      >
        首页
      </router-link>
      <router-link
          to="/notice"
          class="nav-item"
          active-class="active-nav"
      >
        赛事通知
      </router-link>
      <router-link
          to="/apply"
          class="nav-item"
          active-class="active-nav"
      >
        报名入口
      </router-link>
      <router-link
          to="/templates"
          class="nav-item"
          active-class="active-nav"
      >
        模板下载
      </router-link>
      <router-link
          to="/upload"
          class="nav-item"
          active-class="active-nav"
      >
        作品提交
      </router-link>
      <router-link
          to="/public"
          class="nav-item"
          active-class="active-nav"
      >
        赛事公示
      </router-link>
      <router-link
          to="/about"
          class="nav-item"
          active-class="active-nav"
      >
        关于大赛
      </router-link>
      <router-link
          to="/contact"
          class="nav-item"
          active-class="active-nav"
      >
        联系方式
      </router-link>
    </nav>
  </header>
</template>

<style scoped>
.header-container {
  width: 100%;
  height: 80px;
  background-color: #fff;
  border-bottom: 2px solid #c7254e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 999;
  box-sizing: border-box;
}


.logo-area {
  display: flex;
  align-items: center;
  gap: 60px;
  margin-left: 70px;
}
.logo-img {
  width: 78px;
  height: 78px;
  object-fit: contain;

}


.school-name {
  height: 70px;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  font-size: 16px;
  color: #666;
  text-decoration: none;
  font-family: "微软雅黑";
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.active-nav, .nav-item:hover {
  color: #fff;
  background-color: #c7254e;
}

@media (max-width: 992px) {
  .header-container {
    flex-direction: column;
    height: auto;
    padding: 10px 20px;
  }
  .nav-menu {
    margin-top: 10px;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>