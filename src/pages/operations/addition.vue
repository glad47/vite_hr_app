<template>
  <view class="addition-container">
    <!-- Header - Fixed -->
    <view class="page-header">
      <text class="page-title">الإضافات</text>
      <text class="page-subtitle">إدارة طلبات الإضافات المالية</text>
    </view>
    
    <!-- Scrollable Content -->
    <scroll-view 
      class="main-scroll" 
      scroll-y 
      :lower-threshold="150"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      :enable-back-to-top="true"
    >
      <!-- Supervisor Pending Count -->
      <view class="pending-banner" v-if="isSupervisor && pendingCount > 0">
        <uni-icons type="info-filled" size="20" color="#1e40af"></uni-icons>
        <text class="pending-text">يوجد {{ pendingCount }} طلب معلق للمرؤوسين</text>
      </view>
      
      <!-- Mode Switch for Supervisors -->
      <view class="mode-section" v-if="isSupervisor">
        <view class="mode-switch">
          <view 
            class="mode-btn" 
            :class="{ active: currentMode === 'personal' }"
            @click="switchMode('personal')"
          >
            <text class="mode-text">إضافاتي</text>
          </view>
          <view 
            class="mode-btn" 
            :class="{ active: currentMode === 'supervised' }"
            @click="switchMode('supervised')"
          >
            <text class="mode-text">المرؤوسين</text>
            <text class="mode-count" v-if="pendingCount > 0">({{ pendingCount }})</text>
          </view>
        </view>
      </view>
      
      <!-- Employee Filter (Supervised Mode) - Searchable -->
      <view class="filter-bar" v-if="isSupervisor && currentMode === 'supervised'">
        <text class="filter-title">الموظف:</text>
        <view class="filter-search-container">
          <!-- Selected Employee Display -->
          <view class="filter-selected-display" v-if="selectedFilterEmployee && !showFilterEmpList">
            <text class="filter-selected-name">{{ selectedFilterEmployee.name }}</text>
            <view class="filter-actions">
              <view class="filter-clear-btn" @tap="clearFilterEmployee">
                <uni-icons type="clear" size="16" color="#94a3b8"></uni-icons>
              </view>
              <view class="filter-change-btn" @tap="showFilterEmpList = true">
                <uni-icons type="compose" size="16" color="#1a365d"></uni-icons>
              </view>
            </view>
          </view>
          
          <!-- Search Interface -->
          <view v-else class="filter-search-wrapper">
            <uni-easyinput
              v-model="filterEmpSearchText"
              :placeholder="'ابحث عن الموظف...'"
              :clearable="true"
              :prefixIcon="'search'"
              @input="filterFilterEmployees"
              @focus="handleFilterEmpFocus"
              @blur="handleFilterEmpBlur"
              @clear="clearFilterSearch"
              trim="both"
            ></uni-easyinput>
            
            <!-- Filter Employee List Dropdown -->
            <view class="filter-emp-list-container" v-if="showFilterEmpList">
              <scroll-view class="filter-emp-list-scroll" scroll-y>
                <view v-if="filteredFilterEmps && filteredFilterEmps.length > 0">
                  <view 
                    class="filter-emp-item"
                    :class="{ 'filter-emp-selected': isFilterEmpSelected(emp) }"
                    v-for="emp in filteredFilterEmps"
                    :key="emp.id !== null ? emp.id : 'all'"
                    @tap="selectFilterEmployee(emp)"
                  >
                    <view class="filter-emp-avatar">
                      <uni-icons type="person" size="20" :color="isFilterEmpSelected(emp) ? '#1a365d' : '#94a3b8'"></uni-icons>
                    </view>
                    <text class="filter-emp-name">{{ emp.name }}</text>
                    <view class="filter-emp-check" v-if="isFilterEmpSelected(emp)">
                      <uni-icons type="checkmarkempty" size="18" color="#166534"></uni-icons>
                    </view>
                  </view>
                </view>
                <view v-else class="filter-emp-empty">
                  <text>{{ supervisedEmployees.length === 0 ? 'لا يوجد مرؤوسين' : 'لا توجد نتائج' }}</text>
                </view>
              </scroll-view>
            </view>
            
            <!-- Open Search Button -->
            <view v-if="!showFilterEmpList && !selectedFilterEmployee" class="filter-open-btn" @tap="openFilterEmpList">
              <uni-icons type="search" size="16" color="#1a365d"></uni-icons>
              <text>اختر موظف</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Search Filters -->
      <view class="search-section">
        <view class="search-row">
          <view class="search-item">
            <text class="search-label">السنة</text>
            <picker @change="onYearChange" :value="yearIndex" :range="years">
              <view class="search-select">
                <text>{{ queryParams.dueYear || 'الكل' }}</text>
                <uni-icons type="arrowdown" size="12" color="#64748b"></uni-icons>
              </view>
            </picker>
          </view>
          <view class="search-item">
            <text class="search-label">الشهر</text>
            <picker @change="onMonthChange" :value="monthIndex" :range="months" range-key="label">
              <view class="search-select">
                <text>{{ getMonthLabel(queryParams.dueMonth) || 'الكل' }}</text>
                <uni-icons type="arrowdown" size="12" color="#64748b"></uni-icons>
              </view>
            </picker>
          </view>
          <view class="search-item">
            <text class="search-label">الحالة</text>
            <picker @change="onStatusChange" :value="statusIndex" :range="statuses" range-key="label">
              <view class="search-select">
                <text>{{ getStatusLabel(queryParams.status) || 'الكل' }}</text>
                <uni-icons type="arrowdown" size="12" color="#64748b"></uni-icons>
              </view>
            </picker>
          </view>
        </view>
        <view class="search-actions">
          <button class="btn-search" @click="handleSearch">بحث</button>
          <button class="btn-reset" @click="handleReset">إعادة تعيين</button>
        </view>
      </view>
      
      <!-- Add Button -->
      <view class="action-bar">
        <button class="btn-add" @click="handleAdd">
          <uni-icons type="plus" size="18" color="#fff"></uni-icons>
          <text>إضافة طلب جديد</text>
        </button>
      </view>
      
      <!-- Results Summary -->
      <view class="results-bar" v-if="total > 0">
        <text class="results-text">إجمالي النتائج: {{ total }}</text>
      </view>
      
      <!-- List Content -->
      <!-- Loading -->
      <view v-if="loading && additionList.length === 0" class="state-box">
        <view class="spinner"></view>
        <text class="state-text">جاري التحميل...</text>
      </view>
      
      <!-- Empty -->
      <view v-else-if="!loading && additionList.length === 0" class="state-box">
        <text class="state-icon">📋</text>
        <text class="state-text">لا توجد بيانات</text>
      </view>
      
      <!-- Data List -->
      <view v-else class="list-content">
        <view class="list-item" v-for="item in additionList" :key="item.id">
          <!-- Item Header -->
          <view class="item-header">
            <view class="item-amount">
              <text class="amount-number">{{ formatAmount(item.amount) }}</text>
              <text class="amount-unit">ريال</text>
            </view>
            <view class="item-status" :class="'status-' + item.status">
              {{ getStatusText(item.status) }}
            </view>
          </view>
          
          <!-- Item Details -->
          <view class="item-body">
            <view class="detail-row">
              <text class="detail-label">الموظف</text>
              <text class="detail-value emp-name">{{ item.empName }}</text>
            </view>
            
            <view class="detail-row">
              <text class="detail-label">فترة الاستحقاق</text>
              <text class="detail-value">{{ getMonthName(item.dueMonth) }} {{ item.dueYear }}</text>
            </view>
            <view class="detail-row" v-if="item.note">
              <text class="detail-label">ملاحظة</text>
              <text class="detail-value">{{ item.note }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">تاريخ الإنشاء</text>
              <text class="detail-value">{{ formatDate(item.createTime) }}</text>
            </view>
          </view>
          
          <!-- Item Actions -->
          <view class="item-footer">
            <!-- Edit/Delete for pending requests (Personal mode or Supervisor in supervised mode) -->
            <template v-if="item.status === '0'">
              <template v-if="currentMode === 'personal' || (currentMode === 'supervised' && isSupervisor)">
                <button class="btn-edit" @click="handleEdit(item)">تعديل</button>
                <button class="btn-delete" @click="handleDelete(item)">حذف</button>
              </template>
            </template>
            
            <!-- Approve/Reject for supervisors in supervised mode 
            <template v-if="currentMode === 'supervised' && isSupervisor && item.status === '0'">
              <button class="btn-approve" @click="handleApprove(item)">موافقة</button>
              <button class="btn-reject" @click="handleReject(item)">رفض</button>
            </template>
			-->
          </view>
        </view>
        
        <!-- Load More -->
        <view class="load-more" v-if="loadingMore">
          <view class="spinner small"></view>
          <text>جاري التحميل...</text>
        </view>
        <view class="no-more" v-else-if="!hasMore && additionList.length > 0">
          <text>— نهاية القائمة —</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- Add/Edit Dialog -->
    <uni-popup ref="formDialog" type="center" :mask-click="false">
      <view class="dialog-box">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEdit ? 'تعديل الإضافة' : 'إضافة جديدة' }}</text>
          <view class="dialog-close" @click="closeDialog">✕</view>
        </view>
        <scroll-view class="dialog-body" scroll-y>
          <!-- Employee Selection (Supervisor only, in supervised mode, not edit) -->
          <view class="form-field" v-if="isSupervisor && !isEdit && currentMode === 'supervised'">
            <text class="field-label required">الموظف</text>
            
            <!-- Selected Employee Display -->
            <view class="selected-emp-display" v-if="form.empId && !showEmpList">
              <view class="selected-emp-content">
                <view class="selected-emp-avatar">
                  <uni-icons type="person-filled" size="24" color="#fff"></uni-icons>
                </view>
                <view class="selected-emp-details">
                  <text class="selected-emp-name">{{ getSelectedEmpName() }}</text>
                  <text class="selected-emp-label">الموظف المحدد</text>
                </view>
              </view>
              <view class="change-emp-btn" @tap="showEmpList = true">
                <uni-icons type="compose" size="18" color="#1a365d"></uni-icons>
                <text>تغيير</text>
              </view>
            </view>
            
            <!-- Search Interface (when no selection or changing) -->
            <view v-else class="emp-search-container">
              <!-- Search Input Box -->
              <view class="emp-search-wrapper" :class="{ focused: showEmpList }">
                <uni-easyinput
                  v-model="empSearchText"
                  :placeholder="'ابحث عن الموظف بالاسم...'"
                  :clearable="true"
                  :prefixIcon="'search'"
                  @input="filterEmployees"
                  @focus="handleEmpSearchFocus"
                  @blur="handleEmpSearchBlur"
                  @clear="clearEmpSearch"
                  trim="both"
                ></uni-easyinput>
              </view>
              
              <!-- Employee List Dropdown -->
              <view class="emp-list-container" v-if="showEmpList && !form.empId">
                <!-- List Header with Count -->
                <view class="emp-list-header" v-if="filteredEmps.length > 0">
                  <text class="emp-list-count">إجمالي: {{ filteredEmps.length }} موظف</text>
                </view>
                
                <scroll-view 
                  class="emp-list-scroll" 
                  scroll-y
                  :scroll-top="scrollTop"
                  :lower-threshold="50"
                  @scrolltolower="loadMoreEmployees"
                  :enable-back-to-top="true"
                >
                  <view v-if="filteredEmps.length > 0">
                    <view 
                      class="emp-item"
                      :class="{ 'emp-item-selected': form.empId === emp.id }"
                      v-for="emp in displayedEmps"
                      :key="emp.id"
                      @tap="selectEmployee(emp)"
                    >
                      <view class="emp-item-avatar">
                        <uni-icons 
                          type="person" 
                          size="22" 
                          :color="form.empId === emp.id ? '#1a365d' : '#94a3b8'"
                        ></uni-icons>
                      </view>
                      <view class="emp-item-info">
                        <text class="emp-item-name">{{ emp.name }}</text>
                        <text class="emp-item-badge" v-if="emp.id === currentUserId">أنا</text>
                      </view>
                      <view class="emp-item-check" v-if="form.empId === emp.id">
                        <uni-icons type="checkmarkempty" size="22" color="#166534"></uni-icons>
                      </view>
                    </view>
                    
                    <!-- Load More Indicator -->
                    <view v-if="hasMoreEmployees && !empSearchText" class="emp-load-more">
                      <text>جاري التحميل...</text>
                    </view>
                    
                    <!-- Show All Button if there are more -->
                    <view v-if="hasMoreEmployees && !empSearchText && displayedEmps.length < filteredEmps.length" class="emp-show-all" @tap="showAllEmployees">
                      <text>عرض الكل ({{ filteredEmps.length }})</text>
                    </view>
                  </view>
                  
                  <!-- Empty State -->
                  <view v-else class="emp-empty-state">
                    <uni-icons type="person" size="48" color="#cbd5e1"></uni-icons>
                    <text class="emp-empty-text">{{ empSearchText ? 'لا توجد نتائج للبحث' : 'لا يوجد موظفين' }}</text>
                  </view>
                </scroll-view>
              </view>
              
              <!-- Open Search Button (when closed) -->
              <view v-if="!showEmpList && !form.empId" class="open-search-button" @tap="showEmpList = true">
                <uni-icons type="person-add" size="20" color="#1a365d"></uni-icons>
                <text>اختر موظف</text>
              </view>
            </view>
          </view>
          
          <!-- Year -->
          <view class="form-field">
            <text class="field-label required">سنة الاستحقاق</text>
            <picker @change="onFormYearChange" :value="formYearIndex" :range="formYears">
              <view class="field-select">
                <text :class="{ placeholder: !form.dueYear }">{{ form.dueYear || 'اختر السنة' }}</text>
                <uni-icons type="arrowdown" size="14" color="#94a3b8"></uni-icons>
              </view>
            </picker>
          </view>
          
          <!-- Month -->
          <view class="form-field">
            <text class="field-label required">شهر الاستحقاق</text>
            <picker @change="onFormMonthChange" :value="formMonthIndex" :range="formMonths" range-key="label">
              <view class="field-select">
                <text :class="{ placeholder: !form.dueMonth }">{{ getMonthName(form.dueMonth) || 'اختر الشهر' }}</text>
                <uni-icons type="arrowdown" size="14" color="#94a3b8"></uni-icons>
              </view>
            </picker>
          </view>
          
          <!-- Amount -->
          <view class="form-field">
            <text class="field-label required">المبلغ</text>
            <view class="field-input-wrap">
              <uni-easyinput
                v-model="form.amount"
                type="number"
                placeholder="0.00"
                :clearable="true"
              />
              <text class="field-suffix">ريال</text>
            </view>
          </view>
          
          <!-- Note -->
          <view class="form-field">
            <text class="field-label">ملاحظة</text>
            <textarea 
              class="field-textarea" 
              v-model="form.note" 
              placeholder="ملاحظات إضافية (اختياري)"
              maxlength="500"
            />
          </view>
        </scroll-view>
        <view class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">إلغاء</button>
          <button class="btn-submit" @click="submitForm" :disabled="submitting">
            {{ submitting ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { 
  listAddition, 
  getAddition, 
  addAddition, 
  updateAddition, 
  delAddition,
  listSuperviseesAdditions,
  countPendingAdditions,
  approveAddition,
  rejectAddition
} from '@/api/api/addition'

import { getSupervisees, listEmp } from '@/api/api/emp'

export default {
  data() {
    return {
      // User
      isSupervisor: false,
      currentUserId: null,
      currentUserName: '',
      
      // Mode
      currentMode: 'personal',
      
      // Employees
      supervisedEmployees: [],
      employeeFilterOptions: [],
      filterEmployeeIndex: 0,
      selectedFilterEmployee: null,
      
      // Filter employee search
      filterEmpSearchText: '',
      showFilterEmpList: false,
      filteredFilterEmps: [],
      
      // Employee search in form
      allEmpsForForm: [],
      filteredEmps: [],
      displayedEmps: [],
      empSearchText: '',
      showEmpList: false,
      empListPageSize: 20,
      empListCurrentPage: 1,
      hasMoreEmployees: false,
      scrollTop: 0,
      
      // Pending
      pendingCount: 0,
      
      // Loading
      loading: false,
      loadingMore: false,
      isRefreshing: false,
      submitting: false,
      
      // List
      additionList: [],
      total: 0,
      hasMore: true,
      
      // Query
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        empId: null,
        dueYear: null,
        dueMonth: null,
        status: null
      },
      
      // Filters
      years: ['الكل', '2024', '2025', '2026', '2027'],
      yearIndex: 0,
      months: [
        { label: 'الكل', value: null },
        { label: 'يناير', value: 1 },
        { label: 'فبراير', value: 2 },
        { label: 'مارس', value: 3 },
        { label: 'أبريل', value: 4 },
        { label: 'مايو', value: 5 },
        { label: 'يونيو', value: 6 },
        { label: 'يوليو', value: 7 },
        { label: 'أغسطس', value: 8 },
        { label: 'سبتمبر', value: 9 },
        { label: 'أكتوبر', value: 10 },
        { label: 'نوفمبر', value: 11 },
        { label: 'ديسمبر', value: 12 }
      ],
      monthIndex: 0,
      statuses: [
        { label: 'الكل', value: null },
        { label: 'قيد الانتظار', value: '0' },
        { label: 'مقبولة', value: '1' },
        { label: 'مرفوضة', value: '2' }
      ],
      statusIndex: 0,
      
      // Form
      isEdit: false,
      form: {
        id: null,
        empId: null,
        dueYear: null,
        dueMonth: null,
        amount: null,
        note: null
      },
      formYears: ['2024', '2025', '2026', '2027'],
      formYearIndex: -1,
      formMonths: [
        { label: 'يناير', value: 1 },
        { label: 'فبراير', value: 2 },
        { label: 'مارس', value: 3 },
        { label: 'أبريل', value: 4 },
        { label: 'مايو', value: 5 },
        { label: 'يونيو', value: 6 },
        { label: 'يوليو', value: 7 },
        { label: 'أغسطس', value: 8 },
        { label: 'سبتمبر', value: 9 },
        { label: 'أكتوبر', value: 10 },
        { label: 'نوفمبر', value: 11 },
        { label: 'ديسمبر', value: 12 }
      ],
      formMonthIndex: -1
    }
  },
  
  computed: {
    userInfo() {
      return this.$store.state.user.hrUser
    }
  },
  
  onLoad() {
    this.initPage()
  },
  
  methods: {
    async initPage() {
      if (this.userInfo) {
        this.currentUserId = this.userInfo.id
        this.currentUserName = this.userInfo.name
        this.isSupervisor = this.userInfo.isSupervisor === '1' || this.userInfo.isSupervisor === true
      }
      
      if (this.isSupervisor) {
        await this.loadSupervisedEmployees()
        await this.loadPendingCount()
      }
      
      this.loadList()
    },
    
    async loadSupervisedEmployees() {
      try {
        const res = await getSupervisees(this.currentUserId)
        this.supervisedEmployees = res.data || []
        
        this.employeeFilterOptions = [
          { id: null, name: 'جميع المرؤوسين' },
          ...this.supervisedEmployees
        ]
        
        // Include supervisees for form search
        this.allEmpsForForm = [...this.supervisedEmployees]
        this.filteredEmps = [...this.allEmpsForForm]
        this.updateDisplayedEmps()
        
        // Setup filter employee options (for top filter)
        this.filteredFilterEmps = [
          { id: null, name: 'جميع المرؤوسين' },
          ...this.supervisedEmployees
        ]
      } catch (error) {
        console.error('Error loading supervisees:', error)
        this.supervisedEmployees = []
        this.employeeFilterOptions = [{ id: null, name: 'جميع المرؤوسين' }]
        this.allEmpsForForm = []
        this.filteredEmps = []
        this.updateDisplayedEmps()
        this.filteredFilterEmps = [{ id: null, name: 'جميع المرؤوسين' }]
      }
    },
    
    async loadPendingCount() {
      try {
        const res = await countPendingAdditions(this.currentUserId)
        this.pendingCount = res.data || 0
      } catch (error) {
        this.pendingCount = 0
      }
    },
    
    switchMode(mode) {
      if (!this.isSupervisor) {
        this.currentMode = 'personal'
        return
      }
      this.currentMode = mode
      this.selectedFilterEmployee = null
      this.queryParams.pageNum = 1
      this.additionList = []
      this.hasMore = true
      this.loadList()
    },
    
    // Filter employee search methods
    openFilterEmpList() {
      this.filteredFilterEmps = [
        { id: null, name: 'جميع المرؤوسين' },
        ...this.supervisedEmployees
      ]
      this.showFilterEmpList = true
    },
    
    handleFilterEmpFocus() {
      this.openFilterEmpList()
    },
    
    handleFilterEmpBlur() {
      setTimeout(() => {
        if (!this.selectedFilterEmployee) {
          if (!this.filterEmpSearchText) {
            this.showFilterEmpList = false
          }
        }
      }, 300)
    },
    
    filterFilterEmployees() {
      const text = (this.filterEmpSearchText || '').trim().toLowerCase()
      
      if (!text) {
        this.filteredFilterEmps = [
          { id: null, name: 'جميع المرؤوسين' },
          ...this.supervisedEmployees
        ]
      } else {
        const allOptions = [
          { id: null, name: 'جميع المرؤوسين' },
          ...this.supervisedEmployees
        ]
        this.filteredFilterEmps = allOptions.filter(emp => {
          if (!emp || !emp.name) return false
          return emp.name.toLowerCase().includes(text)
        })
      }
      this.showFilterEmpList = true
    },
    
    isFilterEmpSelected(emp) {
      if (emp.id === null) {
        return this.selectedFilterEmployee === null
      }
      return this.selectedFilterEmployee && this.selectedFilterEmployee.id === emp.id
    },
    
    selectFilterEmployee(emp) {
      this.selectedFilterEmployee = emp.id === null ? null : emp
      this.filterEmpSearchText = emp.name
      this.showFilterEmpList = false
      this.queryParams.pageNum = 1
      this.additionList = []
      this.loadList()
    },
    
    clearFilterEmployee() {
      this.selectedFilterEmployee = null
      this.filterEmpSearchText = ''
      this.showFilterEmpList = false
      this.queryParams.pageNum = 1
      this.additionList = []
      this.loadList()
    },
    
    clearFilterSearch() {
      this.filterEmpSearchText = ''
      this.filteredFilterEmps = [
        { id: null, name: 'جميع المرؤوسين' },
        ...this.supervisedEmployees
      ]
      this.showFilterEmpList = true
    },
    
    async loadList() {
      if (this.loading) return
      this.loading = true
      
      if (!this.isSupervisor) {
        this.currentMode = 'personal'
      }
      
      try {
        let response
        
        if (this.currentMode === 'personal' || !this.isSupervisor) {
          this.queryParams.empId = this.currentUserId
          response = await listAddition(this.queryParams)
        } else {
          const params = { ...this.queryParams }
          if (this.selectedFilterEmployee && this.selectedFilterEmployee.id) {
            params.empId = this.selectedFilterEmployee.id
          } else {
            params.empId = null
          }
          response = await listSuperviseesAdditions(this.currentUserId, params)
        }
        
        this.additionList = response.rows || []
        this.total = response.total || 0
        this.hasMore = this.additionList.length < this.total
      } catch (error) {
        console.error('Load list error:', error)
        uni.showToast({ title: 'فشل التحميل', icon: 'none' })
      } finally {
        this.loading = false
        this.isRefreshing = false
      }
    },
    
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return
      
      if (!this.isSupervisor) {
        this.currentMode = 'personal'
      }
      
      this.loadingMore = true
      this.queryParams.pageNum++
      
      try {
        let response
        if (this.currentMode === 'personal' || !this.isSupervisor) {
          this.queryParams.empId = this.currentUserId
          response = await listAddition(this.queryParams)
        } else {
          const params = { ...this.queryParams }
          if (this.selectedFilterEmployee && this.selectedFilterEmployee.id) {
            params.empId = this.selectedFilterEmployee.id
          }
          response = await listSuperviseesAdditions(this.currentUserId, params)
        }
        
        const newItems = response.rows || []
        this.additionList = [...this.additionList, ...newItems]
        this.total = response.total || 0
        this.hasMore = this.additionList.length < this.total
      } catch (error) {
        console.error('Load more error:', error)
        this.queryParams.pageNum--
        uni.showToast({ title: 'فشل تحميل المزيد', icon: 'none' })
      } finally {
        this.loadingMore = false
      }
    },
    
    async onRefresh() {
      this.isRefreshing = true
      this.queryParams.pageNum = 1
      this.additionList = []
      this.hasMore = true
      
      await this.loadList()
      
      if (this.isSupervisor) {
        await this.loadPendingCount()
      }
    },
    
    // Filters
    onYearChange(e) {
      this.yearIndex = e.detail.value
      this.queryParams.dueYear = this.yearIndex === 0 ? null : this.years[this.yearIndex]
    },
    
    onMonthChange(e) {
      this.monthIndex = e.detail.value
      this.queryParams.dueMonth = this.months[this.monthIndex].value
    },
    
    onStatusChange(e) {
      this.statusIndex = e.detail.value
      this.queryParams.status = this.statuses[this.statusIndex].value
    },
    
    handleSearch() {
      this.queryParams.pageNum = 1
      this.additionList = []
      this.hasMore = true
      this.loadList()
    },
    
    handleReset() {
      this.resetFilters()
      this.loadList()
    },
    
    resetFilters() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        empId: null,
        dueYear: null,
        dueMonth: null,
        status: null
      }
      this.yearIndex = 0
      this.monthIndex = 0
      this.statusIndex = 0
      this.filterEmployeeIndex = 0
      this.selectedFilterEmployee = null
      this.filterEmpSearchText = ''
      this.showFilterEmpList = false
      this.filteredFilterEmps = [
        { id: null, name: 'جميع المرؤوسين' },
        ...this.supervisedEmployees
      ]
      this.additionList = []
      this.hasMore = true
    },
    
    // Employee search
    handleEmpSearchFocus() {
      this.showEmpList = true
      if (!this.empSearchText || this.filteredEmps.length === 0) {
        this.filteredEmps = [...this.allEmpsForForm]
        this.updateDisplayedEmps()
      }
    },
    
    handleEmpSearchBlur() {
      setTimeout(() => {
        if (!this.form.empId) {
          if (!this.empSearchText) {
            this.showEmpList = false
          }
        }
      }, 300)
    },
    
    filterEmployees() {
      const text = (this.empSearchText || '').trim().toLowerCase()
      
      this.empListCurrentPage = 1
      this.scrollTop = 0
      
      if (!text) {
        this.filteredEmps = [...this.allEmpsForForm]
      } else {
        this.filteredEmps = this.allEmpsForForm.filter(emp => {
          if (!emp || !emp.name) return false
          return emp.name.toLowerCase().includes(text)
        })
      }
      
      this.updateDisplayedEmps()
      this.showEmpList = true
    },
    
    updateDisplayedEmps() {
      if (this.empSearchText) {
        this.displayedEmps = this.filteredEmps
        this.hasMoreEmployees = false
      } else {
        const endIndex = this.empListCurrentPage * this.empListPageSize
        this.displayedEmps = this.filteredEmps.slice(0, endIndex)
        this.hasMoreEmployees = endIndex < this.filteredEmps.length
      }
    },
    
    loadMoreEmployees() {
      if (this.hasMoreEmployees && !this.empSearchText) {
        this.empListCurrentPage++
        this.updateDisplayedEmps()
      }
    },
    
    showAllEmployees() {
      this.displayedEmps = [...this.filteredEmps]
      this.hasMoreEmployees = false
    },
    
    clearEmpSearch() {
      this.empSearchText = ''
      this.empListCurrentPage = 1
      this.scrollTop = 0
      this.filteredEmps = [...this.allEmpsForForm]
      this.updateDisplayedEmps()
      this.showEmpList = true
    },
    
    selectEmployee(emp) {
      this.form.empId = emp.id;
      this.empSearchText = emp.name;
      this.showEmpList = false;
    },
    
    getSelectedEmpName() {
      const emp = this.allEmpsForForm.find(e => e.id === this.form.empId)
      return emp ? emp.name : ''
    },
    
    // Add/Edit
    async handleAdd() {
      this.isEdit = false
      this.resetForm()
      
      // Auto-select current user in personal mode
      if (this.currentMode === 'personal' || !this.isSupervisor) {
        this.form.empId = this.currentUserId
      } else if (this.isSupervisor && this.currentMode === 'supervised') {
        // In supervised mode, load employees for selection
        if (this.allEmpsForForm.length === 0) {
          await this.loadSupervisedEmployees()
        }
        this.empListCurrentPage = 1
        this.empSearchText = ''
        this.filterEmployees()
        this.showEmpList = false
      }
      
      this.$refs.formDialog.open()
    },
    
    async handleEdit(item) {
      this.isEdit = true
      try {
        const res = await getAddition(item.id)
        const data = res.data
        this.form = {
          id: data.id,
          empId: data.empId,
          dueYear: data.dueYear,
          dueMonth: data.dueMonth,
          amount: data.amount,
          note: data.note
        }
        this.formYearIndex = this.formYears.indexOf(data.dueYear)
        this.formMonthIndex = this.formMonths.findIndex(m => m.value === parseInt(data.dueMonth))
        this.showEmpList = false
        this.$refs.formDialog.open()
      } catch (error) {
        uni.showToast({ title: 'فشل التحميل', icon: 'none' })
      }
    },
    
    onFormYearChange(e) {
      this.formYearIndex = e.detail.value
      this.form.dueYear = this.formYears[this.formYearIndex]
    },
    
    onFormMonthChange(e) {
      this.formMonthIndex = e.detail.value
      this.form.dueMonth = this.formMonths[this.formMonthIndex].value
    },
    
    async submitForm() {
      // Auto-assign current user ID if in personal mode and no employee selected
      if (this.currentMode === 'personal' || !this.isSupervisor) {
        if (!this.form.empId) {
          this.form.empId = this.currentUserId
        }
      }
      
      if (!this.form.empId) {
        uni.showToast({ title: 'يرجى اختيار الموظف', icon: 'none' })
        return
      }
      if (!this.form.dueYear) {
        uni.showToast({ title: 'يرجى اختيار السنة', icon: 'none' })
        return
      }
      if (!this.form.dueMonth) {
        uni.showToast({ title: 'يرجى اختيار الشهر', icon: 'none' })
        return
      }
      if (!this.form.amount || parseFloat(this.form.amount) <= 0) {
        uni.showToast({ title: 'يرجى إدخال مبلغ صحيح', icon: 'none' })
        return
      }
      
      this.submitting = true
      
      try {
        const data = { ...this.form, status: '0' }
        
        if (this.isEdit) {
          await updateAddition(data)
          uni.showToast({ title: 'تم التعديل بنجاح', icon: 'success' })
        } else {
          await addAddition(data)
          uni.showToast({ title: 'تمت الإضافة بنجاح', icon: 'success' })
        }
        
        this.closeDialog()
        this.queryParams.pageNum = 1
        this.additionList = []
        this.hasMore = true
        await this.loadList()
        if (this.isSupervisor) await this.loadPendingCount()
      } catch (error) {
        uni.showToast({ title: 'فشل الحفظ', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    
    closeDialog() {
      this.$refs.formDialog.close()
      this.showEmpList = false
      this.empSearchText = ''
      this.empListCurrentPage = 1
      this.scrollTop = 0
      this.filteredEmps = [...this.allEmpsForForm]
      this.updateDisplayedEmps()
    },
    
    resetForm() {
      this.form = {
        id: null,
        empId: null,
        dueYear: null,
        dueMonth: null,
        amount: null,
        note: null
      }
      this.formYearIndex = -1
      this.formMonthIndex = -1
      this.showEmpList = false
      this.empSearchText = ''
      this.empListCurrentPage = 1
      this.scrollTop = 0
    },
    
    async handleApprove(item) {
      uni.showModal({
        title: 'تأكيد الموافقة',
        content: 'هل أنت متأكد من الموافقة على هذا الطلب؟',
        confirmText: 'موافقة',
        confirmColor: '#166534',
        success: async (res) => {
          if (res.confirm) {
            try {
              await approveAddition(item.id)
              uni.showToast({ title: 'تمت الموافقة بنجاح', icon: 'success' })
              this.queryParams.pageNum = 1
              this.additionList = []
              this.hasMore = true
              await this.loadList()
              await this.loadPendingCount()
            } catch (error) {
              uni.showToast({ title: 'فشل الموافقة', icon: 'none' })
            }
          }
        }
      })
    },
    
    async handleReject(item) {
      uni.showModal({
        title: 'تأكيد الرفض',
        content: 'هل أنت متأكد من رفض هذا الطلب؟',
        confirmText: 'رفض',
        confirmColor: '#dc2626',
        success: async (res) => {
          if (res.confirm) {
            try {
              await rejectAddition(item.id)
              uni.showToast({ title: 'تم الرفض بنجاح', icon: 'success' })
              this.queryParams.pageNum = 1
              this.additionList = []
              this.hasMore = true
              await this.loadList()
              await this.loadPendingCount()
            } catch (error) {
              uni.showToast({ title: 'فشل الرفض', icon: 'none' })
            }
          }
        }
      })
    },
    
    handleDelete(item) {
      uni.showModal({
        title: 'تأكيد الحذف',
        content: 'هل أنت متأكد من حذف هذا الطلب؟',
        confirmText: 'حذف',
        confirmColor: '#dc2626',
        success: async (res) => {
          if (res.confirm) {
            try {
              await delAddition(item.id)
              uni.showToast({ title: 'تم الحذف', icon: 'success' })
              this.queryParams.pageNum = 1
              this.additionList = []
              this.hasMore = true
              this.loadList()
            } catch (error) {
              uni.showToast({ title: 'فشل الحذف', icon: 'none' })
            }
          }
        }
      })
    },
    
    // Helpers
    formatAmount(amount) {
      if (!amount) return '0'
      return parseFloat(amount).toLocaleString('ar-SA')
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('ar-SA')
    },
    
    getMonthName(month) {
      if (!month) return ''
      const m = this.formMonths.find(m => m.value === parseInt(month))
      return m ? m.label : ''
    },
    
    getMonthLabel(value) {
      if (!value) return ''
      const m = this.months.find(m => m.value === parseInt(value))
      return m ? m.label : ''
    },
    
    getStatusLabel(value) {
      if (!value && value !== '0') return ''
      const map = {
        '0': 'قيد الانتظار',
        '1': 'مقبولة',
        '2': 'مرفوضة'
      }
      return map[value] || ''
    },
    
    getStatusText(status) {
      const map = { '0': 'قيد الانتظار', '1': 'مقبولة', '2': 'مرفوضة' }
      return map[status] || '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.addition-container {
  min-height: 100vh;
  height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header - Fixed */
.page-header {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  padding: 44rpx 30rpx 36rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  flex-shrink: 0;
  z-index: 10;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  display: block;
}

.page-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 8rpx;
  display: block;
}

/* Pending Banner */
.pending-banner {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 30rpx;
  margin: 20rpx 20rpx 0;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(30, 64, 175, 0.1);
  border: 1rpx solid #93c5fd;
}

.pending-text {
  font-size: 26rpx;
  color: #1e40af;
  font-weight: 500;
}

/* Mode Section */
.mode-section {
  padding: 20rpx 20rpx 0;
  background: transparent;
}

.mode-switch {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  padding: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  border: 1rpx solid #e2e8f0;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 8rpx;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
    box-shadow: 0 2rpx 6rpx rgba(26, 54, 93, 0.3);
    
    .mode-text {
      color: #fff;
      font-weight: 600;
    }
    .mode-count {
      color: rgba(255,255,255,0.9);
      font-weight: 500;
    }
  }
}

.mode-text {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.mode-count {
  font-size: 24rpx;
  color: #999;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 20rpx;
  margin: 0 20rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  margin-top: 16rpx;
}

.filter-title {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 600;
  white-space: nowrap;
  padding-top: 4rpx;
}

.filter-search-container {
  flex: 1;
  position: relative;
}

.filter-selected-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2rpx solid #93c5fd;
  border-radius: 12rpx;
}

.filter-selected-name {
  font-size: 26rpx;
  color: #1a365d;
  font-weight: 600;
  flex: 1;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.filter-clear-btn,
.filter-change-btn {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  
  &:active {
    background: #f1f5f9;
    transform: scale(0.9);
  }
}

.filter-search-wrapper {
  position: relative;
}

.filter-emp-list-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8rpx;
  background: #fff;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.15);
  z-index: 100;
  max-height: 400rpx;
}

.filter-emp-list-scroll {
  max-height: 400rpx;
}

.filter-emp-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #f8fafc;
  }
  
  &.filter-emp-selected {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-left: 3rpx solid #1a365d;
  }
}

.filter-emp-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.filter-emp-selected .filter-emp-avatar {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
}

.filter-emp-name {
  flex: 1;
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 500;
}

.filter-emp-selected .filter-emp-name {
  color: #1a365d;
  font-weight: 600;
}

.filter-emp-check {
  flex-shrink: 0;
}

.filter-emp-empty {
  padding: 40rpx;
  text-align: center;
  color: #94a3b8;
  font-size: 24rpx;
}

.filter-open-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  background: #f8fafc;
  border: 2rpx dashed #cbd5e1;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #1a365d;
  font-weight: 500;
  margin-top: 8rpx;
  
  &:active {
    background: #f1f5f9;
  }
}

