<template>
  <view class="punch-container">
    <!-- Header - Fixed -->
    <view class="page-header">
      <text class="page-title">تغيير البصمة</text>
      <text class="page-subtitle">إدارة طلبات تغيير البصمة</text>
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
            <text class="mode-text">طلباتي</text>
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
            <text class="search-label">الشيفت</text>
            <picker @change="onShiftChange" :value="shiftIndex" :range="shiftOptions" range-key="name">
              <view class="search-select">
                <text>{{ getShiftName(queryParams.shiftId) || 'الكل' }}</text>
                <uni-icons type="arrowdown" size="12" color="#64748b"></uni-icons>
              </view>
            </picker>
          </view>
          <view class="search-item">
            <text class="search-label">تاريخ البداية</text>
            <picker mode="date" @change="onStartDateChange" :value="startDateValue">
              <view class="search-select">
                <text>{{ queryParams.startTime || 'الكل' }}</text>
                <uni-icons type="arrowdown" size="12" color="#64748b"></uni-icons>
              </view>
            </picker>
          </view>
        </view>
        <view class="search-row">
          <view class="search-item">
            <text class="search-label">تاريخ النهاية</text>
            <picker mode="date" @change="onEndDateChange" :value="endDateValue">
              <view class="search-select">
                <text>{{ queryParams.endTime || 'الكل' }}</text>
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
      <view v-if="loading && punchList.length === 0" class="state-box">
        <view class="spinner"></view>
        <text class="state-text">جاري التحميل...</text>
      </view>

      <!-- Empty -->
      <view v-else-if="!loading && punchList.length === 0" class="state-box">
        <text class="state-icon">📋</text>
        <text class="state-text">لا توجد بيانات</text>
      </view>

      <!-- Data List -->
      <view v-else class="list-content">
        <view class="list-item" v-for="item in punchList" :key="item.id">
          <!-- Item Header -->
          <view class="item-header">
            <view class="item-shift-badge">
              {{ getShiftName(item.shiftId) || 'غير محدد' }}
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
              <text class="detail-label">تاريخ بداية الشيفت</text>
              <text class="detail-value">{{ formatDate(item.startTime) }}</text>
            </view>
            
            <view class="detail-row">
              <text class="detail-label">تاريخ نهاية الشيفت</text>
              <text class="detail-value">{{ formatDate(item.endTime) }}</text>
            </view>
            
            <view class="detail-row" v-if="item.reason">
              <text class="detail-label">السبب</text>
              <text class="detail-value">{{ item.reason }}</text>
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
              <button class="btn-edit" @click="handleEdit(item)">تعديل</button>
              <button class="btn-delete" @click="handleDelete(item)">حذف</button>
            </template>
          </view>
        </view>

        <!-- Load More -->
        <view class="load-more" v-if="loadingMore">
          <view class="spinner small"></view>
          <text>جاري التحميل...</text>
        </view>
        <view class="no-more" v-else-if="!hasMore && punchList.length > 0">
          <text>— نهاية القائمة —</text>
        </view>
      </view>
    </scroll-view>

    <!-- Add/Edit Dialog -->
    <uni-popup ref="formDialog" type="center" :mask-click="false">
      <view class="dialog-box">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEdit ? 'تعديل تغيير البصمة' : 'إضافة جديدة' }}</text>
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

          <!-- Shift Selection -->
          <view class="form-field">
            <text class="field-label required">الشيفت</text>
            <picker @change="onShiftFormChange" :value="shiftFormIndex" :range="shiftOptions" range-key="name">
              <view class="field-select">
                <text :class="{ placeholder: !form.shiftId }">{{ getShiftName(form.shiftId) || 'اختر الشيفت' }}</text>
                <uni-icons type="arrowdown" size="14" color="#94a3b8"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- Start Date -->
          <view class="form-field">
            <text class="field-label required">تاريخ بداية الشيفت</text>
            <picker mode="date" @change="onStartDateFormChange" :value="formStartDateValue">
              <view class="field-select">
                <text :class="{ placeholder: !form.startTime }">{{ form.startTime || 'اختر التاريخ' }}</text>
                <uni-icons type="arrowdown" size="14" color="#94a3b8"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- End Date -->
          <view class="form-field">
            <text class="field-label required">تاريخ نهاية الشيفت</text>
            <picker mode="date" @change="onEndDateFormChange" :value="formEndDateValue">
              <view class="field-select">
                <text :class="{ placeholder: !form.endTime }">{{ form.endTime || 'اختر التاريخ' }}</text>
                <uni-icons type="arrowdown" size="14" color="#94a3b8"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- Reason -->
          <view class="form-field">
            <text class="field-label">سبب التغيير</text>
            <textarea 
              class="field-textarea" 
              v-model="form.reason" 
              placeholder="أدخل سبب التغيير (اختياري)"
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
  listPunch, 
  getPunch, 
  addPunch, 
  updatePunch, 
  delPunch,
  listSuperviseesPunches,
  countPendingPunches
} from '@/api/api/punch'

