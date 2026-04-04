<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
        <el-form-item label="اسم القسم" prop="deptName">
          <el-input
            v-model="queryParams.deptName"
            placeholder="أدخل اسم القسم"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="القسم الأب" prop="parentDept">
          <el-select
            v-model="queryParams.parentDept"
            placeholder="اختر القسم الأب"
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
        v-hasPermi="['api:dept:add']"
      >إضافة جديدة</el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button
        type="info"
        plain
        icon="el-icon-sort"
        size="mini"
        @click="toggleExpandAll"
      >توسيع/طي</el-button>
    </el-col>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>


    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="معرف القسم" prop="deptId" />
      <el-table-column label="اسم القسم" prop="deptName" />
      <el-table-column label="القسم الأب" align="center" prop="parentDept" />
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:dept:edit']"
          >تعديل</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['api:dept:add']"
          >إضافة</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:dept:remove']"
          >حذف</el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改جدول يحتوي على معلومات الأقسام داخل النظام对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="اسم القسم" prop="deptName">
        <el-input v-model="form.deptName" placeholder="أدخل اسم القسم" />
      </el-form-item>
      <el-form-item label="القسم الأب" prop="parentDept">
        <treeselect v-model="form.parentDept" :options="deptOptions" :normalizer="normalizer" placeholder="اختر المعرف للقسم الأب إن وجد" />
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
import { listDept, getDept, delDept, addDept, updateDept } from "@/api/api/dept"
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
  name: "Dept",
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // جدول يحتوي على معلومات الأقسام داخل النظام表格数据
      deptList: [],
      // جدول يحتوي على معلومات الأقسام داخل النظام树选项
      deptOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        deptName: null,
        parentDept: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deptName: [
          { required: true, message: "اسم القسم لا يمكن أن يكون فارغًا", trigger: "blur" }
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
    /** 查询جدول يحتوي على معلومات الأقسام داخل النظام列表 */
    getList() {
      this.loading = true
      listDept(this.queryParams).then(response => {
        this.deptList = this.handleTree(response.data, "deptId", "parentDept")
        this.deptOptions = this.flattenDepts(this.deptList)
        this.loading = false
      })
    },
    flattenDepts(tree) {
      const result = []
      const traverse = (nodes) => {
        nodes.forEach(node => {
          result.push({ deptId: node.deptId, deptName: node.deptName })
          if (node.children) traverse(node.children)
        })
      }
      traverse(tree)
      return result
    },
    /** 转换جدول يحتوي على معلومات الأقسام داخل النظام数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
	/** 查询جدول يحتوي على معلومات الأقسام داخل النظام下拉树结构 */
    getTreeselect() {
      listDept().then(response => {
        this.deptOptions = []
        const data = { deptId: 0, deptName: 'العقدة الرئيسية', children: [] }
        data.children = this.handleTree(response.data, "deptId", "parentDept")
        this.deptOptions.push(data)
      })
    },
    flattenAreas(tree) {
      const result = []
      const traverse = (nodes) => {
        nodes.forEach(node => {
          result.push({ id: node.id, areaName: node.areaName })
          if (node.children) traverse(node.children)
        })
      }
      traverse(tree)
      return result
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        deptId: null,
        deptName: null,
        parentDept: null,
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
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row != null && row.deptId) {
        this.form.parentDept = row.deptId
      } else {
        this.form.parentDept = 0
      }
      this.open = true
      this.title = "إضافة قسم"
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      if (row != null) {
        this.form.parentDept = row.parentDept
      }
      getDept(row.deptId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل قسم"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.deptId != null) {
            updateDept(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addDept(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف الأقسام والذي رقم معرفه هو "' + row.deptId + '"؟').then(function() {
        return delDept(row.deptId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    }
  }
}
</script>
