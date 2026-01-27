<template>
  <view class="emp-dashboard">
    <!-- Header with Gradient -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">{{ empData ? empData.name : 'لوحة التحكم' }}</text>
        <text class="header-subtitle">{{ months[queryParams.month - 1] }} {{ queryParams.year }}</text>
      </view>
    </view>

    <!-- Date Filters -->
    <view class="filters-container">
      <picker mode="selector" :range="years" @change="onYearChange">
        <view class="filter-pill">
          <uni-icons type="calendar" size="20" color="#ffffff"></uni-icons>
          <text class="filter-text">{{ queryParams.year }}</text>
        </view>
      </picker>
      <picker mode="selector" :range="months" @change="onMonthChange">
        <view class="filter-pill">
          <uni-icons type="calendar" size="20" color="#ffffff"></uni-icons>
          <text class="filter-text">{{ months[queryParams.month - 1] }}</text>
        </view>
      </picker>
    </view>

    <view v-if="empData" class="content">
      <!-- Primary Stats -->
      <view class="primary-cards">
        <view class="primary-card salary-card">
          <view class="card-icon-wrapper salary-icon">
            <uni-icons type="paperplane" size="28" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">صافي الراتب</text>
            <text class="card-value-large">{{ empData.salaryAfterDeduction }}</text>
            <text class="card-currency">ريال</text>
          </view>
        </view>
      </view>

      <!-- Info Section -->
      <view class="section">
        <text class="section-title">معلومات الموظف</text>
        <view class="info-cards">
          <view class="info-card">
            <view class="info-icon">
              <uni-icons type="person" size="24" color="#8b5cf6"></uni-icons>
            </view>
            <view class="info-content">
              <text class="info-label">القسم</text>
              <text class="info-value">{{ dept ? dept.deptName : 'غير محدد' }}</text>
            </view>
          </view>

          <view class="info-card">
            <view class="info-icon">
              <uni-icons type="calendar" size="24" color="#06b6d4"></uni-icons>
            </view>
            <view class="info-content">
              <text class="info-label">الشيفت</text>
              <text class="info-value">{{ shift ? shift.name : 'غير محدد' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Leaves & Requests Section -->
      <view class="section">
        <text class="section-title">الإجازات والطلبات</text>
        <view class="stats-grid">
          <view class="stat-card info">
            <view class="stat-header">
              <view class="stat-icon-wrapper info-bg">
                <uni-icons type="calendar" size="24" color="#3b82f6"></uni-icons>
              </view>
              <text class="stat-value">{{ leaveOptions ? leaveOptions.length : 0 }}</text>
            </view>
            <text class="stat-label">الإجازات</text>
          </view>

          <view class="stat-card info">
            <view class="stat-header">
              <view class="stat-icon-wrapper info-bg">
                <uni-icons type="paperplane" size="24" color="#8b5cf6"></uni-icons>
              </view>
              <text class="stat-value">{{ requestOptions ? requestOptions.length : 0 }}</text>
            </view>
            <text class="stat-label">الطلبات</text>
          </view>
        </view>
      </view>

      <!-- Attendance Section -->
      <view class="section">
        <text class="section-title">الحضور والغياب</text>
        <view class="stats-grid">
          <view class="stat-card success">
            <view class="stat-header">
              <view class="stat-icon-wrapper success-bg">
                <uni-icons type="hand-up-filled" size="24" color="#10b981"></uni-icons>
              </view>
              <text class="stat-value">{{ empData.attendanceDays }}</text>
            </view>
            <text class="stat-label">أيام الحضور</text>
            <view class="stat-bar">
              <view class="stat-bar-fill success-bar" :style="{width: (empData.attendanceDays / 30 * 100) + '%'}"></view>
            </view>
          </view>

          <view class="stat-card danger">
            <view class="stat-header">
              <view class="stat-icon-wrapper danger-bg">
                <uni-icons type="hand-down-filled" size="24" color="#ef4444"></uni-icons>
              </view>
              <text class="stat-value">{{ empData.absenceDays }}</text>
            </view>
            <text class="stat-label">أيام الغياب</text>
            <view class="stat-bar">
              <view class="stat-bar-fill danger-bar" :style="{width: (empData.absenceDays / 30 * 100) + '%'}"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- Punch Issues -->
      <view class="section">
        <text class="section-title">التسجيلات</text>
        <view class="stats-grid">
          <view class="stat-card warning">
            <view class="stat-header">
              <view class="stat-icon-wrapper warning-bg">
                <uni-icons type="notification-filled" size="24" color="#f59e0b"></uni-icons>
              </view>
              <text class="stat-value">{{ empData.forgetPunchInDays }}</text>
            </view>
            <text class="stat-label">نسيان الدخول</text>
          </view>

          <view class="stat-card warning">
            <view class="stat-header">
              <view class="stat-icon-wrapper warning-bg">
                <uni-icons type="notification" size="24" color="#f59e0b"></uni-icons>
              </view>
              <text class="stat-value">{{ empData.forgetPunchOutDays }}</text>
            </view>
            <text class="stat-label">نسيان الخروج</text>
          </view>
        </view>
      </view>

      <!-- Financial Section -->
      <view class="section">
        <text class="section-title">المعاملات المالية</text>
        <view class="financial-cards">
          <view class="financial-card loan">
            <view class="financial-icon">
              <uni-icons type="wallet" size="24" color="#3b82f6"></uni-icons>
            </view>
            <view class="financial-content">
              <text class="financial-label">السلف</text>
              <text class="financial-value">{{ empData.totalLoan }} <text class="currency">ريال</text></text>
            </view>
          </view>

          <view class="financial-card deduction">
            <view class="financial-icon">
              <uni-icons type="minus" size="24" color="#ef4444"></uni-icons>
            </view>
            <view class="financial-content">
              <text class="financial-label">الخصومات</text>
              <text class="financial-value">{{ empData.totalDedection }} <text class="currency">ريال</text></text>
            </view>
          </view>

          <view class="financial-card deficit">
            <view class="financial-icon">
              <uni-icons type="info-filled" size="24" color="#dc2626"></uni-icons>
            </view>
            <view class="financial-content">
              <text class="financial-label">العجز</text>
              <text class="financial-value">{{ empData.totalDedection }} <text class="currency">ريال</text></text>
            </view>
          </view>
        </view>
      </view>

      <!-- Attendance Certificate Button -->
      <view class="section">
        <view class="attendance-certificate-card" @click="goToAttendance">
          <view class="certificate-icon-wrapper">
            <uni-icons type="list" size="32" color="#fff"></uni-icons>
          </view>
          <view class="certificate-content">
            <text class="certificate-title">شهادة الحضور والانصراف</text>
            <text class="certificate-subtitle">عرض تفاصيل الحضور الكاملة</text>
          </view>
          <view class="certificate-arrow">
            <uni-icons type="left" size="28" color="#fff"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="no-data">
      <uni-icons type="info" size="60" color="#d1d5db"></uni-icons>
      <text class="no-data-text">لا توجد بيانات متاحة</text>
      <text class="no-data-subtext">يرجى اختيار شهر وسنة مختلفين</text>
    </view>
  </view>
</template>

<script>
import { listSalary } from "@/api/api/emp";
import { getDept } from "@/api/api/dept";
import { getShift } from "@/api/api/shift";
import { listLeave } from "@/api/api/leave";
import { listRequest } from "@/api/api/request";
import uniCard from '@dcloudio/uni-ui/lib/uni-card/uni-card.vue';
import uniSection from '@dcloudio/uni-ui/lib/uni-section/uni-section.vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

export default {
  name: "EmpDashboard",
  components: {
    uniCard,
    uniSection,
    uniIcons
  },
  data() {
    return {
      empData: null,
      shift: null,
      dept: null,
      leaveOptions: [],
      requestOptions: [],
      queryParams: {
        id: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      },
      months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      years: ['2024', '2025', '2026']
    };
  },
  computed: {
    // Get the HR employee ID (not system username)
    hrUser() {
      return this.$store?.state?.user?.hrUser || null;
    },
    empId() {
      return this.hrUser?.id || '';
    },
    empName() {
      return this.hrUser?.name || '';
    },
    // Keep userName for backward compatibility (system username)
    userName() {
      return this.$store?.state?.user?.name || '';
    },
  },
  // Use onShow instead of created - fires after navigation completes
  onShow() {
    console.log('Dashboard onShow - hrUser:', this.hrUser);
    console.log('Dashboard onShow - empId:', this.empId);
    this.loadData();
  },
  // Watch for empId changes (when store gets populated)
  watch: {
    empId: {
      handler(newVal) {
        console.log('empId changed to:', newVal);
        if (newVal) {
          this.loadData();
        }
      },
      immediate: false
    }
  },
  methods: {
    loadData() {
      if (!this.empId) {
        console.warn('No employee ID found in store');
        return;
      }
      this.queryParams.id = this.empId;
      this.getEmployeeData();
      this.getLeaveOptions();
      this.getRequestOptions();
    },
    getEmployeeData() {
      this.queryParams.id = this.empId;
      console.log('Fetching salary data for empId:', this.empId, 'params:', this.queryParams);
      listSalary(this.queryParams).then(res => {
        this.empData = res.rows?.[0] || null;
        
        // After getting employee data, fetch dept and shift
        if (this.empData) {
          if (this.empData.deptId) {
            this.getDeptData(this.empData.deptId);
          }
          if (this.empData.shiftId) {
            this.getShiftData(this.empData.shiftId);
          }
        }
      }).catch(err => {
        console.error('Error fetching employee data:', err);
        this.empData = null;
      });
    },
    getDeptData(deptId) {
      getDept(deptId).then(res => {
        this.dept = res.data || null;
      }).catch(err => {
        console.error('Error fetching dept:', err);
        this.dept = null;
      });
    },
    getShiftData(shiftId) {
      getShift(shiftId).then(res => {
        this.shift = res.data || null;
      }).catch(err => {
        console.error('Error fetching shift:', err);
        this.shift = null;
      });
    },
    getLeaveOptions() {
      listLeave({ empId: this.empId }).then(res => {
        this.leaveOptions = res.rows || [];
      }).catch(err => {
        console.error('Error fetching leaves:', err);
        this.leaveOptions = [];
      });
    },
    getRequestOptions() {
      listRequest({ empId: this.empId }).then(res => {
        this.requestOptions = res.rows || [];
      }).catch(err => {
        console.error('Error fetching requests:', err);
        this.requestOptions = [];
      });
    },
    onMonthChange(e) {
      this.queryParams.month = e.detail.value + 1;
      this.getEmployeeData();
    },
    onYearChange(e) {
      this.queryParams.year = this.years[e.detail.value];
      this.getEmployeeData();
    },
    goToAttendance() {
      if (!this.empData || !this.empData.dailyLogs) {
        uni.showToast({
          title: 'لا توجد بيانات حضور',
          icon: 'none'
        });
        return;
      }

      const query = {
        logs: JSON.stringify(this.empData.dailyLogs),
        month: this.queryParams.month,
        year: this.queryParams.year,
		name: this.empData.name
      };

      uni.navigateTo({
        url: `/pages/attendence/detail?name=${query.name}&empId=${this.userName}&logs=${encodeURIComponent(query.logs)}&month=${query.month}&year=${query.year}`
      });
    }
  }
};
</script>

<style scoped>
.emp-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #76c4cc 0%, #4a9da6 100%);
  direction: rtl;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.header {
  padding: 60rpx 30rpx 40rpx;
  background: transparent;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.header-title {
  font-size: 44rpx;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

/* Filters */
.filters-container {
  display: flex;
  gap: 16rpx;
  padding: 0 30rpx 30rpx;
}

.filter-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20rpx);
  padding: 20rpx 30rpx;
  border-radius: 50rpx;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.filter-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

/* Content */
.content {
  background: #f8fafc;
  border-radius: 40rpx 40rpx 0 0;
  padding: 30rpx;
  min-height: calc(100vh - 300rpx);
}

/* Primary Card - Salary */
.primary-cards {
  margin-bottom: 30rpx;
}

.primary-card {
  background: linear-gradient(135deg, #76c4cc 0%, #4a9da6 100%);
  border-radius: 28rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
  box-shadow: 0 20rpx 50rpx rgba(118, 196, 204, 0.4);
}

.card-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.card-value-large {
  font-size: 56rpx;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
}

.card-currency {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* Sections */
.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20rpx;
  display: block;
}

/* Stats Grid */
.stats-grid {
  display: flex;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.stat-icon-wrapper {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.success-bg {
  background: rgba(16, 185, 129, 0.15);
  border: 2rpx solid rgba(16, 185, 129, 0.3);
}

.danger-bg {
  background: rgba(239, 68, 68, 0.15);
  border: 2rpx solid rgba(239, 68, 68, 0.3);
}

.warning-bg {
  background: rgba(245, 158, 11, 0.2);
  border: 2rpx solid rgba(245, 158, 11, 0.3);
}

.info-bg {
  background: rgba(59, 130, 246, 0.15);
  border: 2rpx solid rgba(59, 130, 246, 0.3);
}

.stat-value {
  font-size: 40rpx;
  font-weight: 800;
  color: #1e293b;
}

.stat-label {
  font-size: 26rpx;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.stat-bar {
  height: 8rpx;
  background: #f1f5f9;
  border-radius: 8rpx;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.success-bar {
  background: linear-gradient(90deg, #10b981, #059669);
}

.danger-bar {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* Financial Cards */
.financial-cards {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.financial-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border-right: 4rpx solid;
}

.financial-card.loan {
  border-right-color: #3b82f6;
}

.financial-card.deduction {
  border-right-color: #ef4444;
}

.financial-card.deficit {
  border-right-color: #dc2626;
}

.financial-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.financial-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.financial-label {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.financial-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #1e293b;
}

.currency {
  font-size: 22rpx;
  color: #94a3b8;
  font-weight: 500;
}

/* Info Cards */
.info-cards {
  display: flex;
  gap: 20rpx;
}

.info-card {
  flex: 1;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.info-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.info-label {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
}

/* No Data */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 30rpx;
  gap: 20rpx;
}

.no-data-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #475569;
}

.no-data-subtext {
  font-size: 26rpx;
  color: #94a3b8;
}

/* Attendance Certificate Card */
.attendance-certificate-card {
  background: linear-gradient(135deg, #76c4cc 0%, #4a9da6 100%);
  border-radius: 28rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 20rpx 50rpx rgba(118, 196, 204, 0.35);
  cursor: pointer;
  transition: all 0.3s ease;
}

.attendance-certificate-card:active {
  transform: scale(0.98);
  box-shadow: 0 15rpx 40rpx rgba(118, 196, 204, 0.3);
}

.certificate-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10rpx);
  flex-shrink: 0;
}

.certificate-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.certificate-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.certificate-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.certificate-arrow {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}
</style>