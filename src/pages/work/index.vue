<template>
  <view class="work-container">
    <!-- بانر الشرائح -->
    <uni-swiper-dot class="uni-swiper-dot-box" :info="bannerData" :current="current" field="content">
      <swiper class="swiper-box" :current="swiperDotIndex" @change="changeSwiper" :autoplay="true" :interval="4000" :circular="true">
        <swiper-item v-for="(item, index) in bannerData" :key="index">
          <view class="swiper-item" @click="clickBannerItem(item)">
            <image :src="item.image" mode="aspectFill" :draggable="false" />
          </view>
        </swiper-item>
      </swiper>
    </uni-swiper-dot>

    <!-- العمليات المتاحة - Available Operations -->
    <view class="section-header" v-if="isSupervisor">
      <view class="section-line"></view>
      <text class="section-title">العمليات المتاحة</text>
      <view class="section-line"></view>
    </view>
    
    <view class="operations-grid" v-if="isSupervisor">
      <uni-grid :column="3" :showBorder="false" :square="false" @change="navigateToOperation">
        
        <!-- السلف - Advance -->
        <uni-grid-item :index="0">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-blue">
              <uni-icons type="wallet-filled" size="32" color="#2563eb"></uni-icons>
            </view>
            <text class="operation-text">السلف</text>
          </view>
        </uni-grid-item>

        <!-- الخصومات - Deduction -->
        <uni-grid-item :index="1">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-red">
              <uni-icons type="minus-filled" size="32" color="#dc2626"></uni-icons>
            </view>
            <text class="operation-text">الخصومات</text>
          </view>
        </uni-grid-item>

        <!-- الإضافات - Addition -->
        <uni-grid-item :index="2">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-green">
              <uni-icons type="plus-filled" size="32" color="#16a34a"></uni-icons>
            </view>
            <text class="operation-text">الإضافات</text>
          </view>
        </uni-grid-item>

        <!-- طلبات الإجازات - Leave -->
        <uni-grid-item :index="3">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-cyan">
              <uni-icons type="calendar-filled" size="32" color="#0891b2"></uni-icons>
            </view>
            <text class="operation-text">طلبات الإجازات</text>
          </view>
        </uni-grid-item>

        <!-- تغيير البصمة - Punch -->
        <uni-grid-item :index="4">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-orange">
              <uni-icons type="hand-thumbsup-filled" size="32" color="#ea580c"></uni-icons>
            </view>
            <text class="operation-text">تغيير البصمة</text>
          </view>
        </uni-grid-item>

        <!-- الاستئذان - Request -->
        <uni-grid-item :index="5">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-purple">
              <uni-icons type="paperplane-filled" size="32" color="#9333ea"></uni-icons>
            </view>
            <text class="operation-text">الاستئذان</text>
          </view>
        </uni-grid-item>

        <!-- العجوزات - Deficit -->
        <uni-grid-item :index="6">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-rose">
              <uni-icons type="flag-filled" size="32" color="#e11d48"></uni-icons>
            </view>
            <text class="operation-text">العجوزات</text>
          </view>
        </uni-grid-item>

      </uni-grid>


      <uni-grid :column="3" :showBorder="false" :square="false" @change="navigateToSupervisor">

         <!-- Approval -->
        <uni-grid-item :index="0">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-orange">
              <uni-icons type="hand-thumbsup-filled" size="32" color="#ea580c"></uni-icons>
            </view>
            <text class="operation-text">طلباتي</text>
          </view>
        </uni-grid-item>

        <!-- Employees -->
        <uni-grid-item :index="1">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-purple">
              <uni-icons type="paperplane-filled" size="32" color="#9333ea"></uni-icons>
            </view>
            <text class="operation-text">المرؤوسين</text>
          </view>
        </uni-grid-item>

        <!-- العجوزات - Deficit -->
        <uni-grid-item :index="2">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-rose">
              <uni-icons type="flag-filled" size="32" color="#e11d48"></uni-icons>
            </view>
            <text class="operation-text">الشفتات</text>
          </view>
        </uni-grid-item>

        <!-- تسجيل الانصراف - Punch Out -->
        <uni-grid-item :index="3">
          <view class="grid-item-box">
            <view class="icon-wrapper icon-green">
              <uni-icons type="camera-filled" size="32" color="#16a34a"></uni-icons>
            </view>
            <text class="operation-text">تسجيل الانصراف</text>
          </view>
        </uni-grid-item>


      </uni-grid>



    </view>

    <!-- إحصائيات سريعة - Quick Stats -->
    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-icon">
          <uni-icons type="compose" size="24" color="#2563eb"></uni-icons>
        </view>
        <view class="stat-content">
          <text class="stat-number">{{ totalOperations }}</text>
          <text class="stat-label">إجمالي العمليات</text>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-icon">
          <uni-icons type="notification-filled" size="24" color="#ea580c"></uni-icons>
        </view>
        <view class="stat-content">
          <text class="stat-number">{{ pendingRequests }}</text>
          <text class="stat-label">طلبات معلقة</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      current: 0,
      swiperDotIndex: 0,
      totalOperations: 0,
      pendingRequests: 0,
      bannerData: [
        {
          image: '/static/images/banner/banner01.jpg'
        },
        {
          image: '/static/images/banner/banner02.jpg'
        },
        {
          image: '/static/images/banner/banner03.jpg'
        }
      ],
      operations: [
        { name: 'advance', label: 'السلف', route: '/pages/operations/advance' },
        { name: 'deduction', label: 'الخصومات', route: '/pages/operations/dedection' },
        { name: 'addition', label: 'الإضافات', route: '/pages/operations/addition' },
        { name: 'leave', label: 'طلبات الإجازات', route: '/pages/operations/leave' },
        { name: 'punch', label: 'تغيير البصمة', route: '/pages/operations/change_punch' },
        { name: 'request', label: 'الاستئذان', route: '/pages/operations/request' },
        { name: 'deficit', label: 'العجوزات', route: '/pages/operations/deficit' }
      ],
      supervisor: [
        { name: 'approval', label: 'طلباتي', route: '/pages/supervisor/approval' },
        { name: 'employees', label: 'المرؤوسين', route: '/pages/supervisor/employees' },
        { name: 'shifts', label: 'الشفتات', route: '/pages/supervisor/shifts' },
        { name: 'punchout', label: 'تسجيل الانصراف', route: '/pages/supervisor/punchout' }
      ]
    }
  },
  computed: {
    userInfo() {
      return this.$store?.state?.user?.hrUser || null
    },
    isSupervisor() {
      if (!this.userInfo) return false
      const supervisorValue = this.userInfo.isSupervisor
      return !!(supervisorValue === true || supervisorValue === 'true' || supervisorValue === 1 || supervisorValue === '1' || supervisorValue === 'yes')
    }
  },
  onLoad() {
    this.loadStatistics()
  },
  methods: {
    clickBannerItem(item) {
      console.log('Banner clicked:', item)
    },
    changeSwiper(e) {
      this.current = e.detail.current
    },
    navigateToOperation(e) {
      const index = e.detail.index
      const operation = this.operations[index]
      
      console.log('Navigate to:', operation.name)
      
      // Navigate to the operation page
      uni.navigateTo({
        url: operation.route,
        fail: (err) => {
          console.error('Navigation failed:', err)
          this.$modal.showToast(`جاري تطوير صفحة ${operation.label}`)
        }
      })
    },

    navigateToSupervisor(e) {
      const index = e.detail.index
      const supervisor = this.supervisor[index]
      
      console.log('Navigate to:', supervisor.name)
      
      // Navigate to the operation page
      uni.navigateTo({
        url: supervisor.route,
        fail: (err) => {
          console.error('Navigation failed:', err)
          this.$modal.showToast(`جاري تطوير صفحة ${supervisor.label}`)
        }
      })
    },
    loadStatistics() {
      // Load statistics from API
      // This is a placeholder - you'll replace with actual API calls
      this.totalOperations = 25
      this.pendingRequests = 5
    }
  }
}
</script>

