<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
      <el-form-item label="معرف الموظف" prop="empId">
        <el-input
          v-model="queryParams.empId"
          placeholder="أدخل معرف الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="تاريخ تقديم الطلب" prop="requestDate">
        <el-date-picker
          clearable
          v-model="queryParams.requestDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ تقديم الطلب">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="المبلغ المطلوب" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="أدخل المبلغ المطلوب"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="عدد الأشهر للتقسيط" prop="months">
        <el-input
          v-model="queryParams.months"
          placeholder="أدخل عدد الأشهر للتقسيط"
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


    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['api:advance:add']"
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
          v-hasPermi="['api:advance:edit']"
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
          v-hasPermi="['api:advance:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:advance:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>



    <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">
      بيانات السلف الخاصة بالموظف: {{ employeeName || 'جارٍ التحميل...' }}
    </div>


    <el-table v-loading="loading" :data="advanceList" @selection-change="handleSelectionChange" @row-click="goToInstallment">
      <el-table-column type="selection" width="55" align="center" />
      
      <el-table-column label="المعرف الفريد للسلفة" align="center" prop="id" />
       <el-table-column label="اسم الموظف" align="center">
        <template slot-scope="scope">
          {{ employeeName }}
        </template>
      </el-table-column>
      
      <el-table-column label="تاريخ تقديم الطلب" align="center" prop="requestDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.requestDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="المبلغ المطلوب" align="center" prop="amount" />
      <el-table-column label="عدد الأشهر للتقسيط" align="center" prop="months" />
      <el-table-column label="سبب الطلب" align="center" prop="reason" />
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
          size="mini"
          type="text"
          icon="el-icon-edit"
          @click.stop="handleUpdate(scope.row)"
          v-hasPermi="['api:advance:edit']"
        >تعديل</el-button>

        <el-button
          size="mini"
          type="text"
          icon="el-icon-delete"
          @click.stop="handleDelete(scope.row)"
          v-hasPermi="['api:advance:remove']"
        >حذف</el-button>

        <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0"
          size="mini"
          type="primary"
          icon="el-icon-check"
          @click.stop="handleApprove(scope.row)"
          v-hasPermi="['api:advance:edit']"
        >موافقة المشرف</el-button>

        <el-button
          v-if="scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="success"
          icon="el-icon-check"
          @click.stop="handleFinalApprove(scope.row)"
          v-hasPermi="['api:advance:edit']"
        >موافقة نهائية</el-button>

        <el-button
          v-if="scope.row.status == '0' || scope.row.status == 0 || scope.row.status == '1' || scope.row.status == 1"
          size="mini"
          type="danger"
          icon="el-icon-close"
          @click.stop="handleReject(scope.row)"
          v-hasPermi="['api:advance:edit']"
        >رفض</el-button>

        <el-button
          size="mini"
          type="warning"
          icon="el-icon-printer"
          @click.stop="handlePrint(scope.row)"
        >طباعة</el-button>
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

    <!-- 添加或修改طلبات السلف المالية对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item prop="empId" style="display: none;">
          <el-input v-model="form.empId" type="hidden" />
        </el-form-item>


        <el-form-item label="تاريخ تقديم الطلب" prop="requestDate">
          <el-date-picker
            clearable
            v-model="form.requestDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ تقديم الطلب">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="المبلغ المطلوب" prop="amount">
          <el-input v-model="form.amount" placeholder="أدخل المبلغ المطلوب" />
        </el-form-item>

        <el-form-item label="عدد الأشهر للتقسيط" prop="months">
          <el-input v-model="form.months" placeholder="أدخل عدد الأشهر للتقسيط" />
        </el-form-item>

        <el-form-item label="سبب الطلب" prop="reason">
          <el-input v-model="form.reason" type="textarea" placeholder="أدخل سبب الطلب" />
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
import { listAdvance, getAdvance, delAdvance, addAdvance, updateAdvance } from "@/api/api/advance"
import { listInstallment } from "@/api/api/installment"
import { getEmp } from "@/api/api/emp"
import queLogo from "@/assets/images/que-logo.png"


