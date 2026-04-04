<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="اسم الشيفت" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل اسم الشيفت"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="وقت بداية الشيفت" prop="startTime">
        <el-time-picker
          clearable
          v-model="queryParams.startTime"
          placeholder="اختر وقت بداية الشيفت"
          value-format="HH:mm:ss"
        />
      </el-form-item>

      <el-form-item label="وقت نهاية الشيفت" prop="endTime">
        <el-time-picker
          clearable
          v-model="queryParams.endTime"
          placeholder="اختر وقت نهاية الشيفت"
          value-format="HH:mm:ss"
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
          v-hasPermi="['api:shift:add']"
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
          v-hasPermi="['api:shift:edit']"
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
          v-hasPermi="['api:shift:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:shift:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <el-table v-loading="loading" :data="shiftList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      
      <el-table-column label="معرّف الشيفت" align="center" prop="id" />
      
      <el-table-column label="اسم الشيفت" align="center" prop="name" />
      <el-table-column label="المنطقة" align="center" prop="areaName" />

      
      <el-table-column label="وقت بداية الشيفت" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="وقت نهاية الشيفت" align="center" prop="endTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="أيام عطلة نهاية الأسبوع" align="center" prop="weekendDays">
        <template #default="{ row }">
          <el-tag
            v-for="dayId in row.weekendDays.split(',')"
            :key="dayId"
            type="info"
            style="margin: 2px"
          >
            {{ getWeekdayLabel(dayId) }}
          </el-tag>
        </template>
      </el-table-column>


      <el-table-column label="الحالة" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '1' ? 'warning' : 'success'" disable-transitions>
            {{ scope.row.status === '1' ? 'يعبر منتصف الليل' : 'لا يعبر منتصف الليل' }}
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
            v-hasPermi="['api:shift:edit']"
          >تعديل</el-button>
          
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:shift:remove']"
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

    <!-- 添加或修改قوالب الشيفتات对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="اسم الشيفت" prop="name">
          <el-input v-model="form.name"  placeholder="أدخل اسم الشيف" />
        </el-form-item>

        <el-form-item label="وقت بداية الشيفت" prop="startTime">
          <el-time-picker
            clearable
            v-model="form.startTime"
            value-format="HH:mm:ss"
            placeholder="اختر وقت بداية الشيفت">
          </el-time-picker>
        </el-form-item>

        <el-form-item label="وقت نهاية الشيفت" prop="endTime">
          <el-time-picker
            clearable
            v-model="form.endTime"
            value-format="HH:mm:ss"
            placeholder="اختر وقت نهاية الشيفت">
          </el-time-picker>
        </el-form-item>



        <el-form-item label="المنطقة" prop="areaId">
          <el-select v-model="form.areaId" placeholder="اختر المنطقة" clearable filterable>
            <el-option
              v-for="area in areaOptions"
              :key="area.id"
              :label="area.areaName"
              :value="area.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="الحالة" prop="status">
          <el-select v-model="form.status" placeholder="اختر الحالة">
            <el-option label="لا يعبر منتصف الليل" value="0" />
            <el-option label="يعبر منتصف الليل" value="1" />
          </el-select>
        </el-form-item>


        <el-form-item label="أيام نهاية الأسبوع" prop="weekendDays">
          <el-select
            v-model="selectedWeekendDays"
            multiple
            placeholder="اختر أيام نهاية الأسبوع"
            style="width: 100%"
          >
            <el-option
              v-for="day in weekdayOptions"
              :key="day.id"
              :label="day.label"
              :value="day.id"
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
import { listShift, getShift, delShift, addShift, updateShift } from "@/api/api/shift"
import { listArea } from "@/api/api/area"

export default {
  name: "Shift",
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
      // قوالب الشيفتات表格数据
      shiftList: [],
      areaOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        startTime: null,
        endTime: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "اسم الشيفت مطلوب", trigger: "blur" }
        ],
        startTime: [
          { required: true, message: "وقت بداية الشيفت مطلوب", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "وقت نهاية الشيفت مطلوب", trigger: "blur" }
        ],
        status: [
          { required: true, message: "يجب اختيار حالة الشيفت", trigger: "change" }
        ]

      },
      weekdayOptions: [
          { id: 1, label: "الاثنين" },
          { id: 2, label: "الثلاثاء" },
          { id: 3, label: "الأربعاء" },
          { id: 4, label: "الخميس" },
          { id: 5, label: "الجمعة" },
          { id: 6, label: "السبت" },
          { id: 7, label: "الأحد" }
        ],
       selectedWeekendDays: [],

      }
  },
  created() {
    this.getList()
  },
  activated() {
    this.getList()
  },
  watch: {
    selectedWeekendDays(newVal) {
      this.form.weekendDays = newVal.join(',');
    }
  },
  methods: {
    loadAreas() {
      listArea({ pageSize: 9999 }).then(response => {
        this.areaOptions = response.rows || []
      })
    },
    /** 查询قوالب الشيفتات列表 */
    getList() {
      this.loading = true
      listShift(this.queryParams).then(response => {
        this.shiftList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getWeekdayLabel(id) {
      const day = this.weekdayOptions.find(d => d.id === parseInt(id));
      return day ? day.label : 'لايوجد';
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
        startTime: null,
        endTime: null,
        status: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        weekendDays: null
      }
      this.selectedWeekendDays = []
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
      this.title = "إضافة قوالب الشيفتات"
    },

    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getShift(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل قوالب الشيفتات"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateShift(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addShift(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف قوالب الشيفتات ذات الرقم "' + ids + '"؟').then(function() {
        return delShift(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },

    /** عملية زر التصدير */
    handleExport() {
      this.download('api/shift/export', {
        ...this.queryParams
      }, `shift_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