/* Search Section */
.search-section {
  padding: 20rpx;
  margin: 16rpx 20rpx 0;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.search-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.search-item {
  flex: 1;
}

.search-label {
  font-size: 22rpx;
  color: #64748b;
  margin-bottom: 10rpx;
  display: block;
  font-weight: 500;
}

.search-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 14rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #334155;
  transition: all 0.2s ease;
  
  &:active {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
}

.search-actions {
  display: flex;
  gap: 16rpx;
}

.btn-search, .btn-reset {
  flex: 1;
  padding: 18rpx;
  border-radius: 6rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
}

.btn-search {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(26, 54, 93, 0.3);
  
  &:active {
    opacity: 0.9;
    transform: translateY(1rpx);
  }
}

.btn-reset {
  background: #fff;
  color: #64748b;
  border: 1rpx solid #e2e8f0;
  
  &:active {
    background: #f8fafc;
  }
}

/* Action Bar */
.action-bar {
  padding: 20rpx;
  margin: 16rpx 20rpx 0;
}

.btn-add {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #166534 0%, #15803d 100%);
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(22, 101, 52, 0.3);
  
  &:active {
    opacity: 0.9;
    transform: translateY(1rpx);
  }
}

/* Results Bar */
.results-bar {
  padding: 16rpx 20rpx;
  margin: 16rpx 20rpx 0;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.results-text {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

/* Main Scroll View */
.main-scroll {
  flex: 1;
  height: 0;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx;
  gap: 20rpx;
}

.state-icon {
  font-size: 80rpx;
}

.state-text {
  font-size: 28rpx;
  color: #999;
}

.spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #e5e5e5;
  border-top-color: #1a365d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  &.small {
    width: 32rpx;
    height: 32rpx;
    border-width: 3rpx;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.list-content {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

/* List Item */
.list-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.1);
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1rpx solid #e2e8f0;
}

.item-amount {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.amount-number {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a365d;
}

.amount-unit {
  font-size: 24rpx;
  color: #666;
}

.item-status {
  padding: 10rpx 18rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.05);
  
  &.status-0 {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    border: 1rpx solid #fcd34d;
  }
  
  &.status-1 {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #166534;
    border: 1rpx solid #86efac;
  }
  
  &.status-2 {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
    border: 1rpx solid #fca5a5;
  }
}

.item-body {
  padding: 16rpx 24rpx;
}

.detail-row {
  display: flex;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  width: 180rpx;
  font-size: 24rpx;
  color: #666;
}

.detail-value {
  flex: 1;
  font-size: 24rpx;
  color: #333;
  
  &.emp-name {
    color: #1a365d;
    font-weight: 600;
  }
}

.item-footer {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fafafa;
  border-top: 1rpx solid #e5e5e5;
}

.btn-edit, .btn-delete, .btn-approve, .btn-reject {
  flex: 1;
  padding: 14rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.btn-edit {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(26, 54, 93, 0.3);
  
  &:active {
    opacity: 0.9;
    transform: translateY(1rpx);
  }
}

.btn-delete {
  background: #fff;
  color: #dc2626;
  border: 2rpx solid #fecaca;
  font-weight: 600;
  
  &:active {
    background: #fef2f2;
  }
}

.btn-approve {
  background: linear-gradient(135deg, #166534 0%, #15803d 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(22, 101, 52, 0.3);
  
  &:active {
    opacity: 0.9;
    transform: translateY(1rpx);
  }
}

.btn-reject {
  background: #fff;
  color: #dc2626;
  border: 2rpx solid #fecaca;
  font-weight: 600;
  
  &:active {
    background: #fef2f2;
  }
}

/* Load More */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;
}

.no-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #ccc;
}

/* Dialog */
.dialog-box {
  width: 680rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
}

.dialog-title {
  font-size: 30rpx;
  color: #fff;
  font-weight: 600;
}

.dialog-close {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.8);
  font-size: 32rpx;
}

.dialog-body {
  padding: 24rpx;
  max-height: 600rpx;
}

.form-field {
  margin-bottom: 24rpx;
}

.field-label {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: 500;
  
  &.required::before {
    content: '*';
    color: #dc2626;
    margin-left: 4rpx;
  }
}

/* Employee Search - Same as punch_change.vue */
.selected-emp-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2rpx solid #bfdbfe;
  border-radius: 12rpx;
}

