<template>
  <view class="normal-login-container">
    <view class="logo-content align-center justify-center flex">
      <image style="width: 100rpx;height: 100rpx;" :src="globalConfig.appInfo.logo" mode="widthFix">
      </image>
      <text class="title">التسجيل</text>
    </view>
    <view class="login-form-content">
      <view class="input-item flex align-center">
        <view class="iconfont icon-user icon"></view>
        <input v-model="registerForm.username" class="input" type="text" placeholder="الرجاء إدخال اسم المستخدم" maxlength="30" />
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input v-model="registerForm.password" type="password" class="input" placeholder="الرجاء إدخال كلمة المرور" maxlength="20" />
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input v-model="registerForm.confirmPassword" type="password" class="input" placeholder="الرجاء إعادة إدخال كلمة المرور" maxlength="20" />
      </view>
      <view class="input-item flex align-center" style="width: 60%;margin: 0px;" v-if="captchaEnabled">
        <view class="iconfont icon-code icon"></view>
        <input v-model="registerForm.code" type="number" class="input" placeholder="الرجاء إدخال رمز التحقق" maxlength="4" />
        <view class="login-code"> 
          <image :src="codeUrl" @click="getCode" class="login-code-img"></image>
        </view>
      </view>
      <view class="action-btn">
        <button @click="handleRegister()" class="register-btn cu-btn block bg-blue lg round">التسجيل</button>
      </view>
    </view>
    <view class="xieyi text-center">
      <text @click="handleUserLogin" class="text-blue">استخدم حساب موجود لتسجيل الدخول</text>
    </view>
  </view>
</template>

<script>
  import { getCodeImg, register } from '@/api/login'

  export default {
    data() {
      return {
        codeUrl: "",
        captchaEnabled: true,
        globalConfig: getApp().globalData.config,
        registerForm: {
          username: "",
          password: "",
          confirmPassword: "",
          code: "",
          uuid: ""
        }
      }
    },
    created() {
      this.getCode()
    },
    methods: {
      // تسجيل دخول المستخدم
      handleUserLogin() {
        this.$tab.navigateTo(`/pages/login`)
      },
      // الحصول على رمز التحقق الرسومي
      getCode() {
        getCodeImg().then(res => {
          this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
          if (this.captchaEnabled) {
            this.codeUrl = 'data:image/gif;base64,' + res.img
            this.registerForm.uuid = res.uuid
          }
        })
      },
      // طريقة التسجيل
      async handleRegister() {
        if (this.registerForm.username === "") {
          this.$modal.msgError("الرجاء إدخال اسم المستخدم")
        } else if (this.registerForm.password === "") {
          this.$modal.msgError("الرجاء إدخال كلمة المرور")
        } else if (this.registerForm.confirmPassword === "") {
          this.$modal.msgError("الرجاء إعادة إدخال كلمة المرور")
        } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
          this.$modal.msgError("كلمات المرور المدخلة غير متطابقة")
        } else if (this.registerForm.code === "" && this.captchaEnabled) {
          this.$modal.msgError("الرجاء إدخال رمز التحقق")
        } else {
          this.$modal.loading("جاري التسجيل، يرجى الانتظار...")
          this.register()
        }
      },
      // تسجيل المستخدم
      async register() {
        register(this.registerForm).then(res => {
          this.$modal.closeLoading()
          uni.showModal({
          	title: "تنبيه النظام",
          	content: "تهانينا، تم تسجيل حسابك " + this.registerForm.username + " بنجاح！",
          	success: function (res) {
          		if (res.confirm) {
                uni.redirectTo({ url: `/pages/login` });
          		}
          	}
          })
        }).catch(() => {
          if (this.captchaEnabled) {
            this.getCode()
          }
        })
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

      .register-btn {
        margin-top: 40px;
        height: 45px;
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
