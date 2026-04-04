<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
      
        <el-form-item label="المنطقة" prop="areaId">
          <el-select v-model="form.areaId" placeholder="اختر المنطقة" clearable filterable>
            <el-option
              v-for="area in areaOptions"
              :key="area.id"
              :label="area.areaName"
              :value="area.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="وصف التقرير" prop="description">
        <el-input
          v-model="queryParams.description"
          placeholder="أدخل وصف التقرير"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="تاريخ إنشاء التقرير" prop="createDate">
        <el-date-picker clearable
          v-model="queryParams.createDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ إنشاء التقرير">
        </el-date-picker>
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
          v-hasPermi="['api:report:add']"
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
          v-hasPermi="['api:report:edit']"
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
          v-hasPermi="['api:report:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:report:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table v-loading="loading" :data="reportList" @selection-change="handleSelectionChange" @row-click="goToReportLinesPage">
  <el-table-column type="selection" width="55" align="center" />
  <el-table-column label="المعرف الفريد للتقرير" align="center" prop="id" />
  <el-table-column label="وصف التقرير" align="center" prop="description" />
  <el-table-column label="تاريخ إنشاء التقرير" align="center" prop="createDate" width="180">
    <template slot-scope="scope">
      <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
    </template>
  </el-table-column>
    <!-- 
      <el-table-column label="المنطقة" align="center" prop="areaName" />
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="text"
          icon="el-icon-edit"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['api:report:edit']"
        >تعديل</el-button>
        <el-button
          size="mini"
          type="text"
          icon="el-icon-delete"
          @click="handleDelete(scope.row)"
          v-hasPermi="['api:report:remove']"
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

    <!-- 添加或修改التقارير المحفوظه对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        
        <el-form-item label="المنطقة" prop="areaId">
          <el-select v-model="form.areaId" placeholder="اختر المنطقة" clearable filterable>
            <el-option
              v-for="area in areaOptions"
              :key="area.id"
              :label="area.areaName"
              :value="area.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="وصف التقرير" prop="description">
          <el-input v-model="form.description" placeholder="أدخل وصف التقرير" />
        </el-form-item>
        <el-form-item label="تاريخ إنشاء التقرير" prop="createDate">
          <el-date-picker clearable
            v-model="form.createDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ إنشاء التقرير">
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="علامة الحذف (0: موجود، 2: محذوف)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="أدخل علامة الحذف (0: موجود، 2: محذوف)" />
        </el-form-item> -->

        <el-divider content-position="center">تفاصيل أسطر التقرير</el-divider>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddHrReportLine">إضافة</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteHrReportLine">حذف</el-button>
          </el-col>
        </el-row>

      </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">تأكيد</el-button>
      <el-button @click="cancel">إلغاء</el-button>
    </div>
  </el-dialog>

  </div>
</template>

<script>
import { listReport, getReport, delReport, addReport, updateReport } from "@/api/api/report"
import { listArea } from "@/api/api/area"

export default {
  name: "Report",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedHrReportLine: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // التقارير المحفوظه表格数据
      reportList: [],
      // تفاصيل أسطر التقرير表格数据
      hrReportLineList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        areaId: null,
        description: null,
        createDate: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        description: [
          { required: true, message: "وصف التقرير لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        createDate: [
          { required: true, message: "تاريخ إنشاء التقرير لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
      }

    }
  },
  created() {
    this.loadAreas()
    this.getList()
  },
  methods: {
    loadAreas() {
      listArea({ pageSize: 9999 }).then(response => {
        this.areaOptions = response.rows || []
      })
    },
    /** 查询التقارير المحفوظه列表 */
    getList() {
      this.loading = true
      listReport(this.queryParams).then(response => {
        this.reportList = response.rows
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
        description: null,
        createDate: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.hrReportLineList = []
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    goToReportLinesPage(row) {
      this.$router.push({ path: "/hr/report/detail/list/" + row.id});
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
      this.title = "إضافة التقارير المحفوظة"
    },
    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getReport(id).then(response => {
        this.form = response.data
        this.hrReportLineList = response.data.hrReportLineList
        this.open = true
        this.title = "تعديل التقارير المحفوظة"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.hrReportLineList = this.hrReportLineList
          if (this.form.id != null) {
            updateReport(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addReport(this.form).then(response => {
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
      const ids = row.id || this.ids
      this.$modal.confirm('هل أنت متأكد من حذف التقرير المحفوظ ذو الرقم "' + ids + '" ؟').then(function() {
        return delReport(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },

	/** تفاصيل أسطر التقرير序号 */
    rowHrReportLineIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** تفاصيل أسطر التقرير添加按钮操作 */
    handleAddHrReportLine() {
      let obj = {}
      obj.name = ""
      obj.salary = ""
      obj.dept = ""
      obj.shift = ""
      obj.attendanceDays = ""
      obj.absenceDays = ""
      obj.forgetPunchInDays = ""
      obj.forgetPunchOutDays = ""
      obj.forgetPunchDays = ""
      obj.minLateArrival = ""
      obj.minEarlyLeft = ""
      obj.totalLoan = ""
      obj.totalDeduction = ""
      obj.deductionLate = ""
      obj.deductionAbsent = ""
      obj.totalAdditionAmount = ""
      obj.salaryAfterDeduction = ""
      this.hrReportLineList.push(obj)
    },
    /** تفاصيل أسطر التقرير删除按钮操作 */
    handleDeleteHrReportLine() {
      if (this.checkedHrReportLine.length == 0) {
        this.$modal.msgError("يرجى أولاً اختيار بيانات تفاصيل أسطر التقرير المراد حذفها")
      } else {
        const hrReportLineList = this.hrReportLineList
        const checkedHrReportLine = this.checkedHrReportLine
        this.hrReportLineList = hrReportLineList.filter(function(item) {
          return checkedHrReportLine.indexOf(item.index) == -1
        })
      }
    },

    /** 复选框选中数据 */
    handleHrReportLineSelectionChange(selection) {
      this.checkedHrReportLine = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/report/export', {
        ...this.queryParams
      }, `report_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
