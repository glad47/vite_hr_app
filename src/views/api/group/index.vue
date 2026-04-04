<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="معرّف الشركة" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          placeholder="اختر الشركة"
          filterable
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="company in companyOptions"
            :key="company.companyId"
            :label="company.name"
            :value="company.companyId"
          />
        </el-select>

      </el-form-item>
      <el-form-item label="اسم المجموعة" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل اسم المجموعة"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['api:group:add']"
        >إضافة</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['api:group:edit']"
        >تعديل</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['api:group:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:group:export']"
        >تصدير</el-button>
      </el-col>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>


    <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" align="center" />
    <el-table-column label="معرّف المجموعة" align="center" prop="groupId" />
    <el-table-column label="معرّف الشركة" align="center" prop="companyId" />
    <el-table-column label="اسم المجموعة" align="center" prop="name" />
    <el-table-column label="وصف المجموعة" align="center" prop="description" />
    <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="text"
          icon="el-icon-edit"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['api:group:edit']"
        >تعديل</el-button>
        <el-button
          size="mini"
          type="text"
          icon="el-icon-delete"
          @click="handleDelete(scope.row)"
          v-hasPermi="['api:group:remove']"
        >حذف</el-button>
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

    <!-- 添加或修改مجموعات الكوبونات对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="الشركة" prop="companyId">
          <el-select
            v-model="form.companyId"
            placeholder="اختر الشركة"
            filterable
            clearable
          >
            <el-option
              v-for="company in companyOptions"
              :key="company.companyId"
              :label="company.name"
              :value="company.companyId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="اسم المجموعة" prop="name">
          <el-input v-model="form.name" placeholder="أدخل اسم المجموعة" />
        </el-form-item>

        <el-form-item label="وصف المجموعة" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="أدخل وصف المجموعة" />
        </el-form-item>

        <el-form-item v-if="!isEditing" label="المجموعة" prop="customerFile">
        <template v-if="!isEditing">
        <el-upload 
          action="#"
          :http-request="handleCustomerFileUpload"
          accept=".csv,.xlsx"
          show-file-list
          drag
          :file-list="form.customerFileList"
          :limit="1"
         

        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">اسحب الملف هنا أو انقر للتحميل</div>
          <div class="el-upload__tip" slot="tip">
            يرجى تحميل ملف يحتوي على الاسم ورقم الهاتف
          </div>
        </el-upload>
        </template>

        <template v-else>
          <!-- <el-divider content-position="center">الكوبونات</el-divider> -->
          <!-- <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddCouponCoupon">إضافة</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteCouponCoupon">حذف</el-button>
            </el-col>
          </el-row> -->


          <!-- <el-table :data="couponCouponList" :row-class-name="rowCouponCouponIndex" @selection-change="handleCouponCouponSelectionChange" ref="couponCoupon">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="الرقم" align="center" prop="index" width="50" />
          <el-table-column label="رقم الهاتف" prop="customerPhone" width="150">
            <template slot-scope="scope">
              <span>{{ scope.row.customerPhone || '—' }}</span>
            </template>
          </el-table-column> -->
          <!-- <el-table-column label="رمز القسيمة" prop="code" width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.code" placeholder="أدخل رمز القسيمة" />
            </template>
          </el-table-column> -->
          <!-- <el-table-column label="حالة الكوبون" prop="status" width="150">
            <template slot-scope="scope">
              <el-select v-model="scope.row.status" placeholder="اختر حالة القسيمة">
                <el-option label="مصدرة" :value="0" />
                <el-option label="مفعّلة" :value="1" />
                <el-option label="مستخدمة" :value="2" />
                <el-option label="ملغاة" :value="3" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="وقت الإصدار" prop="issuedAt" width="240">
            <template slot-scope="scope">
              <el-date-picker clearable v-model="scope.row.issuedAt" type="date" value-format="yyyy-MM-dd" placeholder="اختر وقت الإصدار" />
            </template>
          </el-table-column>
          <el-table-column label="وقت التفعيل" prop="activatedAt" width="240">
            <template slot-scope="scope">
              <el-date-picker clearable v-model="scope.row.activatedAt" type="date" value-format="yyyy-MM-dd" placeholder="اختر وقت التفعيل" />
            </template>
          </el-table-column>
          <el-table-column label="وقت الاستخدام" prop="usedAt" width="240">
            <template slot-scope="scope">
              <el-date-picker clearable v-model="scope.row.usedAt" type="date" value-format="yyyy-MM-dd" placeholder="اختر وقت الاستخدام" />
            </template>
          </el-table-column>
          <el-table-column label="وقت الإلغاء" prop="cancelledAt" width="240">
            <template slot-scope="scope">
              <el-date-picker clearable v-model="scope.row.cancelledAt" type="date" value-format="yyyy-MM-dd" placeholder="اختر وقت الإلغاء" />
            </template>
          </el-table-column>
        </el-table> -->

        </template>



      </el-form-item>


      

        

        
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">تأكيد</el-button>
        <el-button @click="cancel">إلغاء</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listGroup, getGroup, delGroup, addGroup, updateGroup } from "@/api/api/group"
import { listCompany } from "@/api/api/company"
import { getCustomer } from "@/api/api/customer"
import * as XLSX from 'xlsx'

