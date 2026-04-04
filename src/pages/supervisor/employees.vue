<template>
  <view class="emp-container">
    <view class="page-header">
      <text class="page-title">الموظفين</text>
      <text class="page-subtitle">قائمة المرؤوسين وشيفتاتهم</text>
    </view>

    <scroll-view class="main-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- Loading -->
      <view v-if="loading && employees.length === 0" class="state-box">
        <view class="spinner"></view>
        <text class="state-text">جاري التحميل...</text>
      </view>

      <!-- Empty -->
      <view v-else-if="!loading && employees.length === 0" class="state-box">
        <text class="state-icon">👥</text>
        <text class="state-text">لا يوجد مرؤوسين</text>
      </view>

      <!-- Employee List -->
      <view v-else class="list-content">
        <view class="list-item" v-for="emp in employees" :key="emp.id">
          <view class="emp-info">
            <view class="emp-avatar">
              <uni-icons type="person-filled" size="28" color="#fff"></uni-icons>
            </view>
            <view class="emp-details">
              <text class="emp-name">{{ emp.name }}</text>
              <text class="emp-id">رقم: {{ emp.id }}</text>
              <text class="emp-dept" v-if="emp.deptName">{{ emp.deptName }}</text>
            </view>
          </view>

          <!-- Shift Info -->
          <view class="shift-info">
            <text class="shift-label">الشيفت الحالي:</text>
            <view v-if="emp.shiftId && shiftMap[emp.shiftId]" class="shift-badge">
              <text class="shift-name">{{ shiftMap[emp.shiftId].name }}</text>
              <text class="shift-time">{{ shiftMap[emp.shiftId].startTime }} - {{ shiftMap[emp.shiftId].endTime }}</text>
            </view>
            <text v-else class="no-shift">لم يتم تعيين شيفت</text>
          </view>

          <!-- Actions -->
          <view class="emp-actions">
            <button class="btn-assign-shift" @click="openShiftAssign(emp)">
              <uni-icons type="gear" size="16" color="#1a365d"></uni-icons>
              <text>تعيين شيفت</text>
            </button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Shift Assignment Dialog -->
    <uni-popup ref="shiftDialog" type="center" :mask-click="false">
      <view class="dialog-box">
        <view class="dialog-header">
          <text class="dialog-title">تعيين شيفت - {{ selectedEmp ? selectedEmp.name : '' }}</text>
          <view class="dialog-close" @click="closeDialog">✕</view>
        </view>
        <scroll-view class="dialog-body" scroll-y>
          <!-- Existing Shifts -->
          <view class="form-field">
            <text class="field-label">اختر شيفت موجود</text>
            <view class="shift-list">
              <view
                class="shift-option"
                :class="{ selected: selectedShiftId === shift.id }"
                v-for="shift in availableShifts"
                :key="shift.id"
                @click="selectedShiftId = shift.id"
              >
                <text class="shift-opt-name">{{ shift.name }}</text>
                <text class="shift-opt-time">{{ shift.startTime }} - {{ shift.endTime }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">إلغاء</button>
          <button class="btn-submit" @click="assignShift" :disabled="!selectedShiftId">تعيين</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getSupervisees, updateEmp } from '@/api/api/emp'
import { listShift } from '@/api/api/shift'

