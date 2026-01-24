<template>
  <view class="container">
    <view class="example">
      <uni-forms ref="form" :model="user" labelWidth="80px">
        <uni-forms-item label="الاسم المستعار" name="nickName">
          <uni-easyinput v-model="user.nickName" placeholder="الرجاء إدخال الاسم المستعار" />
        </uni-forms-item>
        <uni-forms-item label="رقم الهاتف" name="phonenumber">
          <uni-easyinput v-model="user.phonenumber" placeholder="الرجاء إدخال رقم الهاتف" />
        </uni-forms-item>
        <uni-forms-item label="البريد الإلكتروني" name="email">
          <uni-easyinput v-model="user.email" placeholder="الرجاء إدخال البريد الإلكتروني" />
        </uni-forms-item>
        <uni-forms-item label="الجنس" name="sex" required>
          <uni-data-checkbox v-model="user.sex" :localdata="sexs" />
        </uni-forms-item>
      </uni-forms>
      <button type="primary" @click="submit">إرسال</button>
    </view>
  </view>
</template>

<script>
  import { getUserProfile } from "@/api/system/user"
  import { updateUserProfile } from "@/api/system/user"

  export default {
    data() {
      return {
        user: {
          nickName: "",
          phonenumber: "",
          email: "",
          sex: ""
        },
        sexs: [{
          text: 'ذكر',
          value: "0"
        }, {
          text: 'أنثى',
          value: "1"
        }],
        rules: {
          nickName: {
            rules: [{
              required: true,
              errorMessage: 'الاسم المستعار لا يمكن أن يكون فارغاً'
            }]
          },
          phonenumber: {
            rules: [{
              required: true,
              errorMessage: 'رقم الهاتف لا يمكن أن يكون فارغاً'
            }, {
              pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
              errorMessage: 'الرجاء إدخال رقم هاتف صحيح'
            }]
          },
          email: {
            rules: [{
              required: true,
              errorMessage: 'عنوان البريد الإلكتروني لا يمكن أن يكون فارغاً'
            }, {
              format: 'email',
              errorMessage: 'الرجاء إدخال عنوان بريد إلكتروني صحيح'
            }]
          }
        }
      }
    },
    onLoad() {
      this.getUser()
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      getUser() {
        getUserProfile().then(response => {
          this.user = response.data
        })
      },
      submit(ref) {
        this.$refs.form.validate().then(res => {
          updateUserProfile(this.user).then(response => {
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

  .example {
    padding: 15px;
    background-color: #fff;
  }

  .segmented-control {
    margin-bottom: 15px;
  }

  .button-group {
    margin-top: 15px;
    display: flex;
    justify-content: space-around;
  }

  .form-item {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .button {
    display: flex;
    align-items: center;
    height: 35px;
    line-height: 35px;
    margin-left: 10px;
  }
</style>
