<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="120px">
    <el-form-item label="اسم الجهاز" prop="deviceName">
      <el-input
        v-model="queryParams.deviceName"
        placeholder="أدخل اسم الجهاز"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>

    <el-form-item label="الرقم التسلسلي" prop="serialNumber">
      <el-input
        v-model="queryParams.serialNumber"
        placeholder="أدخل الرقم التسلسلي للجهاز"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>

    <el-form-item label="عنوان IP" prop="deviceIp">
      <el-input
        v-model="queryParams.deviceIp"
        placeholder="أدخل عنوان IP للجهاز"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>

    <!-- <el-form-item label="المنفذ" prop="port">
      <el-input
        v-model="queryParams.port"
        placeholder="أدخل منفذ الاتصال بالجهاز"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item> -->

    <el-form-item label="الفرع أو الموقع" prop="area">
      <el-input
        v-model="queryParams.area"
        placeholder="أدخل الفرع أو الموقع"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>

    <!-- <el-form-item label="المنطقة الزمنية" prop="timeZone">
      <el-input
        v-model="queryParams.timeZone"
        placeholder="أدخل المنطقة الزمنية للجهاز"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item> -->

    <!-- <el-form-item label="مخصص للحضور؟" prop="attendanceEnabled">
      <el-input
        v-model="queryParams.attendanceEnabled"
        placeholder="هل الجهاز مخصص للحضور؟"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item> -->

    <!-- <el-form-item label="مخصص للتحكم في الوصول؟" prop="accessControlEnabled">
      <el-input
        v-model="queryParams.accessControlEnabled"
        placeholder="هل الجهاز مخصص للتحكم في الوصول؟"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item> -->

    <!-- <el-form-item label="وضع نقل البيانات" prop="transferMode">
      <el-input
        v-model="queryParams.transferMode"
        placeholder="0 يعني مباشر، 1 يعني مجدول"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item> -->

    <!-- <el-form-item label="نبض الاتصال (ثواني)" prop="heartbeatInterval">
      <el-input
        v-model="queryParams.heartbeatInterval"
        placeholder="أدخل فترة نبض الاتصال بالجهاز بالثواني"
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
        v-hasPermi="['api:devices:add']"
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
        v-hasPermi="['api:devices:edit']"
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
        v-hasPermi="['api:devices:remove']"
      >حذف</el-button>
    </el-col>

    <el-col :span="1.5">
      <el-button
        type="warning"
        plain
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
        v-hasPermi="['api:devices:export']"
      >تصدير</el-button>
    </el-col>

    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
  </el-row>


    <el-table v-loading="loading" :data="devicesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      
      <el-table-column label="المعرف للجهاز" align="center" prop="deviceId" />
      <el-table-column label="اسم الجهاز" align="center" prop="deviceName" />
      <el-table-column label="الرقم التسلسلي للجهاز" align="center" prop="serialNumber" />
      <el-table-column label="عنوان IP للجهاز" align="center" prop="deviceIp" />
      <el-table-column label="منفذ الاتصال بالجهاز" align="center" prop="port" />
      <el-table-column label="الفرع" align="center" prop="area" />
      <el-table-column label="المنطقة الزمنية للجهاز" align="center" prop="timeZone" />
      <el-table-column label="مخصص للحضور" align="center" prop="attendanceEnabled">
        <template slot-scope="scope">
          <el-tag :type="scope.row.attendanceEnabled ? 'success' : 'info'" size="small">
            {{ scope.row.attendanceEnabled ? 'نعم' : 'لا' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="مخصص للتحكم في الوصول" align="center" prop="accessControlEnabled">
        <template slot-scope="scope">
          <el-tag :type="scope.row.accessControlEnabled ? 'success' : 'info'" size="small">
            {{ scope.row.accessControlEnabled ? 'نعم' : 'لا' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="وضع نقل البيانات" align="center" prop="transferMode">
        <template slot-scope="scope">
          <el-tag :type="scope.row.transferMode === '0' ? 'success' : 'warning'" size="small">
            {{ scope.row.transferMode === '0' ? 'مباشر' : 'مجدول' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- <el-table-column label="فترة نبض الاتصال بالجهاز (بالثواني)" align="center" prop="heartbeatInterval">
        <template slot-scope="scope">
          <el-tag type="info" size="small">
            {{ scope.row.heartbeatInterval }} ثانية
          </el-tag>
        </template>
      </el-table-column> -->


      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['api:devices:edit']"
          >تعديل</el-button>
          
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['api:devices:remove']"
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

    <!-- 添加或修改الاجهزة对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="اسم الجهاز" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="أدخل اسم الجهاز مثل الإدارة" />
        </el-form-item>

        <el-form-item label="الرقم التسلسلي" prop="serialNumber">
          <el-input v-model="form.serialNumber" placeholder="أدخل الرقم التسلسلي للجهاز" />
        </el-form-item>

        <el-form-item label="عنوان IP" prop="deviceIp">
          <el-input v-model="form.deviceIp" placeholder="أدخل عنوان IP للجهاز" />
        </el-form-item>

        <el-form-item label="المنفذ" prop="port">
          <el-input v-model="form.port" placeholder="أدخل منفذ الاتصال بالجهاز" />
        </el-form-item>

        <el-form-item label="الفرع أو الموقع" prop="area">
          <el-input v-model="form.area" placeholder="أدخل الفرع أو الموقع مثل فرع الرحاب" />
        </el-form-item>

        <el-form-item label="المنطقة الزمنية" prop="timeZone">
          <el-input v-model="form.timeZone" placeholder="أدخل المنطقة الزمنية للجهاز" />
        </el-form-item>

        <el-form-item label="مخصص للحضور؟" prop="attendanceEnabled">
          <el-input v-model="form.attendanceEnabled" placeholder="هل الجهاز مخصص للحضور؟" />
        </el-form-item>

        <el-form-item label="مخصص للتحكم في الوصول؟" prop="accessControlEnabled">
          <el-input v-model="form.accessControlEnabled" placeholder="هل الجهاز مخصص للتحكم في الوصول؟" />
        </el-form-item>

        <el-form-item label="وضع نقل البيانات" prop="transferMode">
          <el-input v-model="form.transferMode" placeholder="0 يعني مباشر، 1 يعني مجدول" />
        </el-form-item>

        <el-form-item label="نبض الاتصال (ثواني)" prop="heartbeatInterval">
          <el-input v-model="form.heartbeatInterval" placeholder="أدخل فترة نبض الاتصال بالجهاز بالثواني" />
        </el-form-item>

        <!-- <el-form-item label="علامة الحذف" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="0: موجود، 2: محذوف" />
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
import { listDevices, getDevices, delDevices, addDevices, updateDevices, connectDevices } from "@/api/api/devices"

export default {
  name: "Devices",
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
      // الاجهزة表格数据
      devicesList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceName: null,
        serialNumber: null,
        deviceIp: null,
        port: null,
        area: null,
        timeZone: null,
        attendanceEnabled: null,
        accessControlEnabled: null,
        transferMode: null,
        heartbeatInterval: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deviceName: [
          { required: true, message: "اسم الجهاز مثل الإدارة مطلوب", trigger: "blur" }
        ],
        serialNumber: [
          { required: true, message: "الرقم التسلسلي للجهاز مطلوب", trigger: "blur" }
        ],
        deviceIp: [
          { required: true, message: "عنوان IP للجهاز مطلوب", trigger: "blur" }
        ]
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
    /** 查询الاجهزة列表 */
    getList() {
      this.loading = true
      listDevices(this.queryParams).then(response => {
        this.devicesList = response.rows
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
        deviceId: null,
        deviceName: null,
        serialNumber: null,
        deviceIp: null,
        port: null,
        area: null,
        timeZone: null,
        attendanceEnabled: null,
        accessControlEnabled: null,
        transferMode: null,
        heartbeatInterval: null,
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
      this.ids = selection.map(item => item.deviceId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "إضافة الأجهزة"
    },

    /** عملية زر التعديل */
    handleUpdate(row) {
      this.reset()
      const deviceId = row.deviceId || this.ids
      getDevices(deviceId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل الأجهزة"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.deviceId != null) {
            updateDevices(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
            })
          } else {
            addDevices(this.form).then(response => {
              this.$modal.msgSuccess("تمت الإضافة بنجاح")
              this.open = false
              this.getList()

              // Step 2: Connect to the device
              connectDevices({
                deviceIp: this.form.deviceIp,
                port: this.form.port
              }).then(() => {
                this.$modal.msgSuccess("تم الاتصال بالجهاز بنجاح")
              }).catch(() => {
                this.$modal.msgError("فشل الاتصال بالجهاز")
              })
            })

          }

        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const deviceIds = row.deviceId || this.ids
      this.$modal.confirm('هل أنت متأكد من حذف الجهاز ذو المعرف "' + deviceIds + '"؟').then(function() {
        return delDevices(deviceIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('api/devices/export', {
        ...this.queryParams
      }, `devices_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
