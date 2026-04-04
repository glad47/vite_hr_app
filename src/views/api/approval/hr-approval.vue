<template>
  <div class="app-container">
    <div class="page-header">
      <h2>مركز الموافقات - HR</h2>
      <p>جميع الطلبات المعلقة بانتظار موافقة الموارد البشرية (المرحلة الثانية)</p>
    </div>

    <el-row :gutter="16" class="counts-row">
      <el-col :span="3" v-for="(count, key) in pendingCounts" :key="key">
        <el-card shadow="hover" class="count-card" :class="'count-' + key" @click.native="filterByType(key)">
          <div class="count-number">{{ count }}</div>
          <div class="count-label">{{ typeLabels[key] }}</div>
        </el-card>
      </el-col>
      <el-col :span="3">
        <el-card shadow="hover" class="count-card count-total">
          <div class="count-number">{{ totalPending }}</div>
          <div class="count-label">الإجمالي</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mb8 toolbar">
      <el-col :span="6">
        <el-select v-model="filterType" placeholder="تصفية حسب النوع" clearable @change="applyFilter">
          <el-option label="الكل" value="" />
          <el-option label="الاستئذان" value="requests" />
          <el-option label="الإضافات" value="additions" />
          <el-option label="الخصومات" value="dedections" />
          <el-option label="العجوزات" value="dedectionWs" />
          <el-option label="السلف" value="advances" />
          <el-option label="تغيير البصمة" value="punches" />
          <el-option label="الإجازات" value="leaves" />
        </el-select>
      </el-col>
      <el-col :span="18" style="text-align: left;">
        <el-button type="success" :disabled="selectedItems.length === 0" @click="batchApprove">
          <i class="el-icon-check"></i> موافقة ({{ selectedItems.length }})
        </el-button>
        <el-button type="danger" :disabled="selectedItems.length === 0" @click="batchReject">
          <i class="el-icon-close"></i> رفض ({{ selectedItems.length }})
        </el-button>
        <el-button type="primary" icon="el-icon-refresh" @click="loadData">تحديث</el-button>
      </el-col>
    </el-row>

    <el-table :data="filteredItems" v-loading="loading" @selection-change="handleSelectionChange" border stripe style="width: 100%">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="النوع" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="typeTagColor(scope.row._type)" size="small">{{ typeLabels[scope.row._type] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="الموظف" prop="empName" width="150" />
      <el-table-column label="الحالة" width="140" align="center">
        <template slot-scope="scope">
          <el-tag type="warning" size="small">بانتظار HR</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="التفاصيل" min-width="250">
        <template slot-scope="scope">
          <div v-if="scope.row._type === 'requests'">
            تاريخ: {{ scope.row.requestDate }} | نوع: {{ requestTypeLabel(scope.row.type) }}
            <br/>من {{ scope.row.startTime }} إلى {{ scope.row.endTime }}
            <br v-if="scope.row.reason"/>{{ scope.row.reason }}
          </div>
          <div v-else-if="scope.row._type === 'additions' || scope.row._type === 'dedections' || scope.row._type === 'dedectionWs'">
            المبلغ: {{ scope.row.amount }} ر.س | {{ scope.row.dueYear }}/{{ scope.row.dueMonth }}
            <br v-if="scope.row.note"/>{{ scope.row.note }}
          </div>
          <div v-else-if="scope.row._type === 'advances'">
            المبلغ: {{ scope.row.amount }} ر.س | {{ scope.row.months }} شهر
            <br v-if="scope.row.reason"/>السبب: {{ scope.row.reason }}
          </div>
          <div v-else-if="scope.row._type === 'punches'">
            من {{ scope.row.startTime }} إلى {{ scope.row.endTime }}
            <br v-if="scope.row.reason"/>السبب: {{ scope.row.reason }}
          </div>
          <div v-else-if="scope.row._type === 'leaves'">
            من {{ scope.row.startDate }} إلى {{ scope.row.endDate }}
            <br/>{{ scope.row.leaveNature === '0' ? 'بعذر' : 'بغير عذر' }} | {{ leaveTypeLabel(scope.row.leaveType) }}
            <br v-if="scope.row.reason"/>{{ scope.row.reason }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="المشرف" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.supervisorActionBy">✅ وافق</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="تاريخ الإنشاء" prop="createTime" width="160" />
      <el-table-column label="الإجراءات" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="approveItem(scope.row)">موافقة</el-button>
          <el-button size="mini" type="danger" @click="rejectItem(scope.row)">رفض</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="سبب الرفض" :visible.sync="rejectDialogVisible" width="400px">
      <el-input type="textarea" v-model="rejectNote" placeholder="أدخل سبب الرفض (اختياري)" :rows="3" />
      <div slot="footer">
        <el-button @click="rejectDialogVisible = false">إلغاء</el-button>
        <el-button type="danger" @click="confirmReject">تأكيد الرفض</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getHrPendingItems, getHrPendingCounts,
  hrApprove, hrReject, hrBatchApprove, hrBatchReject
} from '@/api/api/approval'

export default {
  name: 'HrApproval',
  data() {
    return {
      loading: false, allItems: [], filteredItems: [], selectedItems: [],
      filterType: '',
      pendingCounts: { requests: 0, additions: 0, dedections: 0, dedectionWs: 0, advances: 0, punches: 0, leaves: 0 },
      typeLabels: {
        requests: 'الاستئذان',
        additions: 'الإضافات',
        dedections: 'الخصومات',
        dedectionWs: 'العجوزات',
        advances: 'السلف',
        punches: 'تغيير البصمة',
        leaves: 'الإجازات'
      },
      rejectDialogVisible: false, rejectNote: '', rejectTarget: null, rejectBatch: false
    }
  },
  computed: {
    totalPending() { return Object.values(this.pendingCounts).reduce((a, b) => a + b, 0) }
  },
  created() { this.loadData() },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [itemsRes, countsRes] = await Promise.all([getHrPendingItems(), getHrPendingCounts()])
        this.pendingCounts = countsRes.data || {}
        this.allItems = []
        const data = itemsRes.data || {}
        for (const type of Object.keys(data)) {
          (data[type] || []).forEach(item => { item._type = type; this.allItems.push(item) })
        }
        this.allItems.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        this.applyFilter()
      } catch (err) { this.$message.error('فشل تحميل البيانات') }
      finally { this.loading = false }
    },
    applyFilter() { this.filteredItems = this.filterType ? this.allItems.filter(i => i._type === this.filterType) : [...this.allItems] },
    filterByType(type) { this.filterType = type; this.applyFilter() },
    handleSelectionChange(val) { this.selectedItems = val },
    typeTagColor(type) { return ({ requests: '', additions: 'success', dedections: 'danger', dedectionWs: 'danger', advances: 'warning', punches: 'info', leaves: '' })[type] || '' },
    requestTypeLabel(type) { return ({ '0': 'خروج وعودة', '1': 'خروج مبكر', '2': 'تأخير في الحضور' })[type] || type },
    
    leaveTypeLabel(type) {
      const labels = { '0': 'سنوية', '1': 'مرضية', '2': 'رسمية', '3': 'خاصة', '4': 'اضطرارية' }
      return labels[type] || type
    },
    async approveItem(item) {
      try {
        await this.$confirm('هل تريد الموافقة على هذا الطلب؟', 'تأكيد', { type: 'success' })
        const typeMap = { requests: 'request', additions: 'addition', dedections: 'dedection', dedectionWs: 'dedectionW', advances: 'advance', punches: 'punch', leaves: 'leave' }
        await hrApprove({ type: typeMap[item._type], id: item.id, hrUserId: this.$store.getters.userId || 1 })
        this.$message.success('تمت الموافقة بنجاح')
        this.loadData()
      } catch (e) { if (e !== 'cancel') this.$message.error('فشلت العملية') }
    },
    rejectItem(item) { this.rejectTarget = item; this.rejectBatch = false; this.rejectNote = ''; this.rejectDialogVisible = true },
    async confirmReject() {
      const typeMap = { requests: 'request', additions: 'addition', dedections: 'dedection', dedectionWs: 'dedectionW', advances: 'advance', punches: 'punch', leaves: 'leave' }
      try {
        if (this.rejectBatch) {
          await hrBatchReject({ items: this.selectedItems.map(i => ({ type: typeMap[i._type], id: i.id })), approverId: this.$store.getters.userId || 1, note: this.rejectNote })
        } else {
          await hrReject({ type: typeMap[this.rejectTarget._type], id: this.rejectTarget.id, hrUserId: this.$store.getters.userId || 1, note: this.rejectNote })
        }
        this.$message.success('تم الرفض بنجاح'); this.rejectDialogVisible = false; this.loadData()
      } catch (e) { this.$message.error('فشلت العملية') }
    },
    async batchApprove() {
      try {
        await this.$confirm('هل تريد الموافقة على ' + this.selectedItems.length + ' طلب؟', 'تأكيد', { type: 'success' })
        const typeMap = { requests: 'request', additions: 'addition', dedections: 'dedection', dedectionWs: 'dedectionW', advances: 'advance', punches: 'punch', leaves: 'leave' }
        await hrBatchApprove({ items: this.selectedItems.map(i => ({ type: typeMap[i._type], id: i.id })), approverId: this.$store.getters.userId || 1 })
        this.$message.success('تمت الموافقة بنجاح'); this.loadData()
      } catch (e) { if (e !== 'cancel') this.$message.error('فشلت العملية') }
    },
    batchReject() { this.rejectBatch = true; this.rejectNote = ''; this.rejectDialogVisible = true }
  }
}
</script>

<style scoped>

.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 5px; color: #1a365d; }
.page-header p { margin: 0; color: #64748b; font-size: 14px; }
.counts-row { margin-bottom: 20px; }
.count-card { text-align: center; cursor: pointer; transition: transform 0.2s; }
.count-card:hover { transform: translateY(-2px); }
.count-number { font-size: 28px; font-weight: 700; color: #1a365d; }
.count-label { font-size: 13px; color: #64748b; margin-top: 4px; }
.count-requests .count-number { color: #9333ea; }
.count-additions .count-number { color: #16a34a; }
.count-dedections .count-number { color: #dc2626; }
.count-dedectionWs .count-number { color: #e11d48; }
.count-advances .count-number { color: #2563eb; }
.count-punches .count-number { color: #ea580c; }
.count-leaves .count-number { color: #0891b2; }
.count-total .count-number { color: #475569; }
.toolbar { margin-bottom: 16px; }

</style>