export default {
  name: "Group",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedCouponCoupon: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // مجموعات الكوبونات表格数据
      groupList: [],
      // جدول القسائم表格数据
      couponCouponList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        companyId: null,
        name: null,
        description: null,
      },
      // 表单参数
      form: {
        companyId: '',
        customerFileList: [],
        couponCustomerList: []
      },
      companyOptions: [],
      isEditing: false,
      // 表单校验
      rules: {
        companyId: [
          { required: true, message: "معرّف الشركة لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        name: [
          { required: true, message: "اسم المجموعة لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        // customerFile: [
        //   { required: true, message: "يرجى تحميل ملف العملاء", trigger: "change" }
        // ]
      }
    }
  },
  created() {
    this.getList()
    this.loadCompanyOptions()
  },
  activated() {
    this.getList()
    this.loadCompanyOptions()
  },
  methods: {
    /** 查询مجموعات الكوبونات列表 */
    getList() {
      this.loading = true
      listGroup(this.queryParams).then(response => {
        this.groupList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        groupId: null,
        companyId: null,
        name: null,
        description: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.couponCouponList = []
      this.resetForm("form")
    },
  //   handleFileChange(file, fileList) {
  //     console.log("inside the fileList")
  //     console.log(file)
  //     console.log(fileList)
  //     // this.handleCustomerFileUpload(file)
  //   this.form.customerFileList = fileList
  // },

  async fetchCustomerDetails(row) {
    if (!row.customerId) return

    try {
      const response = await getCustomer(row.customerId)
      const customer = response.data
      row.customerPhone = customer.phone // Store phone number in row
    } catch (error) {
      this.$modal.msgError("تعذر جلب بيانات العميل")
      row.customerPhone = null
    }
  },
  async handleCustomerFileUpload(file) {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const customers = XLSX.utils.sheet_to_json(sheet)
    

        const validCustomers = []
        const errorList = []

        customers.forEach((customer) => {
          let rawPhone = String(customer.phone).replace(/\s+/g, '').replace(/^(\+966|00966|966)/, '0')

          if (!/^05\d{8}$/.test(rawPhone)) {
            errorList.push({ name: customer.name, phone: customer.phone })
          } else {
            validCustomers.push({
              name: customer.name,
              phoneNumber: rawPhone
            })
          }
        })

        if (errorList.length > 0) {
          const errorMessage = errorList.map(e => `الاسم: ${e.name} — الرقم: ${e.phone}`).join('\n')
          this.$modal.msgError(`الأرقام التالية غير صالحة:\n${errorMessage}`)
          return
        }

        // Proceed with validCustomers
        this.$modal.msgSuccess("تم التحقق من الملف بنجاح")
        this.form.couponCustomerList = validCustomers
      }

      reader.readAsArrayBuffer(file.file)
    } catch (error) {
      this.$modal.msgError("حدث خطأ أثناء قراءة الملف")
    }
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
      this.ids = selection.map(item => item.groupId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    loadCompanyOptions() {
      listCompany({}).then(response => {
        this.companyOptions = response.rows || []
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
    

      this.isEditing = false
      this.reset()
      this.open = true
      this.title = "إضافة مجموعات الكوبونات"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isEditing = true
      this.reset()
      const groupId = row.groupId || this.ids
      getGroup(groupId).then(response => {
        this.form = response.data
        this.couponCouponList = response.data.couponCouponList
        this.open = true
        this.title = "تعديل مجموعات الكوبونات"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.couponCouponList = this.couponCouponList
          if (this.form.groupId != null) {
            updateGroup(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            if (!this.form.couponCustomerList || this.form.couponCustomerList.length === 0) {
              this.$modal.msgError("يرجى تحميل ملف يحتوي على بيانات العملاء بشكل صحيح، الاسم ورقم الهاتف مطلوبة")
              return;
            }
            addGroup(this.form).then(response => {
              this.$modal.msgSuccess("تمت الإضافة بنجاح")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const groupIds = row.groupId || this.ids
      this.$modal.confirm('هل أنت متأكد من حذف مجموعات الكوبونات ذات الرقم "' + groupIds + '"؟').then(function() {
        return delGroup(groupIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },
	  /** جدول القسائم序号 */
    rowCouponCouponIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** جدول القسائم添加按钮操作 */
    handleAddCouponCoupon() {
      let obj = {}
      obj.customerId = ""
      obj.code = ""
      obj.status = ""
      obj.issuedAt = ""
      obj.activatedAt = ""
      obj.usedAt = ""
      obj.cancelledAt = ""
      this.couponCouponList.push(obj)
    },
    /** جدول القسائم删除按钮操作 */
    handleDeleteCouponCoupon() {
      if (this.checkedCouponCoupon.length == 0) {
        this.$modal.msgError("يرجى أولاً اختيار بيانات جدول القسائم التي تريد حذفها")
      } else {
        const couponCouponList = this.couponCouponList
        const checkedCouponCoupon = this.checkedCouponCoupon
        this.couponCouponList = couponCouponList.filter(function(item) {
          return checkedCouponCoupon.indexOf(item.index) == -1
        })
      }
    },
    /** 复选框选中数据 */
    handleCouponCouponSelectionChange(selection) {
      this.checkedCouponCoupon = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/group/export', {
        ...this.queryParams
      }, `group_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
