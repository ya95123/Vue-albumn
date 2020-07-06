<template lang="pug">
  #app
    b-navbar(toggleable="lg" type="light" variant="light")
      b-container
        //- Bootstrap-vue 有跟 vue-router 做結合，所以可以直接用 to="" router寫法
        b-navbar-brand(to="/") 相簿
        b-navbar-toggle(target='nav-collapse')
        b-collapse#nav-collapse(is-nav)
          b-navbar-nav.ml-auto
            b-nav-item(v-if="user.length === 0" to="/login") 登入
            b-nav-item(v-else to="/album") 我的相簿
            b-nav-item(v-if="user.length === 0" to="/reg") 註冊
            //- 沒登出頁，有登入後才會出現"登出"
            b-nav-item(v-else @click="logout") 登出
    b-container
      router-view
</template>

<script>
export default {
  name: 'app',
  computed: {
    user () {
      return this.$store.getters.user
    }
  },
  methods: {
    logout () {
      this.axios.delete(process.env.VUE_APP_APIURL + '/logout')
        .then(response => {
          const data = response.data
          if (data.success) {
            // 如果回來的資料 success 是 true
            alert('登出成功')
            // 呼叫 vuex 的登出
            this.$store.commit('logout')
            // 如果現在不是在首頁，登出後就跳到的首頁
            if (this.$route.path !== '/') {
              this.$router.push('/')
            }
          } else {
            // 不是就顯示回來的 message
            alert(data.message)
          }
        })
        .catch(error => {
          // 如果回來的狀態不是 200，顯示回來的 message
          alert(error.response.data.message)
        })
    },
    heartbeat () {
      this.axios.get(process.env.VUE_APP_APIURL + '/heartbeat')
        .then(response => {
          const data = response.data

          // 如果是登入中
          if (this.user.length > 0) {
            // 如果後端登入時間過期
            if (!data) {
              this.$store.commit('logout')
              // 如果現在不是在首頁，跳到登出後的首頁
              if (this.$route.path !== '/') {
                this.$router.push('/')
              }
            }
          }
        })
        .catch(() => {
          alert('發生錯誤')
          this.$store.commit('logout')
          // 如果現在不是在首頁，跳到登出後的首頁
          if (this.$route.path !== '/') {
            this.$router.push('/')
          }
        })
    }
  },
  mounted () {
    this.heartbeat()
    setInterval(() => {
      this.heartbeat()
    }, 1000 * 60)
  }
}
</script>

<style>
 *{
   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, '微軟正黑體';
 }
</style>
