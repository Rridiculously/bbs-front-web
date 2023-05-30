<template>
    <div class="error">
      <div class="xx">
        <div class="info">404</div>
        <router-link :to="'/'">返回首页</router-link>
      </div>
    </div>
</template>

<script>

</script>

<style lang="scss" scoped>
.error{
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .xx{
    display: flex;
    flex-direction: column;
    align-items: center;
    .info{
      font-size: 80px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    a{
      color: #6ca1f7;
      font-size: 30px;
    }
  }
}
</style>
