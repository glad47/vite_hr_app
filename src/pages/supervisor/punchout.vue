<template>
  <view class="punch-out-page">
    <!-- Header -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">تسجيل الانصراف</text>
        <text class="header-subtitle">يجب التقاط 30 صورة بالكاميرا</text>
      </view>
    </view>

    <view class="content">
      <!-- Status Card -->
      <view class="status-card">
        <view class="status-icon-wrapper" :class="allPhotosTaken ? 'status-ready' : 'status-pending'">
          <uni-icons :type="allPhotosTaken ? 'checkmarkempty' : 'camera'" size="36" color="#fff"></uni-icons>
        </view>
        <view class="status-info">
          <text class="status-count">{{ photos.length }} / 30</text>
          <text class="status-label">{{ allPhotosTaken ? 'جاهز للتسجيل' : 'صور مطلوبة' }}</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: (photos.length / 30 * 100) + '%' }"></view>
        </view>
      </view>

      <!-- Photo Grid -->
      <view class="section">
        <text class="section-title">الصور الملتقطة</text>
        <view class="photo-grid">
          <view v-for="(photo, index) in 30" :key="index" class="photo-slot" @click="takePhoto(index)">
            <image v-if="photos[index]" :src="photos[index]" mode="aspectFill" class="photo-image"></image>
            <view v-else class="photo-placeholder">
              <uni-icons type="camera-filled" size="28" :color="index === photos.length ? '#76c4cc' : '#d1d5db'"></uni-icons>
              <text class="photo-number">{{ index + 1 }}</text>
            </view>
            <view v-if="photos[index]" class="photo-delete" @click.stop="removePhoto(index)">
              <uni-icons type="close" size="16" color="#fff"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <!-- Take Photo Button -->
      <view class="action-section">
        <button v-if="!allPhotosTaken" class="btn-capture" @click="takeNextPhoto" :disabled="uploading">
          <uni-icons type="camera-filled" size="24" color="#fff"></uni-icons>
          <text class="btn-text">التقاط صورة {{ photos.length + 1 }} من 30</text>
        </button>

        <button v-if="allPhotosTaken" class="btn-submit" @click="submitPunchOut" :disabled="uploading">
          <uni-icons v-if="!uploading" type="checkmarkempty" size="24" color="#fff"></uni-icons>
          <text class="btn-text">{{ uploading ? 'جاري الرفع... ' + uploadProgress + '%' : 'تسجيل الانصراف' }}</text>
        </button>
      </view>

      <!-- Upload Progress -->
      <view v-if="uploading" class="upload-progress">
        <view class="upload-bar">
          <view class="upload-fill" :style="{ width: uploadProgress + '%' }"></view>
        </view>
        <text class="upload-text">جاري رفع الصور... {{ uploadedCount }} / 30</text>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config'
import { getToken } from '@/utils/auth'
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export default {
  name: 'SupervisorPunchOut',
  components: { uniIcons },
  data() {
    return {
      photos: [], // array of tempFilePaths (strings)
      uploading: false,
      uploadProgress: 0,
      uploadedCount: 0
    }
  },
  computed: {
    allPhotosTaken() {
      return this.photos.length === 30
    }
  },
  methods: {
    takePhoto(index) {
      if (this.photos[index]) return
      if (index !== this.photos.length) return
      this.takeNextPhoto()
    },

    takeNextPhoto() {
      if (this.photos.length >= 30) return

      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        sizeType: ['compressed'],
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.photos.push(res.tempFilePaths[0])
            uni.vibrateShort()
            if (this.photos.length === 30) {
              uni.showToast({ title: 'تم التقاط جميع الصور!', icon: 'success' })
            }
          }
        },
        fail: (err) => {
          if (err.errMsg && !err.errMsg.includes('cancel')) {
            uni.showToast({ title: 'فشل فتح الكاميرا', icon: 'none' })
          }
        }
      })
    },

    removePhoto(index) {
      uni.showModal({
        title: 'حذف الصورة',
        content: 'هل تريد حذف الصورة رقم ' + (index + 1) + '؟ سيتم حذف جميع الصور بعدها.',
        success: (res) => {
          if (res.confirm) {
            this.photos.splice(index)
          }
        }
      })
    },

    async submitPunchOut() {
      if (this.photos.length !== 30) {
        uni.showToast({ title: 'يجب التقاط 30 صورة', icon: 'none' })
        return
      }

      this.uploading = true
      this.uploadProgress = 0
      this.uploadedCount = 0

      const baseUrl = config.baseUrl
      const token = getToken()

      try {
        // Upload all 20 photos one by one using uni.uploadFile
        // The backend expects all 20 in one request with param name "photos"
        // But uni.uploadFile only supports one file at a time
        // So we'll upload them all in a single multipart request using XMLHttpRequest

        const boundary = '----FormBoundary' + Date.now()
        const parts = []

        for (let i = 0; i < this.photos.length; i++) {
          const filePath = this.photos[i]

          // Read file as base64 using getFileSystemManager (works in uni-app)
          const fileData = await this.readFileAsArrayBuffer(filePath)
          
          // Get filename
          const fileName = 'photo_' + (i + 1) + '.jpg'

          parts.push({
            name: 'photos',
            fileName: fileName,
            data: fileData,
            contentType: 'image/jpeg'
          })

          this.uploadedCount = i + 1
          this.uploadProgress = Math.round(((i + 1) / 30) * 50)
        }

        // Now send all files in one request
        this.uploadProgress = 60

        const result = await this.uploadMultipleFiles(baseUrl + '/api/manager-attendance/punchout', parts, token)

        this.uploadProgress = 100

        if (result.code === 200) {
          uni.showModal({
            title: 'تم بنجاح',
            content: 'تم تسجيل الانصراف بنجاح مع 30 صورة',
            showCancel: false,
            success: () => {
              this.photos = []
              uni.navigateBack()
            }
          })
        } else {
          uni.showToast({ title: result.msg || 'فشل التسجيل', icon: 'none', duration: 3000 })
        }
      } catch (err) {
        console.error('Upload error:', err)
        uni.showToast({ title: 'فشل رفع الصور: ' + (err.message || err), icon: 'none', duration: 3000 })
      } finally {
        this.uploading = false
      }
    },

    readFileAsArrayBuffer(filePath) {
      return new Promise((resolve, reject) => {
        // #ifdef H5
        // For H5/browser: fetch the blob
        fetch(filePath)
          .then(r => r.arrayBuffer())
          .then(resolve)
          .catch(reject)
        // #endif

        // #ifndef H5
        // For native (App/MP): use file system manager
        const fs = uni.getFileSystemManager()
        fs.readFile({
          filePath: filePath,
          success: (res) => resolve(res.data),
          fail: (err) => reject(err)
        })
        // #endif
      })
    },

    uploadMultipleFiles(url, parts, token) {
      return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2)
        
        // Build multipart body manually
        const chunks = []
        const encoder = new TextEncoder()

        for (const part of parts) {
          chunks.push(encoder.encode(
            '--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="' + part.name + '"; filename="' + part.fileName + '"\r\n' +
            'Content-Type: ' + part.contentType + '\r\n\r\n'
          ))
          chunks.push(new Uint8Array(part.data))
          chunks.push(encoder.encode('\r\n'))
        }
        chunks.push(encoder.encode('--' + boundary + '--\r\n'))

        // Concatenate all chunks
        let totalLen = 0
        for (const c of chunks) totalLen += c.length
        const body = new Uint8Array(totalLen)
        let offset = 0
        for (const c of chunks) {
          body.set(c, offset)
          offset += c.length
        }

        const xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)
        xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)
        xhr.setRequestHeader('Authorization', 'Bearer ' + token)
        xhr.responseType = 'json'

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            this.uploadProgress = 60 + Math.round((e.loaded / e.total) * 40)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response)
          } else {
            reject(new Error('HTTP ' + xhr.status))
          }
        }

        xhr.onerror = () => reject(new Error('Network error'))
        xhr.ontimeout = () => reject(new Error('Timeout'))
        xhr.timeout = 300000 // 5 minutes

        xhr.send(body.buffer)
      })
    }
  }
}
</script>

