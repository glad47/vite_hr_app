<template>
  <view class="help-container">
    <view v-for="(item, findex) in list" :key="findex" :title="item.title" class="list-title">
      <view class="text-title">
        <view :class="item.icon"></view>{{ item.title }}
      </view>
      <view class="childList">
        <view v-for="(child, zindex) in item.childList" :key="zindex" class="question" hover-class="hover"
          @click="handleText(child)">
          <view class="text-item">{{ child.title }}</view>
          <view class="line" v-if="zindex !== item.childList.length - 1"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        list: [{
            icon: 'iconfont icon-github',
            title: 'أسئلة النظام',
            childList: [{
              title: 'هل النظام مفتوح المصدر؟',
              content: 'مفتوح المصدر'
            }, {
              title: 'هل يمكن استخدام النظام تجارياً؟',
              content: 'نعم'
            }, {
              title: 'ما هو عنوان الموقع الرسمي؟',
              content: 'http://ruoyi.vip'
            }, {
              title: 'ما هو عنوان الوثائق؟',
              content: 'http://doc.ruoyi.vip'
            }]
          },
          {
            icon: 'iconfont icon-help',
            title: 'أسئلة أخرى',
            childList: [{
              title: 'كيفية تسجيل الخروج؟',
              content: 'الرجاء النقر على [الخاص بي] - [إعدادات التطبيق] - [تسجيل الخروج] لتسجيل الخروج',
            }, {
              title: 'كيفية تعديل صورة المستخدم؟',
              content: 'الرجاء النقر على [الخاص بي] - [اختيار الصورة] - [النقر على إرسال] لتغيير صورة المستخدم',
            }, {
              title: 'كيفية تعديل كلمة مرور تسجيل الدخول؟',
              content: 'الرجاء النقر على [الخاص بي] - [إعدادات التطبيق] - [تغيير كلمة المرور] لتعديل كلمة مرور تسجيل الدخول',
            }]
          }
        ]
      }
    },
    methods: {
      handleText(item) {
        this.$tab.navigateTo(`/pages/common/textview/index?title=${item.title}&content=${item.content}`)
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #f8f8f8;
  }

  .help-container {
    margin-bottom: 100rpx;
    padding: 30rpx;
  }

  .list-title {
    margin-bottom: 30rpx;
  }

  .childList {
    background: #ffffff;
    box-shadow: 0px 0px 10rpx rgba(193, 193, 193, 0.2);
    border-radius: 16rpx;
    margin-top: 10rpx;
  }

  .line {
    width: 100%;
    height: 1rpx;
    background-color: #F5F5F5;
  }

  .text-title {
    color: #303133;
    font-size: 32rpx;
    font-weight: bold;
    margin-left: 10rpx;

    .iconfont {
      font-size: 16px;
      margin-right: 10rpx;
    }
  }

  .text-item {
    font-size: 28rpx;
    padding: 24rpx;
  }

  .question {
    color: #606266;
    font-size: 28rpx;
  }
</style>
