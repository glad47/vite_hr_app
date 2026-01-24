<template>
  <view class="normal-login-container">
    <view class="logo-content align-center justify-center flex">
      <image style="width: 100rpx;height: 100rpx;" :src="globalConfig.appInfo.logo" mode="widthFix">
      </image>
      <text class="title">تسجيل الدخول</text>
    </view>
    <view class="login-form-content">
      <view class="input-item flex align-center">
        <view class="iconfont icon-user icon"></view>
        <input v-model="loginForm.username" class="input" type="text" placeholder="الرجاء إدخال اسم المستخدم" maxlength="30" />
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input v-model="loginForm.password" type="password" class="input" placeholder="الرجاء إدخال كلمة المرور" maxlength="20" />
      </view>
      <view class="input-item flex align-center" style="width: 60%;margin: 0px;" v-if="captchaEnabled">
        <view class="iconfont icon-code icon"></view>
        <input v-model="loginForm.code" type="number" class="input" placeholder="الرجاء إدخال رمز التحقق" maxlength="4" />
        <view class="login-code"> 
          <image :src="codeUrl" @click="getCode" class="login-code-img"></image>
        </view>
      </view>
      <view class="action-btn">
        <button @click="handleLogin" class="login-btn cu-btn block bg-blue lg round">تسجيل الدخول</button>
      </view>
      <view class="reg text-center" v-if="register">
        <text class="text-grey1">ليس لديك حساب؟</text>
        <text @click="handleUserRegister" class="text-blue">التسجيل الآن</text>
      </view>
      <view class="xieyi text-center">
        <text class="text-grey1">تسجيل الدخول يعني الموافقة على</text>
        <text @click="handleUserAgrement" class="text-blue">《اتفاقية المستخدم》</text>
        <text @click="handlePrivacy" class="text-blue">《اتفاقية الخصوصية》</text>
      </view>
    </view>
     
  </view>
</template>

<script>
  import { getCodeImg } from '@/api/login'
  import { getToken } from '@/utils/auth'
  import { useUserStore } from '@/store/modules/user'

  export default {
    data() {
      return {
        codeUrl: "",
        captchaEnabled: true,
        register: false,
        globalConfig: getApp().globalData.config,
        loginForm: {
          username: "admin",
          password: "admin123",
          code: "",
          uuid: ""
        }
      }
    },
    created() {
      this.getCode()
    },
    onLoad() {
      //#ifdef H5
      if (getToken()) {
        this.$tab.reLaunch('/pages/index')
      }
      //#endif
    },
    methods: {
      handleUserRegister() {
        this.$tab.redirectTo(`/pages/register`)
      },
      handlePrivacy() {
        let site = this.globalConfig.appInfo.agreements[0]
        this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
      },
      handleUserAgrement() {
        let site = this.globalConfig.appInfo.agreements[1]
        this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
      },
      getCode() {
        getCodeImg().then(res => {
          this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
          if (this.captchaEnabled) {
            this.codeUrl = 'data:image/gif;base64,' + res.img
            this.loginForm.uuid = res.uuid
          }
        })
      },
      async handleLogin() {
        if (this.loginForm.username === "") {
          this.$modal.msgError("الرجاء إدخال اسم المستخدم")
        } else if (this.loginForm.password === "") {
          this.$modal.msgError("الرجاء إدخال كلمة المرور")
        } else if (this.loginForm.code === "" && this.captchaEnabled) {
          this.$modal.msgError("الرجاء إدخال رمز التحقق")
        } else {
          this.$modal.loading("جاري تسجيل الدخول، يرجى الانتظار...")
          this.pwdLogin()
        }
      },
      async pwdLogin() {
        const userStore = useUserStore()
        try {
          await userStore.Login(this.loginForm)
          this.$modal.closeLoading()
          this.loginSuccess()
        } catch (error) {
          this.$modal.closeLoading()
          if (this.captchaEnabled) {
            this.getCode()
          }
        }
      },
      async loginSuccess() {
        const userStore = useUserStore()
        try {
          await userStore.GetInfo()
          this.$tab.reLaunch('/pages/index')
        } catch (error) {
          console.error('GetInfo failed:', error)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #ffffff;
  }

  .normal-login-container {
    width: 100%;

    .logo-content {
      width: 100%;
      font-size: 21px;
      text-align: center;
      padding-top: 15%;

      image {
        border-radius: 4px;
      }

      .title {
        margin-left: 10px;
      }
    }

    .login-form-content {
      text-align: center;
      margin: 20px auto;
      margin-top: 15%;
      width: 80%;

      .input-item {
        margin: 20px auto;
        background-color: #f5f6f7;
        height: 45px;
        border-radius: 20px;

        .icon {
          font-size: 38rpx;
          margin-left: 10px;
          color: #999;
        }

        .input {
          width: 100%;
          font-size: 14px;
          line-height: 20px;
          text-align: left;
          padding-left: 15px;
        }

      }

      .login-btn {
        margin-top: 40px;
        height: 45px;
      }
      
      .reg {
        margin-top: 15px;
      }
      
      .xieyi {
        color: #333;
        margin-top: 20px;
      }
      
      .login-code {
        height: 38px;
        float: right;
      
        .login-code-img {
          height: 38px;
          position: absolute;
          margin-left: 10px;
          width: 200rpx;
        }
      }
    }
  }
</style>
