<template>
  <view class="requests-page">
    <view class="header">
      <view class="header-content">
        <text class="header-title">طلباتي</text>
        <text class="header-subtitle">جميع طلباتي المقدمة</text>
      </view>
    </view>

    <view class="content">
      <!-- Status Filter -->
      <view class="status-tabs">
        <view class="stab" :class="{ active: statusFilter === '0' }" @click="setStatus('0')">
          <text class="stab-text">قيد الانتظار</text>
        </view>
        <view class="stab" :class="{ active: statusFilter === '3' }" @click="setStatus('3')">
          <text class="stab-text">مقبول</text>
        </view>
        <view class="stab" :class="{ active: statusFilter === 'rejected' }" @click="setStatus('rejected')">
          <text class="stab-text">مرفوض</text>
        </view>
      </view>

      <!-- Type Filter -->
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-tabs">
          <view class="tab" :class="{ active: filterType === '' }" @click="filterByType('')">
            <text class="tab-text">الكل ({{ statusFilteredItems.length }})</text>
          </view>
          <view class="tab" :class="{ active: filterType === key }" v-for="(label, key) in typeLabels" :key="key" @click="filterByType(key)">
            <text class="tab-text">{{ label }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- Loading -->
      <view v-if="loading" class="state-box">
        <text class="state-text">جاري التحميل...</text>
      </view>

      <!-- Empty -->
      <view v-else-if="filteredItems.length === 0" class="state-box">
        <uni-icons type="info" size="50" color="#d1d5db"></uni-icons>
        <text class="state-text">لا توجد طلبات</text>
      </view>

      <!-- Items -->
      <view v-else class="items-list">
        <view class="item-card" v-for="item in filteredItems" :key="item._type + '-' + item.id">
          <view class="item-top">
            <view class="type-badge" :class="'badge-' + item._type">
              <text class="badge-text">{{ typeLabels[item._type] }}</text>
            </view>
            <view class="status-badge" :class="'status-' + item.status">
              <text class="status-text">{{ statusLabel(item.status) }}</text>
            </view>
          </view>

          <view class="item-body">
            <template v-if="item._type === 'requests'">
              <view class="detail-row">
                <text class="detail-label">الاسم</text>
                <text class="detail-value">{{ requestTypeLabel(item.empName) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">النوع</text>
                <text class="detail-value">{{ requestTypeLabel(item.type) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">التاريخ</text>
                <text class="detail-value">{{ item.requestDate }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">الوقت</text>
                <text class="detail-value">{{ item.startTime }} → {{ item.endTime }}</text>
              </view>
              <view class="detail-row" v-if="item.reason">
                <text class="detail-label">السبب</text>
                <text class="detail-value">{{ item.reason }}</text>
              </view>
            </template>
            <template v-else-if="item._type === 'additions' || item._type === 'dedections' || item._type === 'dedectionWs'">
              <view class="detail-row">
                <text class="detail-label">الاسم</text>
                <text class="detail-value">{{ requestTypeLabel(item.empName) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">المبلغ</text>
                <text class="detail-value">{{ item.amount }} ر.س</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">الفترة</text>
                <text class="detail-value">{{ item.dueYear }}/{{ item.dueMonth }}</text>
              </view>
              <view class="detail-row" v-if="item.note">
                <text class="detail-label">ملاحظات</text>
                <text class="detail-value">{{ item.note }}</text>
              </view>
            </template>
            <template v-else-if="item._type === 'advances'">
              <view class="detail-row">
                <text class="detail-label">الاسم</text>
                <text class="detail-value">{{ requestTypeLabel(item.empName) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">المبلغ</text>
                <text class="detail-value">{{ item.amount }} ر.س</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">الأقساط</text>
                <text class="detail-value">{{ item.months }} شهر</text>
              </view>
            </template>
            <template v-else-if="item._type === 'punches'">
              <view class="detail-row">
                <text class="detail-label">الاسم</text>
                <text class="detail-value">{{ requestTypeLabel(item.empName) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">الوقت</text>
                <text class="detail-value">{{ item.startTime }} → {{ item.endTime }}</text>
              </view>
            </template>
            <template v-else-if="item._type === 'leaves'">
              <view class="detail-row">
                <text class="detail-label">الاسم</text>
                <text class="detail-value">{{ requestTypeLabel(item.empName) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">النوع</text>
                <text class="detail-value">{{ leaveTypeLabel(item.leaveType) }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">من</text>
                <text class="detail-value">{{ item.startDate }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">إلى</text>
                <text class="detail-value">{{ item.endDate }}</text>
              </view>
            </template>
          </view>

          <view class="item-footer">
            <text class="footer-date">{{ item.createTime }}</text>
            <button v-if="item.status === '0'" class="btn-delete" @click="deleteItem(item)">
              <uni-icons type="trash" size="16" color="#dc2626"></uni-icons>
              <text class="btn-delete-text">حذف</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request'
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export default {
  name: 'MyRequests',
  components: { uniIcons },
  data() {
    return {
      loading: false,
      allItems: [],
      statusFilteredItems: [],
      filteredItems: [],
      filterType: '',
      statusFilter: '0', // Default: pending
      typeLabels: {
        requests: 'الاستئذان',
        leaves: 'الإجازات',
        additions: 'الإضافات',
        dedections: 'الخصومات',
        dedectionWs: 'العجوزات',
        advances: 'السلف',
        punches: 'تغيير البصمة'
      }
    }
  },
  computed: {
    empId() {
      return this.$store?.state?.user?.hrUser?.id || ''
    }
  },
  onShow() {
    if (this.empId) this.loadData()
  },
  watch: {
    empId(val) { if (val) this.loadData() }
  },
  onPullDownRefresh() {
    this.loadData().then(() => uni.stopPullDownRefresh())
  },
  methods: {
    async loadData() {
      if (!this.empId) return
      this.loading = true
      try {
        const res = await request({ url: '/api/my-requests/' + this.empId, method: 'get' })
        const data = res.data || {}
        this.allItems = []
        const types = ['requests', 'leaves', 'additions', 'dedections', 'dedectionWs', 'advances', 'punches']
        types.forEach(type => {
          (data[type] || []).forEach(r => { r._type = type; this.allItems.push(r) })
        })
        this.allItems.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        this.applyFilter()
      } catch (e) {
        console.error('Load error:', e)
      } finally {
        this.loading = false
      }
    },

    setStatus(s) {
      this.statusFilter = s
      this.applyFilter()
    },

    filterByType(type) {
      this.filterType = type
      this.applyFilter()
    },

    applyFilter() {
      // First filter by status
      if (this.statusFilter === 'rejected') {
        this.statusFilteredItems = this.allItems.filter(i => i.status === '2' || i.status === '4')
      } else {
        this.statusFilteredItems = this.allItems.filter(i => i.status === this.statusFilter)
      }
      // Then filter by type
      this.filteredItems = this.filterType
        ? this.statusFilteredItems.filter(i => i._type === this.filterType)
        : [...this.statusFilteredItems]
    },

    statusLabel(s) {
      return { '0': 'قيد الانتظار', '1': 'بانتظار HR', '2': 'مرفوض', '3': 'مقبول', '4': 'مرفوض من HR' }[s] || s
    },
    requestTypeLabel(t) {
      return { '0': 'خروج وعودة', '1': 'خروج مبكر', '2': 'تأخير' }[t] || t
    },
    leaveTypeLabel(t) {
      return { '0': 'سنوية', '1': 'مرضية', '2': 'رسمية', '3': 'خاصة', '4': 'اضطرارية' }[t] || t
    },

    deleteItem(item) {
      uni.showModal({
        title: 'حذف الطلب',
        content: 'هل أنت متأكد من حذف هذا الطلب؟',
        success: async (res) => {
          if (!res.confirm) return
          try {
            const urlMap = {
              requests: '/api/request/',
              leaves: '/api/leave/',
              additions: '/api/addition/',
              dedections: '/api/dedection/',
              dedectionWs: '/api/dedectionW/',
              advances: '/api/advance/',
              punches: '/api/punch/'
            }
            const url = urlMap[item._type]
            if (url) {
              await request({ url: url + item.id, method: 'delete' })
            }
            const idx = this.allItems.findIndex(i => i._type === item._type && i.id === item.id)
            if (idx > -1) this.allItems.splice(idx, 1)
            this.applyFilter()
            uni.showToast({ title: 'تم الحذف', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: 'فشل الحذف', icon: 'none' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.requests-page { min-height: 100vh; background: linear-gradient(135deg, #76c4cc 0%, #4a9da6 100%); direction: rtl; }
.header { padding: 60rpx 30rpx 30rpx; }
.header-content { display: flex; flex-direction: column; gap: 8rpx; }
.header-title { font-size: 44rpx; font-weight: 800; color: #fff; }
.header-subtitle { font-size: 26rpx; color: rgba(255,255,255,0.85); }
.content { background: #f8fafc; border-radius: 40rpx 40rpx 0 0; padding: 24rpx; min-height: calc(100vh - 200rpx); }

/* Status Tabs */
.status-tabs { display: flex; gap: 12rpx; margin-bottom: 20rpx; }
.stab { flex: 1; text-align: center; padding: 18rpx; border-radius: 16rpx; background: #fff; border: 2rpx solid #e2e8f0; }
.stab.active { border-color: #4a9da6; background: #4a9da6; }
.stab.active .stab-text { color: #fff; }
.stab-text { font-size: 26rpx; font-weight: 600; color: #475569; }

/* Type Filter */
.filter-scroll { margin-bottom: 20rpx; }
.filter-tabs { display: flex; gap: 12rpx; padding: 4rpx 0; }
.tab { padding: 14rpx 24rpx; border-radius: 50rpx; background: #fff; border: 2rpx solid #e2e8f0; white-space: nowrap; flex-shrink: 0; }
.tab.active { background: #4a9da6; border-color: #4a9da6; }
.tab.active .tab-text { color: #fff; }
.tab-text { font-size: 24rpx; color: #475569; font-weight: 600; }

.state-box { display: flex; flex-direction: column; align-items: center; padding: 100rpx 0; gap: 16rpx; }
.state-text { font-size: 28rpx; color: #94a3b8; }

.items-list { display: flex; flex-direction: column; gap: 16rpx; }
.item-card { background: #fff; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }

.item-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.type-badge { padding: 6rpx 16rpx; border-radius: 8rpx; }
.badge-text { font-size: 22rpx; font-weight: 600; color: #fff; }
.badge-requests { background: #9333ea; }
.badge-additions { background: #16a34a; }
.badge-dedections { background: #dc2626; }
.badge-dedectionWs { background: #e11d48; }
.badge-advances { background: #2563eb; }
.badge-punches { background: #ea580c; }
.badge-leaves { background: #0891b2; }

.status-badge { padding: 6rpx 16rpx; border-radius: 8rpx; }
.status-text { font-size: 22rpx; font-weight: 600; }
.status-0 { background: #fef3c7; } .status-0 .status-text { color: #d97706; }
.status-1 { background: #dbeafe; } .status-1 .status-text { color: #2563eb; }
.status-2 { background: #fee2e2; } .status-2 .status-text { color: #dc2626; }
.status-3 { background: #dcfce7; } .status-3 .status-text { color: #16a34a; }
.status-4 { background: #fee2e2; } .status-4 .status-text { color: #dc2626; }

.item-body { display: flex; flex-direction: column; gap: 8rpx; }
.detail-row { display: flex; gap: 12rpx; }
.detail-label { font-size: 24rpx; color: #94a3b8; min-width: 100rpx; }
.detail-value { font-size: 24rpx; color: #1e293b; font-weight: 500; flex: 1; }

.item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid #f1f5f9; }
.footer-date { font-size: 22rpx; color: #94a3b8; }
.btn-delete { display: flex; align-items: center; gap: 6rpx; background: #fee2e2; padding: 10rpx 20rpx; border-radius: 10rpx; border: none; }
.btn-delete-text { font-size: 22rpx; color: #dc2626; font-weight: 600; }
</style>
