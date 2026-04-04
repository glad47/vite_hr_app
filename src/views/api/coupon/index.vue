<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
    <el-form-item label="رقم الهاتف" prop="phoneNumber">
      <el-input
        v-model="queryParams.phoneNumber"
        placeholder="أدخل رقم الهاتف"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>

    <el-form-item label="الشركة" prop="companyId">
      <el-select
        v-model="queryParams.companyId"
        placeholder="اختر الشركة"
        clearable
        @change="filterGroupsByCompany"
      >
        <el-option
          v-for="company in companyList"
          :key="company.companyId"
          :label="company.name"
          :value="company.companyId"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="المجموعة" prop="groupId">
      <el-select
        v-model="queryParams.groupId"
        placeholder="اختر المجموعة"
        clearable
      >
        <el-option
          v-for="group in filteredGroupList"
          :key="group.groupId"
          :label="group.name"
          :value="group.groupId"
        />
      </el-select>
    </el-form-item>
    <!-- <el-form-item label="رمز القسيمة" prop="code">
      <el-input
        v-model="queryParams.code"
        placeholder="أدخل رمز القسيمة"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item> -->
    <el-form-item label="وقت الإصدار" prop="issuedAt">
      <el-date-picker clearable
        v-model="queryParams.issuedAt"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="اختر وقت الإصدار">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="وقت التفعيل" prop="activatedAt">
      <el-date-picker clearable
        v-model="queryParams.activatedAt"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="اختر وقت التفعيل">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="وقت الاستخدام" prop="usedAt">
      <el-date-picker clearable
        v-model="queryParams.usedAt"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="اختر وقت الاستخدام">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="وقت الإلغاء" prop="cancelledAt">
      <el-date-picker clearable
        v-model="queryParams.cancelledAt"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="اختر وقت الإلغاء">
      </el-date-picker>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">بحث</el-button>
      <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">إعادة تعيين</el-button>
    </el-form-item>
  </el-form>


    <el-row :gutter="10" class="mb8">
    <el-col :span="1.5">
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
        v-hasPermi="['api:coupon:add']"
      >إضافة</el-button>
    </el-col>
    <!-- <el-col :span="1.5">
      <el-button
        type="success"
        plain
        icon="el-icon-edit"
        size="mini"
        :disabled="single"
        @click="handleUpdate"
        v-hasPermi="['api:coupon:edit']"
      >تفعيل</el-button>
    </el-col> -->
    <el-col :span="1.5">
      <el-button
        type="danger"
        plain
        icon="el-icon-delete"
        size="mini"
        :disabled="multiple"
        @click="handleCancel"
        v-hasPermi="['api:coupon:remove']"
      >الغاء</el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button
        type="warning"
        plain
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
        v-hasPermi="['api:coupon:export']"
      >تصدير</el-button>
    </el-col>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>


    <el-table v-loading="loading" :data="couponList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="معرّف الكوبونات" align="center" prop="couponId" />
      <el-table-column label="رقم الهاتف" align="center">
        <template slot-scope="scope">
          <span>{{ customerPhones[scope.row.customerId] || '—' }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column label="معرّف العميل" align="center" prop="customerId" />
      <el-table-column label="معرّف المجموعة" align="center" prop="groupId" /> -->
      <!-- <el-table-column label="رمز القسيمة" align="center" prop="code" /> -->
      <el-table-column label="الحالة" align="center" prop="status">
        <template slot-scope="scope">
          <span>
            {{
              scope.row.status === '0' ? 'مصدرة' :
              scope.row.status === '1' ? 'مفعّلة' :
              scope.row.status === '2' ? 'مستخدمة' :
              scope.row.status === '3' ? 'ملغاة' :
              'غير معروفة'
            }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="وقت الإصدار" align="center" prop="issuedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.issuedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="وقت التفعيل" align="center" prop="activatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.activatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="وقت الاستخدام" align="center" prop="usedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.usedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="وقت الإلغاء" align="center" prop="cancelledAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.cancelledAt, '{y}-{m}-{d}') }}</span>

        </template>
      </el-table-column>
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <template v-if="scope.row.status === '0'">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['api:coupon:edit']"
            >تفعيل الكوبون</el-button>
          </template>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleCancel(scope.row)"
            v-hasPermi="['api:coupon:remove']"
          >الإلغاء</el-button>
        </template>
      </el-table-column>
    </el-table>

    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改جدول القسائم对话框 -->
     <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <!-- Other form items -->

      <el-form-item label="رمز التحقق" prop="verificationCode">
        <verification-code-input
          :length="4"
          :force-upper-case="false"
          :type="'number'"
          @complete="onCodeComplete"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitVerForm">تأكيد</el-button>
      <el-button @click="cancel">إلغاء</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import { listCoupon, getCoupon, delCoupon, addCoupon, updateCoupon } from "@/api/api/coupon"
