<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
      <!-- <el-form-item label="معرف الموظف" prop="empId">
        <el-input
          v-model="queryParams.empId"
          placeholder="أدخل معرف الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->


      

      <el-form-item label="طبيعة الإجازة" prop="leaveNature">
        <el-select
          v-model="queryParams.leaveNature"
          placeholder="اختر طبيعة الإجازة"
          clearable
          @change="handleQuery"
        >
          <el-option label="بعذر" value="0" />
          <el-option label="بغير عذر" value="1" />
        </el-select>
      </el-form-item>


      <el-form-item label="هل الإجازة مدفوعة؟" prop="isPaid">
        <el-select
          v-model="queryParams.isPaid"
          placeholder="اختر حالة الدفع"
          clearable
        >
          <el-option label="غير مدفوعة" value="0" />
          <el-option label="مدفوعة" value="1" />
        </el-select>
      </el-form-item>



      <el-form-item label="نوع الإجازة" prop="leaveType">
          <el-select
            v-model="queryParams.leaveType"
            placeholder="اختر نوع الإجازة"
            clearable
          >
            <el-option label="سنوية" value="0" />
            <el-option label="مرضية" value="1" />
            <el-option label="رسمية" value="2" />
            <el-option label="خاصة" value="3" />
            <el-option label="اضطرارية" value="4" />
          </el-select>
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



      <el-form-item label="تاريخ بداية الإجازة" prop="startDate">
        <el-date-picker
          clearable
          v-model="queryParams.startDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ البداية"
        />
      </el-form-item>

      <el-form-item label="تاريخ نهاية الإجازة" prop="endDate">
        <el-date-picker
          clearable
          v-model="queryParams.endDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ النهاية"
        />
      </el-form-item>

      <!-- <el-form-item label="القسم (إذا كانت رسمية)" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="أدخل معرف القسم"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->

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
          v-hasPermi="['api:leave:add']"
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
          v-hasPermi="['api:leave:edit']"
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
          v-hasPermi="['api:leave:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:leave:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->
    


   
    <el-table v-loading="loading" :data="leaveList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="المعرف الفريد للإجازة" align="center" prop="id" />
           <el-table-column label="اسم الموظف" align="center">
          <template slot-scope="scope">
            {{ employeeNames[scope.row.empId] || 'جاري التحميل...' }}
          </template>
      </el-table-column>
      <el-table-column label="طبيعة الإجازة" align="center" prop="leaveNature">
      <template slot-scope="scope">
        <el-tag
          :type="scope.row.leaveNature === '0' ? 'success' : 'danger'"
          disable-transitions
        >
          {{ scope.row.leaveNature === '0' ? 'بعذر' : 'بغير عذر' }}
        </el-tag>
      </template>
    </el-table-column>

      <el-table-column label="نوع الإجازة" align="center" prop="leaveType">
        <template slot-scope="scope">
          <el-tag
            :type="getLeaveTypeTagType(scope.row.leaveType)"
            disable-transitions
          >
            {{ getLeaveTypeLabel(scope.row.leaveType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="هل الإجازة مدفوعة؟" align="center" prop="isPaid">
      <template slot-scope="scope">
        <el-tag
          :type="scope.row.isPaid === true || scope.row.isPaid ? 'success' : 'danger'"
          disable-transitions
        >
          {{ scope.row.isPaid === true || scope.row.isPaid ? 'مدفوعة' : 'غير مدفوعة' }}
        </el-tag>
      </template>
    </el-table-column>

      <el-table-column label="تاريخ بداية الإجازة" align="center" prop="startDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="تاريخ نهاية الإجازة" align="center" prop="endDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="مطلوب إذا كانت إجازة رسمية" align="center" prop="deptId" /> -->
      <!-- <el-table-column label="سبب الإجازة" align="center" prop="reason" /> -->
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
          <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0"
          size="mini"
          type="primary"
          icon="el-icon-check"
          @click.stop="handleApprove(scope.row)"
          v-hasPermi="['api:leave:edit']"
        >موافقة المشرف</el-button>

        <el-button
          v-if="scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="success"
          icon="el-icon-check"
          @click.stop="handleFinalApprove(scope.row)"
          v-hasPermi="['api:leave:edit']"
        >موافقة نهائية</el-button>

        <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0 || scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="danger"
          icon="el-icon-close"
          @click.stop="handleReject(scope.row)"
          v-hasPermi="['api:leave:edit']"
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

    <!-- 添加或修改طلبات الإجازات对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">

        <el-table-column label="اسم الموظف" align="center">
          <template slot-scope="scope">
            {{ employeeNames[scope.row.empId] || 'جاري التحميل...' }}
          </template>
      </el-table-column>

        <el-form-item label="طبيعة الإجازة" prop="leaveNature">
          <el-select
            v-model="form.leaveNature"
            placeholder="اختر طبيعة الإجازة"
            clearable
          >
            <el-option label="بعذر" value="0" />
            <el-option label="بغير عذر" value="1" />
          </el-select>
        </el-form-item>



        <el-form-item label="نوع الإجازة" prop="leaveType">
          <el-select
            v-model="form.leaveType"
            placeholder="اختر نوع الإجازة"
            clearable
          >
            <el-option label="سنوية" value="0" />
            <el-option label="مرضية" value="1" />
            <el-option label="رسمية" value="2" />
            <el-option label="خاصة" value="3" />
            <el-option label="اضطرارية" value="4" />
          </el-select>
        </el-form-item>



        <el-form-item label="هل الإجازة مدفوعة؟" prop="isPaid">
          <el-radio-group v-model="form.isPaid">
            <el-radio :label="1">مدفوعة</el-radio>
            <el-radio :label="0">غير مدفوعة</el-radio>
          </el-radio-group>

        </el-form-item>


        <el-form-item label="تاريخ بداية الإجازة" prop="startDate">
          <el-date-picker
            clearable
            v-model="form.startDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ البداية"
          />
        </el-form-item>

        <el-form-item label="تاريخ نهاية الإجازة" prop="endDate">
          <el-date-picker
            clearable
            v-model="form.endDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ النهاية"
          />
        </el-form-item>

        <!-- <el-form-item label="القسم (إذا كانت رسمية)" prop="deptId">
          <el-input v-model="form.deptId" placeholder="أدخل معرف القسم" />
        </el-form-item> -->

        <el-form-item label="سبب الإجازة" prop="reason">
          <el-input v-model="form.reason" type="textarea" placeholder="أدخل سبب الإجازة" />
        </el-form-item>

        <!-- <el-form-item label="علامة الحذف" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="(0) موجود، (2) محذوف" />
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
import { listLeave, getLeave, delLeave, addLeave, updateLeave } from "@/api/api/leave"
import { getEmp, listEmp } from "@/api/api/emp"

export default {
  name: "Leave",
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
      // طلبات الإجازات表格数据
      leaveList: [],
      empNameMap: {},
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        empId: null,
        leaveNature: null,
        leaveType: null,
        isPaid: null,
        startDate: null,
        endDate: null,
        deptId: null,
        reason: null,
        status: '0',
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "معرف الموظف مطلوب", trigger: "blur" }
        ],
        leaveNature: [
          { required: true, message: "طبيعة الإجازة مطلوبة (بعذر أو بغير عذر)", trigger: "blur" }
        ],
        startDate: [
          { required: true, message: "تاريخ بداية الإجازة مطلوب", trigger: "blur" }
        ],
        endDate: [
          { required: true, message: "تاريخ نهاية الإجازة مطلوب", trigger: "blur" }
        ]
      }

    }
  },
  created() {
    this.getList()
    this.preloadEmployeeNames();
  },
  activated() {
    this.getList()
    this.preloadEmployeeNames();
  },
  computed: {
  employeeNames() {
    return this.empNameMap;
  }
},
  methods: {
    /** 查询طلبات الإجازات列表 */
    getList() {
      this.loading = true
      listLeave(this.queryParams).then(response => {
        this.leaveList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getLeaveTypeLabel(value) {
      switch (value) {
        case '0': return 'سنوية';
        case '1': return 'مرضية';
        case '2': return 'رسمية';
        case '3': return 'خاصة';
        case '4': return 'اضطرارية';
        default: return 'غير محددة';
      }
    },
    getLeaveTypeTagType(value) {
      switch (value) {
        case '0': return 'success';      // سنوية
        case '1': return 'info';         // مرضية
        case '2': return 'primary';      // رسمية
        case '3': return 'danger';       // خاصة
        case '4': return 'warning';      // اضطرارية
        default: return '';
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
        leaveNature: null,
        leaveType: null,
        isPaid: 0,
        startDate: null,
        endDate: null,
        deptId: null,
        reason: null,
        status: '0',
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm("form")
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
    async preloadEmployeeNames() {
      try {
        const res = await listEmp({pageSize:9999});
        const employees = res.rows || [];
        employees.forEach(emp => {
          this.$set(this.empNameMap, emp.id, emp.name || '');
        });
      } catch (error) {
        console.error("Failed to load employee names:", error);
      }
    },
    async loadEmployeeName(empId) {
      try {
          const res = await getEmp(empId);
          this.employeeName = res.data.name || '';
        } catch (error) {
          this.employeeName = null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.form.empId = this.$route.params.empId;
      this.open = true
      this.title = "إضافة طلب الإجازة"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.form.empId = this.$route.params.empId; // or from selected row
      const id = row.id || this.ids
      getLeave(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل طلب الإجازة"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateLeave(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addLeave(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف طلبات الإجازات ذات الرقم "' + ids + '"؟').then(function() {
        return delLeave(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})

    },

    async handleApprove(row) {
          try {
            await this.$confirm('هل أنت متأكد من قبول هذا الطلب؟', 'تأكيد', {
              confirmButtonText: 'نعم',
              cancelButtonText: 'لا',
              type: 'warning'
            });

            const updated = { ...row, status: '1' }; // 1 = Supervisor Approved
            await updateLeave(updated); // reuse existing update function
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
        await updateLeave(updated);
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
        await updateLeave(updated); // reuse existing update function
        this.$message.success('تم رفض الطلب');
        this.getList(); // refresh table
      } catch (err) {
        // canceled or failed
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/leave/export', {
        ...this.queryParams
      }, `leave_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
