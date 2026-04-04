<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="معرف الموظف" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="أدخل رمز الموظف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="الاسم الأول" prop="firstName">
        <el-input
          v-model="queryParams.firstName"
          placeholder="أدخل الاسم الأول"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="اسم العائلة" prop="lastName">
        <el-input
          v-model="queryParams.lastName"
          placeholder="أدخل اسم العائلة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="الاسم الكامل" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل الاسم الكامل"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="رابط الصورة الشخصية" prop="photo">
        <el-input
          v-model="queryParams.photo"
          placeholder="أدخل رابط الصورة الشخصية"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="القسم" prop="deptId">
      <el-select
        v-model="queryParams.deptId"
        placeholder="اختر القسم"
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

    <el-form-item label="الوظيفة" prop="positionId">
      <el-select
        v-model="queryParams.positionId"
        placeholder="اختر الوظيفة"
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

    <el-form-item label="المنطقة" prop="areaId">
      <el-select
        v-model="queryParams.areaId"
        placeholder="اختر المنطقة"
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

    <!-- <el-form-item label="الجهاز" prop="deviceId">
      <el-select
        v-model="queryParams.deviceId"
        placeholder="اختر الجهاز"
        clearable
        @change="handleQuery"
      >
        <el-option
          v-for="item in deviceOptions"
          :key="item.deviceId"
          :label="item.deviceName"
          :value="item.deviceId"
        />
      </el-select>
    </el-form-item> -->

      <el-form-item label="تاريخ التوظيف" prop="hireDate">
        <el-date-picker clearable
          v-model="queryParams.hireDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ التوظيف">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="تاريخ الميلاد" prop="birthday">
        <el-date-picker clearable
          v-model="queryParams.birthday"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="اختر تاريخ الميلاد">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="الجنس" prop="gender">
        <el-select
          v-model="queryParams.gender"
          placeholder="اختر الجنس"
          clearable
          @change="handleQuery"
        >
          <el-option label="ذكر (M)" value="M" />
          <el-option label="أنثى (F)" value="F" />
        </el-select>
      </el-form-item>

      <el-form-item label="رقم الهاتف" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="أدخل رقم الهاتف"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="الجنسية" prop="national">
        <el-input
          v-model="queryParams.national"
          placeholder="أدخل الجنسية"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="المدينة" prop="city">
        <el-input
          v-model="queryParams.city"
          placeholder="أدخل المدينة"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="العنوان" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="أدخل العنوان"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="الرمز البريدي" prop="postcode">
        <el-input
          v-model="queryParams.postcode"
          placeholder="أدخل الرمز البريدي"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="البريد الإلكتروني" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="أدخل البريد الإلكتروني"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="الاجهزة المرتبطة" prop="deviceIds">
          <el-input
            v-model="queryParams.deviceIds"
            placeholder="请输入الاجهزة المرتبطة"
            clearable
            @keyup.enter.native="handleQuery"
          />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">بحث</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">إعادة تعيين</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['api:emp:add']"
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
          v-hasPermi="['api:emp:edit']"
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
          v-hasPermi="['api:emp:remove']"
        >حذف</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['api:emp:export']"
        >تصدير</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->


    

    <el-table v-loading="loading" :data="empList" @selection-change="handleSelectionChange" @row-click="goToDedection">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="المعرف للموظف" align="center" prop="id" />
      <el-table-column label="الاسم" align="center" prop="name" />
      <!-- <el-table-column label="رابط الصورة الشخصية" align="center" prop="photo" /> -->
      <el-table-column label="القسم" align="center" prop="deptId">
        <template slot-scope="scope">
          <el-tag type="info" disable-transitions>{{ getDeptName(scope.row.deptId) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="الوظيفة" align="center" prop="positionId">
        <template slot-scope="scope">
          <el-tag type="success" disable-transitions>{{ getPositionName(scope.row.positionId) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="المنطقة" align="center" prop="areaId">
        <template slot-scope="scope">
          <el-tag type="warning" disable-transitions>{{ getAreaName(scope.row.areaId) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="تاريخ التوظيف" align="center" prop="hireDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.hireDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="تاريخ الميلاد" align="center" prop="birthday" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="الجنس (M/F)" align="center" prop="gender" />
      <el-table-column label="رقم الهاتف" align="center" prop="phone" />
      <el-table-column label="الجنسية" align="center" prop="national" />
      <el-table-column label="المدينة" align="center" prop="city" />
      <!-- <el-table-column label="العنوان" align="center" prop="address" />
      <el-table-column label="الرمز البريدي" align="center" prop="postcode" />
      <el-table-column label="البريد الإلكتروني" align="center" prop="email" /> -->
      <!-- <el-table-column label="الاجهزة المرتبطة" align="center" prop="deviceIds" /> -->
      <!-- <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
      

      <template slot-scope="scope">
        <el-button
          size="mini"
          type="text"
          icon="el-icon-edit"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['api:emp:edit']"
        >تعديل</el-button>
        <el-button
          size="mini"
          type="text"
          icon="el-icon-delete"
          @click="handleDelete(scope.row)"
          v-hasPermi="['api:emp:remove']"
        >حذف</el-button>
      </template>
    </el-table-column> -->

    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改الموظفون对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="الاسم" prop="name">
          <el-input v-model="form.name" placeholder="أدخل الاسم" />
        </el-form-item>

        <!-- <el-form-item label="اسم العائلة" prop="lastName">
          <el-input v-model="form.lastName" placeholder="أدخل اسم العائلة" />
        </el-form-item> -->
        <!-- <el-form-item label="الاسم الكامل" prop="fullName">
          <el-input v-model="form.fullName" placeholder="أدخل الاسم الكامل" />
        </el-form-item> -->
        <!-- <el-form-item label="رابط الصورة الشخصية" prop="photo">
          <el-input v-model="form.photo" placeholder="أدخل رابط الصورة الشخصية" />
        </el-form-item> -->
        <el-form-item label="القسم" prop="deptId">
          <el-select v-model="form.deptId" placeholder="اختر القسم" clearable>
            <el-option
              v-for="item in deptOptions"
              :key="item.deptId"
              :label="item.deptName"
              :value="item.deptId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="الوظيفة" prop="positionId">
          <el-select v-model="form.positionId" placeholder="اختر الوظيفة" clearable>
            <el-option
              v-for="item in positionOptions"
              :key="item.positionId"
              :label="item.positionName"
              :value="item.positionId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="المنطقة" prop="areaId">
          <el-select v-model="form.areaId" placeholder="اختر المنطقة" clearable>
            <el-option
              v-for="item in areaOptions"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="تاريخ التوظيف" prop="hireDate">
          <el-date-picker clearable
            v-model="form.hireDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ التوظيف">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="تاريخ الميلاد" prop="birthday">
          <el-date-picker clearable
            v-model="form.birthday"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="اختر تاريخ الميلاد">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="الجنس" prop="gender">
          <el-select v-model="form.gender" placeholder="اختر الجنس" clearable>
            <el-option label="ذكر (M)" value="M" />
            <el-option label="أنثى (F)" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item label="رقم الهاتف" prop="phone">
          <el-input v-model="form.phone" placeholder="أدخل رقم الهاتف" />
        </el-form-item>
        <el-form-item label="الجنسية" prop="national">
          <el-input v-model="form.national" placeholder="أدخل الجنسية" />
        </el-form-item>
        <el-form-item label="المدينة" prop="city">
          <el-input v-model="form.city" placeholder="أدخل المدينة" />
        </el-form-item>
        <el-form-item label="العنوان" prop="address">
          <el-input v-model="form.address" placeholder="أدخل العنوان" />
        </el-form-item>
        <el-form-item label="الرمز البريدي" prop="postcode">
          <el-input v-model="form.postcode" placeholder="أدخل الرمز البريدي" />
        </el-form-item>
        <el-form-item label="البريد الإلكتروني" prop="email">
          <el-input v-model="form.email" placeholder="أدخل البريد الإلكتروني" />
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
import { listEmp, getEmp, delEmp, addEmp, updateEmp } from "@/api/api/emp"
import { listArea } from "@/api/api/area"
import { listPosition } from "@/api/api/position"
import { listDept } from "@/api/api/dept"
import { listDevices } from "@/api/api/devices"
import axios from "axios"

export default {
  name: "Emp",
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
      // الموظفون表格数据
      empList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        id: null,
        pageNum: 1,
        pageSize: 10,
        name: null,
        photo: null,
        deptId: null,
        positionId: null,
        areaId: null,
        hireDate: null,
        birthday: null,
        gender: null,
        phone: null,
        national: null,
        city: null,
        address: null,
        postcode: null,
        email: null,
      },
      deptOptions: [],
      positionOptions: [],
      areaOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "الاسم مطلوب", trigger: "blur" }
        ]
      }

    }
  },
  created() {
    this.getList()
    this.getDeptOptions()
    this.getPositionOptions()
    this.getAreaOptions()
  
    // Call it when server starts
    // fetchAndLogEmployees();
  },
  activated() {
    this.getList()
    this.getDeptOptions()
    this.getPositionOptions()
    this.getAreaOptions()
  
  },
  methods: {
    /** 查询الموظفون列表 */
    getList() {
      this.loading = true
      listEmp(this.queryParams).then(response => {
        this.empList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getDeptOptions() {
      listDept({}).then(response => {
        this.deptOptions = response.data
      })
    },
    getPositionOptions() {
      listPosition({pageSize: 9999}).then(response => {
        this.positionOptions = response.data
      })
    },
    getAreaOptions() {
      listArea({pageSize: 9999}).then(response => {
        this.areaOptions = response.data
      })
    },
    getDeptName(id) {
      const dept = this.deptOptions.find(item => item.deptId === id)
      return dept ? dept.deptName : id
    },
    getPositionName(id) {
      const pos = this.positionOptions.find(item => item.positionId === id)
      return pos ? pos.positionName : id
    },
    getAreaName(id) {
      const area = this.areaOptions.find(item => item.id === id)
      return area ? area.areaName : id
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    goToDedection(row) {
      this.$router.push({ path: "/hr/dedection/detail/list/" + row.id});
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        photo: null,
        deptId: null,
        positionId: null,
        areaId: null,
        hireDate: null,
        birthday: null,
        gender: null,
        phone: null,
        national: null,
        city: null,
        address: null,
        postcode: null,
        email: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
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
      this.title = "إضافة موظف"
    },

    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getEmp(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل موظف"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateEmp(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addEmp(this.form).then(response => {
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
      this.$modal.confirm('هل أنت متأكد من حذف الموظف ذو الرقم "' + ids + '"؟').then(function() {
        return delEmp(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/emp/export', {
        ...this.queryParams
      }, `emp_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
