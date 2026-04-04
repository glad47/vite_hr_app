<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="معرف الموظف" prop="empId">
        <el-input
          v-model="queryParams.empId"
          placeholder="أدخل معرف الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="الاسم" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل الاسم"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">بحث</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">إعادة تعيين</el-button>
      </el-form-item>
    </el-form>


    <!-- <el-row :gutter="10" class="mb8">
    <el-col :span="1.5">
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
        v-hasPermi="['api:transaction:add']"
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
        v-hasPermi="['api:transaction:edit']"
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
        v-hasPermi="['api:transaction:remove']"
      >حذف</el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button
        type="warning"
        plain
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
        v-hasPermi="['api:transaction:export']"
      >تصدير</el-button>
    </el-col>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row> -->


    <el-table v-loading="loading" :data="transactionList" @selection-change="handleSelectionChange">
  <el-table-column type="selection" width="55" align="center" />
  <!-- <el-table-column label="المعرف الفريد للبصمة" align="center" prop="id" /> -->
  <el-table-column label="معرف الموظف" align="center" prop="empId" />
  <el-table-column label="الاسم" align="center" prop="name" />
  <el-table-column label="القسم" align="center" prop="department" />
  <el-table-column label="الوظيفة" align="center" prop="position" />
  <el-table-column label="وقت البصمة" align="center" prop="punchTime" width="180">
    <template slot-scope="scope">
      <span>{{ parseTime(scope.row.punchTime, '{y}-{m}-{d}:{h}:{i}:{s}') }}</span>
    </template>
  </el-table-column>
  <!-- <el-table-column label="حالة البصمة" align="center" prop="punchState" />
  <el-table-column label="عرض حالة البصمة" align="center" prop="punchStateDisplay" />
  <el-table-column label="نوع التحقق" align="center" prop="verifyType" />
  <el-table-column label="عرض نوع التحقق" align="center" prop="verifyTypeDisplay" />
  <el-table-column label="رمز العمل" align="center" prop="workCode" />
  <el-table-column label="الموقع الجغرافي" align="center" prop="gpsLocation" />
  <el-table-column label="اسم المنطقة" align="center" prop="areaAlias" /> -->
  <!-- <el-table-column label="رقم الجهاز" align="center" prop="terminalSn" /> -->
  <el-table-column label="اسم الجهاز" align="center" prop="terminalAlias" />
  <!-- <el-table-column label="درجة الحرارة" align="center" prop="temperature" />
  <el-table-column label="هل يرتدي كمامة" align="center" prop="isMask" />
  <el-table-column label="وقت الرفع" align="center" prop="uploadTime" width="180">
    <template slot-scope="scope">
       <span>{{ parseTime(scope.row.punchTime, '{y}-{m}-{d}:{h}:{i}:{s}') }}</span>
    </template>
  </el-table-column>
  <el-table-column label="الأجهزة المرتبطة" align="center" prop="deviceIds" /> -->
  <!-- <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
    <template slot-scope="scope">
      <el-button
        size="mini"
        type="text"
        icon="el-icon-edit"
        @click="handleUpdate(scope.row)"
        v-hasPermi="['api:transaction:edit']"
      >تعديل</el-button>
      <el-button
        size="mini"
        type="text"
        icon="el-icon-delete"
        @click="handleDelete(scope.row)"
        v-hasPermi="['api:transaction:remove']"
      >حذف</el-button>
    </template>
  </el-table-column> -->
