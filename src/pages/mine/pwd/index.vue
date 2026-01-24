<template>
  <view class="pwd-retrieve-container">
    <uni-forms ref="form" :value="user" labelWidth="80px">
      <uni-forms-item name="oldPassword" label="كلمة المرور القديمة">
        <uni-easyinput type="password" v-model="user.oldPassword" placeholder="الرجاء إدخال كلمة المرور القديمة" />
      </uni-forms-item>
      <uni-forms-item name="newPassword" label="كلمة المرور الجديدة">
        <uni-easyinput type="password" v-model="user.newPassword" placeholder="الرجاء إدخال كلمة المرور الجديدة" />
      </uni-forms-item>
      <uni-forms-item name="confirmPassword" label="تأكيد كلمة المرور">
        <uni-easyinput type="password" v-model="user.confirmPassword" placeholder="الرجاء تأكيد كلمة المرور الجديدة" />
      </uni-forms-item>
      <button type="primary" @click="submit">إرسال</button>
    </uni-forms>
  </view>
</template>

<script>
  import { updateUserPwd } from "@/api/system/user"

  export default {
    data() {
      return {
        user: {
          oldPassword: undefined,
          newPassword: undefined,
          confirmPassword: undefined
        },
        rules: {
          oldPassword: {
            rules: [{
              required: true,
              errorMessage: 'كلمة المرور القديمة لا يمكن أن تكون فارغة'
            }]
          },
          newPassword: {
            rules: [{
                required: true,
                errorMessage: 'كلمة المرور الجديدة لا يمكن أن تكون فارغة',
              },
              {
                minLength: 6,
                maxLength: 20,
                errorMessage: 'الطول من 6 إلى 20 حرفاً'
              }
            ]
          },
          confirmPassword: {
            rules: [{
                required: true,
                errorMessage: 'تأكيد كلمة المرور لا يمكن أن يكون فارغاً'
              }, {
                validateFunction: (rule, value, data) => data.newPassword === value,
                errorMessage: 'كلمات المرور المدخلة غير متطابقة'
              }
            ]
          }
        }
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      submit() {
        this.$refs.form.validate().then(res => {
          updateUserPwd(this.user.oldPassword, this.user.newPassword).then(response => {
            this.$modal.msgSuccess("تم التعديل بنجاح")
          })
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #ffffff;
  }

  .pwd-retrieve-container {
    padding-top: 36rpx;
    padding: 15px;
  }
</style>