.selected-emp-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.selected-emp-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.selected-emp-details {
  flex: 1;
}

.selected-emp-name {
  font-size: 28rpx;
  color: #1a365d;
  font-weight: 600;
  display: block;
  margin-bottom: 4rpx;
}

.selected-emp-label {
  font-size: 22rpx;
  color: #64748b;
  display: block;
}

.change-emp-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 16rpx;
  background: #fff;
  border: 2rpx solid #bfdbfe;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #1a365d;
  font-weight: 500;
}

.emp-search-container {
  position: relative;
}

.emp-search-wrapper {
  position: relative;
  
  &.focused :deep(.uni-easyinput__content) {
    border-color: #1a365d;
    box-shadow: 0 4rpx 16rpx rgba(26, 54, 93, 0.2);
  }
}

.emp-list-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12);
  z-index: 1000;
  max-height: 500rpx;
  overflow: hidden;
}

.emp-list-header {
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
  background: #f8fafc;
}

.emp-list-count {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.emp-list-scroll {
  max-height: 500rpx;
}

.emp-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
  transition: background 0.2s ease;
  
  &:active {
    background: #f8fafc;
  }
  
  &.emp-item-selected {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-left: 3rpx solid #1a365d;
  }
}

.emp-item-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.emp-item-selected .emp-item-avatar {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
}