<style lang="scss" scoped>
/* #ifndef APP-NVUE */
page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #f8f9fa;
  min-height: 100%;
  height: auto;
}

view {
  font-size: 14px;
  line-height: inherit;
}
/* #endif */

.work-container {
  padding-bottom: 40rpx;
  background-color: #f8f9fa;
}

/* Swiper Styles */
.uni-swiper-dot-box {
  margin: 20rpx 20rpx 30rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  background: #fff;
}

.swiper-box {
  height: 300rpx;
  border-radius: 12rpx;
}

.swiper-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  border-radius: 12rpx;
  overflow: hidden;
  
  image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40rpx 30rpx 30rpx;
}

.section-line {
  flex: 1;
  height: 2rpx;
  background-color: #e5e7eb;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  padding: 0 20rpx;
  letter-spacing: 1rpx;
}

/* Operations Grid */
.operations-grid {
  margin: 0 20rpx;
  background-color: transparent;
}

.grid-item-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 15rpx;
  margin: 10rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  min-height: 160rpx;
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.08);
    background: #fafafa;
  }
}

.icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.operation-text {
  text-align: center;
  font-size: 26rpx;
  color: #374151;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

/* Icon Color Backgrounds */
.icon-blue {
  background-color: #dbeafe;
}

.icon-red {
  background-color: #fee2e2;
}

.icon-cyan {
  background-color: #cffafe;
}

.icon-green {
  background-color: #dcfce7;
}

.icon-orange {
  background-color: #fed7aa;
}

.icon-purple {
  background-color: #f3e8ff;
}

.icon-rose {
  background-color: #ffe4e6;
}

.icon-indigo {
  background-color: #e0e7ff;
}

.icon-teal {
  background-color: #ccfbf1;
}

.icon-amber {
  background-color: #fef3c7;
}

/* Stats Section */
.stats-section {
  display: flex;
  justify-content: space-between;
  margin: 40rpx 30rpx 20rpx;
  flex-wrap: wrap;
  gap: 20rpx;
}

.stat-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx 25rpx;
  flex: 1;
  min-width: 300rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}

.stat-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  background-color: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

/* Responsive Design */
@media screen and (min-width: 500px) {
  .uni-swiper-dot-box {
    width: 500px;
    margin: 30rpx auto;
  }
  
  .operations-grid {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .stats-section {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>