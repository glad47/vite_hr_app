<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="اسم الشركة" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل اسم الشركة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="البريد الإلكتروني" prop="contactEmail">
        <el-input
          v-model="queryParams.contactEmail"
          placeholder="أدخل البريد الإلكتروني للتواصل"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="رقم الهاتف" prop="contactPhone">
        <el-input
          v-model="queryParams.contactPhone"
          placeholder="أدخل رقم الهاتف للتواصل"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="عنوان الشركة" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="أدخل عنوان الشركة"
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
          v-hasPermi="['api:company:add']"
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
          v-hasPermi="['api:company:edit']"
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
          v-hasPermi="['api:company:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:company:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <el-table v-loading="loading" :data="companyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="معرّف الشركة" align="center" prop="companyId" />
      <el-table-column label="اسم الشركة" align="center" prop="name" />
      <el-table-column label="البريد الإلكتروني" align="center" prop="contactEmail" />
      <el-table-column label="رقم الهاتف" align="center" prop="contactPhone" />
      <el-table-column label="عنوان الشركة" align="center" prop="address" />
      <el-table-column label="ملاحظات" align="center" prop="remark" />
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:company:edit']"
          >تعديل</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:company:remove']"
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

    <!-- 添加或修改الشركات对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="اسم الشركة" prop="name">
          <el-input v-model="form.name" placeholder="أدخل اسم الشركة" />
        </el-form-item>
        <el-form-item label="البريد الإلكتروني" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="أدخل البريد الإلكتروني للتواصل" />
        </el-form-item>
        <el-form-item label="رقم الهاتف" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="أدخل رقم الهاتف للتواصل" />
        </el-form-item>
        <el-form-item label="عنوان الشركة" prop="address">
          <el-input v-model="form.address" placeholder="أدخل عنوان الشركة" />
        </el-form-item>
        <el-form-item label="ملاحظات" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="أدخل الملاحظات" />
        </el-form-item>

        <!-- <el-divider content-position="center">معلومات مجموعات القسائم</el-divider>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddCouponGroup">إضافة</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteCouponGroup">حذف</el-button>
          </el-col>
        </el-row> -->

        <!-- <el-table :data="couponGroupList" :row-class-name="rowCouponGroupIndex" @selection-change="handleCouponGroupSelectionChange" ref="couponGroup">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="الرقم" align="center" prop="index" width="50" />
          <el-table-column label="اسم المجموعة" prop="name" width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" placeholder="أدخل اسم المجموعة" />
            </template>
          </el-table-column>
        </el-table> -->
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">تأكيد</el-button>
        <el-button @click="cancel">إلغاء</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listCompany, getCompany, delCompany, addCompany, updateCompany } from "@/api/api/company"

export default {
  name: "Company",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedCouponGroup: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // الشركات表格数据
      companyList: [],
      // مجموعات الكوبونات表格数据
      couponGroupList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        contactEmail: null,
        contactPhone: null,
        address: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "اسم الشركة لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  activated() {
     this.getList()
  },
  methods: {
    /** 查询الشركات列表 */
    getList() {
      this.loading = true
      listCompany(this.queryParams).then(response => {
        this.companyList = response.rows
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
        companyId: null,
        name: null,
        contactEmail: null,
        contactPhone: null,
        address: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      }
      this.couponGroupList = []
      this.resetForm("form")
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
      this.ids = selection.map(item => item.companyId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "إضافة شركة"
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const companyId = row.companyId || this.ids
      getCompany(companyId).then(response => {
        this.form = response.data
        this.couponGroupList = response.data.couponGroupList
        this.open = true
        this.title = "تعديل شركة"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.couponGroupList = this.couponGroupList
          if (this.form.companyId != null) {
            updateCompany(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addCompany(this.form).then(response => {
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
      const companyIds = row.companyId || this.ids
      this.$modal.confirm('هل أنت متأكد من حذف الشركات ذات الرقم "' + companyIds + '"؟').then(function() {
        return delCompany(companyIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },
	/** مجموعات الكوبونات序号 */
    rowCouponGroupIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** مجموعات الكوبونات添加按钮操作 */
    handleAddCouponGroup() {
      let obj = {}
      obj.name = ""
      obj.description = ""
      this.couponGroupList.push(obj)
    },
    /** مجموعات الكوبونات删除按钮操作 */
    handleDeleteCouponGroup() {
      if (this.checkedCouponGroup.length == 0) {
        this.$modal.msgError("请先选择要删除的مجموعات الكوبونات数据")
      } else {
        const couponGroupList = this.couponGroupList
        const checkedCouponGroup = this.checkedCouponGroup
        this.couponGroupList = couponGroupList.filter(function(item) {
          return checkedCouponGroup.indexOf(item.index) == -1
        })
      }
    },
    /** 复选框选中数据 */
    handleCouponGroupSelectionChange(selection) {
      this.checkedCouponGroup = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/company/export', {
        ...this.queryParams
      }, `company_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
