<template>
  <view class="approval-container">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">مركز الموافقات</text>
      <text class="page-subtitle">الطلبات المعلقة بانتظار موافقتك</text>
    </view>

    <scroll-view class="main-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      
      <!-- Pending Counts -->
      <view class="counts-grid">
        <view class="count-item" v-for="(count, key) in pendingCounts" :key="key" @click="filterByType(key)">
          <text class="count-number">{{ count }}</text>
          <text class="count-label">{{ typeLabels[key] }}</text>
        </view>
      </view>

      <!-- Filter Tabs -->
      <view class="filter-tabs">
        <view class="tab-item" :class="{ active: filterType === '' }" @click="filterByType('')">
          <text>الكل ({{ allItems.length }})</text>
        </view>
        <view class="tab-item" :class="{ active: filterType === key }" v-for="(label, key) in typeLabels" :key="key" @click="filterByType(key)">
          <text>{{ label }}</text>
        </view>
      </view>

      <!-- Batch Actions -->
      <view class="batch-actions" v-if="selectedIds.length > 0">
        <text class="batch-count">{{ selectedIds.length }} محدد</text>
        <button class="btn-batch-approve" @click="batchApprove">موافقة الكل</button>
        <button class="btn-batch-reject" @click="batchReject">رفض الكل</button>
      </view>

      <!-- Loading -->
      <view v-if="loading && filteredItems.length === 0" class="state-box">
        <view class="spinner"></view>
        <text class="state-text">جاري التحميل...</text>
      </view>

      <!-- Empty -->
      <view v-else-if="!loading && filteredItems.length === 0" class="state-box">
        <text class="state-icon">✅</text>
        <text class="state-text">لا توجد طلبات معلقة</text>
      </view>

      <!-- Items List -->
      <view v-else class="list-content">
        <view class="list-item" v-for="item in filteredItems" :key="item._type + '-' + item.id">
          <!-- Checkbox -->
          <view class="item-checkbox" @click="toggleSelect(item)">
            <view class="checkbox" :class="{ checked: isSelected(item) }">
              <text v-if="isSelected(item)">✓</text>
            </view>
          </view>

          <view class="item-content">
            <!-- Header -->
            <view class="item-header">
              <view class="type-badge" :class="'type-' + item._type">
                <text>{{ typeLabels[item._type] }}</text>
              </view>
              <text class="item-name">{{ item.empName }}</text>
            </view>

            <!-- Details -->
            <view class="item-details">
              <template v-if="item._type === 'requests'">
                <text class="detail-text">{{ requestTypeLabel(item.type) }} - {{ formatDate(item.requestDate) }}</text>
                <text class="detail-text">{{ item.startTime }} → {{ item.endTime }}</text>
              </template>
              <template v-else-if="item._type === 'additions' || item._type === 'dedections'">
                <text class="detail-text">{{ item.amount }} ر.س | {{ item.dueYear }}/{{ item.dueMonth }}</text>
                <text class="detail-text" v-if="item.note">{{ item.note }}</text>
              </template>
              <template v-else-if="item._type === 'advances'">
                <text class="detail-text">{{ item.amount }} ر.س - {{ item.months }} شهر</text>
                <text class="detail-text" v-if="item.reason">{{ item.reason }}</text>
              </template>
              <template v-else-if="item._type === 'punches'">
                <text class="detail-text">{{ formatDate(item.startTime) }} → {{ formatDate(item.endTime) }}</text>
                <text class="detail-text" v-if="item.reason">{{ item.reason }}</text>
              </template>
              <text class="detail-date">{{ formatDate(item.createTime) }}</text>
            </view>

            <!-- Actions -->
            <view class="item-actions">
              <button class="btn-approve" @click="approveItem(item)">موافقة</button>
              <button class="btn-reject" @click="rejectItem(item)">رفض</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import {
  getSupervisorPendingItems,
  getSupervisorPendingCounts,
  supervisorApprove,
  supervisorReject,
  supervisorBatchApprove,
  supervisorBatchReject
} from '@/api/api/approval'

