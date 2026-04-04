<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <!-- <el-form-item label="معرف السلفة" prop="advanceId">
        <el-input
          v-model="queryParams.advanceId"
          placeholder="أدخل معرف السلفة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->

      <!-- <el-form-item label="معرف الموظف" prop="empId">
        <el-input
          v-model="queryParams.empId"
          placeholder="أدخل معرف الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->

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


      <el-form-item label="مبلغ القسط" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="أدخل مبلغ القسط"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>


      <el-form-item label="حالة القسط" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="اختر حالة القسط"
          clearable
          @change="handleQuery"
        >
          <el-option label="غير مدفوع" value="0" />
          <el-option label="مدفوع" value="1" />
          <el-option label="مؤجل" value="2" />
        </el-select>
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
          v-hasPermi="['api:installment:add']"
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
          v-hasPermi="['api:installment:edit']"
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
          v-hasPermi="['api:installment:remove']"
        >حذف</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:installment:export']"
        >تصدير</el-button>
      </el-col>

      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <!-- Employee Name Header -->
    <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">
      بيانات الأقساط الخاصة بالموظف: {{ employeeName || 'جارٍ التحميل...' }}
    </div>

    <el-table v-loading="loading" :data="installmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      
      <el-table-column label="المعرف الفريد للقسط" align="center" prop="id" />
      <el-table-column label="معرف السلفة" align="center" prop="advanceId" />
      <el-table-column label="اسم الموظف" align="center">
        <template slot-scope="scope">
          {{ employeeName }}
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

      <el-table-column label="مبلغ القسط" align="center" prop="amount" />

      <el-table-column label="حالة القسط" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="danger">غير مدفوع</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="success">مدفوع</el-tag>
          <el-tag v-else-if="scope.row.status === '2'" type="warning">مؤجل</el-tag>
          <el-tag v-else type="info">غير معروف</el-tag>
        </template>
      </el-table-column>


      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click.stop="handleUpdate(scope.row)"
            v-hasPermi="['api:installment:edit']"
          >تعديل</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click.stop="handleUpdate(scope.row)"
            v-hasPermi="['api:installment:edit']"
          >تاجيل</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click.stop="handleDelete(scope.row)"
            v-hasPermi="['api:installment:remove']"
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

    <!-- 添加或修改أقساط السلف المالية对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="معرف السلفة" prop="advanceId" style="display: none;">
          <el-input v-model="form.advanceId" placeholder="أدخل معرف السلفة" type="hidden" />
        </el-form-item>

        <el-form-item label="معرف الموظف" prop="empId" style="display: none;">
          <el-input v-model="form.empId" placeholder="أدخل معرف الموظف" type="hidden" />
        </el-form-item>


        <el-form-item label="سنة الاستحقاق" prop="dueYear">
          <el-input v-model="form.dueYear" placeholder="أدخل سنة الاستحقاق"/>
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


        <el-form-item label="مبلغ القسط" prop="amount">
          <el-input v-model="form.amount" placeholder="أدخل مبلغ القسط" />
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
import { listInstallment, getInstallment, delInstallment, addInstallment, updateInstallment } from "@/api/api/installment"
import { getEmp } from "@/api/api/emp"
export default {
  name: "Installment",
  data() {
    return {
      // 遮罩层
      loading: true,
      employeeName: null,
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
      // أقساط السلف المالية表格数据
      installmentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        advanceId: null,
        empId: null,
        dueYear: null,
        dueMonth: null,
        amount: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        advanceId: [
          { required: true, message: "معرف السلفة مطلوب", trigger: "blur" }
        ],
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
          { required: true, message: "مبلغ القسط مطلوب", trigger: "blur" }
        ]
      }

    }
  },
  created() {
    this.getList()


    this.form.empId = this.$route.params.empId;
    this.loadEmployeeName(this.$route.params.empId);
    this.form.advanceId = this.$route.params.advanceId;
  },
  activated() {
    this.getList()
    this.form.empId = this.$route.params.empId;
    this.loadEmployeeName(this.$route.params.empId);
    this.form.advanceId = this.$route.params.advanceId;
  },
  methods: {
    /** 查询أقساط السلف المالية列表 */
    getList() {
      this.queryParams.empId = this.$route.params.empId;
      this.queryParams.advanceId =this.$route.params.advanceId;
      this.loading = true
      listInstallment(this.queryParams).then(response => {
        this.installmentList = response.rows
        this.total = response.total
        this.loading = false
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
        advanceId: null,
        empId: null,
        dueYear: null,
        dueMonth: null,
        amount: null,
        status: null,
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
      this.form.empId = this.$route.params.empId;
      this.form.advanceId = this.$route.params.advanceId;
      this.open = true
      this.title = "إضافة أقساط السلف المالية"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.form.empId = this.$route.params.empId;
      this.form.advanceId = this.$route.params.advanceId;
      const id = row.id || this.ids
      getInstallment(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل أقساط السلف المالية"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateInstallment(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addInstallment(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$modal.confirm('هل أنت متأكد من حذف قسط السلفة المالية رقم "' + ids + '"؟').then(function() {
        return delInstallment(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("تم الحذف بنجاح");
      }).catch(() => {});
    },
    async handlePostpone(row) {
      try {
        await this.$confirm('هل أنت متأكد من تاجيل هذا القسط؟', 'تأكيد', {
          confirmButtonText: 'نعم',
          cancelButtonText: 'لا',
          type: 'warning'
        });

        const updated = { ...row, status: 1 }; // 1 = Approved
        await updateInstallment(updated); // reuse existing update function
        this.$message.success('تم قبول الطلب بنجاح');
        this.getList(); // refresh table
      } catch (err) {
        // canceled or failed
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/installment/export', {
        ...this.queryParams
      }, `installment_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
