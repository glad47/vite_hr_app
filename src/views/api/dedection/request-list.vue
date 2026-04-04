<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px" >
      


      <el-form-item label="معرف الموظف" prop="empId">
        <el-input
          v-model="queryParams.empId"
          placeholder="أدخل معرف الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>



      <el-form-item label="سنة الاستحقاق" prop="dueYear">
        <el-select
          v-model="queryParams.dueYear"
          placeholder="اختر سنة الاستحقاق"
          clearable
          @change="handleQuery"
        >
          <el-option label="2025" value="2025" />
          <el-option label="2026" value="2026" />
          <el-option label="2027" value="2027" />
        </el-select>
      </el-form-item>


      <el-form-item label="شهر الاستحقاق" prop="dueMonth">
        <el-select
          v-model="queryParams.dueMonth"
          placeholder="اختر شهر الاستحقاق"
          clearable
          @change="handleQuery"
        >
          <el-option label="يناير" value="1" />
          <el-option label="فبراير" value="2" />
          <el-option label="مارس" value="3" />
          <el-option label="أبريل" value="4" />
          <el-option label="مايو" value="5" />
          <el-option label="يونيو" value="6" />
          <el-option label="يوليو" value="7" />
          <el-option label="أغسطس" value="8" />
          <el-option label="سبتمبر" value="9" />
          <el-option label="أكتوبر" value="10" />
          <el-option label="نوفمبر" value="11" />
          <el-option label="ديسمبر" value="12" />
        </el-select>
    </el-form-item>




      <el-form-item label="مبلغ الخصم" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="أدخل مبلغ الخصم"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="اسم المشرف" prop="supervisorName">
        <el-input
          v-model="queryParams.supervisorName"
          placeholder="أدخل اسم المشرف"
          clearable
          @keyup.enter.native="handleQuery"
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


    <!-- <el-row :gutter="10" class="mb8" >
    <el-col :span="1.5">
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        size="mini"
        @click="handleAdd"
        v-hasPermi="['api:dedection:add']"
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
        v-hasPermi="['api:dedection:edit']"
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
        v-hasPermi="['api:dedection:remove']"
      >حذف</el-button>
    </el-col>

    <el-col :span="1.5">
      <el-button
        type="warning"
        plain
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
        v-hasPermi="['api:dedection:export']"
      >تصدير</el-button>
    </el-col>

    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>

    <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">
          بيانات الخصومات الخاصة بالموظف: {{ employeeName || 'جارٍ التحميل...' }}
    </div> -->


    
    <el-table v-loading="loading" :data="dedectionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="معرف الخصم" align="center" prop="id" />

     <el-table-column label="اسم الموظف" align="center">
          <template slot-scope="scope">
            {{ employeeNames[scope.row.empId] || 'جاري التحميل...' }}
          </template>
      </el-table-column>

      <el-table-column label="سنة الاستحقاق" align="center" prop="dueYear" />
      <el-table-column label="شهر الاستحقاق" align="center" prop="dueMonth">
          <template slot-scope="scope">
            <el-tag type="info">
              {{
                scope.row.dueMonth === 1 ? 'يناير' :
                scope.row.dueMonth === 2 ? 'فبراير' :
                scope.row.dueMonth === 3 ? 'مارس' :
                scope.row.dueMonth === 4 ? 'أبريل' :
                scope.row.dueMonth === 5 ? 'مايو' :
                scope.row.dueMonth === 6 ? 'يونيو' :
                scope.row.dueMonth === 7 ? 'يوليو' :
                scope.row.dueMonth === 8 ? 'أغسطس' :
                scope.row.dueMonth === 9 ? 'سبتمبر' :
                scope.row.dueMonth === 10 ? 'أكتوبر' :
                scope.row.dueMonth === 11 ? 'نوفمبر' :
                scope.row.dueMonth === 12 ? 'ديسمبر' :
                'غير معروف'
              }}
            </el-tag>
          </template>
        </el-table-column>
      <el-table-column label="مبلغ الخصم" align="center" prop="amount" />
      <el-table-column label="حالة الخصم" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag
            :type="getStatusTagType(scope.row.status)"
            disable-transitions
          >
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="اسم المشرف" align="center" prop="supervisorName" />
      <el-table-column label="ملاحظة" align="center" prop="note" />
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:dedection:edit']"
          >تعديل</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:dedection:remove']"
          >حذف</el-button> -->


          <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0"
          size="mini"
          type="primary"
          icon="el-icon-check"
          @click.stop="handleApprove(scope.row)"
          v-hasPermi="['api:dedection:edit']"
        >موافقة المشرف</el-button>

        <el-button
          v-if="scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="success"
          icon="el-icon-check"
          @click.stop="handleFinalApprove(scope.row)"
          v-hasPermi="['api:dedection:edit']"
        >موافقة نهائية</el-button>

        <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0 || scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="danger"
          icon="el-icon-close"
          @click.stop="handleReject(scope.row)"
          v-hasPermi="['api:dedection:edit']"
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

    <!-- 添加或修改الخصومات对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="معرف الموظف" prop="empId" style="display: none;">
          <el-input v-model="form.empId" placeholder="أدخل معرف الموظف"  type="hidden" />
        </el-form-item>

        <el-form-item label="سنة الاستحقاق" prop="dueYear">
          <el-select
            v-model="form.dueYear"
            placeholder="اختر سنة الاستحقاق"
            clearable
          >
            <el-option label="2025" value="2025" />
            <el-option label="2026" value="2026" />
            <el-option label="2027" value="2027" />
          </el-select>
        </el-form-item>


        <el-form-item label="شهر الاستحقاق" prop="dueMonth">
          <el-select
            v-model="form.dueMonth"
            placeholder="اختر شهر الاستحقاق"
            clearable
          >
            <el-option label="يناير" value="1" />
            <el-option label="فبراير" value="2" />
            <el-option label="مارس" value="3" />
            <el-option label="أبريل" value="4" />
            <el-option label="مايو" value="5" />
            <el-option label="يونيو" value="6" />
            <el-option label="يوليو" value="7" />
            <el-option label="أغسطس" value="8" />
            <el-option label="سبتمبر" value="9" />
            <el-option label="أكتوبر" value="10" />
            <el-option label="نوفمبر" value="11" />
            <el-option label="ديسمبر" value="12" />
          </el-select>
        </el-form-item>

        <el-form-item label="مبلغ الخصم" prop="amount">
          <el-input v-model="form.amount" placeholder="أدخل مبلغ الخصم" />
        </el-form-item>

        <el-form-item label="اسم المشرف" prop="supervisorName">
          <el-input v-model="form.supervisorName" placeholder="أدخل اسم المشرف" />
        </el-form-item>

        <el-form-item label="ملاحظة" prop="note">
          <el-input v-model="form.note" type="textarea" placeholder="أدخل الملاحظة" />
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
import { listDedection, getDedection, delDedection, addDedection, updateDedection } from "@/api/api/dedection"
import { getEmp, listEmp  } from "@/api/api/emp"
export default {
  name: "Dedection",
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
      // الخصومات表格数据
      dedectionList: [],
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
        dueYear: null,
        dueMonth: null,
        amount: null,
        status: '0',
        supervisorName: null,
        note: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "معرف الموظف مطلوب", trigger: "blur" }
        ],
        dueYear: [
          { required: true, message: "سنة الاستحقاق مطلوبة", trigger: "blur" }
        ],
        dueMonth: [
          { required: true, message: "شهر الاستحقاق مطلوب", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "مبلغ الخصم مطلوب", trigger: "blur" }
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
    /** 查询الخصومات列表 */
    getList() {
      this.loading = true
      listDedection(this.queryParams).then(response => {
        this.dedectionList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
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
    async loadEmployeeName(empId) {
      try {
          const res = await getEmp(empId);
          this.employeeName = res.data.name || '';
        } catch (error) {
          this.employeeName = null
      }
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        empId: null,
        dueYear: null,
        dueMonth: null,
        amount: null,
        status: '0',
        supervisorName: null,
        note: null,
        delFlag: null,
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
      this.open = true
      this.title = "اضافة خصم"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getDedection(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل الخصم"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDedection(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح");
              this.open = false
              this.getList()
            })
          } else {
            addDedection(this.form).then(response => {
              this.$modal.msgSuccess("تمت الإضافة بنجاح");
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('هل أنت متأكد من حذف بيانات الخصم بالرقم "' + ids + '"؟').then(function() {
        return delDedection(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("تم الحذف بنجاح");
      }).catch(() => {});
    },
    async handleApprove(row) {
      try {
          await this.$confirm('هل أنت متأكد من قبول هذا الطلب؟', 'تأكيد', {
            confirmButtonText: 'نعم',
            cancelButtonText: 'لا',
            type: 'warning'
          });

          const updated = { ...row, status: '1' }; // 1 = Supervisor Approved
          await updateDedection(updated); // reuse existing update function
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
        await updateDedection(updated);
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
        await updateDedection(updated); // reuse existing update function
        this.$message.success('تم رفض الطلب');
        this.getList(); // refresh table
      } catch (err) {
        // canceled or failed
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/dedection/export', {
        ...this.queryParams
      }, `dedection_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
