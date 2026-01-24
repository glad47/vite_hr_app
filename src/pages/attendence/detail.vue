<template>
  <view class="attendance-container">
    <!-- Header Section -->
    <view class="header-section">
      <view class="header-card">
        <text class="main-title">شهادة الحضور والانصراف</text>
        <text class="employee-name">الموظف: {{ empName || 'جارٍ التحميل...' }}</text>
        <text class="date-info">الشهر: {{ monthName }} / السنة: {{ year }}</text>
        <text class="emp-id">الرقم الوظيفي: {{ empId }}</text>
      </view>
    </view>

    <!-- Cards Section -->
    <scroll-view scroll-y class="cards-container">
      <view v-if="dailyLogs && dailyLogs.length > 0" class="cards-list">
        <view 
          v-for="(log, index) in dailyLogs" 
          :key="index" 
          class="day-card"
          :class="{
            'card-absent': log.absent,
            'card-weekend': log.weekend,
            'card-leave': log.onLeave
          }"
        >
          <!-- Date Header -->
          <view class="card-header">
            <text class="card-date">{{ log.date }}</text>
            <view class="status-badge" :class="{
              'badge-absent': log.absent,
              'badge-weekend': log.weekend,
              'badge-leave': log.onLeave,
              'badge-present': !log.absent && !log.weekend && !log.onLeave
            }">
              <text class="badge-text">
                {{ log.absent ? 'غياب' : log.weekend ? 'عطلة' : log.onLeave ? 'إجازة' : 'حضور' }}
              </text>
            </view>
          </view>

          
          <!-- Shift Time -->
		  <view class="card-row">
		    <text class="row-label">وقت الشيفت:</text>
		    <text class="row-value">{{ log.shiftStart }} - {{ log.shiftEnd }}</text>
		  </view>

          <!-- Punch Times -->
          <view class="punch-times">
            <view class="punch-item">
              <text class="punch-label">الدخول</text>
              <text class="punch-value" :class="{ 'text-missing': !log.punchIn && !log.absent && !log.onLeave && !log.weekend }">
                {{ formatPunchTime(log.punchIn, log) }}
              </text>
            </view>
            <view class="punch-item">
              <text class="punch-label">الخروج</text>
              <text class="punch-value" :class="{ 'text-missing': !log.punchOut && !log.absent && !log.onLeave && !log.weekend }">
                {{ formatPunchTime(log.punchOut, log) }}
              </text>
            </view>
          </view>

          <!-- Issues Row -->
          <view class="issues-section" v-if="log.minutesLate > 0 || log.minutesEarlyLeave > 0 || log.forgotPunchIn || log.forgotPunchOut">
            <view class="issue-grid">
              <view v-if="log.minutesLate > 0" class="issue-item danger">
                <uni-icons type="notification-filled" size="20" color="#e74c3c"></uni-icons>
                <text class="issue-text">تأخير {{ log.minutesLate }} د</text>
              </view>
              <view v-if="log.minutesEarlyLeave > 0" class="issue-item warning">
                <uni-icons type="notification-filled" size="20" color="#f39c12"></uni-icons>
                <text class="issue-text">خروج مبكر {{ log.minutesEarlyLeave }} د</text>
              </view>
              <view v-if="log.forgotPunchIn" class="issue-item danger">
                <uni-icons type="closeempty" size="20" color="#e74c3c"></uni-icons>
                <text class="issue-text">نسيان دخول</text>
              </view>
              <view v-if="log.forgotPunchOut" class="issue-item danger">
                <uni-icons type="closeempty" size="20" color="#e74c3c"></uni-icons>
                <text class="issue-text">نسيان خروج</text>
              </view>
            </view>
          </view>

          <!-- All Good Indicator -->
          <view v-else-if="!log.absent && !log.weekend && !log.onLeave" class="all-good">
            <uni-icons type="checkmarkempty" size="20" color="#27ae60"></uni-icons>
            <text class="all-good-text">لا توجد مشاكل</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-else class="empty-state">
        <uni-icons type="info" size="80" color="#d1d5db"></uni-icons>
        <text class="empty-text">لا توجد بيانات حضور متاحة</text>
      </view>
    </scroll-view>

    <!-- Print Button -->
    <!-- <view class="action-buttons">
      <button class="print-btn" @click="handlePrint">
        <text class="btn-text">طباعة</text>
      </button>
    </view> -->
  </view>
</template>

<script>
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