export default {
  data() {
    return {
      loading: false,
      isRefreshing: false,
      employees: [],
      shiftMap: {},
      availableShifts: [],
      selectedEmp: null,
      selectedShiftId: null,
      currentUserId: null
    }
  },
  computed: {
    userInfo() { return this.$store.state.user.hrUser }
  },
  onShow() {
    const user = this.userInfo
    if (user) {
      this.currentUserId = user.id
      this.loadData()
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [empRes, shiftRes] = await Promise.all([
          getSupervisees(this.currentUserId),
          listShift({ pageSize: 9999 })
        ])
        this.employees = empRes.data || []
        const shifts = shiftRes.rows || []
        this.availableShifts = shifts
        this.shiftMap = {}
        shifts.forEach(s => { this.shiftMap[s.id] = s })
      } catch (e) {
        uni.showToast({ title: 'فشل التحميل', icon: 'none' })
      } finally {
        this.loading = false
        this.isRefreshing = false
      }
    },

    async onRefresh() { this.isRefreshing = true; await this.loadData() },

    openShiftAssign(emp) {
      this.selectedEmp = emp
      this.selectedShiftId = emp.shiftId || null
      this.$refs.shiftDialog.open()
    },

    closeDialog() { this.$refs.shiftDialog.close() },

    async assignShift() {
      if (!this.selectedShiftId || !this.selectedEmp) return
      try {
        await updateEmp({ id: this.selectedEmp.id, shiftId: this.selectedShiftId })
        uni.showToast({ title: 'تم تعيين الشيفت', icon: 'success' })
        this.closeDialog()
        this.loadData()
      } catch (e) {
        uni.showToast({ title: 'فشل التعيين', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.emp-container { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
.page-header { padding: 40rpx 20rpx 24rpx; background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); color: #fff; }
.page-title { font-size: 36rpx; font-weight: 700; display: block; margin-bottom: 8rpx; }
.page-subtitle { font-size: 24rpx; opacity: 0.9; display: block; }
.main-scroll { flex: 1; height: 0; }
.state-box { display: flex; flex-direction: column; align-items: center; padding: 100rpx; }
.spinner { width: 60rpx; height: 60rpx; border: 4rpx solid #e2e8f0; border-top-color: #1a365d; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-text { margin-top: 24rpx; font-size: 28rpx; color: #94a3b8; }
.state-icon { font-size: 80rpx; }

.list-content { padding: 16rpx; }
.list-item { background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.emp-info { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.emp-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: linear-gradient(135deg, #1a365d, #2c5282); display: flex; align-items: center; justify-content: center; }
.emp-details { flex: 1; }
.emp-name { font-size: 30rpx; font-weight: 600; color: #1e293b; display: block; }
.emp-id { font-size: 22rpx; color: #94a3b8; display: block; }
.emp-dept { font-size: 22rpx; color: #64748b; display: block; }

.shift-info { padding: 12rpx; background: #f8fafc; border-radius: 8rpx; margin-bottom: 12rpx; }
.shift-label { font-size: 22rpx; color: #64748b; display: block; margin-bottom: 8rpx; }
.shift-badge { display: flex; justify-content: space-between; }
.shift-name { font-size: 26rpx; color: #1a365d; font-weight: 600; }
.shift-time { font-size: 24rpx; color: #475569; }
.no-shift { font-size: 24rpx; color: #94a3b8; font-style: italic; }

.emp-actions { display: flex; }
.btn-assign-shift { display: flex; align-items: center; gap: 8rpx; padding: 14rpx 20rpx; background: #eff6ff; border: 2rpx solid #bfdbfe; border-radius: 8rpx; font-size: 24rpx; color: #1a365d; font-weight: 600; flex: 1; justify-content: center; }

/* Dialog */
.dialog-box { width: 680rpx; background: #fff; border-radius: 20rpx; overflow: hidden; }
.dialog-header { display: flex; justify-content: space-between; padding: 28rpx 24rpx; background: linear-gradient(135deg, #1a365d, #2c5282); }
.dialog-title { font-size: 30rpx; color: #fff; font-weight: 600; }
.dialog-close { color: rgba(255,255,255,0.8); font-size: 32rpx; }
.dialog-body { padding: 24rpx; max-height: 600rpx; }
.form-field { margin-bottom: 24rpx; }
.field-label { font-size: 26rpx; color: #1e293b; font-weight: 500; margin-bottom: 12rpx; display: block; }
.shift-list { display: flex; flex-direction: column; gap: 8rpx; }
.shift-option { display: flex; justify-content: space-between; padding: 16rpx; border: 2rpx solid #e2e8f0; border-radius: 8rpx; &.selected { background: #eff6ff; border-color: #1a365d; } }
.shift-opt-name { font-size: 26rpx; color: #1e293b; font-weight: 500; }
.shift-opt-time { font-size: 24rpx; color: #64748b; }
.dialog-footer { display: flex; gap: 16rpx; padding: 20rpx 24rpx; border-top: 1rpx solid #f1f5f9; }
.btn-cancel, .btn-submit { flex: 1; padding: 20rpx; border-radius: 8rpx; font-size: 28rpx; font-weight: 600; border: none; }
.btn-cancel { background: #f8fafc; color: #64748b; }
.btn-submit { background: linear-gradient(135deg, #166534, #15803d); color: #fff; &[disabled] { opacity: 0.5; } }
</style>
