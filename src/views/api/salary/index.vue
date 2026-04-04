<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="معرف الموظف" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="أدخل رمز الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>



      <el-form-item label="السنة" prop="year">
          <el-select v-model="queryParams.year" placeholder="اختر السنة">
            <el-option
              v-for="(year, index) in years"
              :key="'year-' + index"
              :label="year"
              :value="year"
            />
          </el-select>
        </el-form-item>

      <el-form-item label="الشهر" prop="month">
          <el-select v-model="queryParams.month" placeholder="اختر الشهر">
            <el-option
              v-for="(month, index) in months"
              :key="'end-month-' + index"
              :label="month"
              :value="index + 1"
            />
          </el-select>
        </el-form-item>
      <!-- <el-form-item label="الاسم الأول" prop="firstName">
        <el-input
          v-model="queryParams.firstName"
          placeholder="أدخل الاسم الأول"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="اسم العائلة" prop="lastName">
        <el-input
          v-model="queryParams.lastName"
          placeholder="أدخل اسم العائلة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="الاسم الكامل" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل الاسم الكامل"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="رابط الصورة الشخصية" prop="photo">
        <el-input
          v-model="queryParams.photo"
          placeholder="أدخل رابط الصورة الشخصية"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="القسم" prop="deptId">
      <el-select
        v-model="queryParams.deptId"
        placeholder="اختر القسم"
        clearable
        @change="handleQuery"
      >
        <el-option
          v-for="item in deptOptions"
          :key="item.deptId"
          :label="item.deptName"
          :value="item.deptId"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="الوظيفة" prop="positionId">
      <el-select
        v-model="queryParams.positionId"
        placeholder="اختر الوظيفة"
        clearable
        @change="handleQuery"
      >
        <el-option
          v-for="item in positionOptions"
          :key="item.positionId"
          :label="item.positionName"
          :value="item.positionId"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="المنطقة" prop="areaId">
      <el-select
        v-model="queryParams.areaId"
        placeholder="اختر المنطقة"
        clearable
        @change="handleQuery"
      >
        <el-option
          v-for="item in areaOptions"
          :key="item.id"
          :label="item.areaName"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <!-- <el-form-item label="الجهاز" prop="deviceId">
      <el-select
        v-model="queryParams.deviceId"
        placeholder="اختر الجهاز"
        clearable
        @change="handleQuery"
      >
        <el-option
          v-for="item in deviceOptions"
          :key="item.deviceId"
          :label="item.deviceName"
          :value="item.deviceId"
        />
      </el-select>
    </el-form-item> -->

      <el-form-item label="تاريخ التوظيف" prop="hireDate">
        <el-date-picker clearable
          v-model="queryParams.hireDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ التوظيف">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="تاريخ الميلاد" prop="birthday">
        <el-date-picker clearable
          v-model="queryParams.birthday"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ الميلاد">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="الجنس" prop="gender">
        <el-select
          v-model="queryParams.gender"
          placeholder="اختر الجنس"
          clearable
          @change="handleQuery"
        >
          <el-option label="ذكر (M)" value="M" />
          <el-option label="أنثى (F)" value="F" />
        </el-select>
      </el-form-item>

      <el-form-item label="رقم الهاتف" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="أدخل رقم الهاتف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="الجنسية" prop="national">
        <el-input
          v-model="queryParams.national"
          placeholder="أدخل الجنسية"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="المدينة" prop="city">
        <el-input
          v-model="queryParams.city"
          placeholder="أدخل المدينة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="العنوان" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="أدخل العنوان"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="الرمز البريدي" prop="postcode">
        <el-input
          v-model="queryParams.postcode"
          placeholder="أدخل الرمز البريدي"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="البريد الإلكتروني" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="أدخل البريد الإلكتروني"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>


      <el-form-item label=" الشيفت" prop="shiftId">
        <el-select
          v-model="queryParams.shiftId"
          placeholder="اختر الشيفت"
          clearable
          filterable
          @change="handleQuery"
        >
          <el-option
            v-for="shift in shiftOptions"
            :key="shift.id"
            :label="shift.name"
            :value="shift.id"
          />
        </el-select>
      </el-form-item>


      <el-form-item label="الراتب الشهري" prop="salary">
        <el-input
          v-model="queryParams.salary"
          placeholder="أدخل الراتب الشهري"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <!-- <el-form-item label="الاجهزة المرتبطة" prop="deviceIds">
          <el-input
            v-model="queryParams.deviceIds"
            placeholder="请输入الاجهزة المرتبطة"
            clearable
            @keyup.enter.native="handleQuery"
          />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">بحث</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">إعادة تعيين</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['api:emp:add']"
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
          v-hasPermi="['api:emp:edit']"
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
          v-hasPermi="['api:emp:remove']"
        >حذف</el-button>
      </el-col>
      
      </el-col> -->
      

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:emp:export']"
        >تصدير</el-button>
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="printTable"
          v-hasPermi="['api:emp:export']"
        >طباعة</el-button>

        <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="handleSaveReport"
            v-hasPermi="['api:report:add']"
          >حفظ التقرير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div id="print-area"  style="width: 100%;">
      <div id="print-area-clone" style="display: none;"></div>

      <div class="print-only" style="text-align: center; font-size: 14px; margin-bottom: 20px;">
        {{ printHeader }}
      </div>

      <el-table 
      v-loading="loading" 
      :data="empList" 
      @selection-change="handleSelectionChange"
      :row-class-name="tableRowClass"
      
      height="100vh">


      <el-table-column label="#" align="center" width="50">
        <template slot-scope="scope">
          <span v-if="!scope.row.isSummary">{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
       <el-table-column  @click.stop label="المعرف للموظف" align="center" prop="id">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="الاسم" align="center" prop="name">
          <template slot-scope="scope">
            <span @click.stop>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="الراتب الشهري" align="center" prop="salary" />
        <el-table-column label="القسم" align="center" prop="deptId">
          <template slot-scope="scope">
            <el-tag
              v-if="!scope.row.isSummary"
              type="info"
              disable-transitions
            >
              {{ getDeptName(scope.row.deptId) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- <el-table-column label="الشيفت" align="center" prop="shiftId">
          <template slot-scope="scope">
            <el-tag
              v-if="!scope.row.isSummary"
              type="info"
              size="small"
            >
              {{ shiftMap[scope.row.shiftId] || scope.row.shiftId }}
            </el-tag>
          </template>
        </el-table-column> -->



        

        <!-- <el-table-column label="الوظيفة" align="center" prop="positionId">
          <template slot-scope="scope">
            <el-tag type="success" disable-transitions>{{ getPositionName(scope.row.positionId) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="المنطقة" align="center" prop="areaId">
          <template slot-scope="scope">
            <el-tag type="warning" disable-transitions>{{ getAreaName(scope.row.areaId) }}</el-tag>
          </template>
        </el-table-column> -->

        <!-- <el-table-column label="تاريخ التوظيف" align="center" prop="hireDate" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.hireDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="تاريخ الميلاد" align="center" prop="birthday" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="الجنس (M/F)" align="center" prop="gender" />
        <el-table-column label="رقم الهاتف" align="center" prop="phone" />
        <el-table-column label="الجنسية" align="center" prop="national" /> -->
        <el-table-column label="ايام الحضور" align="center" prop="attendanceDays" />
        <el-table-column label="ايام الغياب" align="center" prop="absenceDays" />
        <el-table-column label="نسيان بصمة الدخول" align="center" prop="forgetPunchInDays" />
        <el-table-column label="نسيان بصمة الخروج" align="center" prop="forgetPunchOutDays" />
        <el-table-column label="مجموع نسيان البصمات" align="center" prop="forgetPunchDays" />
        <el-table-column label="دقائق التاخير" align="center" prop="minLateArrival" />
        <el-table-column label="دقائق الخروج المبكر" align="center" prop="minEarlyLeft" />
        <el-table-column label="مبلغ السلف" align="center" prop="totalLoan" />
        <el-table-column label="مبلغ الخصم" align="center" prop="totalDedection" />
        <el-table-column label="مبلغ العجز" align="center" prop="totalDedectionW" />


        <el-table-column label="خصم التاخير" align="center" prop="deductionLate" />
       
        <el-table-column label="خصم الغياب" align="center" prop="deductionAbsent" />
        <el-table-column label="الاضافات" align="center" prop="totalAdditionAmount" />
        <el-table-column label="صافي الراتب" align="center" prop="salaryAfterDeduction" />


      <el-table-column
          label="الإجراءات"
          align="center"
          class-name="no-print small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-if="!scope.row.isSummary"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="goToAttendence(scope.row)"
              v-hasPermi="['api:emp:edit']"
            >
              عرض الحضور
            </el-button>
          </template>
        </el-table-column>


        


        
        <!-- <el-table-column label="العنوان" align="center" prop="address" />
        <el-table-column label="الرمز البريدي" align="center" prop="postcode" />
        <el-table-column label="البريد الإلكتروني" align="center" prop="email" /> -->
        <!-- <el-table-column label="الاجهزة المرتبطة" align="center" prop="deviceIds" /> -->
        <!-- <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        

        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:emp:edit']"
          >تعديل</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:emp:remove']"
          >حذف</el-button>
        </template>
      </el-table-column> -->

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
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="formReport" :model="formReport" :rules="rules" label-width="120px">
        <el-form-item label="وصف التقرير" prop="description">
          <el-input v-model="formReport.description" placeholder="أدخل وصف التقرير" />
        </el-form-item>
        <el-form-item label="تاريخ إنشاء التقرير" prop="createDate">
          <el-date-picker clearable
            v-model="formReport.createDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ إنشاء التقرير">
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="علامة الحذف (0: موجود، 2: محذوف)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="أدخل علامة الحذف (0: موجود، 2: محذوف)" />
        </el-form-item> -->

      </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitReportWithLines">تأكيد</el-button>
      <el-button @click="cancel">إلغاء</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import { listSalary, getEmp, delEmp, addEmp, updateEmp } from "@/api/api/emp"
import { listReport, getReport, delReport, addReport, updateReport } from "@/api/api/report"
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
      formReport: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "الاسم مطلوب", trigger: "blur" }
        ]
      }

    }
  },
  created() {
    this.getList()
    this.getDeptOptions()
    this.getPositionOptions()
    this.getAreaOptions()
    this.getShiftOptions()
    this.loadShiftData()
  },
  activated() {
    this.getList()
    this.getDeptOptions()
    this.getPositionOptions()
    this.getAreaOptions()
    this.getShiftOptions()
    this.loadShiftData()
  },
  computed: {
   printHeader() {
      const monthIndex = this.queryParams.month;
      const monthName = this.months[monthIndex - 1] || '';
      const year = this.queryParams.year || '';

      const deptId = this.queryParams.deptId;
      const dept = this.deptOptions.find(item => item.deptId === deptId);
      const deptName = dept ? dept.deptName : '';

      return `كيو | رواتب الموظفين | شهر ${monthName} ${year} | القسم ${deptName}`;
    }

  },
  methods: {
    /** 查询الموظفون列表 */
    getList() {
      this.loading = true;
      listSalary(this.queryParams).then(response => {
      const data = response.rows || [];

      // Only calculate and add summary if data is not empty
      if (data.length > 0) {
        const summary = {
          totalLoan: 0,
          totalDedection: 0,
          totalDedectionW: 0,
          deductionLate: 0,
          deductionAbsent: 0,
          totalAdditionAmount: 0,
          salaryAfterDeduction: 0,
          salary: 0, // ✅ New field
          isSummary: true
        };

        data.forEach(item => {
          summary.totalLoan += Number(item.totalLoan || 0);
          summary.totalDedection += Number(item.totalDedection || 0);
          summary.totalDedectionW += Number(item.totalDedectionW || 0);
          summary.deductionLate += Number(item.deductionLate || 0);
          summary.deductionAbsent += Number(item.deductionAbsent || 0);
          summary.totalAdditionAmount += Number(item.totalAdditionAmount || 0);
          summary.salaryAfterDeduction += Number(item.salaryAfterDeduction || 0);
          summary.salary += Number(item.salary || 0); 
        });

        for (let key in summary) {
          if (typeof summary[key] === 'number') {
            summary[key] = summary[key].toFixed(2);
          }
        }

        this.empList = [...data, summary];
      } else {
        this.empList = [];
      }

      this.total = response.total;
      this.loading = false;
  });
  },
 tableRowClass({ row }) {
    return row.isSummary ? 'summary-row' : '';
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
getSummaries(param) {
    const { columns, data } = param;
    const sums = [];

    columns.forEach((column, index) => {
      if (index === 0) {
        sums[index] = 'الإجمالي';
        return;
      }

      const prop = column.property;
      if (prop && data.length > 0) {
        const total = data.reduce((sum, row) => {
          const value = Number(row[prop]);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        sums[index] = total.toFixed(2);
      } else {
        sums[index] = '';
      }
    });

    return sums;
},
goToAttendence(row) {
  const query = new URLSearchParams({
    logs: JSON.stringify(row.dailyLogs),
    month: this.queryParams.month,
    year: this.queryParams.year
  }).toString();

  const url = `/hr/attendence/detail/list/${row.id}?${query}`;
  window.open(url, '_blank');
},
async submitReportWithLines() {
    // Step 1: Create report metadata
    const report = {
      description: this.formReport.description,
      createDate: this.formReport.createDate,
      hrReportLineList: [] // will be filled below
    };

    // Step 2: Convert empList into report lines
    report.hrReportLineList = this.empList
      .filter(emp => !emp.isSummary) // exclude summary row
      .map(emp => ({
        empId: emp.id,
        name: emp.name,
        deptId: emp.deptId,
        shiftId: emp.shiftId,
        salary: Number(emp.salary),
        attendanceDays: Number(emp.attendanceDays),
        absenceDays: Number(emp.absenceDays),
        forgetPunchInDays: Number(emp.forgetPunchInDays),
        forgetPunchOutDays: Number(emp.forgetPunchOutDays),
        forgetPunchDays: Number(emp.forgetPunchDays),
        minLateArrival: Number(emp.minLateArrival),
        minEarlyLeft: Number(emp.minEarlyLeft),
        totalLoan: Number(emp.totalLoan),
        totalDedection: Number(emp.totalDedection),
        deductionLate: Number(emp.deductionLate),
        deductionAbsent: Number(emp.deductionAbsent),
        totalAdditionAmount: Number(emp.totalAdditionAmount),
        salaryAfterDeduction: Number(emp.salaryAfterDeduction)
      }));

    // Step 3: Send to backend
    try {
      await addReport(report);
      this.$message.success("تم حفظ التقرير مع التفاصيل بنجاح");
      this.open = false;
    } catch (error) {
      this.$message.error("حدث خطأ أثناء حفظ التقرير");
      console.error(error);
    }
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
          @media print {
            .no-print {
              display: none !important;
            }
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
     handleSaveReport() {
      this.resetForm("formReport")
      this.open = true
      this.title = "إضافة التقارير المحفوظة"
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
.summary-row {
  font-weight: bold;
  background-color: #f5f7fa;
}

</style>

