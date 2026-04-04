<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="القسم" prop="deptId">
        <el-select
          v-model="queryParams.deptId"
          placeholder="اختر القسم"
          clearable
          filterable
          @change="handleQuery"
        >
          <el-option
            v-for="dept in deptOptions"
            :key="dept.deptId"
            :label="dept.deptName"
            :value="dept.deptId"
          />
        </el-select>
      </el-form-item>




      <el-form-item label="المنطقة" prop="areaId">
        <el-select
          v-model="queryParams.areaId"
          placeholder="اختر المنطقة"
          clearable
          filterable
          @change="handleQuery"
        >
          <el-option
            v-for="area in areaOptions"
            :key="area.id"
            :label="area.areaName"
            :value="area.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="الشيفت" prop="shiftId">
        <el-select
          v-model="queryParams.shiftId"
          placeholder="اختر الشيفت"
          clearable
          filterable
          @change="handleQuery"
        >
          <el-option
            v-for="shift in shiftOptions"
            :key="shift.id"
            :label="shift.name"
            :value="shift.id"
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
          v-hasPermi="['api:timetable:add']"
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
          v-hasPermi="['api:timetable:edit']"
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
          v-hasPermi="['api:timetable:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:timetable:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <el-table v-loading="loading" :data="timetableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="المعرّف" align="center" prop="id" />
      <el-table-column label="القسم" align="center" prop="deptId">
      <template slot-scope="scope">
        <el-tag type="info" size="small">
          {{ deptMap[scope.row.deptId] }}
        </el-tag>
      </template>
    </el-table-column>


      <el-table-column label="الشيفتات" align="center" prop="shiftIds">
        <template slot-scope="scope">
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            <el-tag
              v-for="id in (scope.row.shiftIds ? scope.row.shiftIds.split(',') : [])"
              :key="id"
              type="success"
              size="small"
            >
              {{ shiftMap[Number(id)] || id }}
            </el-tag>
          </div>
        </template>
      </el-table-column>


      
      <el-table-column label="المنطقة" align="center" prop="areaName" />
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:timetable:edit']"
          >تعديل</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:timetable:remove']"
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

    <!-- 添加或修改الجدول الزمني الخاص بالأقسام فقط对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="القسم" prop="deptId">
          <el-select
            v-model="form.deptId"
            placeholder="اختر القسم"
            clearable
            filterable
          >
            <el-option
              v-for="dept in deptOptions"
              :key="dept.deptId"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>

       <el-form-item label="الشيفتات" prop="shiftIds">
              <el-select
                v-model="form.shiftIds"
                multiple
                clearable
                filterable
                placeholder="اختر الشيفتات"
              >
                <el-option
                  v-for="shift in shiftOptions"
                  :key="shift.id"
                  :label="shift.name"
                  :value="shift.id"
                />
              </el-select>
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
import { listTimetable, getTimetable, delTimetable, addTimetable, updateTimetable } from "@/api/api/timetable"
import { listDept } from "@/api/api/dept"
import { listShift } from "@/api/api/shift"
import { listArea } from "@/api/api/area"
export default {
  name: "Timetable",
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
      // الجدول الزمني الخاص بالأقسام فقط表格数据
      timetableList: [],
      deptOptions: [],
      shiftOptions: [],
      shiftMap: {},
      deptMap: {},
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deptId: null,
        shiftIds: null,
        shiftId:null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deptId: [
          { required: true, message: "معرّف القسم المرتبط بالدوام لا يمكن أن يكون فارغًا", trigger: "blur" }
        ],
      }

    }
  },
  created() {
    this.getList()
    this.getDeptOptions()
    this.getShiftOptions()
  },
  activated() {
    this.getList()
    this.getDeptOptions()
    this.getShiftOptions()
  },
  computed: {
    shiftIdsString() {
      return Array.isArray(this.form.shiftIds)
        ? this.form.shiftIds.join(',')
        : this.form.shiftIds
    }
  },
  methods: {
    /** 查询الجدول الزمني الخاص بالأقسام فقط列表 */
    getList() {
      this.loading = true
      listTimetable(this.queryParams).then(response => {
        this.timetableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    getDeptOptions() {
      listDept({}).then(response => {
        this.deptOptions = response.data
        this.deptMap = Object.fromEntries(
          response.data.map(dept => [dept.deptId, dept.deptName])
        )
      })
    },
    getShiftOptions() {
      listShift({pageSize: 9999}).then(response => {
        this.shiftOptions = response.rows

        this.shiftMap = Object.fromEntries(
        response.rows.map(shift => [shift.id, shift.name])
      )
      })
      
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        deptId: null,
        shiftIds: null,
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
      this.title = "إضافة دوام"
    },

    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getTimetable(id).then(response => {
        this.form = response.data
        this.form.shiftIds = this.form.shiftIds
          ? this.form.shiftIds.split(',').map(id => Number(id))
          : []

        this.open = true
        this.title = "تعديل الدوام"
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            this.form.shiftIds = this.shiftIdsString
            updateTimetable(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
             this.form.shiftIds = this.shiftIdsString
            addTimetable(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف الدوام الخاص بالأقسام فقط ذو الرقم "' + ids + '"؟').then(function() {
        return delTimetable(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/timetable/export', {
        ...this.queryParams
      }, `timetable_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