.emp-item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.emp-item-name {
  font-size: 28rpx;
  color: #1e293b;
  font-weight: 500;
}

.emp-item-selected .emp-item-name {
  color: #1a365d;
  font-weight: 600;
}

.emp-item-badge {
  padding: 4rpx 12rpx;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.emp-item-check {
  flex-shrink: 0;
}

.emp-load-more {
  padding: 20rpx;
  text-align: center;
  font-size: 24rpx;
  color: #94a3b8;
}

.emp-show-all {
  padding: 20rpx;
  text-align: center;
  font-size: 24rpx;
  color: #1a365d;
  font-weight: 500;
  border-top: 1rpx solid #f1f5f9;
  
  &:active {
    background: #f8fafc;
  }
}

.emp-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}

.emp-empty-text {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #94a3b8;
}

.open-search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx;
  background: #f8fafc;
  border: 2rpx dashed #cbd5e1;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #1a365d;
  font-weight: 500;
  margin-top: 12rpx;
  
  &:active {
    background: #f1f5f9;
  }
}

.field-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #334155;
  transition: all 0.2s ease;
  
  &:active {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  .placeholder {
    color: #94a3b8;
  }
}

.field-input-wrap {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #1a365d;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(26, 54, 93, 0.1);
  }
}

.field-suffix {
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #666;
}

.field-textarea {
  width: 100%;
  min-height: 140rpx;
  padding: 20rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 26rpx;
  box-sizing: border-box;
  color: #334155;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1a365d;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(26, 54, 93, 0.1);
  }
}

.dialog-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: #fafafa;
  border-top: 1rpx solid #e5e5e5;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.btn-cancel {
  background: #fff;
  color: #666;
  border: 1rpx solid #ddd;
}

.btn-submit {
  background: linear-gradient(135deg, #166534 0%, #15803d 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(22, 101, 52, 0.3);
  
  &:active:not([disabled]) {
    opacity: 0.9;
    transform: translateY(1rpx);
  }
  
  &[disabled] {
    opacity: 0.6;
    box-shadow: none;
  }
}
</style>

