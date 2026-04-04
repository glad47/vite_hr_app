<template>



  <div class="app-container">

    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">

      <!-- <el-form-item label="معرّف الموظف" prop="empId">

        <el-input

          v-model="queryParams.empId"

          placeholder="أدخل معرّف الموظف"

          clearable

          @keyup.enter.native="handleQuery"

        />

      </el-form-item> -->

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

      <el-form-item label="وقت بداية الشيفت" prop="startTime">

        <el-date-picker

          clearable

          v-model="queryParams.startTime"

          type="date"

          value-format="yyyy-MM-dd"

          placeholder="اختر وقت بداية الشيفت"

        />

      </el-form-item>

      <el-form-item label="وقت نهاية الشيفت" prop="endTime">

        <el-date-picker

          clearable

          v-model="queryParams.endTime"

          type="date"

          value-format="yyyy-MM-dd"

          placeholder="اختر وقت نهاية الشيفت"

        />

      </el-form-item>

      <el-form-item label="حالة الطلب" prop="status">

          <el-select

            v-model="queryParams.status"

            placeholder="اختر حالة الطلب"

            clearable

            @change="handleQuery"

          >

            <el-option label="قيد الانتظار" value="0" />

            <el-option label="موافق من المشرف" value="1" />

            <el-option label="مرفوض من المشرف" value="2" />
          <el-option label="موافق نهائياً" value="3" />
          <el-option label="مرفوض من HR" value="4" />

          </el-select>

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

          v-hasPermi="['api:punch:add']"

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

          v-hasPermi="['api:punch:edit']"

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

          v-hasPermi="['api:punch:remove']"

        >حذف</el-button>

      </el-col>

      <el-col :span="1.5">

        <el-button

          type="warning"

          plain

          icon="el-icon-download"

          size="mini"

          @click="handleExport"

          v-hasPermi="['api:punch:export']"

        >تصدير</el-button>

      </el-col>

      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>

    </el-row>

     -->

    <!-- <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">

      بيانات تغيير البصمة الخاصة بالموظف: {{ employeeName || 'جارٍ التحميل...' }}

    </div> -->

    <el-table v-loading="loading" :data="punchList" @selection-change="handleSelectionChange">

      <el-table-column type="selection" width="55" align="center" />

      

      <el-table-column label="معرّف التغيير البصمة" align="center" prop="id" />

      <el-table-column label="اسم الموظف" align="center">

          <template slot-scope="scope">

            {{ employeeNames[scope.row.empId] || 'جاري التحميل...' }}

          </template>

      </el-table-column>

      <el-table-column label="قالب الشيفت" align="center" prop="shiftId">

        <template slot-scope="scope">

          <el-tag type="info" size="small">

            {{ shiftMap[scope.row.shiftId] || scope.row.shiftId }}

          </el-tag>

        </template>

      </el-table-column>

      

      <el-table-column label="وقت بداية الشيفت" align="center" prop="startTime" width="180">

        <template slot-scope="scope">

          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>

        </template>

      </el-table-column>

      

      <el-table-column label="وقت نهاية الشيفت" align="center" prop="endTime" width="180">

        <template slot-scope="scope">

          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>

        </template>

      </el-table-column>

      

      <el-table-column label="سبب التغيير" align="center" prop="reason" />

      <el-table-column label="حالة الطلب" align="center" prop="status">

        <template slot-scope="scope">

          <el-tag

            :type="getStatusTagType(scope.row.status)"

            disable-transitions

          >

            {{ getStatusLabel(scope.row.status) }}

          </el-tag>

        </template>

      </el-table-column>

      

      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">

        <template slot-scope="scope">

          <!-- <el-button

            size="mini"

            type="text"

            icon="el-icon-edit"

            @click="handleUpdate(scope.row)"

            v-hasPermi="['api:punch:edit']"

          >تعديل</el-button>

          

          <el-button

            size="mini"

            type="text"

            icon="el-icon-delete"

            @click="handleDelete(scope.row)"

            v-hasPermi="['api:punch:remove']"

          >حذف</el-button> -->

          <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0"
          size="mini"
          type="primary"
          icon="el-icon-check"
          @click.stop="handleApprove(scope.row)"
          v-hasPermi="['api:punch:edit']"
        >موافقة المشرف</el-button>

        <el-button
          v-if="scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="success"
          icon="el-icon-check"
          @click.stop="handleFinalApprove(scope.row)"
          v-hasPermi="['api:punch:edit']"
        >موافقة نهائية</el-button>

        <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0 || scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="danger"
          icon="el-icon-close"
          @click.stop="handleReject(scope.row)"
          v-hasPermi="['api:punch:edit']"
        >رفض</el-button>

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

    <!-- 添加或修改تغيير البصمة对话框 -->

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>

      <el-form ref="form" :model="form" :rules="rules" label-width="120px">

        <el-form-item label="معرّف الموظف" prop="empId">

          <el-input v-model="form.empId" placeholder="أدخل معرّف الموظف" />

        </el-form-item>

        <el-form-item label="الشيفت" prop="shiftId">

            <el-select

              v-model="form.shiftId"

              placeholder="اختر الشيفت"

              clearable

              filterable

            >

              <el-option

                v-for="shift in shiftOptions"

                :key="shift.id"

                :label="shift.name"

                :value="shift.id"

              />

            </el-select>

          </el-form-item>

        <el-form-item label="وقت بداية الشيفت" prop="startTime">

          <el-date-picker

            clearable

            v-model="form.startTime"

            type="date"

            value-format="yyyy-MM-dd"

            placeholder="اختر وقت بداية الشيفت"

          />

        </el-form-item>

        <el-form-item label="وقت نهاية الشيفت" prop="endTime">

          <el-date-picker

            clearable

            v-model="form.endTime"

            type="date"

            value-format="yyyy-MM-dd"

            placeholder="اختر وقت نهاية الشيفت"

          />

        </el-form-item>

        <el-form-item label="سبب التغيير" prop="reason">

          <el-input v-model="form.reason" type="textarea" placeholder="أدخل السبب إن وجد" />

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