export default {
  data() {
    return {
      loading: false,
      isRefreshing: false,
      supervisorId: null,
      allItems: [],
      filteredItems: [],
      selectedIds: [],
      filterType: '',
      pendingCounts: { requests: 0, additions: 0, dedections: 0, advances: 0, punches: 0 },
      typeLabels: {
        requests: 'الاستئذان',
        additions: 'الإضافات',
        dedections: 'الخصومات',
        advances: 'السلف',
        punches: 'تغيير البصمة'
      }
    }
  },
  computed: {
    userInfo() { return this.$store.state.user.hrUser }
  },
  onShow() {
    this.initUser()
    if (this.supervisorId) this.loadData()
  },
  methods: {
    initUser() {
      const user = this.userInfo
      if (user) {
        this.supervisorId = user.id
      }
    },

    async loadData() {
      if (!this.supervisorId) return
      this.loading = true
      try {
        const [itemsRes, countsRes] = await Promise.all([
          getSupervisorPendingItems(this.supervisorId),
          getSupervisorPendingCounts(this.supervisorId)
        ])
        this.pendingCounts = countsRes.data || {}
        this.allItems = []
        const data = itemsRes.data || {}
        for (const type of Object.keys(data)) {
          (data[type] || []).forEach(item => {
            item._type = type
            this.allItems.push(item)
          })
        }
        this.allItems.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        this.applyFilter()
      } catch (e) {
        uni.showToast({ title: 'فشل التحميل', icon: 'none' })
      } finally {
        this.loading = false
        this.isRefreshing = false
      }
    },

    async onRefresh() { this.isRefreshing = true; await this.loadData() },

    applyFilter() {
      this.filteredItems = this.filterType
        ? this.allItems.filter(i => i._type === this.filterType)
        : [...this.allItems]
    },

    filterByType(type) { this.filterType = type; this.applyFilter() },

    toggleSelect(item) {
      const key = item._type + '-' + item.id
      const idx = this.selectedIds.indexOf(key)
      if (idx >= 0) this.selectedIds.splice(idx, 1)
      else this.selectedIds.push(key)
    },

    isSelected(item) { return this.selectedIds.includes(item._type + '-' + item.id) },

    requestTypeLabel(type) {
      return { '0': 'خروج وعودة', '1': 'خروج مبكر', '2': 'تأخير' }[type] || type
    },

    formatDate(d) {
      if (!d) return '-'
      const date = new Date(d)
      if (isNaN(date.getTime())) return d
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    },

    async approveItem(item) {
      uni.showModal({
        title: 'تأكيد الموافقة',
        content: 'هل تريد الموافقة على هذا الطلب؟',
        success: async (res) => {
          if (!res.confirm) return
          const typeMap = { requests: 'request', additions: 'addition', dedections: 'dedection', advances: 'advance', punches: 'punch' }
          try {
            await supervisorApprove({ type: typeMap[item._type], id: item.id, supervisorId: this.supervisorId })
            uni.showToast({ title: 'تمت الموافقة', icon: 'success' })
            this.loadData()
          } catch (e) { uni.showToast({ title: 'فشلت العملية', icon: 'none' }) }
        }
      })
    },

    rejectItem(item) {
      uni.showModal({
        title: 'تأكيد الرفض',
        content: 'هل تريد رفض هذا الطلب؟',
        editable: false,
        success: async (res) => {
          if (!res.confirm) return
          const typeMap = { requests: 'request', additions: 'addition', dedections: 'dedection', advances: 'advance', punches: 'punch' }
          try {
            await supervisorReject({ type: typeMap[item._type], id: item.id, supervisorId: this.supervisorId })
            uni.showToast({ title: 'تم الرفض', icon: 'success' })
            this.loadData()
          } catch (e) { uni.showToast({ title: 'فشلت العملية', icon: 'none' }) }
        }
      })
    },

    async batchApprove() {
      const typeMap = { requests: 'request', additions: 'addition', dedections: 'dedection', advances: 'advance', punches: 'punch' }
      const items = this.selectedIds.map(key => {
        const [type, id] = key.split('-')
        return { type: typeMap[type], id: parseInt(id) }
      })
      try {
        await supervisorBatchApprove({ items, approverId: this.supervisorId })
        uni.showToast({ title: 'تمت الموافقة', icon: 'success' })
        this.selectedIds = []
        this.loadData()
      } catch (e) { uni.showToast({ title: 'فشلت العملية', icon: 'none' }) }
    },

    async batchReject() {
      const typeMap = { requests: 'request', additions: 'addition', dedections: 'dedection', advances: 'advance', punches: 'punch' }
      const items = this.selectedIds.map(key => {
        const [type, id] = key.split('-')
        return { type: typeMap[type], id: parseInt(id) }
      })
      try {
        await supervisorBatchReject({ items, approverId: this.supervisorId })
        uni.showToast({ title: 'تم الرفض', icon: 'success' })
        this.selectedIds = []
        this.loadData()
      } catch (e) { uni.showToast({ title: 'فشلت العملية', icon: 'none' }) }
    }
  }
}
</script>

