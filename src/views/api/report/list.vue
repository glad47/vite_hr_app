<template>
  <div class="app-container">
   
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
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
    
    <el-row :gutter="10" class="mb8">
      
      

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="printTable"
          v-hasPermi="['api:emp:export']"
        >طباعة</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div id="print-area"  style="width: 100%;">
      <div id="print-area-clone" style="display: none;"></div>

      


    
    <div style="margin-bottom: 20px; font-size: 16px; text-align: center;">
      تقرير: {{ reportDescription  || '' }} / التاريخ: {{ reportDate || '' }}
    </div>
     
   

      <el-table v-loading="loading" height="100vh"   :data="filteredHrReportLineList ? filteredHrReportLineList : hrReportLineList" @selection-change="handleSelectionChange">
        <el-table-column label="الاسم" prop="name" align="center" />
        <el-table-column label="الراتب الأساسي" prop="salary" align="center" />
        <el-table-column label="أيام الحضور" prop="attendanceDays" align="center" />
        <el-table-column label="أيام الغياب" prop="absenceDays" align="center" />
        <el-table-column label="أيام نسيان الدخول" prop="forgetPunchInDays" align="center" />
        <el-table-column label="أيام نسيان الخروج" prop="forgetPunchOutDays" align="center" />
        <el-table-column label="إجمالي أيام النسيان" prop="forgetPunchDays" align="center" />
        <el-table-column label="دقائق التأخير" prop="minLateArrival" align="center" />
        <el-table-column label="دقائق الخروج المبكر" prop="minEarlyLeft" align="center" />
        <el-table-column label="خصم التأخير" prop="deductionLate" align="center" />
        <el-table-column label="خصم الغياب" prop="deductionAbsent" align="center" />
        <el-table-column label="إجمالي القروض" prop="totalLoan" align="center" />
        <el-table-column label="إجمالي الإضافات" prop="totalAdditionAmount" align="center" />
        <el-table-column label="الراتب بعد الخصم" prop="salaryAfterDeduction" align="center" />
      </el-table>

    </div>
    
    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->

  </div>
</template>

<script>
import { listSalary, getEmp, delEmp, addEmp, updateEmp } from "@/api/api/emp"
import { listMonth, getMonth, delMonth, addMonth, updateMonth } from "@/api/api/month"
import { listReport, getReport, delReport, addReport, updateReport } from "@/api/api/report"

import { listArea } from "@/api/api/area"
import { listPosition } from "@/api/api/position"
import { listDept } from "@/api/api/dept"
// import { listDevices } from "@/api/api/devices"
import { listShift} from "@/api/api/shift"
import { listTimetable } from "@/api/api/timetable"
import axios from "axios"
import printJS from 'print-js';
import * as XLSX from 'xlsx'


export default {
  name: "Emp",
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
      // الموظفون表格数据
      empList: [],
      shiftOptions: [],
      filteredShiftOptions: {},
      hrReportLineList : null,
      filteredHrReportLineList: null,
      reportDate : null,
      reportDescription: null,
      shiftMap: {},
      currentReport : null,
      month: null,
      year: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        id: null,
        name: null,
        pageSize: 9999
      },
      months: [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ],
      years: [
        '2024', '2025', '2026'
      ],
      deptOptions: [],
      positionOptions: [],
      areaOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "الاسم مطلوب", trigger: "blur" }
        ]
      }

    }
  },
  created() {
    this.form.id = this.$route.params.reportId
    this.reportId = this.$route.params.reportId
    this.getList()
    
    
    
  },
  activated() {
    this.form.id = this.$route.params.reportId
    this.reportId = this.$route.params.reportId
    this.getList()
  
  },
  computed: {
  monthName() {
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      return months[this.month - 1]; // subtract 1 because array is 0-indexed
    }
  },
  methods: {
    /** 查询الموظفون列表 */
    getList() {
      this.loading = true
      getReport(this.form.id).then(response => {
        this.hrReportLineList = response.data.hrReportLineList
        this.reportDate = response.data.createDate
        this.reportDescription = response.data.description
        this.loading = false
      })

      // this.generateFakeSalaries();



      
    },
  printTable() {
      printJS({
          printable: 'print-area',
          type: 'html',
          scanStyles: true,
          style: `
            @page { size: A4 landscape; margin: 0.1mm; }
            table { font-size: 2px; border-collapse: collapse; }
            th, td { border: 0.1px solid #ccc; text-align: center; padding: 0px;}
            .el-table__header-wrapper, .el-table__body-wrapper {
              overflow: visible !important;
               padding: 0px;
            }
            .el-table {
            width: 100%!important;
            font-size: 3px !important;
          }
            .el-table__row {
            page-break-inside: avoid;
          }
          `
        });
  },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // First check if hrReportLineList exists and is not empty
      if (!this.hrReportLineList || this.hrReportLineList.length == 0) {
        console.warn("No HR report lines available");
        return;
      }

      // Build regex from search string (case-insensitive)
      const regex = new RegExp(this.queryParams.name, "i");
      console.log("working ...")
      console.log(regex)
      // Filter the list
      this.filteredHrReportLineList = this.hrReportLineList.filter(item => {
        // Example: search by employee name or department
        console.log("***************")
        console.log(regex.test(item.name))
        return regex.test(item.name)
      });

 
},

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.filteredHrReportLineList = null
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
      this.title = "إضافة موظف"
    },

    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getEmp(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل موظف"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateEmp(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addEmp(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف الموظف ذو الرقم "' + ids + '"؟').then(function() {
        return delEmp(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    // handleExport() {
    //   this.download('api/emp/export', {
    //     ...this.queryParams
    //   }, `emp_${new Date().getTime()}.xlsx`)
    // }
  }
}
</script>
<style>
/* .print-only {
  display: none;
}

@media print {
  .print-only {
    display: block!important;
  }
} */
</style>