import { listPunch, getPunch, delPunch, addPunch, updatePunch } from "@/api/api/punch"

import { listShift} from "@/api/api/shift"

import { getEmp } from "@/api/api/emp"

export default {

  name: "Punch",

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

      // تغيير البصمة表格数据

      punchList: [],

      // 弹出层标题

      title: "",

      // 是否显示弹出层

      open: false,

      // 查询参数

      queryParams: {

        pageNum: 1,

        pageSize: 10,

        empId: null,

        shiftId: null,

        startTime: null,

        endTime: null,

        reason: null,

        status: '0',

      },

      shiftOptions: [],

      shiftMap: {},

      // Initialize empNameMap as an empty object

      empNameMap: {},

      // 表单参数

      form: {},

      // 表单校验

      rules: {

        empId: [

          { required: true, message: "معرّف الموظف مطلوب", trigger: "blur" }

        ],

        shiftId: [

          { required: true, message: "معرّف قالب الشيفت مطلوب", trigger: "blur" }

        ],

        startTime: [

          { required: true, message: "وقت بداية الشيفت مطلوب", trigger: "blur" }

        ],

        endTime: [

          { required: true, message: "وقت نهاية الشيفت مطلوب", trigger: "blur" }

        ]

      }

    }

  },

  created() {

    this.getList()

    this.getShiftOptions()

    // this.form.empId = this.$route.params.empId;

    // this.loadEmployeeName(this.$route.params.empId);

  },

  activated() {

    this.getList()

    this.getShiftOptions()

  },

  computed: {

    employeeNames() {

      return this.empNameMap;

    },

  },

  methods: {

    /** 查询تغيير البصمة列表 */

    getList() {

      // this.queryParams.empId = this.$route.params.empId

      this.loading = true

      listPunch(this.queryParams).then(response => {

        this.punchList = response.rows

        this.total = response.total

        this.loading = false

        // Load employee names after getting the punch list

        this.loadEmployeeNames()

      })

    },

    /** Load employee names for all unique employee IDs in the punch list */

    async loadEmployeeNames() {

      // Get unique employee IDs from punch list

      const empIds = [...new Set(this.punchList.map(item => item.empId).filter(id => id != null))]

      

      // Load each employee name

      const promises = empIds.map(async (empId) => {

        // Skip if already loaded

        if (this.empNameMap[empId]) {

          return

        }

        try {

          const res = await getEmp(empId)

          this.$set(this.empNameMap, empId, res.data.name || `موظف ${empId}`)

        } catch (error) {

          this.$set(this.empNameMap, empId, `موظف ${empId}`)

        }

      })

      

      await Promise.all(promises)

    },

    getStatusLabel(value) {
      switch (String(value)) {
        case '0': return 'قيد الانتظار';
        case '1': return 'موافق من المشرف';
        case '2': return 'مرفوض من المشرف';
        case '3': return 'موافق نهائياً';
        case '4': return 'مرفوض من HR';
        default: return 'غير محددة';

      }

    },

    getStatusTagType(value) {
      switch (String(value)) {
        case '0': return 'warning';
        case '1': return '';
        case '2': return 'danger';
        case '3': return 'success';
        case '4': return 'danger';
        default: return 'info';

      }

    },

    getShiftOptions() {

      listShift({pageSize: 9999}).then(response => {

        this.shiftOptions = response.rows

        this.shiftMap = Object.fromEntries(

          response.rows.map(shift => [shift.id, shift.name])

        )

      })

    },

    async loadEmployeeName(empId) {

      try {

          const res = await getEmp(empId);

          this.employeeName = res.data.name || '';

        } catch (error) {

          this.employeeName = null

      }

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

        shiftId: null,

        startTime: null,

        endTime: null,

        reason: null,

        delFlag: null,

        createBy: null,

        createTime: null,

        updateBy: null,

        updateTime: null,

        status: '0',

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

      // this.form.empId = this.$route.params.empId;

      this.open = true

      this.title = "إضافة تغيير البصمة"

    },

    /** عملية زر التعديل */

    handleUpdate(row) {

      this.reset()

      // this.form.empId = this.$route.params.empId;

      const id = row.id || this.ids

      getPunch(id).then(response => {

        this.form = response.data

        this.open = true

        this.title = "تعديل تغيير البصمة"

      })

    },

    /** 提交按钮 */

    submitForm() {

      this.$refs["form"].validate(valid => {

        if (valid) {

          if (this.form.id != null) {

            updatePunch(this.form).then(response => {

              this.$modal.msgSuccess("تم التعديل بنجاح")

              this.open = false

              this.getList()

            })

          } else {

            addPunch(this.form).then(response => {

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

      this.$modal.confirm('هل أنت متأكد من حذف تغيير البصمة ذو المعرف "' + ids + '"؟').then(function() {

        return delPunch(ids)

      }).then(() => {

        this.getList()

        this.$modal.msgSuccess("تم الحذف بنجاح")

      }).catch(() => {})

    },

    /** عملية زر التصدير */

    handleExport() {

      this.download('api/punch/export', {

        ...this.queryParams

      }, `punch_${new Date().getTime()}.xlsx`)

    },

    async handleApprove(row) {

          try {

            await this.$confirm('هل أنت متأكد من قبول هذا الطلب؟', 'تأكيد', {

              confirmButtonText: 'نعم',

              cancelButtonText: 'لا',

              type: 'warning'

            });

            const updated = { ...row, status: '1' }; // 1 = Supervisor Approved

            await updatePunch(updated); // reuse existing update function

            this.$message.success('تم قبول الطلب بنجاح');

            this.getList(); // refresh table

          } catch (err) {

            // canceled or failed

          }

    },

    
    async handleFinalApprove(row) {
      try {
        await this.$confirm('هل أنت متأكد من الموافقة النهائية على هذا الطلب؟', 'تأكيد', {
          confirmButtonText: 'نعم',
          cancelButtonText: 'لا',
          type: 'warning'
        });
        const updated = { ...row, status: '3' }; // 3 = Final Approved
        await updatePunch(updated);
        this.$message.success('تمت الموافقة النهائية');
        this.getList();
      } catch (err) {
      }
    },

    async handleReject(row) {

      try {

        await this.$confirm('هل أنت متأكد من رفض هذا الطلب؟', 'تأكيد', {

          confirmButtonText: 'نعم',

          cancelButtonText: 'لا',

          type: 'warning'

        });

        const newStatus = (String(row.status) === '1') ? '4' : '2';
        const updated = { ...row, status: newStatus }; // 2 = Rejected by Supervisor, 4 = Rejected by HR

        await updatePunch(updated); // reuse existing update function

        this.$message.success('تم رفض الطلب');

        this.getList(); // refresh table

      } catch (err) {

        // canceled or failed

      }

    },

  }

}

</script>

