<template>
  <div class="app-container">
   

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

      


     <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold; text-align: center;">
      شهادة الحضور والانصراف الخاصة بالموظف: {{ employeeName || 'جارٍ التحميل...' }}
    </div>
    <div style="margin-bottom: 20px; font-size: 16px; text-align: center;">
      الشهر: {{ monthName  || '' }} / السنة: {{ year || '' }}
    </div>
     <div style="margin-bottom: 20px; font-size: 16px; text-align: center;">
      الرقم الوظيفي: {{ empId  || '' }} 
    </div>
   

      <el-table v-loading="loading" height="100vh" :data="dailyLogs" @selection-change="handleSelectionChange">
       <el-table-column label="التاريخ" prop="date" align="center" />
              <el-table-column label="وقت الشيفت" align="center">
                <template slot-scope="scope">
                  {{ scope.row.shiftStart }} - {{ scope.row.shiftEnd }}
                </template>
              </el-table-column>
              <el-table-column label="الدخول" prop="punchIn" align="center" />
              <el-table-column label="الخروج" prop="punchOut" align="center" />
              <el-table-column label="تأخير (د)" prop="minutesLate" align="center" />
              <el-table-column label="خروج مبكر (د)" prop="minutesEarlyLeave" align="center" />
              <el-table-column label="نسيان دخول" align="center">
                <template slot-scope="scope">
                  {{ scope.row.forgotPunchIn ? 'نعم' : 'لا' }}
                </template>
              </el-table-column>
              <el-table-column label="نسيان خروج" align="center">
                <template slot-scope="scope">
                  {{ scope.row.forgotPunchOut ? 'نعم' : 'لا' }}
                </template>
              </el-table-column>
              <el-table-column label="غياب" align="center">
                <template slot-scope="scope">
                  {{ scope.row.absent ? 'نعم' : 'لا' }}
                </template>
              </el-table-column>
              <el-table-column label="عطلة اسبوع" align="center">
                <template slot-scope="scope">
                  {{ scope.row.weekend ? 'نعم' : 'لا' }}
                </template>
              </el-table-column>
              <el-table-column label="إجازة" align="center">
                <template slot-scope="scope">
                  {{ scope.row.onLeave ? 'نعم' : 'لا' }}
                </template>
              </el-table-column>


      </el-table>
    </div>
    
    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->

    <!-- 添加或修改الموظفون对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="الاسم" prop="name">
          <el-input v-model="form.name" placeholder="请输入الاسم" />
        </el-form-item>
        <!-- <el-form-item label="اسم العائلة" prop="lastName">
          <el-input v-model="form.lastName" placeholder="أدخل اسم العائلة" />
        </el-form-item> -->
        <!-- <el-form-item label="الاسم الكامل" prop="fullName">
          <el-input v-model="form.fullName" placeholder="أدخل الاسم الكامل" />
        </el-form-item> -->
        <!-- <el-form-item label="رابط الصورة الشخصية" prop="photo">
          <el-input v-model="form.photo" placeholder="أدخل رابط الصورة الشخصية" />
        </el-form-item> -->
        <el-form-item label="القسم" prop="deptId">
          <el-select v-model="form.deptId" placeholder="اختر القسم" clearable>
            <el-option
              v-for="item in deptOptions"
              :key="item.deptId"
              :label="item.deptName"
              :value="item.deptId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="الوظيفة" prop="positionId">
          <el-select v-model="form.positionId" placeholder="اختر الوظيفة" clearable>
            <el-option
              v-for="item in positionOptions"
              :key="item.positionId"
              :label="item.positionName"
              :value="item.positionId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="المنطقة" prop="areaId">
          <el-select v-model="form.areaId" placeholder="اختر المنطقة" clearable>
            <el-option
              v-for="item in areaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="تاريخ التوظيف" prop="hireDate">
          <el-date-picker clearable
            v-model="form.hireDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ التوظيف">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="تاريخ الميلاد" prop="birthday">
          <el-date-picker clearable
            v-model="form.birthday"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ الميلاد">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="الجنس" prop="gender">
          <el-select v-model="form.gender" placeholder="اختر الجنس" clearable>
            <el-option label="ذكر (M)" value="M" />
            <el-option label="أنثى (F)" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item label="رقم الهاتف" prop="phone">
          <el-input v-model="form.phone" placeholder="أدخل رقم الهاتف" />
        </el-form-item>
        <el-form-item label="الجنسية" prop="national">
          <el-input v-model="form.national" placeholder="أدخل الجنسية" />
        </el-form-item>
        <el-form-item label="المدينة" prop="city">
          <el-input v-model="form.city" placeholder="أدخل المدينة" />
        </el-form-item>
        <el-form-item label="العنوان" prop="address">
          <el-input v-model="form.address" placeholder="أدخل العنوان" />
        </el-form-item>
        <el-form-item label="الرمز البريدي" prop="postcode">
          <el-input v-model="form.postcode" placeholder="أدخل الرمز البريدي" />
        </el-form-item>
        <el-form-item label="البريد الإلكتروني" prop="email">
          <el-input v-model="form.email" placeholder="أدخل البريد الإلكتروني" />
        </el-form-item>

        <el-form-item label="الشيفت" prop="shiftId">
          <el-select
            v-model="form.shiftId"
            placeholder="اختر الشيفت"
            clearable
            filterable
          >
            <el-option
              v-for="shift in filteredShiftOptions[form.deptId] || []"
              :key="shift.id"
              :label="shift.name"
              :value="shift.id"
            />
          </el-select>
        </el-form-item>




        <el-form-item label="الراتب الشهري" prop="salary">
          <el-input v-model="form.salary" placeholder="أدخل الراتب الشهري" />
        </el-form-item>

      
       
        <!-- <el-form-item label="علامة الحذف (0: موجود، 2: محذوف)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="أدخل علامة الحذف (0: موجود، 2: محذوف)" />
        </el-form-item> -->

       

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">تأكيد</el-button>
        <el-button @click="cancel">إلغاء</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSalary, getEmp, delEmp, addEmp, updateEmp } from "@/api/api/emp"