import { listShift } from '@/api/api/shift'

import { getSupervisees } from '@/api/api/emp'

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
      
      // Shifts
      shiftOptions: [],
      shiftMap: {},
      shiftIndex: 0,
      shiftFormIndex: 0,
      
      // Pending
      pendingCount: 0,
      
      // Loading
      loading: false,
      loadingMore: false,
      isRefreshing: false,
      submitting: false,
      
      // List
      punchList: [],
      total: 0,
      hasMore: true,
      
      // Query
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        empId: null,
        shiftId: null,
        startTime: null,
        endTime: null,
        status: null
      },
      
      // Filters
      startDateValue: '',
      endDateValue: '',
      statuses: [
        { label: 'الكل', value: null },
        { label: 'قيد الانتظار', value: '0' },
        { label: 'موافق من المشرف', value: '1' },
        { label: 'مرفوض من المشرف', value: '2' },
        { label: 'موافق نهائياً', value: '3' },
        { label: 'مرفوض من HR', value: '4' }
      ],
      statusIndex: 0,
      
      // Form
      isEdit: false,
      form: {
        id: null,
        empId: null,
        shiftId: null,
        startTime: null,
        endTime: null,
        reason: null,
        status: null
      },
      formStartDateValue: '',
      formEndDateValue: ''
    }
  },
  
  computed: {
    userInfo() {
      return this.$store.state.user.hrUser
    }
  },
  
  onLoad() {
    // Initialize with supervisor = false
    this.isSupervisor = false
    this.currentMode = 'personal'
    this.initUser()
    this.loadShiftOptions()
  },
  
  onShow() {
    // Ensure supervisor is false by default
    this.isSupervisor = false
    this.currentMode = 'personal'
    this.initUser()
    if (this.currentUserId) {
      this.queryParams.pageNum = 1
      this.punchList = []
      this.hasMore = true
      this.loadList()
      if (this.isSupervisor) {
        this.loadPendingCount()
        this.loadSupervisedEmployees()
      }
    }
  },
  
  methods: {
    initUser() {
      const user = this.userInfo
      console.log('initUser - user object:', user)
      if (user) {
        this.currentUserId = user.id
        this.currentUserName = user.name || ''
        // Check if user is supervisor - handle various formats
        const supervisorValue = user.isSupervisor
        console.log('isSupervisor value:', supervisorValue, 'type:', typeof supervisorValue)
        this.isSupervisor = !!(supervisorValue === true || supervisorValue === 'true' || supervisorValue === 1 || supervisorValue === '1' || supervisorValue === 'yes')
        console.log('isSupervisor set to:', this.isSupervisor)
        if (!this.isSupervisor) {
          this.currentMode = 'personal'
        }
      } else {
        // If no user info, ensure supervisor is false
        console.log('No user info found')
        this.isSupervisor = false
        this.currentMode = 'personal'
      }
    },
    
    async loadShiftOptions() {
      try {
        const res = await listShift({ pageSize: 9999 })
        this.shiftOptions = res.rows || []
        this.shiftMap = Object.fromEntries(
          this.shiftOptions.map(shift => [shift.id, shift.name])
        )
      } catch (error) {
        console.error('Failed to load shifts:', error)
      }
    },
    
    getShiftName(shiftId) {
      if (!shiftId) return null
      return this.shiftMap[shiftId] || null
    },
    
    async loadSupervisedEmployees() {
      if (!this.isSupervisor) return
      try {
        const res = await getSupervisees(this.currentUserId)
        this.supervisedEmployees = res.data || []
        this.filteredFilterEmps = [
          { id: null, name: 'جميع المرؤوسين' },
          ...this.supervisedEmployees
        ]
      } catch (error) {
        console.error('Failed to load supervised employees:', error)
      }
    },
    
    async loadPendingCount() {
      if (!this.isSupervisor) return
      try {
        const res = await countPendingPunches(this.currentUserId)
        this.pendingCount = res.data || 0
      } catch (error) {
        console.error('Failed to load pending count:', error)
      }
    },
    
    switchMode(mode) {
      // Only allow mode switching if user is supervisor
      if (!this.isSupervisor) {
        this.currentMode = 'personal'
        return
      }
      this.currentMode = mode
      this.selectedFilterEmployee = null
      this.queryParams.pageNum = 1
      this.punchList = []
      this.hasMore = true
      this.loadList()
    },
    
    openFilterEmpList() {
      this.showFilterEmpList = true
      this.filterEmpSearchText = ''
      this.filterFilterEmployees()
    },
    
    filterFilterEmployees() {
      const text = (this.filterEmpSearchText || '').trim().toLowerCase()
      if (this.currentMode === 'personal') {
        this.filteredFilterEmps = []
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
      this.punchList = []
      this.loadList()
    },
    
    clearFilterEmployee() {
      this.selectedFilterEmployee = null
      this.filterEmpSearchText = ''
      this.showFilterEmpList = false
      this.queryParams.pageNum = 1
      this.punchList = []
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
    
    handleFilterEmpFocus() {
      this.showFilterEmpList = true
    },
    
    handleFilterEmpBlur() {
      setTimeout(() => {
        this.showFilterEmpList = false
      }, 200)
    },
    
    onShiftChange(e) {
      this.shiftIndex = e.detail.value
      const selected = this.shiftOptions[this.shiftIndex]
      this.queryParams.shiftId = selected ? selected.id : null
    },
    
    onStartDateChange(e) {
      this.startDateValue = e.detail.value
      this.queryParams.startTime = e.detail.value
    },
    
    onEndDateChange(e) {
      this.endDateValue = e.detail.value
      this.queryParams.endTime = e.detail.value
    },
    
    onStatusChange(e) {
      this.statusIndex = e.detail.value
      const selected = this.statuses[this.statusIndex]
      this.queryParams.status = selected ? selected.value : null
    },
    
    handleSearch() {
      this.queryParams.pageNum = 1
      this.punchList = []
      this.hasMore = true
      this.loadList()
    },
    
    handleReset() {
      this.queryParams.shiftId = null
      this.queryParams.startTime = null
      this.queryParams.endTime = null
      this.queryParams.status = null
      this.startDateValue = ''
      this.endDateValue = ''
      this.shiftIndex = 0
      this.statusIndex = 0
      this.handleSearch()
    },
    
    async loadList() {
      if (this.loading) return
      this.loading = true
      
      // Ensure non-supervisors always use personal mode
      if (!this.isSupervisor) {
        this.currentMode = 'personal'
      }
      
      try {
        let response
        
        if (this.currentMode === 'personal' || !this.isSupervisor) {
          this.queryParams.empId = this.currentUserId
          response = await listPunch(this.queryParams)
        } else {
          const params = { ...this.queryParams }
          if (this.selectedFilterEmployee && this.selectedFilterEmployee.id) {
            params.empId = this.selectedFilterEmployee.id
          } else {
            params.empId = null
          }
          response = await listSuperviseesPunches(this.currentUserId, params)
        }
        
        this.punchList = response.rows || []
        this.total = response.total || 0
        this.hasMore = this.punchList.length < this.total
        
        console.log('Load list:', {
          loaded: this.punchList.length,
          total: this.total,
          hasMore: this.hasMore,
          pageNum: this.queryParams.pageNum
        })
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
      
      // Ensure non-supervisors always use personal mode
      if (!this.isSupervisor) {
        this.currentMode = 'personal'
      }
      
      this.loadingMore = true
      this.queryParams.pageNum++
      
      try {
        let response
        
        if (this.currentMode === 'personal' || !this.isSupervisor) {
          this.queryParams.empId = this.currentUserId
          response = await listPunch(this.queryParams)
        } else {
          const params = { ...this.queryParams }
          if (this.selectedFilterEmployee && this.selectedFilterEmployee.id) {
            params.empId = this.selectedFilterEmployee.id
          } else {
            params.empId = null
          }
          response = await listSuperviseesPunches(this.currentUserId, params)
        }
        
        const newItems = response.rows || []
        this.punchList = [...this.punchList, ...newItems]
        this.hasMore = this.punchList.length < (response.total || 0)
      } catch (error) {
        console.error('Load more error:', error)
        this.queryParams.pageNum--
      } finally {
        this.loadingMore = false
      }
    },
    
    async onRefresh() {
      this.isRefreshing = true
      this.queryParams.pageNum = 1
      this.punchList = []
      this.hasMore = true
      await this.loadList()
      if (this.isSupervisor) {
        await this.loadPendingCount()
      }
    },
    
    async handleAdd() {
      this.isEdit = false
      this.resetForm()
      if (!this.isSupervisor) {
        // Non-supervisor: auto-assign their own ID
        this.form.empId = this.currentUserId
      } else {
        // Supervisor: check current mode
        if (this.currentMode === 'personal') {
          // Personal mode: auto-assign supervisor's own ID, employee field will be hidden
          this.form.empId = this.currentUserId
        } else {
          // Supervised mode: load employees for selection, don't auto-open list
          if (this.allEmpsForForm.length === 0) {
            await this.loadEmployeesForForm()
          }
          // Reset pagination
          this.empListCurrentPage = 1
          this.empSearchText = ''
          this.filterEmployees()
          // Don't auto-open the list - let supervisor click to open
          this.showEmpList = false
        }
      }
      this.$refs.formDialog.open()
    },
    
    async handleEdit(item) {
      this.isEdit = true
      try {
        const res = await getPunch(item.id)
        const data = res.data
        this.form = {
          id: data.id,
          empId: data.empId,
          shiftId: data.shiftId,
          startTime: data.startTime,
          endTime: data.endTime,
          reason: data.reason,
          status: data.status
        }
        this.formStartDateValue = data.startTime || ''
        this.formEndDateValue = data.endTime || ''
        this.updateShiftFormIndex()
        this.$refs.formDialog.open()
      } catch (error) {
        uni.showToast({ title: 'فشل التحميل', icon: 'none' })
      }
    },
    
    updateShiftFormIndex() {
      const index = this.shiftOptions.findIndex(s => s.id === this.form.shiftId)
      this.shiftFormIndex = index >= 0 ? index : 0
    },
    
    onShiftFormChange(e) {
      this.shiftFormIndex = e.detail.value
      const selected = this.shiftOptions[this.shiftFormIndex]
      this.form.shiftId = selected ? selected.id : null
    },
    
    onStartDateFormChange(e) {
      this.formStartDateValue = e.detail.value
      this.form.startTime = e.detail.value
    },
    
    onEndDateFormChange(e) {
      this.formEndDateValue = e.detail.value
      this.form.endTime = e.detail.value
    },
    
    async submitForm() {
      // Auto-assign supervisor's ID if in personal mode and no employee selected
      if (this.isSupervisor && this.currentMode === 'personal' && !this.form.empId) {
        this.form.empId = this.currentUserId
      }
      
      // Validation
      if (!this.form.empId) {
        uni.showToast({ title: 'يرجى اختيار الموظف', icon: 'none' })
        return
      }
      if (!this.form.shiftId) {
        uni.showToast({ title: 'يرجى اختيار الشيفت', icon: 'none' })
        return
      }
      if (!this.form.startTime) {
        uni.showToast({ title: 'يرجى اختيار تاريخ بداية الشيفت', icon: 'none' })
        return
      }
      if (!this.form.endTime) {
        uni.showToast({ title: 'يرجى اختيار تاريخ نهاية الشيفت', icon: 'none' })
        return
      }
      
      this.submitting = true
      
      try {
        const data = { ...this.form }
        
        // Set status to pending for new requests
        if (!this.isEdit) {
          data.status = '0'
        }
        
        if (this.isEdit) {
          await updatePunch(data)
          uni.showToast({ title: 'تم التعديل بنجاح', icon: 'success' })
        } else {
          await addPunch(data)
          uni.showToast({ title: 'تمت الإضافة بنجاح', icon: 'success' })
        }
        
        this.closeDialog()
        this.queryParams.pageNum = 1
        this.punchList = []
        this.hasMore = true
        await this.loadList()
        if (this.isSupervisor) await this.loadPendingCount()
      } catch (error) {
        console.error('Submit error:', error)
        uni.showToast({ title: 'فشل الحفظ', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    
    async handleDelete(item) {
      uni.showModal({
        title: 'تأكيد الحذف',
        content: 'هل أنت متأكد من حذف هذا الطلب؟',
        confirmText: 'حذف',
        confirmColor: '#dc2626',
        success: async (res) => {
          if (res.confirm) {
            try {
              await delPunch(item.id)
              uni.showToast({ title: 'تم الحذف بنجاح', icon: 'success' })
              this.queryParams.pageNum = 1
              this.punchList = []
              this.hasMore = true
              await this.loadList()
              if (this.isSupervisor) await this.loadPendingCount()
            } catch (error) {
              uni.showToast({ title: 'فشل الحذف', icon: 'none' })
            }
          }
        }
      })
    },
    
    closeDialog() {
      this.$refs.formDialog.close()
      this.resetForm()
    },
    
    resetForm() {
      this.form = {
        id: null,
        empId: null,
        shiftId: null,
        startTime: null,
        endTime: null,
        reason: null,
        status: null
      }
      this.formStartDateValue = ''
      this.formEndDateValue = ''
      this.shiftFormIndex = 0
      this.showEmpList = false
      this.empSearchText = ''
    },
    
    // Employee search in form
    async loadEmployeesForForm() {
      try {
        const res = await getSupervisees(this.currentUserId)
        this.allEmpsForForm = res.data || []
        this.filterEmployees()
      } catch (error) {
        console.error('Failed to load employees:', error)
      }
    },
    
    filterEmployees() {
      const text = (this.empSearchText || '').trim().toLowerCase()
      if (!text) {
        this.filteredEmps = [...this.allEmpsForForm]
      } else {
        this.filteredEmps = this.allEmpsForForm.filter(emp => 
          emp.name && emp.name.toLowerCase().includes(text)
        )
      }
      this.updateDisplayedEmployees()
    },
    
    updateDisplayedEmployees() {
      const endIndex = Math.min(
        this.empListCurrentPage * this.empListPageSize,
        this.filteredEmps.length
      )
      this.displayedEmps = this.filteredEmps.slice(0, endIndex)
      this.hasMoreEmployees = endIndex < this.filteredEmps.length
    },
    
    loadMoreEmployees() {
      if (this.hasMoreEmployees && !this.empSearchText) {
        this.empListCurrentPage++
        this.updateDisplayedEmployees()
      }
    },
    
    showAllEmployees() {
      this.displayedEmps = [...this.filteredEmps]
      this.hasMoreEmployees = false
    },
    
    selectEmployee(emp) {
      this.form.empId = emp.id
      this.showEmpList = false
      this.empSearchText = ''
      // If supervisor selects themselves, the field will be automatically hidden by the v-if condition
      // and empId is already set to their ID
    },
    
    getSelectedEmpName() {
      if (!this.form.empId) return ''
      const emp = this.allEmpsForForm.find(e => e.id === this.form.empId)
      return emp ? emp.name : ''
    },
    
    handleEmpSearchFocus() {
      if (!this.allEmpsForForm.length) {
        this.loadEmployeesForForm()
      }
      this.showEmpList = true
    },
    
    handleEmpSearchBlur() {
      setTimeout(() => {
        this.showEmpList = false
      }, 200)
    },
    
    clearEmpSearch() {
      this.empSearchText = ''
      this.filterEmployees()
    },
    
    // Helpers
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    getStatusLabel(value) {
      if (value === null || value === undefined) return null
      const status = this.statuses.find(s => s.value === String(value))
      return status ? status.label : null
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
    }
  }
}
</script>

<style scoped lang="scss">
/* Same styles as request.vue - copying the essential ones */
.punch-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}

.page-header {
  padding: 40rpx 20rpx 24rpx;
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  color: #fff;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 8rpx;
}

.page-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
}

.pending-banner {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx;
  margin: 16rpx 20rpx 0;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12rpx;
  border-left: 4rpx solid #1e40af;
}

.pending-text {
  font-size: 26rpx;
  color: #1e40af;
  font-weight: 500;
}

.mode-section {
  padding: 20rpx;
  margin-top: 16rpx;
}

.mode-switch {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  padding: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.mode-btn {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 8rpx;
  transition: all 0.2s ease;
  
  &.active {
    background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
    
    .mode-text {
      color: #fff;
      font-weight: 600;
    }
    
    .mode-count {
      color: rgba(255,255,255,0.9);
    }
  }
}

.mode-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 500;
}

.mode-count {
  font-size: 24rpx;
  color: #94a3b8;
  margin-left: 4rpx;
}

/* Filter Bar - Same as request.vue */
.filter-bar {
  padding: 20rpx;
  margin: 16rpx 20rpx 0;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.filter-title {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

.filter-search-container {
  position: relative;
}

.filter-selected-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
}

.filter-selected-name {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 12rpx;
}

.filter-clear-btn, .filter-change-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  background: #fff;
  border: 1rpx solid #e2e8f0;
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
  border-radius: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12);
  z-index: 1000;
  max-height: 400rpx;
  overflow: hidden;
}

.filter-emp-list-scroll {
  max-height: 400rpx;
}

.filter-emp-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
  
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
  padding: 100rpx 40rpx;
}

.spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e2e8f0;
  border-top-color: #1a365d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  &.small {
    width: 40rpx;
    height: 40rpx;
    border-width: 3rpx;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.state-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #94a3b8;
}

.state-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.list-content {
  padding: 20rpx;
}

.list-item {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  overflow: hidden;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.item-shift-badge {
  padding: 8rpx 16rpx;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #475569;
  font-weight: 500;
}

.item-status {
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  font-weight: 600;
  
  &.status-0 {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.status-1 {
    background: #dbeafe;
    color: #1e40af;
  }
  
  &.status-2 {
    background: #fee2e2;
    color: #991b1b;
  }
  
  &.status-3 {
    background: #d1fae5;
    color: #065f46;
  }
  
  &.status-4 {
    background: #fce7f3;
    color: #9d174d;
  }
}

.item-body {
  padding: 20rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.detail-value {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 500;
  text-align: right;
  flex: 1;
  
  &.emp-name {
    color: #1a365d;
    font-weight: 600;
  }
}

.item-footer {
  display: flex;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: #f8fafc;
  border-top: 1rpx solid #e5e5e5;
}

.btn-edit, .btn-delete {
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
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
  
  &.required::after {
    content: ' *';
    color: #dc2626;
  }
}

.field-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 16rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #1e293b;
  transition: all 0.2s ease;
  
  &.disabled {
    opacity: 0.5;
    background: #f1f5f9;
  }
  
  &:active:not(.disabled) {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  .placeholder {
    color: #94a3b8;
  }
}

.field-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 16rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #1e293b;
  line-height: 1.6;
}

.field-hint {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 8rpx;
  display: block;
}

.dialog-footer {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f1f5f9;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.btn-cancel {
  background: #f8fafc;
  color: #64748b;
  
  &:active {
    background: #f1f5f9;
  }
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

/* Employee Search Styles - Same as request.vue */
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

</style>


