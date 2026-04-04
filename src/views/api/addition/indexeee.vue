<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="معرف الموظف" prop="empId">
        <el-input
          v-model="queryParams.empId"
          placeholder="请输入معرف الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="سنة الاستحقاق" prop="dueYear">
        <el-input
          v-model="queryParams.dueYear"
          placeholder="请输入سنة الاستحقاق"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="شهر الاستحقاق" prop="dueMonth">
        <el-input
          v-model="queryParams.dueMonth"
          placeholder="请输入شهر الاستحقاق"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="مبلغ الإضافة" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="请输入مبلغ الإضافة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="اسم المشرف" prop="supervisorName">
        <el-input
          v-model="queryParams.supervisorName"
          placeholder="请输入اسم المشرف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
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
          v-hasPermi="['api:addition:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['api:addition:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['api:addition:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:addition:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="additionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="المعرف الفريد للإضافة" align="center" prop="id" />
      <el-table-column label="معرف الموظف" align="center" prop="empId" />
      <el-table-column label="سنة الاستحقاق" align="center" prop="dueYear" />
      <el-table-column label="شهر الاستحقاق" align="center" prop="dueMonth" />
      <el-table-column label="مبلغ الإضافة" align="center" prop="amount" />
      <el-table-column label="0: قيد الانتظار، 1: مقبولة، 2: مرفوضة" align="center" prop="status" />
      <el-table-column label="اسم المشرف" align="center" prop="supervisorName" />
      <el-table-column label="ملاحظات إضافية حول الإضافة" align="center" prop="note" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:addition:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:addition:remove']"
          >删除</el-button>
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

    <!-- 添加或修改الإضافات对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="معرف الموظف" prop="empId">
          <el-input v-model="form.empId" placeholder="请输入معرف الموظف" />
        </el-form-item>
        <el-form-item label="سنة الاستحقاق" prop="dueYear">
          <el-input v-model="form.dueYear" placeholder="请输入سنة الاستحقاق" />
        </el-form-item>
        <el-form-item label="شهر الاستحقاق" prop="dueMonth">
          <el-input v-model="form.dueMonth" placeholder="请输入شهر الاستحقاق" />
        </el-form-item>
        <el-form-item label="مبلغ الإضافة" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入مبلغ الإضافة" />
        </el-form-item>
        <el-form-item label="اسم المشرف" prop="supervisorName">
          <el-input v-model="form.supervisorName" placeholder="请输入اسم المشرف" />
        </el-form-item>
        <el-form-item label="ملاحظات إضافية حول الإضافة" prop="note">
          <el-input v-model="form.note" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="علامة الحذف (0: موجود، 2: محذوف)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入علامة الحذف (0: موجود، 2: محذوف)" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAddition, getAddition, delAddition, addAddition, updateAddition } from "@/api/api/addition"

export default {
  name: "Addition",
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
      // الإضافات表格数据
      additionList: [],
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
        status: null,
        supervisorName: null,
        note: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        empId: [
          { required: true, message: "معرف الموظف不能为空", trigger: "blur" }
        ],
        dueYear: [
          { required: true, message: "سنة الاستحقاق不能为空", trigger: "blur" }
        ],
        dueMonth: [
          { required: true, message: "شهر الاستحقاق不能为空", trigger: "blur" }
        ],
        amount: [
          { required: true, message: "مبلغ الإضافة不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询الإضافات列表 */
    getList() {
      this.loading = true
      listAddition(this.queryParams).then(response => {
        this.additionList = response.rows
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
        dueYear: null,
        dueMonth: null,
        amount: null,
        status: null,
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
      this.title = "添加الإضافات"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getAddition(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改الإضافات"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAddition(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addAddition(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
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
      this.$modal.confirm('是否确认删除الإضافات编号为"' + ids + '"的数据项？').then(function() {
        return delAddition(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/addition/export', {
        ...this.queryParams
      }, `addition_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
