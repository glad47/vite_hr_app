<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
      <el-form-item label="الوظيفة" prop="positionName">
        <el-input
          v-model="queryParams.positionName"
          placeholder="أدخل اسم الوظيفة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="رمز الوظيفة" prop="positionCode">
        <el-input
          v-model="queryParams.positionCode"
          placeholder="أدخل رمز الوظيفة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="الوظيفة الأب" prop="parentPosition">
          <el-select
            v-model="queryParams.parentPosition"
            placeholder="اختر الوظيفة الأب"
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
          v-hasPermi="['api:position:add']"
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
      :data="positionList"
      row-key="positionId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="معرف الوظيفة" prop="positionId" />
      <el-table-column label="اسم الوظيفة" prop="positionName" />
      <el-table-column label="رمز الوظيفة" align="center" prop="positionCode" />
      <el-table-column label="الوظيفة الأب" align="center" prop="parentPosition" />
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:position:edit']"
          >تعديل</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['api:position:add']"
          >إضافة</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:position:remove']"
          >حذف</el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改جدول يحتوي على معلومات الوظائف داخل النظام对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="اسم الوظيفة" prop="positionName">
          <el-input v-model="form.positionName" placeholder="أدخل اسم الوظيفة" />
        </el-form-item>
        <el-form-item label="رمز الوظيفة" prop="positionCode">
          <el-input v-model="form.positionCode" placeholder="أدخل رمز الوظيفة" />
        </el-form-item>
        <el-form-item label="الوظيفة الأب إن وجدت" prop="parentPosition">
          <treeselect v-model="form.parentPosition" :options="positionOptions" :normalizer="normalizer" placeholder="اختر الوظيفة الأب" />
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
import { listPosition, getPosition, delPosition, addPosition, updatePosition } from "@/api/api/position"
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
  name: "Position",
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // جدول يحتوي على معلومات الوظائف داخل النظام表格数据
      positionList: [],
      // جدول يحتوي على معلومات الوظائف داخل النظام树选项
      positionOptions: [],
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
        positionName: null,
        positionCode: null,
        parentPosition: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        positionName: [
          { required: true, message: "اسم الوظيفة لا يمكن أن يكون فارغًا", trigger: "blur" }
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
    /** 查询جدول يحتوي على معلومات الوظائف داخل النظام列表 */
    getList() {
      this.loading = true
      listPosition(this.queryParams).then(response => {
        this.positionList = this.handleTree(response.data, "positionId", "parentPosition")
        this.positionOptions = this.flattenPositions(this.positionList)
        this.loading = false
      })
    },
    flattenPositions(tree) {
      const result = []
      const traverse = (nodes) => {
        nodes.forEach(node => {
          result.push({ positionId: node.positionId, positionName: node.positionName })
          if (node.children) traverse(node.children)
        })
      }
      traverse(tree)
      return result
    },
    /** 转换جدول يحتوي على معلومات الوظائف داخل النظام数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.positionId,
        label: node.positionName,
        children: node.children
      }
    },
	/** 查询جدول يحتوي على معلومات الوظائف داخل النظام下拉树结构 */
    getTreeselect() {
      listPosition().then(response => {
        this.positionOptions = []
        const data = { positionId: 0, positionName: 'العقدة الرئيسية', children: [] }
        data.children = this.handleTree(response.data, "positionId", "parentPosition")
        this.positionOptions.push(data)
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
        positionId: null,
        positionName: null,
        positionCode: null,
        parentPosition: null,
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
      if (row != null && row.positionId) {
        this.form.parentPosition = row.positionId
      } else {
        this.form.parentPosition = 0
      }
      this.open = true
      this.title = "إضافة وظيفة"
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
        this.form.parentPosition = row.parentPosition
      }
      getPosition(row.positionId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل وظيفة"
      })

    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.positionId != null) {
            updatePosition(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addPosition(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف الوظائف "' + row.positionId + '"؟').then(function() {
        return delPosition(row.positionId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    }

  }
}
</script>
