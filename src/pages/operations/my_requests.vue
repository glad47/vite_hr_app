<template>
  <view class="myrequests-container">
    <view class="page-header">
      <text class="page-title">طلباتي</text>
      <text class="page-subtitle">جميع طلباتي ومتابعة حالتها</text>
    </view>

    <scroll-view
      class="main-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- Status Summary -->
      <view class="status-summary">
        <view class="status-item" @click="filterByStatus(null)">
          <text class="status-count">{{ totalCount }}</text>
          <text class="status-label">الكل</text>
        </view>
        <view class="status-item status-pending" @click="filterByStatus('0')">
          <text class="status-count">{{ countByStatus('0') }}</text>
          <text class="status-label">قيد الانتظار</text>
        </view>
        <view class="status-item status-sup-approved" @click="filterByStatus('1')">
          <text class="status-count">{{ countByStatus('1') }}</text>
          <text class="status-label">بانتظار HR</text>
        </view>
        <view class="status-item status-approved" @click="filterByStatus('3')">
          <text class="status-count">{{ countByStatus('3') }}</text>
          <text class="status-label">مقبول</text>
        </view>
        <view class="status-item status-rejected" @click="filterByStatus('2,4')">
          <text class="status-count">{{ countByStatus('2') + countByStatus('4') }}</text>
          <text class="status-label">مرفوض</text>
        </view>
      </view>

      <!-- Type Filter Tabs -->
      <view class="filter-tabs">
        <view class="tab-item" :class="{ active: filterType === '' }" @click="filterType = ''; applyFilters()">
          <text>الكل</text>
        </view>
        <view class="tab-item" :class="{ active: filterType === 'request' }" @click="filterType = 'request'; applyFilters()">
          <text>استئذان</text>
        </view>
        <view class="tab-item" :class="{ active: filterType === 'addition' }" @click="filterType = 'addition'; applyFilters()">
          <text>إضافات</text>
        </view>
        <view class="tab-item" :class="{ active: filterType === 'dedection' }" @click="filterType = 'dedection'; applyFilters()">
          <text>خصومات</text>
        </view>
        <view class="tab-item" :class="{ active: filterType === 'advance' }" @click="filterType = 'advance'; applyFilters()">
          <text>سلف</text>
        </view>
        <view class="tab-item" :class="{ active: filterType === 'punch' }" @click="filterType = 'punch'; applyFilters()">
          <text>تغيير بصمة</text>
        </view>
      </view>

      <!-- Loading -->
      <view v-if="loading && allItems.length === 0" class="state-box">
        <view class="spinner"></view>
        <text class="state-text">جاري التحميل...</text>
      </view>

      <!-- Empty -->
      <view v-else-if="!loading && filteredItems.length === 0" class="state-box">
        <text class="state-icon">📋</text>
        <text class="state-text">لا توجد طلبات</text>
      </view>

      <!-- Items List -->
      <view v-else class="list-content">
        <view class="list-item" v-for="item in filteredItems" :key="item._type + '-' + item.id">
          <view class="item-header">
            <view class="type-badge" :class="'type-' + item._type">
              <text>{{ typeLabels[item._type] }}</text>
            </view>
            <view class="status-badge" :class="'status-' + item.status">
              <text>{{ getStatusText(item.status) }}</text>
            </view>
          </view>

          <view class="item-body">
            <template v-if="item._type === 'request'">
              <view class="detail-row">
                <text class="detail-label">النوع</text>
                <text class="detail-value">{{ requestTypeLabel(item.type) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">التاريخ</text>
                <text class="detail-value">{{ formatDate(item.requestDate) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">الوقت</text>
                <text class="detail-value">{{ item.startTime }} → {{ item.endTime }}</text>
              </view>
            </template>

            <template v-else-if="item._type === 'addition' || item._type === 'dedection'">
              <view class="detail-row">
                <text class="detail-label">المبلغ</text>
                <text class="detail-value">{{ item.amount }} ر.س</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">الفترة</text>
                <text class="detail-value">{{ item.dueYear }}/{{ item.dueMonth }}</text>
              </view>
              <view class="detail-row" v-if="item.note">
                <text class="detail-label">ملاحظة</text>
                <text class="detail-value">{{ item.note }}</text>
              </view>
            </template>

            <template v-else-if="item._type === 'advance'">
              <view class="detail-row">
                <text class="detail-label">المبلغ</text>
                <text class="detail-value">{{ item.amount }} ر.س</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">الأقساط</text>
                <text class="detail-value">{{ item.months }} شهر</text>
              </view>
            </template>

            <template v-else-if="item._type === 'punch'">
              <view class="detail-row">
                <text class="detail-label">الفترة</text>
                <text class="detail-value">{{ formatDate(item.startTime) }} → {{ formatDate(item.endTime) }}</text>
              </view>
            </template>

            <!-- Approval Progress -->
            <view class="approval-progress">
              <view class="progress-step" :class="{ done: parseInt(item.status) >= 1 }">
                <view class="step-dot"></view>
                <text class="step-label">المشرف</text>
              </view>
              <view class="progress-line" :class="{ done: parseInt(item.status) >= 1 }"></view>
              <view class="progress-step" :class="{ done: parseInt(item.status) >= 3 }">
                <view class="step-dot"></view>
                <text class="step-label">HR</text>
              </view>
              <view class="progress-line" :class="{ done: parseInt(item.status) >= 3 }"></view>
              <view class="progress-step" :class="{ done: parseInt(item.status) === 3 }">
                <view class="step-dot"></view>
                <text class="step-label">مكتمل</text>
              </view>
            </view>

            <view class="detail-row date-row">
              <text class="detail-date">{{ formatDate(item.createTime) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { listRequest } from '@/api/api/request'
import { listAddition } from '@/api/api/addition'
import { listDedection } from '@/api/api/dedection'
import { listAdvance } from '@/api/api/advance'
import { listPunch } from '@/api/api/punch'

export default {
  data() {
    return {
      loading: false,
      isRefreshing: false,
      currentUserId: null,
      allItems: [],
      filteredItems: [],
      filterType: '',
      filterStatus: null,
      typeLabels: {
        request: 'استئذان',
        addition: 'إضافة',
        dedection: 'خصم',
        advance: 'سلفة',
        punch: 'تغيير بصمة'
      }
    }
  },
  computed: {
    userInfo() { return this.$store.state.user.hrUser },
    totalCount() { return this.allItems.length }
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
      if (!this.currentUserId) return
      this.loading = true
      try {
        const params = { empId: this.currentUserId, pageSize: 9999 }
        const [reqRes, addRes, dedRes, advRes, pchRes] = await Promise.all([
          listRequest(params),
          listAddition(params),
          listDedection(params),
          listAdvance(params),
          listPunch(params)
        ])

        this.allItems = []
        const addItems = (items, type) => {
          (items || []).forEach(item => {
            item._type = type
            this.allItems.push(item)
          })
        }
        addItems(reqRes.rows, 'request')
        addItems(addRes.rows, 'addition')
        addItems(dedRes.rows, 'dedection')
        addItems(advRes.rows, 'advance')
        addItems(pchRes.rows, 'punch')

        this.allItems.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        this.applyFilters()
      } catch (e) {
        console.error('Failed to load data', e)
        uni.showToast({ title: 'فشل التحميل', icon: 'none' })
      } finally {
        this.loading = false
        this.isRefreshing = false
      }
    },

    async onRefresh() { this.isRefreshing = true; await this.loadData() },

    applyFilters() {
      let items = [...this.allItems]
      if (this.filterType) {
        items = items.filter(i => i._type === this.filterType)
      }
      if (this.filterStatus !== null) {
        const statuses = this.filterStatus.split(',')
        items = items.filter(i => statuses.includes(String(i.status)))
      }
      this.filteredItems = items
    },

    filterByStatus(status) {
      this.filterStatus = status
      this.applyFilters()
    },

    countByStatus(status) {
      return this.allItems.filter(i => String(i.status) === status).length
    },

    getStatusText(status) {
      switch (String(status)) {
        case '0': return 'قيد الانتظار'
        case '1': return 'موافق من المشرف'
        case '2': return 'مرفوض من المشرف'
        case '3': return 'موافق نهائياً'
        case '4': return 'مرفوض من HR'
        default: return 'غير محدد'
      }
    },

    requestTypeLabel(type) {
      return { '0': 'خروج وعودة', '1': 'خروج مبكر', '2': 'تأخير' }[type] || type
    },

    formatDate(d) {
      if (!d) return '-'
      const date = new Date(d)
      if (isNaN(date.getTime())) return d
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    }
  }
}
</script>

<style scoped lang="scss">
.myrequests-container { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
.page-header { padding: 40rpx 20rpx 24rpx; background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); color: #fff; }
.page-title { font-size: 36rpx; font-weight: 700; display: block; margin-bottom: 8rpx; }
.page-subtitle { font-size: 24rpx; opacity: 0.9; display: block; }
.main-scroll { flex: 1; height: 0; }

/* Status Summary */
.status-summary { display: flex; padding: 16rpx; gap: 8rpx; }
.status-item { flex: 1; background: #fff; border-radius: 12rpx; padding: 16rpx 8rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.status-count { font-size: 32rpx; font-weight: 700; color: #1e293b; display: block; }
.status-label { font-size: 20rpx; color: #64748b; display: block; margin-top: 4rpx; }
.status-pending .status-count { color: #d97706; }
.status-sup-approved .status-count { color: #2563eb; }
.status-approved .status-count { color: #16a34a; }
.status-rejected .status-count { color: #dc2626; }

/* Filter Tabs */
.filter-tabs { display: flex; padding: 8rpx 16rpx; overflow-x: auto; gap: 8rpx; }
.tab-item { padding: 10rpx 16rpx; background: #fff; border-radius: 20rpx; font-size: 22rpx; color: #64748b; border: 1rpx solid #e2e8f0; flex-shrink: 0; }
.tab-item.active { background: #1a365d; color: #fff; border-color: #1a365d; }

/* States */
.state-box { display: flex; flex-direction: column; align-items: center; padding: 100rpx; }
.spinner { width: 60rpx; height: 60rpx; border: 4rpx solid #e2e8f0; border-top-color: #1a365d; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-text { margin-top: 24rpx; font-size: 28rpx; color: #94a3b8; }
.state-icon { font-size: 80rpx; }

/* List */
.list-content { padding: 16rpx; }
.list-item { background: #fff; border-radius: 12rpx; margin-bottom: 16rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.item-header { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 20rpx; border-bottom: 1rpx solid #f1f5f9; }
.type-badge { padding: 4rpx 12rpx; border-radius: 6rpx; font-size: 22rpx; font-weight: 600; }
.type-request { background: #f3e8ff; color: #7c3aed; }
.type-addition { background: #dcfce7; color: #16a34a; }
.type-dedection { background: #fee2e2; color: #dc2626; }
.type-advance { background: #dbeafe; color: #2563eb; }
.type-punch { background: #ffedd5; color: #ea580c; }

.status-badge { padding: 4rpx 12rpx; border-radius: 6rpx; font-size: 22rpx; font-weight: 600; }
.status-0 { background: #fef3c7; color: #92400e; }
.status-1 { background: #dbeafe; color: #1e40af; }
.status-2 { background: #fee2e2; color: #991b1b; }
.status-3 { background: #d1fae5; color: #065f46; }
.status-4 { background: #fce7f3; color: #9d174d; }

.item-body { padding: 16rpx 20rpx; }
.detail-row { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.detail-label { font-size: 24rpx; color: #64748b; }
.detail-value { font-size: 24rpx; color: #1e293b; font-weight: 500; }
.date-row { justify-content: flex-end; margin-top: 8rpx; }
.detail-date { font-size: 22rpx; color: #94a3b8; }

/* Approval Progress */
.approval-progress { display: flex; align-items: center; justify-content: center; margin: 16rpx 0 8rpx; padding: 12rpx; background: #f8fafc; border-radius: 8rpx; }
.progress-step { display: flex; flex-direction: column; align-items: center; gap: 4rpx; }
.step-dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: #cbd5e1; border: 2rpx solid #e2e8f0; }
.progress-step.done .step-dot { background: #16a34a; border-color: #16a34a; }
.step-label { font-size: 18rpx; color: #94a3b8; }
.progress-step.done .step-label { color: #16a34a; font-weight: 600; }
.progress-line { width: 40rpx; height: 3rpx; background: #cbd5e1; margin: 0 8rpx; margin-bottom: 20rpx; }
.progress-line.done { background: #16a34a; }
</style>