import { getCustomer } from "@/api/api/customer";
import {listCompany}  from "@/api/api/company";
import {listGroup}  from "@/api/api/group";
import VerificationCodeInput from 'vue-verification-code-input'

export default {
  components: {
    VerificationCodeInput
  },
  name: "Coupon",
  data() {
    return {
      customerPhones: {},
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // جدول القسائم表格数据
      couponList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerId: null,
        groupId: null,
        companyId: null,
        code: null,
        status: null,
        issuedAt: null,
        activatedAt: null,
        usedAt: null,
        cancelledAt: null,
      },
      companyList: [],
      groupList: [],
      filteredGroupList: [],
      // 表单参数
      form: {},
      formVerification: {
        verificationCode: ''
      },
      expectedCode: '123456',
      // 表单校验
      rules: {
        customerId: [
          { required: true, message: "معرّف العميل مطلوب", trigger: "blur" }
        ],
        groupId: [
          { required: true, message: "معرّف المجموعة مطلوب", trigger: "blur" }
        ]
      }

    }
  },
  created() {
    this.getList()
    this.loadCompaniesAndGroups()
  },
  activated() {
    this.getList()
    this.loadCompaniesAndGroups()
  },
  methods: {
    /** 查询جدول القسائم列表 */
    getList() {
      this.loading = true
      listCoupon(this.queryParams).then(response => {
        this.couponList = response.rows
         // Fetch phone numbers for each customerId
      const uniqueIds = [...new Set(response.rows.map(c => c.customerId))]
        for (const id of uniqueIds) {
          if (!this.customerPhones[id]) {
            const res = getCustomer(id).then((res) => {
                this.$set(this.customerPhones, id, res.data.phoneNumber)  
            })
            
          }
        }
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    onCodeComplete(code) {
      this.formVerification.verificationCode = code
      if (code === this.expectedCode) {
        this.$modal.msgSuccess('تم التحقق بنجاح')
      } else {
        this.$modal.msgError('رمز التحقق غير صحيح')
      }
    },
    submitVerForm() {
      if (this.formVerification.verificationCode !== this.expectedCode) {
        this.$modal.msgError('يرجى إدخال رمز تحقق صحيح قبل المتابعة')
        return
      }
      // Proceed with submission
    },
    // 表单重置
    reset() {
      this.form = {
        couponId: null,
        customerId: null,
        groupId: null,
        code: null,
        status: null,
        issuedAt: null,
        activatedAt: null,
        usedAt: null,
        cancelledAt: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm("form")
    },

    async loadCompaniesAndGroups() {
      console.log("inside the laod companies and group ...")
      const [companyRes, groupRes] = await Promise.all([
        listCompany({}),
        listGroup({})
      ])
      console.log(companyRes)
      this.companyList = companyRes.rows
      this.groupList = groupRes.rows
      this.filteredGroupList = [...this.groupList] // default: all groups
    },
    filterGroupsByCompany(companyId) {
      console.log("inside the filtering of group")
      console.log(companyId)
      this.queryParams.groupId = null
      this.filteredGroupList = this.groupList.filter(group => group.companyId === companyId)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.couponId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "اضافة كوبون"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const couponId = row.couponId || this.ids
      getCoupon(couponId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تفعيل الكوبون"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.couponId != null) {
            updateCoupon(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addCoupon(this.form).then(response => {
              this.$modal.msgSuccess("تمت الإضافة بنجاح")
              this.open = false
              this.getList()
            })
          }

        }
      })
    },
    handleCancel(row) {
      const tobeUpdated = []
      const couponIds = row.couponId || this.ids
      if (row.couponId) {
        const updated = { ...row, status: "3" }
        tobeUpdated.push(updated)
      } else {
        const updatedList = this.couponList
          .filter(item => this.ids.includes(item.couponId))
          .map(item => ({ ...item, status: "3" }))
        tobeUpdated.push(...updatedList)
      }
      
    
      this.$modal.confirm('هل أنت متأكد من إلغاء الكوبون رقم "' + couponIds + '"؟').then(() => {
        var result = null
        for (const item of tobeUpdated) {
          result = updateCoupon(item)
        }

        return result
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الإلغاء بنجاح")
      }).catch(() => {})
    },

    /** 删除按钮操作 */
   handleDelete(row) {
      const couponIds = row.couponId || this.ids
      this.$modal.confirm('هل أنت متأكد من حذف جدول القسائم رقم "' + couponIds + '"؟').then(function() {
        return delCoupon(couponIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/coupon/export', {
        ...this.queryParams
      }, `coupon_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