import { listMonth, getMonth, delMonth, addMonth, updateMonth } from "@/api/api/month"
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
      shiftMap: {},
      employeeName : null,
      month: null,
      year: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        id: null,
        pageNum: 1,
        pageSize: 9999,
        name: null,
        photo: null,
        deptId: null,
        positionId: null,
        areaId: null,
        hireDate: null,
        birthday: null,
        gender: null,
        phone: null,
        national: null,
        city: null,
        address: null,
        postcode: null,
        email: null,
        shiftId: null,
        salary: null,
        year: null,
        month: null,
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
    this.form.empId = this.$route.params.empId
    this.empId = this.$route.params.empId
    const logsRaw = this.$route.query.logs;
    this.month = this.$route.query.month;
    this.year = this.$route.query.year;
    if (logsRaw) {
      try {
        this.dailyLogs = JSON.parse(logsRaw);
        
        // Loop through each log and apply the fix
        this.dailyLogs.forEach(log => {
          const isAbsent = log.absent;
          const isOnLeave = log.onLeave;
          const isOnWeekend = log.weekend;

          if (!isAbsent && !isOnLeave && !isOnWeekend) {
            if (!log.punchIn) {
              log.punchIn = "x";
            }
            if (!log.punchOut) {
              log.punchOut = "x";
            }
          }
        });
        this.loading = false
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
    this.loadEmployeeName(this.$route.params.empId);
  },
  activated() {
    this.form.empId = this.$route.params.empId
    this.empId = this.$route.params.empId
    const logsRaw = this.$route.query.logs;
    this.month = this.$route.query.month;
    this.year = this.$route.query.year;
    if (logsRaw) {
      try {
        this.dailyLogs = JSON.parse(logsRaw);
        
        // Loop through each log and apply the fix
        this.dailyLogs.forEach(log => {
          const isAbsent = log.absent;
          const isOnLeave = log.onLeave;
          const isOnWeekend = log.weekend;

          if (!isAbsent && !isOnLeave && !isOnWeekend) {
            if (!log.punchIn) {
              log.punchIn = "x";
            }
            if (!log.punchOut) {
              log.punchOut = "x";
            }
          }
        });

        this.loading = false
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
    this.loadEmployeeName(this.$route.params.empId);
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
      listSalary(this.queryParams).then(response => {
        this.empList = response.rows
        this.total = response.total
        this.loading = false
      })

      // this.generateFakeSalaries();



      
    },
    generateFakeSalaries() {
  const fakeList = [];
  for (let i = 1; i <= 100; i++) {
    fakeList.push({
      id: i,
      name: `الموظف ${i}`,
      department: `القسم ${((i - 1) % 5) + 1}`,
      baseSalary: (3000 + i * 10).toFixed(2),
      bonus: (i % 2 === 0 ? 500 : 300).toFixed(2),
      deductions: (i % 3 === 0 ? 150 : 100).toFixed(2),
      netSalary: (3000 + i * 10 + (i % 2 === 0 ? 500 : 300) - (i % 3 === 0 ? 150 : 100)).toFixed(2),
      month: this.queryParams.month,
      year: this.queryParams.year
    });
  }

  this.empList = fakeList;
  this.total = fakeList.length;
  this.loading = false;


},

handleExport() {
    const exportData = this.empList.map(emp => ({
      'المعرف للموظف': emp.id,
      'الاسم': emp.name,
      'الراتب الشهري': emp.salary,
      'القسم': this.getDeptName(emp.deptId),
      'الشيفت': this.shiftMap[emp.shiftId] || emp.shiftId,
      'ايام الحضور': emp.attendanceDays,
      'ايام الغياب': emp.absenceDays,
      'نسيان بصمة الدخول': emp.forgetPunchInDays,
      'نسيان بصمة الخروج': emp.forgetPunchOutDays,
      'مجموع نسيان البصمات': emp.forgetPunchDays,
      'دقائق التاخير': emp.minLateArrival,
      'دقائق الخروج المبكر': emp.minEarlyLeft,
      'مبلغ السلف': emp.totalLoan,
      'مبلغ الخصم': emp.totalDedection,
      'خصم التاخير': emp.deductionLate,
      'خصم الخروج المبكر': emp.deductionEarlyLeft,
      'خصم الغياب': emp.deductionAbsent,
      'صافي الراتب': emp.salaryAfterDeduction
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الموظفين')
    XLSX.writeFile(workbook, 'الموظفين.xlsx')
  }
,
async loadEmployeeName(empId) {
      try {
          const res = await getEmp(empId);
          this.employeeName = res.data.name || '';
        } catch (error) {
          this.employeeName = null
      }
    },
    async loadShiftData() {
      // 1. Load all shifts
      const shiftRes = await listShift()
      this.allShifts = shiftRes.rows || []
      console.log(shiftRes.rows)

      // 2. Load all timetables
      const timetableRes = await listTimetable()
      const timetables = timetableRes.rows || []
       console.log(timetableRes.rows)

      // 3. Build filteredShiftOptions: dept_id → [shift objects]
      this.filteredShiftOptions = {}
      for (const timetable of timetables) {
        const deptId = timetable.deptId
        const shiftIds = (timetable.shiftIds || '')
          .split(',')
          .map(id => Number(id.trim()))
          .filter(id => !isNaN(id))

        this.filteredShiftOptions[deptId] = this.allShifts.filter(shift =>
            shiftIds.includes(shift.id)
        )

   
     }
     console.log(this.filteredShiftOptions)

        // 4. Set shiftCurrentChoice based on current dept_id
        // this.updateShiftChoice()
    },

    updateShiftChoice() {
      const deptId = this.form.dept_id
      this.shiftCurrentChoice = deptId ? (this.filteredShiftOptions[deptId] || []) : []
    },
    getShiftChoiceByRowId(rowId) {
      const row = this.empList.find(emp => emp.id === rowId)
      if (!row || !row.dept_id) return []
      return this.filteredShiftOptions[row.dept_id] || []
    },
    getShiftOptions() {
      listShift({pageSize: 9999}).then(response => {
        this.shiftOptions = response.rows
        this.shiftMap = Object.fromEntries(
          response.rows.map(shift => [shift.id, shift.name])
        )
      })
    },
    getDeptOptions() {
      listDept({}).then(response => {
        this.deptOptions = response.data
      })
    },
    getPositionOptions() {
      listPosition({}).then(response => {
        this.positionOptions = response.data
      })
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
    getAreaOptions() {
      listArea({}).then(response => {
        this.areaOptions = response.data
      })
    },
    getDeptName(id) {
      const dept = this.deptOptions.find(item => item.deptId === id)
      return dept ? dept.deptName : id
    },
    getPositionName(id) {
      const pos = this.positionOptions.find(item => item.positionId === id)
      return pos ? pos.positionName : id
    },
    getAreaName(id) {
      const area = this.areaOptions.find(item => item.id === id)
      return area ? area.areaName : id
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
        name: null,
        photo: null,
        deptId: null,
        positionId: null,
        areaId: null,
        hireDate: null,
        birthday: null,
        gender: null,
        phone: null,
        national: null,
        city: null,
        address: null,
        postcode: null,
        email: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        shiftId: null,
        salary: null,
        year: null,
        month: null,
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

