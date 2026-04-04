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


      <el-form-item label="تاريخ الاستئذان" prop="requestDate">
        <el-date-picker clearable
          v-model="queryParams.requestDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر بداية الاستئذان">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="وقت بداية الاستئذان" prop="startTime">
        <el-time-picker clearable
          v-model="queryParams.startTime"
          value-format="HH:mm:ss"
          placeholder="اختر وقت بداية الاستئذان">
        </el-time-picker>
      </el-form-item>

      <el-form-item label="وقت نهاية الاستئذان" prop="endTime">
        <el-time-picker clearable
          v-model="queryParams.endTime"
          value-format="HH:mm:ss"
          placeholder="اختر وقت نهاية الاستئذان">
        </el-time-picker>
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



      <el-form-item label="نوع الاستئذان" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="اختر نوع الاستئذان"
          clearable
          @change="handleQuery"
        >
          <el-option label="خروج وعودة" value="0" />
          <el-option label="خروج مبكر" value="1" />
          <el-option label="تأخير في الحضور" value="2" />
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
    


   
    <el-table v-loading="loading" :data="requestList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="المعرف الفريد للاستئذان" align="center" prop="id" />
           <el-table-column label="اسم الموظف" align="center">
          <template slot-scope="scope">
            {{ employeeNames[scope.row.empId] || 'جاري التحميل...' }}
          </template>
      </el-table-column>
      <el-table-column label="تاريخ الاستئذان" align="center" prop="requestDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.requestDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      
      
      <el-table-column label="وقت بداية الاستئذان" align="center" prop="startTime" width="180">
         <template slot-scope="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="وقت نهاية الاستئذان" align="center" prop="endTime" width="180">
         <template slot-scope="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      
      

      <el-table-column label="نوع الاستئذان" align="center" prop="type">
        <template slot-scope="scope">
          <el-tag
            :type="getTypeTagType(scope.row.type)"
            disable-transitions
          >
            {{ getTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>




      <el-table-column label="سبب الاستئذان" align="center" prop="reason" />


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

  

  </div>
</template>

<script>
import { listRequest, getRequest, delRequest, addRequest, updateRequest } from "@/api/api/request"
import { getEmp, listEmp } from "@/api/api/emp"

export default {
  name: "Request",
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
      // الاستذان表格数据
      requestList: [],
      empNameMap: {},
      employeeName: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        empId: null,
        requestDate: null,
        startTime: null,
        endTime: null,
        reason: null,
        status: '0',
        type: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "معرّف الموظف مطلوب", trigger: "blur" }
        ],
        requestDate: [
          { required: true, message: "تاريخ الاستئذان مطلوب", trigger: "blur" }
        ],
        startTime: [
        {
          trigger: 'change',
          validator: (rule, value, callback) => {
            const type = this.form.type; // ensure same model
            // Required for type 0 or 2
            if (type == '0' || type == '2') {
              if (!value) return callback(new Error('وقت بداية الاستئذان مطلوب'));
            }
            callback();
          }
        }
      ],
      endTime: [
        {
          trigger: 'change',
          validator: (rule, value, callback) => {
            const type = this.form.type;
            // Required for type 0 or 1
            if (type == '0' || type == '1') {
              if (!value) return callback(new Error('وقت نهاية الاستئذان مطلوب'));
            }
            callback();
          }
        }
      ],
        type: [
          { required: true, message: "نوع الاستئذان مطلوب", trigger: "change" }
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
    /** 查询الاستذان列表 */
    getList() {
      this.loading = true
      listRequest(this.queryParams).then(response => {
        this.requestList = response.rows
        this.total = response.total
        this.loading = false
      })
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
    getTypeLabel(value) {
    switch (value) {
      case '0': return 'خروج وعودة';
      case '1': return 'خروج مبكر';
      case '2': return 'تأخير في الحضور';
      default: return 'غير محدد';
      }
    },
    getTypeTagType(value) {
      switch (value) {
        case '0': return 'info';     // لون أزرق فاتح
        case '1': return 'warning';  // لون أصفر
        case '2': return 'danger';   // لون أحمر
        default: return '';
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
    onTypeChange() {
      // Clear values and errors when disabling fields to avoid stale validation
      if (this.form.type === 1) {
        this.form.startTime = '';
        this.$refs.form.clearValidate(['startTime']);
      } else if (this.form.type === 2) {
        this.form.endTime = '';
        this.$refs.form.clearValidate(['endTime']);
      } else {
        this.$refs.form.clearValidate(['startTime', 'endTime']);
      }
      // Revalidate both time fields after type change
      this.$nextTick(() => {
        this.$refs.form.validateField('startTime');
        this.$refs.form.validateField('endTime');
      });
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
        requestDate: null,
        startTime: null,
        endTime: null,
        reason: null,
        delFlag: null,
        status: '0',
        type: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
      this.form.empId = this.$route.params.empId;
      this.open = true
      this.title = "اضافة استذان"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.form.empId = this.$route.params.empId; // or from selected row
      const id = row.id || this.ids
      getRequest(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل استذان"
      })
    },
    /** 提交按钮 */
    submitForm() {
  this.$refs["form"].validate(valid => {
    if (valid) {
      if (this.form.id != null) {
        updateRequest(this.form).then(response => {
          this.$modal.msgSuccess("تم التعديل بنجاح")
          this.open = false
          this.getList()
        })
      } else {
        this.form.status = '1'
        addRequest(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف الاستئذان ذو الرقم "' + ids + '" ؟').then(function() {
        return delRequest(ids)
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
            await updateRequest(updated); // reuse existing update function
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
        await updateRequest(updated);
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
        await updateRequest(updated); // reuse existing update function
        this.$message.success('تم رفض الطلب');
        this.getList(); // refresh table
      } catch (err) {
        // canceled or failed
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/request/export', {
        ...this.queryParams
      }, `request_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>



