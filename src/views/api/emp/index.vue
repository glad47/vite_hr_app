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
      
      <el-form-item label="الاسم الكامل" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="أدخل الاسم الكامل"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="رقم الهوية" prop="identityNumber">
        <el-input
          v-model="queryParams.identityNumber"
          placeholder="أدخل رقم الهوية"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

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

      <el-form-item label="البريد الإلكتروني" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="أدخل البريد الإلكتروني"
          clearable
          @keyup.enter.native="handleQuery"
        />
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

      <el-form-item label="المشرف" prop="supervisorId">
        <el-select
          v-model="queryParams.supervisorId"
          placeholder="اختر المشرف"
          clearable
          filterable
          @change="handleQuery"
        >
          <el-option
            v-for="supervisor in supervisorOptions"
            :key="supervisor.id"
            :label="supervisor.name"
            :value="supervisor.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="هو مشرف" prop="isSupervisor">
        <el-select
          v-model="queryParams.isSupervisor"
          placeholder="اختر"
          clearable
          @change="handleQuery"
        >
          <el-option label="نعم" value="1" />
          <el-option label="لا" value="0" />
        </el-select>
      </el-form-item>

      <el-form-item label="الراتب الشهري" prop="salary">
        <el-input
          v-model="queryParams.salary"
          placeholder="أدخل الراتب الشهري"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="بدون شيفت" prop="noShift">
        <el-checkbox v-model="queryParams.noShift"></el-checkbox>
      </el-form-item>

      <el-form-item label="بدون راتب" prop="noSalary">
        <el-checkbox v-model="queryParams.noSalary"></el-checkbox>
      </el-form-item>

      <el-form-item label="بدون مشرف" prop="noSupervisor">
        <el-checkbox v-model="queryParams.noSupervisor"></el-checkbox>
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
          type="info"
          plain
          icon="el-icon-user"
          size="mini"
          @click="handleAssignSupervisor"
          v-hasPermi="['api:emp:supervisor']"
        >تعيين مشرف</el-button>
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
    </el-row>

    <el-table v-loading="loading" :data="empList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="المعرف للموظف" align="center" prop="id" />
      <el-table-column label="الاسم" align="center" prop="name" />
      <el-table-column label="رقم الهوية" align="center" prop="identityNumber" />
      
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

      <el-table-column label="الجنس (M/F)" align="center" prop="gender" />
      <!-- <el-table-column label="رقم الهاتف" align="center" prop="phone" />
      <el-table-column label="الجنسية" align="center" prop="national" />
      <el-table-column label="المدينة" align="center" prop="city" />
       -->
      <el-table-column label="الشيفت" align="center" prop="shiftId">
        <template slot-scope="scope">
          <el-tag type="info" size="small">
            {{ shiftMap[scope.row.shiftId] || scope.row.shiftId }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="الراتب الشهري" align="center" prop="salary" />
      
      <el-table-column label="مشرف؟" align="center" prop="isSupervisor" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isSupervisor == '1' ? 'success' : 'info'" size="small">
            {{ scope.row.isSupervisor == '1' ? 'نعم' : 'لا' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="المشرف" align="center" prop="supervisorId" width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.supervisorId" type="primary" size="small">
            {{ getSupervisorName(scope.row.supervisorId) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

        <el-table-column label="عدد المرؤوسين" align="center" width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.isSupervisor == '1'">
              <el-button 
                size="small" 
                :type="getSuperviseesCount(scope.row.superviseesIds) > 0 ? 'primary' : 'info'"
                @click="viewSupervisees(scope.row)"
                :disabled="getSuperviseesCount(scope.row.superviseesIds) === 0"
                style="padding: 7px 15px;"
              >
                <i class="el-icon-user" style="margin-right: 5px;"></i>
                <span style="font-weight: bold;">
                  {{ getSuperviseesCount(scope.row.superviseesIds) }}
                </span>
              </el-button>
            </div>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
      <el-table-column label="الإجراءات" align="center" class-name="small-padding fixed-width" width="180">
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
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- Add/Edit Employee Dialog -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="الاسم" prop="name">
          <el-input v-model="form.name" placeholder="أدخل الاسم" />
        </el-form-item>

        <el-form-item label="رقم الهوية" prop="identityNumber">
          <el-input v-model="form.identityNumber" placeholder="أدخل رقم الهوية" />
        </el-form-item>

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

        <el-form-item label="الشيفت" prop="shiftId">
          <el-select
            v-model="form.shiftId"
            placeholder="اختر الشيفت"
            clearable
            filterable
          >
            <el-option
              v-for="shift in filteredShiftOptions[form.deptId] || []"
              :key="shift.id"
              :label="shift.name"
              :value="shift.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="الراتب الشهري" prop="salary">
          <el-input v-model="form.salary" placeholder="أدخل الراتب الشهري" />
        </el-form-item>

        <el-form-item label="المشرف" prop="supervisorId">
          <el-select
            v-model="form.supervisorId"
            placeholder="اختر المشرف"
            clearable
            filterable
          >
            <el-option
              v-for="supervisor in availableSupervisors"
              :key="supervisor.id"
              :label="supervisor.name"
              :value="supervisor.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="هو مشرف" prop="isSupervisor">
          <el-switch
            v-model="form.isSupervisor"
            active-value="1"
            inactive-value="0"
            active-text="نعم"
            inactive-text="لا">
          </el-switch>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">تأكيد</el-button>
        <el-button @click="cancel">إلغاء</el-button>
      </div>
    </el-dialog>

    <!-- Enhanced Assign Supervisor Dialog -->
    <el-dialog title="تعيين مشرف" :visible.sync="supervisorDialogVisible" width="600px" append-to-body>
      <el-form ref="supervisorForm" :model="supervisorForm" label-width="140px">
        <!-- Supervisor Selection -->
        <el-form-item label="اختر المشرف" required>
          <el-select
            v-model="supervisorForm.supervisorId"
            placeholder="اختر المشرف"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="supervisor in supervisorOptions"
              :key="supervisor.id"
              :label="supervisor.name + ' (ID: ' + supervisor.id + ')'"
              :value="supervisor.id"
            >
              <span style="float: left">{{ supervisor.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ getDeptName(supervisor.deptId) }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-divider></el-divider>

        <!-- Assignment Type Selection -->
        <el-form-item label="طريقة التعيين" required>
          <el-radio-group v-model="supervisorForm.assignmentType" @change="handleAssignmentTypeChange">
            <el-radio label="employees">تعيين لموظفين محددين</el-radio>
            <el-radio label="department">تعيين لقسم كامل</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Employees Multi-Select (shown when assignmentType is 'employees') -->
        <el-form-item 
          v-if="supervisorForm.assignmentType === 'employees'" 
          label="اختر الموظفين"
          required
        >
          <el-select
            v-model="supervisorForm.selectedEmployees"
            multiple
            filterable
            placeholder="ابحث واختر الموظفين"
            style="width: 100%"
            collapse-tags
          >
            <el-option
              v-for="emp in availableEmployees"
              :key="emp.id"
              :label="emp.name + ' (ID: ' + emp.id + ')'"
              :value="emp.id"
            >
              <span style="float: left">{{ emp.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ getDeptName(emp.deptId) }}
              </span>
            </el-option>
          </el-select>
          
          <!-- Show selected employees as tags -->
          <div style="margin-top: 10px;" v-if="supervisorForm.selectedEmployees.length > 0">
            <el-tag
              v-for="empId in supervisorForm.selectedEmployees"
              :key="empId"
              closable
              @close="removeSelectedEmployee(empId)"
              style="margin: 2px"
            >
              {{ getEmployeeName(empId) }}
            </el-tag>
          </div>
        </el-form-item>

        <!-- Department Selection (shown when assignmentType is 'department') -->
        <el-form-item 
          v-if="supervisorForm.assignmentType === 'department'" 
          label="اختر القسم"
          required
        >
          <el-select
            v-model="supervisorForm.selectedDepartment"
            filterable
            placeholder="ابحث واختر القسم"
            style="width: 100%"
            @change="handleDepartmentChange"
          >
            <el-option
              v-for="dept in deptOptions"
              :key="dept.deptId"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>

          <!-- Show employees count in selected department -->
          <div style="margin-top: 10px; color: #909399; font-size: 13px;" v-if="supervisorForm.selectedDepartment">
            <i class="el-icon-info"></i>
            سيتم تعيين المشرف لجميع موظفي قسم {{ getSelectedDepartmentName() }}
            ({{ getEmployeesCountInDept(supervisorForm.selectedDepartment) }} موظف)
          </div>
        </el-form-item>

        <!-- Summary Section -->
        <el-divider v-if="supervisorForm.supervisorId"></el-divider>
        <el-form-item label="ملخص" v-if="supervisorForm.supervisorId">
          <el-alert
            :title="getSummaryText()"
            type="info"
            :closable="false"
            show-icon>
          </el-alert>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSupervisorAssignment" :disabled="!canSubmit">
          تأكيد التعيين
        </el-button>
        <el-button @click="closeSupervisorDialog">إلغاء</el-button>
      </div>
    </el-dialog>

    <!-- View Supervisees Dialog -->
    <el-dialog title="المرؤوسون" :visible.sync="superviseesDialogVisible" width="700px" append-to-body>
      <el-table :data="currentSupervisees" style="width: 100%">
        <el-table-column label="المعرف" prop="id" width="80" />
        <el-table-column label="الاسم" prop="name" />
        <el-table-column label="القسم" prop="deptId">
          <template slot-scope="scope">
            {{ getDeptName(scope.row.deptId) }}
          </template>
        </el-table-column>
        <el-table-column label="الوظيفة" prop="positionId">
          <template slot-scope="scope">
            {{ getPositionName(scope.row.positionId) }}
          </template>
        </el-table-column>
        <el-table-column label="الإجراءات" width="120">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="removeSupervisee(scope.row)"
            >إزالة</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="superviseesDialogVisible = false">إغلاق</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listEmp, getEmp, delEmp, addEmp, updateEmp, assignSupervisorToEmployees, assignSupervisorToDept, removeSupervisorFromEmployees, getSupervisees } from "@/api/api/emp"
import { listArea } from "@/api/api/area"
import { listPosition } from "@/api/api/position"
import { listDept } from "@/api/api/dept"
import { listShift } from "@/api/api/shift"
import { listTimetable } from "@/api/api/timetable"

export default {
  name: "Emp",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      allEmpy : [],
      total: 0,
      empList: [],
      shiftOptions: [],
      filteredShiftOptions: {},
      shiftMap: {},
      supervisorOptions: [],
      title: "",
      open: false,
      supervisorDialogVisible: false,
      superviseesDialogVisible: false,
      currentSupervisees: [],
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
        identityNumber: null,
        postcode: null,
        email: null,
        shiftId: null,
        salary: null,
        noShift: false,
        noSalary: false,
        noSupervisor: false,
        supervisorId: null,
        isSupervisor: null
      },
      deptOptions: [],
      positionOptions: [],
      areaOptions: [],
      form: {},
      supervisorForm: {
        supervisorId: null,
        assignmentType: 'employees', // 'employees' or 'department'
        selectedEmployees: [],
        selectedDepartment: null
      },
      rules: {
        name: [
          { required: true, message: "الاسم مطلوب", trigger: "blur" }
        ]
      }
    }
  },
  computed: {
    availableSupervisors() {
      return this.allEmpy.filter(emp => 
        emp.isSupervisor == '1' && emp.id != this.form.id
      )
    },
    availableEmployees() {
      // Get all employees except the selected supervisor
      return this.allEmpy.filter(emp => emp.id != this.supervisorForm.supervisorId)
    },
    canSubmit() {
      if (!this.supervisorForm.supervisorId) return false
      
      if (this.supervisorForm.assignmentType === 'employees') {
        return this.supervisorForm.selectedEmployees.length > 0
      }
      
      if (this.supervisorForm.assignmentType === 'department') {
        return this.supervisorForm.selectedDepartment != null
      }
      
      return false
    }
  },
  created() {
    this.getList()
    this.getAllEmploys()
    this.getDeptOptions()
    this.getPositionOptions()
    this.getAreaOptions()
    this.getShiftOptions()
    this.loadShiftData()
    this.loadSupervisorOptions()
  },
  activated() {
    this.getList()
    this.getAllEmploys()
    this.getDeptOptions()
    this.getPositionOptions()
    this.getAreaOptions()
    this.getShiftOptions()
    this.loadShiftData()
    this.loadSupervisorOptions()
  },
  methods: {
    getList() {
      this.loading = true
      listEmp(this.queryParams).then(response => {
        this.empList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getAllEmploys(){
      listEmp({pageSize: 9999}).then(response => {
        this.allEmpy = response.rows
      })
    },
    async loadShiftData() {
      const shiftRes = await listShift({pageSize: 9999})
      this.allShifts = shiftRes.rows || []

      const timetableRes = await listTimetable({pageSize: 9999})
      const timetables = timetableRes.rows || []

      this.filteredShiftOptions = {}
      for (const timetable of timetables) {
        const deptId = timetable.deptId
        const shiftIds = (timetable.shiftIds || '')
          .split(',')
          .map(id => Number(id.trim()))
          .filter(id => !isNaN(id))

        this.filteredShiftOptions[deptId] = this.allShifts.filter(shift =>
          shiftIds.includes(shift.id)
        )
      }
    },

    getShiftOptions() {
      listShift({pageSize: 9999}).then(response => {
        this.shiftOptions = response.rows
        this.shiftMap = Object.fromEntries(
          response.rows.map(shift => [shift.id, shift.name])
        )
      })
    },

    loadSupervisorOptions() {
      listEmp({isSupervisor: '1', pageSize: 9999}).then(response => {
        this.supervisorOptions = response.rows
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
      const dept = this.deptOptions.find(item => item.deptId == id)
      return dept ? dept.deptName : id
    },

    getPositionName(id) {
      const pos = this.positionOptions.find(item => item.positionId == id)
      return pos ? pos.positionName : id
    },

    getAreaName(id) {
      const area = this.areaOptions.find(item => item.id == id)
      return area ? area.areaName : id
    },

    getSupervisorName(id) {
      const supervisor = this.allEmpy.find(emp => emp.id == id)
      return supervisor ? supervisor.name : id
    },

    getEmployeeName(id) {
      const emp = this.allEmpy.find(e => e.id == id)
      return emp ? emp.name : id
    },

    getSuperviseesCount(superviseesIds) {
      if (!superviseesIds) return 0
      return superviseesIds.split(',').filter(id => id.trim()).length
    },

    getSelectedDepartmentName() {
      const dept = this.deptOptions.find(d => d.deptId == this.supervisorForm.selectedDepartment)
      return dept ? dept.deptName : ''
    },

    getEmployeesCountInDept(deptId) {
      console.log(this.allEmpy)
      return this.allEmpy.filter(emp => 
        emp.deptId == deptId && emp.id != this.supervisorForm.supervisorId
      ).length
    },

    getSummaryText() {
      const supervisorName = this.getSupervisorName(this.supervisorForm.supervisorId)
      
      if (this.supervisorForm.assignmentType === 'employees') {
        const count = this.supervisorForm.selectedEmployees.length
        return `سيتم تعيين "${supervisorName}" كمشرف لـ ${count} موظف`
      } else if (this.supervisorForm.assignmentType === 'department') {
        const deptName = this.getSelectedDepartmentName()
        const count = this.getEmployeesCountInDept(this.supervisorForm.selectedDepartment)
        return `سيتم تعيين "${supervisorName}" كمشرف لجميع موظفي قسم "${deptName}" (${count} موظف)`
      }
      
      return ''
    },

    handleAssignmentTypeChange() {
      // Clear selections when changing assignment type
      this.supervisorForm.selectedEmployees = []
      this.supervisorForm.selectedDepartment = null
    },

    handleDepartmentChange(deptId) {
      // Optional: Show confirmation or additional info when department is selected
      console.log('Selected department:', deptId)
    },

    viewSupervisees(row) {
      this.loading = true
      getSupervisees(row.id).then(response => {
        this.currentSupervisees = response.data
        this.superviseesDialogVisible = true
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    removeSupervisee(row) {
      this.$modal.confirm('هل أنت متأكد من إزالة هذا الموظف من قائمة المرؤوسين؟').then(() => {
        return removeSupervisorFromEmployees(row.id.toString())
      }).then(() => {
        this.$modal.msgSuccess("تمت الإزالة بنجاح")
        this.viewSupervisees({ id: this.currentSupervisees[0].supervisorId })
        this.getList()
      }).catch(() => {})
    },

    handleAssignSupervisor() {
      // Reset the form
      this.supervisorForm = {
        supervisorId: null,
        assignmentType: 'employees',
        selectedEmployees: [],
        selectedDepartment: null
      }
      
      // If there are selected employees from the table, pre-fill them
      if (this.ids.length > 0) {
        this.supervisorForm.selectedEmployees = [...this.ids]
      }
      
      this.supervisorDialogVisible = true
    },

    removeSelectedEmployee(empId) {
      const index = this.supervisorForm.selectedEmployees.indexOf(empId)
      if (index > -1) {
        this.supervisorForm.selectedEmployees.splice(index, 1)
      }
    },

    submitSupervisorAssignment() {
      if (!this.canSubmit) {
        this.$modal.msgWarning("الرجاء إكمال جميع الحقول المطلوبة")
        return
      }

      this.loading = true

      if (this.supervisorForm.assignmentType === 'employees') {
        // Assign to specific employees
        const superviseesIds = this.supervisorForm.selectedEmployees.join(',')
        assignSupervisorToEmployees(this.supervisorForm.supervisorId, superviseesIds).then(() => {
          this.$modal.msgSuccess("تم تعيين المشرف بنجاح")
          this.closeSupervisorDialog()
          this.getList()
          this.loadSupervisorOptions()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      } else if (this.supervisorForm.assignmentType === 'department') {
        // Assign to entire department
        assignSupervisorToDept(
          this.supervisorForm.selectedDepartment, 
          this.supervisorForm.supervisorId
        ).then(() => {
          this.$modal.msgSuccess("تم تعيين المشرف للقسم بنجاح")
          this.closeSupervisorDialog()
          this.getList()
          this.loadSupervisorOptions()
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    },

    closeSupervisorDialog() {
      this.supervisorDialogVisible = false
      this.supervisorForm = {
        supervisorId: null,
        assignmentType: 'employees',
        selectedEmployees: [],
        selectedDepartment: null
      }
    },

    cancel() {
      this.open = false
      this.reset()
    },

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
        identityNumber: null,
        postcode: null,
        email: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        shiftId: null,
        salary: null,
        supervisorId: null,
        isSupervisor: '0',
        superviseesIds: null
      }
      this.resetForm("form")
    },

    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },

    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    handleAdd() {
      this.reset()
      this.open = true
      this.title = "إضافة موظف"
    },

    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getEmp(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "تعديل موظف"
      })
    },

    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            console.log("i am updating ..")
            console.log(this.form)
            updateEmp(this.form).then(response => {
              this.$modal.msgSuccess("تم التعديل بنجاح")
              this.open = false
              this.getList()
              this.loadSupervisorOptions()
            })
          } else {
            addEmp(this.form).then(response => {
              this.$modal.msgSuccess("تمت الإضافة بنجاح")
              this.open = false
              this.getList()
              this.loadSupervisorOptions()
            })
          }
        }
      })
    },

    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('هل أنت متأكد من حذف الموظف ذو الرقم "' + ids + '"؟').then(function() {
        return delEmp(ids)
      }).then(() => {
        this.getList()
        this.loadSupervisorOptions()
        this.$modal.msgSuccess("تم الحذف بنجاح")
      }).catch(() => {})
    },

    handleExport() {
      this.download('api/emp/export', {
        ...this.queryParams
      }, `emp_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.el-badge {
  margin-right: 10px;
}
</style>