</el-table>

    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改سجلات البصمة对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="معرف الموظف" prop="empId">
          <el-input v-model="form.empId" placeholder="أدخل معرف الموظف" />
        </el-form-item>
        <el-form-item label="الاسم" prop="name">
          <el-input v-model="form.name" placeholder="أدخل الاسم" />
        </el-form-item>
        <el-form-item label="القسم" prop="department">
          <el-input v-model="form.department" placeholder="أدخل القسم" />
        </el-form-item>
        <el-form-item label="الوظيفة" prop="position">
          <el-input v-model="form.position" placeholder="أدخل الوظيفة" />
        </el-form-item>
        <el-form-item label="وقت البصمة" prop="punchTime">
          <el-date-picker clearable
            v-model="form.punchTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر وقت البصمة">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="حالة البصمة" prop="punchState">
          <el-input v-model="form.punchState" placeholder="أدخل حالة البصمة" />
        </el-form-item>
        <el-form-item label="عرض حالة البصمة" prop="punchStateDisplay">
          <el-input v-model="form.punchStateDisplay" placeholder="أدخل عرض حالة البصمة" />
        </el-form-item>
        <el-form-item label="عرض نوع التحقق" prop="verifyTypeDisplay">
          <el-input v-model="form.verifyTypeDisplay" placeholder="أدخل عرض نوع التحقق" />
        </el-form-item>
        <el-form-item label="رمز العمل" prop="workCode">
          <el-input v-model="form.workCode" placeholder="أدخل رمز العمل" />
        </el-form-item>
        <el-form-item label="الموقع الجغرافي" prop="gpsLocation">
          <el-input v-model="form.gpsLocation" placeholder="أدخل الموقع الجغرافي" />
        </el-form-item>
        <el-form-item label="اسم المنطقة" prop="areaAlias">
          <el-input v-model="form.areaAlias" placeholder="أدخل اسم المنطقة" />
        </el-form-item>
        <el-form-item label="رقم الجهاز" prop="terminalSn">
          <el-input v-model="form.terminalSn" placeholder="أدخل رقم الجهاز" />
        </el-form-item>
        <el-form-item label="اسم الجهاز" prop="terminalAlias">
          <el-input v-model="form.terminalAlias" placeholder="أدخل اسم الجهاز" />
        </el-form-item>
        <el-form-item label="درجة الحرارة" prop="temperature">
          <el-input v-model="form.temperature" placeholder="أدخل درجة الحرارة" />
        </el-form-item>
        <el-form-item label="هل يرتدي كمامة" prop="isMask">
          <el-input v-model="form.isMask" placeholder="أدخل هل يرتدي كمامة" />
        </el-form-item>
        <el-form-item label="وقت الرفع" prop="uploadTime">
          <el-date-picker clearable
            v-model="form.uploadTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر وقت الرفع">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="علامة الحذف (0: موجود، 2: محذوف)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="أدخل علامة الحذف (0: موجود، 2: محذوف)" />
        </el-form-item>
        <el-form-item label="الأجهزة المرتبطة" prop="deviceIds">
          <el-input v-model="form.deviceIds" placeholder="أدخل الأجهزة المرتبطة" />
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
import { listTransaction, getTransaction, delTransaction, addTransaction, updateTransaction } from "@/api/api/transaction"

export default {
  name: "Transaction",
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
      // سجلات البصمة表格数据
      transactionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        empId: null,
        name: null,
        department: null,
        position: null,
        punchTime: null,
        punchState: null,
        punchStateDisplay: null,
        verifyType: null,
        verifyTypeDisplay: null,
        workCode: null,
        gpsLocation: null,
        areaAlias: null,
        terminalSn: null,
        terminalAlias: null,
        temperature: null,
        isMask: null,
        uploadTime: null,
        deviceIds: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "معرف الموظف不能为空", trigger: "blur" }
        ],
        punchTime: [
          { required: true, message: "وقت البصمة不能为空", trigger: "blur" }
        ],
        deviceIds: [
          { required: true, message: "الاجهزة المرتبطة不能为空", trigger: "blur" }
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
    /** 查询سجلات البصمة列表 */
    getList() {
      this.loading = true
      listTransaction(this.queryParams).then(response => {
        this.transactionList = response.rows
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
        id: null,
        empId: null,
        name: null,
        department: null,
        position: null,
        punchTime: null,
        punchState: null,
        punchStateDisplay: null,
        verifyType: null,
        verifyTypeDisplay: null,
        workCode: null,
        gpsLocation: null,
        areaAlias: null,
        terminalSn: null,
        terminalAlias: null,
        temperature: null,
        isMask: null,
        uploadTime: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        deviceIds: null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加سجلات البصمة"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getTransaction(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改سجلات البصمة"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTransaction(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addTransaction(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除سجلات البصمة编号为"' + ids + '"的数据项？').then(function() {
        return delTransaction(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/transaction/export', {
        ...this.queryParams
      }, `transaction_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
