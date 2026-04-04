<template>
  <div class="app-container home">
    <div class="welcome-message">
      مرحبًا بك في نظام كيو
    </div>
  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      version: "3.9.0"
    }
  },
  methods: {
    goTarget(href) {
      window.open(href, "_blank")
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 18px;
  color: #2c3e50;
  background-color: #f9f9f9;
  direction: rtl;

  .welcome-message {
    padding: 20px 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