<style scoped>
.punch-out-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #76c4cc 0%, #4a9da6 100%);
  direction: rtl;
}

.header { padding: 60rpx 30rpx 30rpx; }
.header-content { display: flex; flex-direction: column; gap: 8rpx; }
.header-title { font-size: 44rpx; font-weight: 800; color: #fff; }
.header-subtitle { font-size: 26rpx; color: rgba(255,255,255,0.85); }

.content {
  background: #f8fafc;
  border-radius: 40rpx 40rpx 0 0;
  padding: 30rpx;
  min-height: calc(100vh - 200rpx);
}

.status-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06);
}

.status-icon-wrapper {
  width: 70rpx; height: 70rpx;
  border-radius: 18rpx;
  display: flex; align-items: center; justify-content: center;
}
.status-pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
.status-ready { background: linear-gradient(135deg, #10b981, #059669); }

.status-info { flex: 1; display: flex; flex-direction: column; gap: 4rpx; }
.status-count { font-size: 36rpx; font-weight: 800; color: #1e293b; }
.status-label { font-size: 24rpx; color: #64748b; }

.progress-bar { width: 100%; height: 10rpx; background: #e2e8f0; border-radius: 10rpx; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #76c4cc, #4a9da6); border-radius: 10rpx; transition: width 0.3s; }

.section { margin-bottom: 30rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #1e293b; margin-bottom: 16rpx; display: block; }

.photo-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.photo-slot { width: calc(25% - 9rpx); aspect-ratio: 1; border-radius: 16rpx; overflow: hidden; position: relative; }
.photo-image { width: 100%; height: 100%; }
.photo-placeholder {
  width: 100%; height: 100%;
  background: #fff; border: 3rpx dashed #d1d5db; border-radius: 16rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4rpx;
}
.photo-number { font-size: 20rpx; color: #94a3b8; font-weight: 600; }
.photo-delete {
  position: absolute; top: 6rpx; left: 6rpx;
  width: 36rpx; height: 36rpx;
  background: rgba(239,68,68,0.9); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.action-section { margin-top: 30rpx; margin-bottom: 20rpx; }
.btn-capture, .btn-submit {
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  width: 100%; padding: 28rpx; border-radius: 50rpx; border: none;
  font-size: 30rpx; font-weight: 700; color: #fff;
}
.btn-capture { background: linear-gradient(135deg, #76c4cc, #4a9da6); box-shadow: 0 10rpx 30rpx rgba(118,196,204,0.4); }
.btn-submit { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 10rpx 30rpx rgba(16,185,129,0.4); }
.btn-capture[disabled], .btn-submit[disabled] { opacity: 0.6; }
.btn-text { color: #fff; font-size: 30rpx; font-weight: 700; }

.upload-progress { margin-top: 20rpx; text-align: center; }
.upload-bar { height: 12rpx; background: #e2e8f0; border-radius: 12rpx; overflow: hidden; margin-bottom: 12rpx; }
.upload-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 12rpx; transition: width 0.3s; }
.upload-text { font-size: 24rpx; color: #64748b; }
</style>
