<script>
import config from './config'
import { getToken } from '@/utils/auth'

export default {
  onLaunch() {
    console.log('App Launch')
    this.initApp()
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  globalData: {
    config: null
  },
  methods: {
    initApp() {
      this.initConfig()
      // #ifdef H5
      this.checkLogin()
      // #endif
    },
    initConfig() {
      this.globalData.config = config
    },
    checkLogin() {
      if (!getToken()) {
        uni.reLaunch({
          url: '/pages/login'
        })
      }
    }
  }
}
</script>

<style lang="scss">
@use '@/static/scss/index.scss' as *;
</style>