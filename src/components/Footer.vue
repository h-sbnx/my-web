<script setup>
</script>

<template>
  <footer class="footer-container">

    <div class="footer-left">
      <img src="@/assets/image/college-logo.png" alt="生物医学工程学院院徽" class="footer-logo" />
      <div class="name-group">
        <div class="full-name">安徽医科大学生物医学工程学院</div>
        <div class="eng-name">School of Biomedical Engineering</div>
      </div>
    </div>

    <div class="footer-middle">
      <p>© 2025 安徽医科大学生物医学工程学院 版权所有</p>
      <p>皖ICP备XXXXXXXX号（替换为学校真实备案号）</p>
    </div>

  </footer>
</template>


<style scoped>
.footer-container {
  width: 100%;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 30px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6c757d;
  font-family: "微软雅黑";
  margin-top: 50px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-logo {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.name-group {
  line-height: 1.5;
}

.full-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.eng-name {
  font-size: 12px;
  color: #6c757d;
}

.footer-middle {
  text-align: center;
  font-size: 14px;
  line-height: 1.8;
}

@media (max-width: 992px) {
  .footer-container {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 20px 20px;
  }
  .footer-left {
    flex-direction: column;
  }
}
</style>