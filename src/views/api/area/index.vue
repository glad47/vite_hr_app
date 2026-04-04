<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="رمز المنطقة" prop="areaCode">
        <el-input
          v-model="queryParams.areaCode"
          placeholder="أدخل رمز المنطقة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="اسم المنطقة" prop="areaName">
        <el-input
          v-model="queryParams.areaName"
          placeholder="أدخل اسم المنطقة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="المنطقة الأب" prop="parentArea">
        <el-select
          v-model="queryParams.parentArea"
          placeholder="اختر المنطقة الأب"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="item in areaOptions"
            :key="item.id"
            :label="item.areaName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- <el-form-item label="اسم المنطقة الأب" prop="parentAreaName">
        <el-input
          v-model="queryParams.parentAreaName"
          placeholder="أدخل اسم المنطقة الأب إن وجدت"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
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
        v-hasPermi="['api:area:add']"
      >إضافة جديدة</el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button
        type="info"
        plain
        icon="el-icon-sort"
        size="mini"
        @click="toggleExpandAll"
      >توسيع / طي</el-button>
    </el-col>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>


    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="areaList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >

      <el-table-column label="معرف المنطقة" prop="id" />
      <el-table-column label="رمز المنطقة" prop="areaCode" />
      <el-table-column label="اسم المنطقة" align="center" prop="areaName" />
      <!-- <el-table-column label="المعرف للمنطقة الأب" align="center" prop="parentArea" /> -->
      <!-- <el-table-column label="اسم المنطقة الأب" align="center" prop="parentAreaName" /> -->
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:area:edit']"
          >تعديل</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['api:area:add']"
          >إضافة</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:area:remove']"
          >حذف</el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改المناطق对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="رمز المنطقة" prop="areaCode">
          <el-input v-model="form.areaCode" placeholder="أدخل رمز المنطقة" />
        </el-form-item>
        <el-form-item label="اسم المنطقة" prop="areaName">
          <el-input v-model="form.areaName" placeholder="أدخل اسم المنطقة" />
        </el-form-item>
        <el-form-item label="المنطقة الأب" prop="parentArea">
          <treeselect v-model="form.parentArea" :options="areaOptions" :normalizer="normalizer" placeholder="اختر المعرف للمنطقة الأب إن وجدت" />
        </el-form-item>
        <!-- <el-form-item label="اسم المنطقة الأب" prop="parentAreaName">
          <el-input v-model="form.parentAreaName" placeholder="أدخل اسم المنطقة الأب إن وجدت" />
        </el-form-item> -->
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
import { listArea, getArea, delArea, addArea, updateArea } from "@/api/api/area"
import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
  name: "Area",
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // المناطق表格数据
      areaList: [],
      // المناطق树选项
      areaOptions: [],
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
        areaCode: null,
        areaName: null,
        parentArea: null,
        // parentAreaName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        areaName: [
          { required: true, message: "اسم المنطقة لا يمكن أن يكون فارغًا", trigger: "blur" }
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
    /** 查询المناطق列表 */
    getList() {
      this.loading = true
      listArea(this.queryParams).then(response => {
        this.areaList = this.handleTree(response.data, "id", "parentArea")
        this.areaOptions = this.flattenAreas(this.areaList)
        this.loading = false
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
    /** 转换المناطق数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.areaName,
        children: node.children
      }
    },
	/** 查询المناطق下拉树结构 */
    getTreeselect() {
      listArea().then(response => {
        this.areaOptions = []
        const data = { id: 0, areaName: 'العقدة الرئيسية', children: [] }
        data.children = this.handleTree(response.data, "id", "parentArea")
        this.areaOptions.push(data)
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
        areaCode: null,
        areaName: null,
        parentArea: null,
        // parentAreaName: null,
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
      if (row != null && row.id) {
        this.form.parentArea = row.id
      } else {
        this.form.parentArea = 0
      }
      this.open = true
      this.title = "اضافة منطقة"
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
        this.form.parentArea = row.parentArea
      }
      getArea(row.id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل منطقة"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
              updateArea(this.form).then(response => {
                this.$modal.msgSuccess("تم التعديل بنجاح")
                this.open = false
                this.getList()
              })
            } else {
              addArea(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف المنطقة التي رقم معرفها هو "' + row.id + '"؟').then(function() {
        return delArea(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    }

  }
}
</script>
