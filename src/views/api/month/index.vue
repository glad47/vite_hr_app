<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="اسم الشهر" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل اسم الشهر"
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['api:month:add']"
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
          v-hasPermi="['api:month:edit']"
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
          v-hasPermi="['api:month:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:month:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <el-table v-loading="loading" :data="monthList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column label="معرّف الشهر" align="center" prop="id" />
        <el-table-column label="اسم الشهر" align="center" prop="name" />
        <el-table-column label="اليوم لبداية الشهر" align="center" prop="startDay" />
        <el-table-column label="الشهر لبداية الشهر" align="center">
          <template slot-scope="scope">
            <el-tag type="info">
              {{ months[scope.row.startMonth - 1] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="اليوم لنهاية الشهر" align="center" prop="endDay" />
        <el-table-column label="الشهر لنهاية الشهر" align="center">
          <template slot-scope="scope">
            <el-tag type="success">
              {{ months[scope.row.endMonth - 1] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['api:month:edit']"
            >تعديل</el-button>
            
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['api:month:remove']"
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

    <!-- 添加或修改الاشهر对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="اسم الشهر" prop="name">
          <el-input v-model="form.name" placeholder="أدخل اسم الشهر" />
        </el-form-item>

        <!-- اليوم لبداية الشهر -->
        <el-form-item label="اليوم لبداية الشهر" prop="startDay">
          <el-select v-model="form.startDay" placeholder="اختر اليوم">
            <el-option v-for="d in 31" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>

        <!-- الشهر لبداية الشهر -->
        <el-form-item label="الشهر لبداية الشهر" prop="startMonth">
          <el-select v-model="form.startMonth" placeholder="اختر الشهر">
            <el-option
              v-for="(month, index) in months"
              :key="index"
              :label="month"
              :value="index + 1"
            />
          </el-select>
        </el-form-item>

        <!-- اليوم لنهاية الشهر -->
        <el-form-item label="اليوم لنهاية الشهر" prop="endDay">
          <el-select v-model="form.endDay" placeholder="اختر اليوم">
            <el-option v-for="d in 31" :key="'end-' + d" :label="d" :value="d" />
          </el-select>
        </el-form-item>

        <!-- الشهر لنهاية الشهر -->
        <el-form-item label="الشهر لنهاية الشهر" prop="endMonth">
          <el-select v-model="form.endMonth" placeholder="اختر الشهر">
            <el-option
              v-for="(month, index) in months"
              :key="'end-month-' + index"
              :label="month"
              :value="index + 1"
            />
          </el-select>
        </el-form-item>

        <!-- علامة الحذف -->
        <!--
        <el-form-item label="علامة الحذف (0: موجود، 2: محذوف)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="أدخل علامة الحذف (0: موجود، 2: محذوف)" />
        </el-form-item>
        -->
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">تأكيد</el-button>
        <el-button @click="cancel">إلغاء</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listMonth, getMonth, delMonth, addMonth, updateMonth } from "@/api/api/month"

export default {
  name: "Month",
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
      // الاشهر表格数据
      monthList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        startDay: null,
        startMonth: null,
        endDay: null,
        endMonth: null,
      },
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "اسم الشهر لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        startDay: [
          { required: true, message: "اليوم لبداية الشهر لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        startMonth: [
          { required: true, message: "الشهر لبداية الشهر لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        endDay: [
          { required: true, message: "اليوم لنهاية الشهر لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
        endMonth: [
          { required: true, message: "الشهر لنهاية الشهر لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],

      }
    }
  },
  created() {
    this.getList()
  },
  activated() {
    this.getList()
  },
  methods: {
    /** 查询الاشهر列表 */
    getList() {
      this.loading = true
      listMonth(this.queryParams).then(response => {
        this.monthList = response.rows
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
        name: null,
        startDay: null,
        startMonth: null,
        endDay: null,
        endMonth: null,
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
      this.title = "إضافة الأشهر"
    },

    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getMonth(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل الأشهر"
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMonth(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addMonth(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف الشهر ذو الرقم "' + ids + '"؟').then(function() {
        return delMonth(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },

    /** عملية زر التصدير */
    handleExport() {
      this.download('api/month/export', {
        ...this.queryParams
      }, `month_${new Date().getTime()}.xlsx`)
    }

  }
}
</script>
