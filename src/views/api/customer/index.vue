<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="اسم العميل" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل اسم العميل"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="رقم الهاتف" prop="phoneNumber">
        <el-input
          v-model="queryParams.phoneNumber"
          placeholder="أدخل رقم الهاتف"
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
        v-hasPermi="['api:customer:add']"
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
        v-hasPermi="['api:customer:edit']"
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
        v-hasPermi="['api:customer:remove']"
      >حذف</el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button
        type="warning"
        plain
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
        v-hasPermi="['api:customer:export']"
      >تصدير</el-button>
    </el-col>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>


    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" align="center" />
    <el-table-column label="معرّف العميل" align="center" prop="customerId" />
    <el-table-column label="اسم العميل" align="center" prop="name" />
    <el-table-column label="رقم الهاتف" align="center" prop="phoneNumber" />
    <el-table-column label="ملاحظات" align="center" prop="remark" />
    <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="text"
          icon="el-icon-edit"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['api:customer:edit']"
        >تعديل</el-button>
        <el-button
          size="mini"
          type="text"
          icon="el-icon-delete"
          @click="handleDelete(scope.row)"
          v-hasPermi="['api:customer:remove']"
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

    <!-- 添加或修改العملاء对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="اسم العميل" prop="name">
        <el-input v-model="form.name" placeholder="أدخل اسم العميل" />
      </el-form-item>
      <el-form-item label="رقم الهاتف" prop="phoneNumber">
        <el-input v-model="form.phoneNumber" placeholder="أدخل رقم الهاتف" />
      </el-form-item>
      <!-- <el-form-item label="علامة الحذف (0: موجود، 2: محذوف)" prop="delFlag">
        <el-input v-model="form.delFlag" placeholder="أدخل علامة الحذف (0: موجود، 2: محذوف)" />
      </el-form-item> -->
      <el-form-item label="ملاحظات" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="أدخل الملاحظات" />
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
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer } from "@/api/api/customer"

export default {
  name: "Customer",
  data() {
    return {
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
      // العملاء表格数据
      customerList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        phoneNumber: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "اسم العميل لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        phoneNumber: [
          { required: true, message: "رقم الهاتف لا يمكن أن يكون فارغًا", trigger: "blur" }
        ]
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
    /** 查询العملاء列表 */
    getList() {
      this.loading = true
      listCustomer(this.queryParams).then(response => {
        this.customerList = response.rows
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
        customerId: null,
        name: null,
        phoneNumber: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      }
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
      this.ids = selection.map(item => item.customerId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "إضافة عميل"
    },

    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const customerId = row.customerId || this.ids
      getCustomer(customerId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل بيانات العميل"
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.customerId != null) {
            // تعديل بيانات العميل
            updateCustomer(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            // إضافة عميل جديد
            addCustomer(this.form).then(response => {
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
      const customerIds = row.customerId || this.ids
      this.$modal.confirm('هل أنت متأكد من حذف العميل ذو الرقم "' + customerIds + '"؟').then(function() {
        return delCustomer(customerIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },

    /** عملية زر التصدير */
    handleExport() {
      this.download('api/customer/export', {
        ...this.queryParams
      }, `customer_${new Date().getTime()}.xlsx`)
    }

  }
}
</script>
