<template>
  <div class="home">
    <h2>Home页面</h2>
    <el-button type="primary" @click="toMyTableBtnClickHandle">点击跳转myTable页面</el-button>
  </div>
</template>

<script>

export default {
  name: 'Home',
  methods: {
    toMyTableBtnClickHandle() {
      this.$router.push({
        path: '/myTable'
      })
    }
  }
}
</script>