export default {
  name: "Advance",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      employeeName: null,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // طلبات السلف المالية表格数据
      advanceList: [],
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
        amount: null,
        months: null,
        reason: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "معرف الموظف مطلوب", trigger: "blur" }
        ],
        requestDate: [
          { required: true, message: "تاريخ تقديم الطلب مطلوب", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "المبلغ المطلوب مطلوب", trigger: "blur" }
        ],
        months: [
          { required: true, message: "عدد الأشهر للتقسيط مطلوب", trigger: "blur" }
        ]
      }

    }
  },
  created() {
    this.getList()
    this.form.empId = this.$route.params.empId;
    this.loadEmployeeName(this.$route.params.empId);
  },
  activated() {
    this.getList()
    this.form.empId = this.$route.params.empId;
    this.loadEmployeeName(this.$route.params.empId);
  },
  methods: {
    /** 查询طلبات السلف المالية列表 */
    getList() {
      this.queryParams.empId = this.$route.params.empId
      this.loading = true
      listAdvance(this.queryParams).then(response => {
        this.advanceList = response.rows
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
        requestDate: null,
        amount: null,
        months: null,
        reason: null,
        status: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm("form")
    },
    async loadEmployeeName(empId) {
      try {
          const res = await getEmp(empId);
          this.employeeName = res.data.name || '';
        } catch (error) {
          this.employeeName = null
      }
    },
    goToInstallment(row) {
       if (row.status == '1') {
        this.$router.push({ path: "/hr/advance/installment/list/" + row.empId + "/" + row.id});
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
      this.title = "اضافة سلفة"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.form.empId = this.$route.params.empId; // or from selected row
      const id = row.id || this.ids
      getAdvance(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل سلفة"
      })
    },
    /** 提交按钮 */
    submitForm() {
      
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAdvance(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            this.form.status = "1"
            addAdvance(this.form).then(response => {
              this.$modal.msgSuccess("تمت الإضافة بنجاح")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    getStatusTagType(status) {
    switch (status) {
      case '0':
      case 0:
        return 'info';    // Blue
      case '1':
      case 1:
        return 'success'; // Green
      case '2':
      case 2:
        return 'danger';  // Red
      default:
        return 'warning'; // Fallback
    }
  },
  getStatusLabel(status) {
    switch (status) {
      case '0':
      case 0:
        return 'قيد الانتظار';
      case '1':
      case 1:
        return 'موافق عليه';
      case '2':
      case 2:
        return 'مرفوض';
      default:
        return 'غير معروف';
    }
  },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('هل أنت متأكد من حذف طلب السلفة المالية رقم "' + ids + '"؟').then(function() {
        return delAdvance(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("تم الحذف بنجاح");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/advance/export', {
        ...this.queryParams
      }, `advance_${new Date().getTime()}.xlsx`)
    },
    async handleApprove(row) {
      try {
        await this.$confirm('هل أنت متأكد من قبول هذا الطلب؟', 'تأكيد', {
          confirmButtonText: 'نعم',
          cancelButtonText: 'لا',
          type: 'warning'
        });

        const updated = { ...row, status: '1' }; // 1 = Supervisor Approved
        await updateAdvance(updated); // reuse existing update function
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
        await updateAdvance(updated);
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
    await updateAdvance(updated); // reuse existing update function
    this.$message.success('تم رفض الطلب');
    this.getList(); // refresh table
  } catch (err) {
    // canceled or failed
  }
},

async handlePrint(row) {
  try {
    // Fetch employee details
    const empRes = await getEmp(row.empId);
    const emp = empRes.data;

    // Fetch installments for this advance
    const instRes = await listInstallment({ advanceId: row.id, empId: row.empId, pageSize: 999 });
    const installments = instRes.rows || [];

    // Month names in Arabic
    const monthNames = {
      1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
      5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
      9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
    };

    // Status labels
    const statusLabel = (s) => {
      if (s === '0' || s === 0) return 'غير مدفوع';
      if (s === '1' || s === 1) return 'مدفوع';
      if (s === '2' || s === 2) return 'مؤجل';
      return 'غير معروف';
    };

    const statusColor = (s) => {
      if (s === '0' || s === 0) return '#e74c3c';
      if (s === '1' || s === 1) return '#27ae60';
      if (s === '2' || s === 2) return '#f39c12';
      return '#95a5a6';
    };

    // Advance status
    const advStatusLabel = (s) => {
      if (s === '0' || s === 0) return 'قيد الانتظار';
      if (s === '1' || s === 1) return 'موافق عليه';
      if (s === '2' || s === 2) return 'مرفوض';
      return 'غير معروف';
    };

    const today = new Date();
    const dateStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');

    // Build installment rows
    let installmentRows = '';
    let totalPaid = 0;
    let totalRemaining = 0;
    installments.forEach((inst, idx) => {
      const isPaid = inst.status === '1' || inst.status === 1;
      if (isPaid) totalPaid += parseFloat(inst.amount || 0);
      else totalRemaining += parseFloat(inst.amount || 0);

      installmentRows += `
        <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafe'};">
          <td style="padding: 10px 14px; border-bottom: 1px solid #e8ecf1; text-align: center; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e8ecf1; text-align: center; font-size: 13px;">${inst.dueYear || '-'}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e8ecf1; text-align: center; font-size: 13px;">${monthNames[inst.dueMonth] || inst.dueMonth || '-'}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e8ecf1; text-align: center; font-size: 13px; font-weight: 600;">${parseFloat(inst.amount || 0).toFixed(2)} ر.س</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e8ecf1; text-align: center;">
            <span style="display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #fff; background: ${statusColor(inst.status)};">
              ${statusLabel(inst.status)}
            </span>
          </td>
        </tr>`;
    });

    const totalAmount = parseFloat(row.amount || 0);

    // Convert logo to base64 for the print window
    const logoSrc = queLogo;

    const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>كشف سلفة - ${emp.name || ''}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Tajawal', sans-serif;
          background: #fff;
          color: #2c3e50;
          padding: 0;
          direction: rtl;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 25mm 20mm 30mm 20mm;
          position: relative;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #1a5276;
          margin-bottom: 25px;
        }
        .header-right {
          text-align: right;
        }
        .header-left {
          text-align: left;
        }
        .company-name {
          font-size: 28px;
          font-weight: 800;
          color: #1a5276;
          letter-spacing: 1px;
        }
        .company-sub {
          font-size: 13px;
          color: #7f8c8d;
          margin-top: 2px;
        }
        .doc-title {
          text-align: center;
          margin: 25px 0;
        }
        .doc-title h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a5276;
          display: inline-block;
          padding: 8px 40px;
          border: 2px solid #1a5276;
          border-radius: 8px;
          background: #eaf2f8;
        }
        .doc-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 13px;
          color: #555;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a5276;
          margin: 20px 0 12px 0;
          padding-right: 12px;
          border-right: 4px solid #2980b9;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 30px;
          margin-bottom: 20px;
        }
        .info-item {
          display: flex;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px dashed #dce1e6;
        }
        .info-label {
          font-weight: 600;
          color: #34495e;
          min-width: 130px;
          font-size: 13px;
        }
        .info-value {
          color: #2c3e50;
          font-size: 13px;
        }
        .summary-boxes {
          display: flex;
          gap: 15px;
          margin: 15px 0 20px 0;
        }
        .summary-box {
          flex: 1;
          padding: 14px;
          border-radius: 10px;
          text-align: center;
        }
        .summary-box.total { background: #eaf2f8; border: 1px solid #2980b9; }
        .summary-box.paid { background: #eafaf1; border: 1px solid #27ae60; }
        .summary-box.remaining { background: #fef5e7; border: 1px solid #f39c12; }
        .summary-box .label { font-size: 12px; color: #666; font-weight: 500; }
        .summary-box .value { font-size: 22px; font-weight: 800; margin-top: 4px; }
        .summary-box.total .value { color: #1a5276; }
        .summary-box.paid .value { color: #27ae60; }
        .summary-box.remaining .value { color: #e67e22; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        table thead th {
          background: #1a5276;
          color: #fff;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
        }
        table thead th:first-child { border-radius: 0 8px 0 0; }
        table thead th:last-child { border-radius: 8px 0 0 0; }
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
        }
        .signature-block {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 2px solid #2c3e50;
          margin-top: 60px;
          padding-top: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #34495e;
        }
        .signature-role {
          font-size: 11px;
          color: #7f8c8d;
          margin-top: 3px;
        }
        .footer {
          position: absolute;
          bottom: 15mm;
          left: 20mm;
          right: 20mm;
          text-align: center;
          font-size: 11px;
          color: #aab2b8;
          border-top: 1px solid #e0e0e0;
          padding-top: 10px;
        }
        .logo-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
        @media print {
          body { padding: 0; }
          .page { padding: 15mm 15mm 25mm 15mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="header-right">
            <div class="company-name">كيو مارت</div>
            <div class="company-sub">Que Mart - إدارة الموارد البشرية</div>
          </div>
          <div class="header-left">
            <img src="${logoSrc}" class="logo-img" alt="Que Mart Logo" />
          </div>
        </div>

        <div class="doc-title">
          <h2>كشف تفاصيل السلفة المالية</h2>
        </div>

        <div class="doc-meta">
          <div>رقم السلفة: <strong>#${row.id}</strong></div>
          <div>تاريخ الطباعة: <strong>${dateStr}</strong></div>
        </div>

        <div class="section-title">بيانات الموظف</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">رقم الموظف:</span>
            <span class="info-value">${emp.id || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">الاسم الكامل:</span>
            <span class="info-value">${emp.name || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">الجنس:</span>
            <span class="info-value">${emp.gender === 'M' ? 'ذكر' : emp.gender === 'F' ? 'أنثى' : '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">رقم الهاتف:</span>
            <span class="info-value">${emp.phone || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">البريد الإلكتروني:</span>
            <span class="info-value">${emp.email || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">تاريخ التوظيف:</span>
            <span class="info-value">${emp.hireDate || '-'}</span>
          </div>
        </div>

        <div class="section-title">تفاصيل السلفة</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">تاريخ تقديم الطلب:</span>
            <span class="info-value">${row.requestDate || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">المبلغ الإجمالي:</span>
            <span class="info-value" style="font-weight:700; color:#1a5276;">${totalAmount.toFixed(2)} ر.س</span>
          </div>
          <div class="info-item">
            <span class="info-label">عدد الأقساط:</span>
            <span class="info-value">${row.months || '-'} شهر</span>
          </div>
          <div class="info-item">
            <span class="info-label">حالة الطلب:</span>
            <span class="info-value" style="font-weight:700;">${advStatusLabel(row.status)}</span>
          </div>
          <div class="info-item" style="grid-column: span 2;">
            <span class="info-label">سبب الطلب:</span>
            <span class="info-value">${row.reason || '-'}</span>
          </div>
        </div>

        <div class="summary-boxes">
          <div class="summary-box total">
            <div class="label">إجمالي السلفة</div>
            <div class="value">${totalAmount.toFixed(2)} ر.س</div>
          </div>
          <div class="summary-box paid">
            <div class="label">المبلغ المدفوع</div>
            <div class="value">${totalPaid.toFixed(2)} ر.س</div>
          </div>
          <div class="summary-box remaining">
            <div class="label">المبلغ المتبقي</div>
            <div class="value">${totalRemaining.toFixed(2)} ر.س</div>
          </div>
        </div>

        <div class="section-title">جدول الأقساط</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>السنة</th>
              <th>الشهر</th>
              <th>مبلغ القسط</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${installmentRows || '<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">لا توجد أقساط مسجلة</td></tr>'}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-line">توقيع الموظف</div>
            <div class="signature-role">${emp.name || ''}</div>
          </div>
          <div class="signature-block">
            <div class="signature-line">توقيع المحاسب</div>
            <div class="signature-role">قسم المحاسبة</div>
          </div>
          <div class="signature-block">
            <div class="signature-line">توقيع المدير</div>
            <div class="signature-role">الإدارة العامة</div>
          </div>
        </div>

        <div class="footer">
          كيو مارت - Que Mart | جميع الحقوق محفوظة © ${today.getFullYear()} | تم إنشاء هذا المستند إلكترونياً
        </div>
      </div>
    </body>
    </html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.print();
    };
  } catch (err) {
    console.error('Print error:', err);
    this.$message.error('حدث خطأ أثناء تجهيز الطباعة');
  }
},
  }
}
</script>