<template>
  <div class="app-container">
    <div class="page-header">
      <h2>سجل حضور المشرفين</h2>
      <p>عرض جميع سجلات انصراف المشرفين مع الصور المرفقة</p>
    </div>

    <!-- Search Form -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px" class="mb8">
      <el-form-item label="المشرف" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="معرف المشرف" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="من تاريخ" prop="beginTime">
        <el-date-picker v-model="queryParams.beginTime" type="date" value-format="yyyy-MM-dd" placeholder="من" />
      </el-form-item>
      <el-form-item label="إلى تاريخ" prop="endTime">
        <el-date-picker v-model="queryParams.endTime" type="date" value-format="yyyy-MM-dd" placeholder="إلى" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">بحث</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">إعادة تعيين</el-button>
      </el-form-item>
    </el-form>

    <!-- Table -->
    <el-table v-loading="loading" :data="attendanceList" border stripe>
      <el-table-column label="#" type="index" width="55" align="center" />
      <el-table-column label="اسم المشرف" prop="userName" width="160" />
      <el-table-column label="وقت الانصراف" prop="punchOutTime" width="180" />
      <el-table-column label="عدد الصور" prop="photoCount" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.photoCount === 20 ? 'success' : 'danger'" size="small">
            {{ scope.row.photoCount }} / 20
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="الحالة" width="100" align="center">
        <template slot-scope="scope">
          <el-tag type="success" size="small">مكتمل</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="الصور" min-width="200">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-picture" @click="viewPhotos(scope.row)">
            عرض الصور ({{ scope.row.photoCount }})
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="تاريخ الإنشاء" prop="createTime" width="160" />
    </el-table>

    <!-- Pagination -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- Photo Viewer Dialog -->
    <el-dialog title="صور الانصراف" :visible.sync="photoDialogVisible" width="80%" top="5vh">
      <div class="photo-grid" v-if="currentPhotos.length > 0">
        <div v-for="(url, index) in currentPhotos" :key="index" class="photo-item">
          <el-image :src="url" :preview-src-list="currentPhotos" fit="cover" class="photo-thumb">
            <div slot="error" class="image-error">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
          <span class="photo-number">{{ index + 1 }}</span>
        </div>
      </div>
      <el-empty v-else description="لا توجد صور" />
    </el-dialog>
  </div>
</template>

<script>
import { listManagerAttendance } from '@/api/api/managerAttendance'

export default {
  name: 'ManagerAttendance',
  data() {
    return {
      loading: false,
      attendanceList: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        userId: null,
        beginTime: null,
        endTime: null
      },
      photoDialogVisible: false,
      currentPhotos: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const params = { ...this.queryParams }
      if (params.beginTime) params['params[beginTime]'] = params.beginTime
      if (params.endTime) params['params[endTime]'] = params.endTime
      delete params.beginTime
      delete params.endTime
      listManagerAttendance(params).then(res => {
        this.attendanceList = res.rows || []
        this.total = res.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    viewPhotos(row) {
      this.currentPhotos = row.photoUrls ? row.photoUrls.split(',') : []
      this.photoDialogVisible = true
    }
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 5px; color: #1a365d; }
.page-header p { margin: 0; color: #64748b; font-size: 14px; }
.photo-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}
.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.photo-thumb {
  width: 100%;
  height: 100%;
}
.photo-number {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}
.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 30px;
}
</style>