<style scoped lang="scss">
.approval-container { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
.page-header { padding: 40rpx 20rpx 24rpx; background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); color: #fff; }
.page-title { font-size: 36rpx; font-weight: 700; display: block; margin-bottom: 8rpx; }
.page-subtitle { font-size: 24rpx; opacity: 0.9; display: block; }
.main-scroll { flex: 1; height: 0; }

.counts-grid { display: flex; flex-wrap: wrap; padding: 16rpx; gap: 12rpx; }
.count-item { flex: 1; min-width: 30%; background: #fff; border-radius: 12rpx; padding: 16rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.count-number { font-size: 36rpx; font-weight: 700; color: #1a365d; display: block; }
.count-label { font-size: 22rpx; color: #64748b; display: block; margin-top: 4rpx; }

.filter-tabs { display: flex; padding: 12rpx 16rpx; overflow-x: auto; white-space: nowrap; gap: 8rpx; }
.tab-item { padding: 12rpx 20rpx; background: #fff; border-radius: 20rpx; font-size: 24rpx; color: #64748b; border: 1rpx solid #e2e8f0; flex-shrink: 0; }
.tab-item.active { background: #1a365d; color: #fff; border-color: #1a365d; }

.batch-actions { display: flex; align-items: center; gap: 12rpx; padding: 12rpx 20rpx; margin: 8rpx 16rpx; background: #eff6ff; border-radius: 12rpx; }
.batch-count { font-size: 26rpx; color: #1e40af; font-weight: 600; flex: 1; }
.btn-batch-approve, .btn-batch-reject { padding: 10rpx 20rpx; border-radius: 8rpx; font-size: 24rpx; font-weight: 600; border: none; }
.btn-batch-approve { background: #16a34a; color: #fff; }
.btn-batch-reject { background: #dc2626; color: #fff; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 100rpx; }
.spinner { width: 60rpx; height: 60rpx; border: 4rpx solid #e2e8f0; border-top-color: #1a365d; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-text { margin-top: 24rpx; font-size: 28rpx; color: #94a3b8; }
.state-icon { font-size: 80rpx; }

.list-content { padding: 16rpx; }
.list-item { display: flex; gap: 12rpx; background: #fff; border-radius: 12rpx; margin-bottom: 16rpx; padding: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.item-checkbox { display: flex; align-items: flex-start; padding-top: 4rpx; }
.checkbox { width: 40rpx; height: 40rpx; border: 2rpx solid #cbd5e1; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; font-size: 24rpx; color: #fff; }
.checkbox.checked { background: #1a365d; border-color: #1a365d; }
.item-content { flex: 1; }
.item-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 8rpx; }
.type-badge { padding: 4rpx 12rpx; border-radius: 6rpx; font-size: 20rpx; font-weight: 600; }
.type-requests { background: #f3e8ff; color: #7c3aed; }
.type-additions { background: #dcfce7; color: #16a34a; }
.type-dedections { background: #fee2e2; color: #dc2626; }
.type-advances { background: #dbeafe; color: #2563eb; }
.type-punches { background: #ffedd5; color: #ea580c; }
.item-name { font-size: 28rpx; font-weight: 600; color: #1e293b; }
.item-details { margin-bottom: 12rpx; }
.detail-text { font-size: 24rpx; color: #475569; display: block; margin-bottom: 4rpx; }
.detail-date { font-size: 22rpx; color: #94a3b8; display: block; }
.item-actions { display: flex; gap: 12rpx; }
.btn-approve, .btn-reject { flex: 1; padding: 14rpx; border-radius: 8rpx; font-size: 24rpx; font-weight: 600; border: none; text-align: center; }
.btn-approve { background: linear-gradient(135deg, #166534, #15803d); color: #fff; }
.btn-reject { background: #fff; color: #dc2626; border: 2rpx solid #fecaca; }
</style>