export default {
  components: {
    uniIcons
  },
  data() {
    return {
      empId: '',
      empName: '',
      dailyLogs: [],
      month: null,
      year: null,
      months: [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ]
    };
  },
  computed: {
    monthName() {
      return this.months[this.month - 1] || '';
    }
  },
  onLoad(options) {
    console.log('Page loaded with options:', options);
    console.log('Raw empName:', options.empName);
    
    if (options.logs) {
      try {
        this.dailyLogs = JSON.parse(decodeURIComponent(options.logs));
        this.empId = options.empId || '';
        
        // Decode empName properly - it might be double-encoded
        if (options.name) {
          try {
            this.empName = decodeURIComponent(options.name);
          } catch (e) {
            this.empName = options.name;
          }
        }
        
        this.month = parseInt(options.month) || null;
        this.year = parseInt(options.year) || null;
        
        console.log('Loaded data:', {
          empId: this.empId,
          empName: this.empName,
          month: this.month,
          year: this.year,
          logsCount: this.dailyLogs.length
        });
        
        this.processLogs();
        
      } catch (e) {
        console.error('Failed to parse logs from URL:', e);
        uni.showToast({
          title: 'فشل في تحميل البيانات',
          icon: 'none'
        });
      }
    } else {
      console.log('No logs data found in URL parameters');
      this.empId = options.empId || '';
      this.empName = options.empName ? decodeURIComponent(options.empName) : '';
      this.month = parseInt(options.month) || null;
      this.year = parseInt(options.year) || null;
      
      uni.showToast({
        title: 'لا توجد بيانات حضور',
        icon: 'none',
        duration: 2000
      });
    }
  },
  methods: {
    processLogs() {
      this.dailyLogs.forEach(log => {
        const isAbsent = log.absent;
        const isOnLeave = log.onLeave;
        const isOnWeekend = log.weekend;

        if (!isAbsent && !isOnLeave && !isOnWeekend) {
          if (!log.punchIn) {
            log.punchIn = "x";
          }
          if (!log.punchOut) {
            log.punchOut = "x";
          }
        }
      });
    },
    formatPunchTime(time, log) {
      if (log.absent || log.onLeave || log.weekend) {
        return '-';
      }
      return time || 'x';
    },
    handlePrint() {
      uni.showToast({
        title: 'وظيفة الطباعة غير متاحة في التطبيق',
        icon: 'none',
        duration: 2000
      });
    }
  }
};
</script>

<style scoped>
.attendance-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
  padding-bottom: 100rpx;
}

/* Header Section */
.header-section {
  padding: 30rpx;
  background: linear-gradient(135deg, #76c4cc 0%, #4a9da6 100%);
}

.header-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.main-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 24rpx;
}

.employee-name {
  display: block;
  font-size: 30rpx;
  color: #34495e;
  text-align: center;
  margin-bottom: 16rpx;
  font-weight: 600;
}

.date-info {
  display: block;
  font-size: 28rpx;
  color: #5a6c7d;
  text-align: center;
  margin-bottom: 12rpx;
}

.emp-id {
  display: block;
  font-size: 26rpx;
  color: #7f8c8d;
  text-align: center;
}

/* Cards Container */
.cards-container {
  height: calc(100vh - 400rpx);
  padding: 30rpx;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* Day Card */
.day-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border-left: 6rpx solid #76c4cc;
  transition: all 0.3s ease;
}

.day-card:active {
  transform: scale(0.98);
}

.card-absent {
  border-left-color: #e74c3c;
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
}

.card-weekend {
  border-left-color: #3498db;
  background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
}

.card-leave {
  border-left-color: #27ae60;
  background: linear-gradient(135deg, #ffffff 0%, #f0fff4 100%);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f2f5;
}

.card-date {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
}

.status-badge {
  padding: 10rpx 24rpx;
  border-radius: 50rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.badge-present {
  background: #d5f5e3;
  color: #27ae60;
}

.badge-absent {
  background: #fadbd8;
  color: #e74c3c;
}

.badge-weekend {
  background: #d6eaf8;
  color: #3498db;
}

.badge-leave {
  background: #d5f5e3;
  color: #27ae60;
}

.badge-text {
  font-size: 22rpx;
}

/* Card Row */
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  direction: rtl;
}

.row-label {
  font-size: 26rpx;
  color: #7f8c8d;
  font-weight: 500;
  text-align: right;
}

.row-value {
  font-size: 26rpx;
  color: #2c3e50;
  font-weight: 600;
  text-align: left;
  direction: ltr;
}
/* Punch Times */
.punch-times {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.punch-item {
  flex: 1;
  background: #f8fafc;
  padding: 20rpx;
  border-radius: 16rpx;
  text-align: center;
}

.punch-label {
  display: block;
  font-size: 22rpx;
  color: #7f8c8d;
  margin-bottom: 8rpx;
}

.punch-value {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
}

.text-missing {
  color: #e74c3c !important;
}

/* Issues Section */
.issues-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f2f5;
}

.issue-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.issue-item.warning {
  background: #fff3cd;
}

.issue-item.danger {
  background: #fadbd8;
}

.issue-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #2c3e50;
}

/* All Good */
.all-good {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #d5f5e3;
  border-radius: 12rpx;
  margin-top: 20rpx;
}

.all-good-text {
  font-size: 24rpx;
  color: #27ae60;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 40rpx;
  gap: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #95a5a6;
  text-align: center;
}

/* Action Buttons */
.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.print-btn {
  width: 100%;
  background: linear-gradient(135deg, #76c4cc 0%, #4a9da6 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 30rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 20rpx rgba(118, 196, 204, 0.3);
}

.btn-text {
  color: #ffffff;
}
</style>