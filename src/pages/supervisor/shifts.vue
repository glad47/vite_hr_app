<template>
  <view class="shift-container">
    <view class="page-header">
      <text class="page-title">إدارة الشيفتات</text>
      <text class="page-subtitle">إنشاء وتعيين الشيفتات لقسمك</text>
    </view>

    <scroll-view class="main-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      
      <!-- Add New Shift Button -->
      <view class="action-bar">
        <button class="btn-add" @click="handleAdd">
          <uni-icons type="plus" size="18" color="#fff"></uni-icons>
          <text>إنشاء شيفت جديد</text>
        </button>
      </view>

      <!-- Loading -->
      <view v-if="loading && shifts.length === 0" class="state-box">
        <view class="spinner"></view>
        <text class="state-text">جاري التحميل...</text>
      </view>

      <!-- Empty -->
      <view v-else-if="!loading && shifts.length === 0" class="state-box">
        <text class="state-icon">⏰</text>
        <text class="state-text">لا توجد شيفتات</text>
      </view>

      <!-- Shifts List -->
      <view v-else class="list-content">
        <view class="section-title">شيفتات القسم</view>
        <view class="list-item" v-for="shift in shifts" :key="shift.id">
          <view class="shift-header">
            <text class="shift-name">{{ shift.name }}</text>
            <view class="shift-type-badge" :class="'type-' + (shift.shiftType || '0')">
              <text>{{ shiftTypeLabel(shift.shiftType) }}</text>
            </view>
          </view>
          <view class="shift-body">
            <view class="shift-time-row">
              <text class="time-label">البداية:</text>
              <text class="time-value">{{ shift.startTime }}</text>
            </view>
            <view class="shift-time-row">
              <text class="time-label">النهاية:</text>
              <text class="time-value">{{ shift.endTime }}</text>
            </view>
            <view class="shift-time-row" v-if="shift.weekendDays">
              <text class="time-label">عطلة:</text>
              <text class="time-value">{{ formatWeekend(shift.weekendDays) }}</text>
            </view>
          </view>
        </view>

        <!-- Normal Shifts (type=2) -->
        <view v-if="normalShifts.length > 0">
          <view class="section-title" style="margin-top: 24rpx;">الشيفتات العادية الخاصة</view>
          <view class="list-item" v-for="shift in normalShifts" :key="'n-' + shift.id">
            <view class="shift-header">
              <text class="shift-name">{{ shift.name }}</text>
              <view class="shift-type-badge type-2">
                <text>عادي خاص</text>
              </view>
            </view>
            <view class="shift-body">
              <view class="shift-time-row">
                <text class="time-label">البداية:</text>
                <text class="time-value">{{ shift.startTime }}</text>
              </view>
              <view class="shift-time-row">
                <text class="time-label">النهاية:</text>
                <text class="time-value">{{ shift.endTime }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Create Shift Dialog -->
    <uni-popup ref="shiftDialog" type="center" :mask-click="false">
      <view class="dialog-box">
        <view class="dialog-header">
          <text class="dialog-title">إنشاء شيفت جديد</text>
          <view class="dialog-close" @click="closeDialog">✕</view>
        </view>
        <scroll-view class="dialog-body" scroll-y>
          <view class="form-field">
            <text class="field-label required">اسم الشيفت</text>
            <input class="field-input" v-model="form.name" placeholder="أدخل اسم الشيفت" />
          </view>

          <view class="form-field">
            <text class="field-label required">وقت البداية</text>
            <picker mode="time" @change="onStartTimeChange" :value="form.startTime || '08:00'">
              <view class="field-select">
                <text :class="{ placeholder: !form.startTime }">{{ form.startTime || 'اختر الوقت' }}</text>
                <uni-icons type="arrowdown" size="14" color="#94a3b8"></uni-icons>
              </view>
            </picker>
          </view>

          <view class="form-field">
            <text class="field-label required">وقت النهاية</text>
            <picker mode="time" @change="onEndTimeChange" :value="form.endTime || '16:00'">
              <view class="field-select">
                <text :class="{ placeholder: !form.endTime }">{{ form.endTime || 'اختر الوقت' }}</text>
                <uni-icons type="arrowdown" size="14" color="#94a3b8"></uni-icons>
              </view>
            </picker>
          </view>

          <view class="form-field">
            <text class="field-label">أيام العطلة</text>
            <view class="weekend-picker">
              <view
                class="day-chip"
                :class="{ active: selectedDays.includes(day.value) }"
                v-for="day in weekDays"
                :key="day.value"
                @click="toggleDay(day.value)"
              >
                <text>{{ day.label }}</text>
              </view>
            </view>
          </view>

          <view class="form-field">
            <text class="field-label">يعبر منتصف الليل؟</text>
            <switch :checked="form.status === '1'" @change="form.status = $event.detail.value ? '1' : '0'" color="#1a365d" />
          </view>

        </scroll-view>
        <view class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">إلغاء</button>
          <button class="btn-submit" @click="submitForm" :disabled="submitting">
            {{ submitting ? 'جاري الحفظ...' : 'إنشاء' }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listShift, addShift } from '@/api/api/shift'
import { getEmp } from '@/api/api/emp'

export default {
  data() {
    return {
      loading: false,
      isRefreshing: false,
      submitting: false,
      shifts: [],
      normalShifts: [],
      currentUserId: null,
      userDeptId: null,
      weekDays: [
        { label: 'سبت', value: '7' },
        { label: 'أحد', value: '1' },
        { label: 'إثنين', value: '2' },
        { label: 'ثلاثاء', value: '3' },
        { label: 'أربعاء', value: '4' },
        { label: 'خميس', value: '5' },
        { label: 'جمعة', value: '6' }
      ],
      selectedDays: [],
      form: {
        name: '',
        startTime: '',
        endTime: '',
        status: '0',
        shiftType: '1', // temporary by default from app
        deptId: null
      }
    }
  },
  computed: {
    userInfo() { return this.$store.state.user.hrUser }
  },
  onShow() {
    const user = this.userInfo
    if (user) {
      this.currentUserId = user.id
      this.loadUserDept()
      this.loadData()
    }
  },
  methods: {
    async loadUserDept() {
      try {
        const res = await getEmp(this.currentUserId)
        if (res.data) {
          this.userDeptId = res.data.deptId
          this.form.deptId = this.userDeptId
        }
      } catch (e) {
        console.error('Failed to load user dept', e)
      }
    },

    async loadData() {
      this.loading = true
      try {
        // Load all shifts (regular ones will be returned, temporary excluded by default)
        const res = await listShift({ pageSize: 9999 })
        const allShifts = res.rows || []

        // Filter for department shifts
        if (this.userDeptId) {
          this.shifts = allShifts.filter(s => !s.deptId || s.deptId === this.userDeptId)
        } else {
          this.shifts = allShifts
        }

        // Load normal shifts (type=2)
        const normalRes = await listShift({ shiftType: '2', pageSize: 9999 })
        this.normalShifts = normalRes.rows || []
      } catch (e) {
        uni.showToast({ title: 'فشل التحميل', icon: 'none' })
      } finally {
        this.loading = false
        this.isRefreshing = false
      }
    },

    async onRefresh() { this.isRefreshing = true; await this.loadData() },

    handleAdd() {
      this.form = { name: '', startTime: '', endTime: '', status: '0', shiftType: '1', deptId: this.userDeptId }
      this.selectedDays = []
      this.$refs.shiftDialog.open()
    },

    closeDialog() { this.$refs.shiftDialog.close() },

    onStartTimeChange(e) { this.form.startTime = e.detail.value + ':00' },
    onEndTimeChange(e) { this.form.endTime = e.detail.value + ':00' },

    toggleDay(day) {
      const idx = this.selectedDays.indexOf(day)
      if (idx >= 0) this.selectedDays.splice(idx, 1)
      else this.selectedDays.push(day)
    },

    async submitForm() {
      if (!this.form.name) { uni.showToast({ title: 'أدخل اسم الشيفت', icon: 'none' }); return }
      if (!this.form.startTime) { uni.showToast({ title: 'اختر وقت البداية', icon: 'none' }); return }
      if (!this.form.endTime) { uni.showToast({ title: 'اختر وقت النهاية', icon: 'none' }); return }

      this.submitting = true
      try {
        const data = {
          ...this.form,
          weekendDays: this.selectedDays.join(','),
          deptId: this.userDeptId,
          areaId: this.userInfo.areaId,
          shiftType: '0' // Always temporary from app
        }
        await addShift(data)
        uni.showToast({ title: 'تم إنشاء الشيفت', icon: 'success' })
        this.closeDialog()
        this.loadData()
      } catch (e) {
        uni.showToast({ title: 'فشل الإنشاء', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },

    shiftTypeLabel(type) {
      return { '0': 'عادي', '1': 'مؤقت', '2': 'عادي خاص' }[type] || 'عادي'
    },

    formatWeekend(days) {
      if (!days) return ''
      const map = { '1': 'أحد', '2': 'إثنين', '3': 'ثلاثاء', '4': 'أربعاء', '5': 'خميس', '6': 'جمعة', '7': 'سبت' }
      return days.split(',').map(d => map[d.trim()] || d).join(', ')
    }
  }
}
</script>

<style scoped lang="scss">
.shift-container { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
.page-header { padding: 40rpx 20rpx 24rpx; background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); color: #fff; }
.page-title { font-size: 36rpx; font-weight: 700; display: block; margin-bottom: 8rpx; }
.page-subtitle { font-size: 24rpx; opacity: 0.9; display: block; }
.main-scroll { flex: 1; height: 0; }

.action-bar { padding: 20rpx; }
.btn-add { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10rpx; padding: 24rpx; background: linear-gradient(135deg, #166534, #15803d); color: #fff; border-radius: 12rpx; font-size: 28rpx; font-weight: 600; border: none; }

.section-title { font-size: 28rpx; font-weight: 600; color: #1e293b; padding: 0 20rpx; margin-bottom: 12rpx; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 100rpx; }
.spinner { width: 60rpx; height: 60rpx; border: 4rpx solid #e2e8f0; border-top-color: #1a365d; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-text { margin-top: 24rpx; font-size: 28rpx; color: #94a3b8; }
.state-icon { font-size: 80rpx; }

.list-content { padding: 16rpx; }
.list-item { background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.shift-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.shift-name { font-size: 30rpx; font-weight: 600; color: #1e293b; }
.shift-type-badge { padding: 4rpx 12rpx; border-radius: 6rpx; font-size: 20rpx; font-weight: 600; }
.type-0 { background: #dbeafe; color: #1e40af; }
.type-1 { background: #fef3c7; color: #92400e; }
.type-2 { background: #dcfce7; color: #166534; }
.shift-body { display: flex; flex-direction: column; gap: 8rpx; }
.shift-time-row { display: flex; justify-content: space-between; }
.time-label { font-size: 24rpx; color: #64748b; }
.time-value { font-size: 24rpx; color: #1e293b; font-weight: 500; }

/* Dialog */
.dialog-box { width: 680rpx; background: #fff; border-radius: 20rpx; overflow: hidden; }
.dialog-header { display: flex; justify-content: space-between; padding: 28rpx 24rpx; background: linear-gradient(135deg, #1a365d, #2c5282); }
.dialog-title { font-size: 30rpx; color: #fff; font-weight: 600; }
.dialog-close { color: rgba(255,255,255,0.8); font-size: 32rpx; }
.dialog-body { padding: 24rpx; max-height: 600rpx; }
.form-field { margin-bottom: 24rpx; }
.field-label { font-size: 26rpx; color: #1e293b; font-weight: 500; margin-bottom: 12rpx; display: block; &.required::after { content: ' *'; color: #dc2626; } }
.field-input { width: 100%; padding: 20rpx 16rpx; background: #f8fafc; border: 2rpx solid #e2e8f0; border-radius: 12rpx; font-size: 26rpx; }
.field-select { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 16rpx; background: #f8fafc; border: 2rpx solid #e2e8f0; border-radius: 12rpx; .placeholder { color: #94a3b8; } }

.weekend-picker { display: flex; flex-wrap: wrap; gap: 8rpx; }
.day-chip { padding: 12rpx 20rpx; border: 2rpx solid #e2e8f0; border-radius: 8rpx; font-size: 24rpx; color: #64748b; &.active { background: #1a365d; color: #fff; border-color: #1a365d; } }

.info-note { display: flex; align-items: center; gap: 8rpx; padding: 16rpx; background: #eff6ff; border-radius: 8rpx; font-size: 22rpx; color: #1e40af; }

.dialog-footer { display: flex; gap: 16rpx; padding: 20rpx 24rpx; border-top: 1rpx solid #f1f5f9; }
.btn-cancel, .btn-submit { flex: 1; padding: 20rpx; border-radius: 8rpx; font-size: 28rpx; font-weight: 600; border: none; }
.btn-cancel { background: #f8fafc; color: #64748b; }
.btn-submit { background: linear-gradient(135deg, #166534, #15803d); color: #fff; &[disabled] { opacity: 0.5; } }
</style>
