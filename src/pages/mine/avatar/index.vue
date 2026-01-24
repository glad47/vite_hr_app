<template>
	<view class="container">
		<view class="page-body uni-content-info">
			<view class='cropper-content'>
				<view v-if="isShowImg" class="uni-corpper" :style="'width:'+cropperInitW+'px;height:'+cropperInitH+'px;background:#000'">
					<view class="uni-corpper-content" :style="'width:'+cropperW+'px;height:'+cropperH+'px;left:'+cropperL+'px;top:'+cropperT+'px'">
						<image :src="imageSrc" :style="'width:'+cropperW+'px;height:'+cropperH+'px'"></image>
						<view class="uni-corpper-crop-box" @touchstart.stop="contentStartMove" @touchmove.stop="contentMoveing" @touchend.stop="contentTouchEnd"
						    :style="'left:'+cutL+'px;top:'+cutT+'px;right:'+cutR+'px;bottom:'+cutB+'px'">
							<view class="uni-cropper-view-box">
								<view class="uni-cropper-dashed-h"></view>
								<view class="uni-cropper-dashed-v"></view>
								<view class="uni-cropper-line-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-tr" data-drag="topTight"></view>
								<view class="uni-cropper-point point-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-rb" data-drag="rightBottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-bl" data-drag="bottomLeft"></view>
								<view class="uni-cropper-point point-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-lt" data-drag="leftTop"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class='cropper-config'>
				<button type="primary reverse" @click="getImage" style='margin-top: 30rpx;'> اختيار الصورة </button>
				<button type="warn" @click="getImageInfo" style='margin-top: 30rpx;'> إرسال </button>
			</view>
			<canvas canvas-id="myCanvas" :style="'position:absolute;border: 1px solid red; width:'+imageW+'px;height:'+imageH+'px;top:-9999px;left:-9999px;'"></canvas>
		</view>
	</view>
</template>

<script>
  import config from '@/config'
  import store from "@/store"
  import { uploadAvatar } from "@/api/system/user"
  
  const baseUrl = config.baseUrl
	let sysInfo = uni.getSystemInfoSync()
	let SCREEN_WIDTH = sysInfo.screenWidth
	let PAGE_X, // موضع x عند الضغط
		PAGE_Y, // موضع y عند الضغط 
		PR = sysInfo.pixelRatio, // dpi
		T_PAGE_X, // موضع x عند الحركة
		T_PAGE_Y, // موضع Y عند الحركة
		CUT_L, // قيمة left الأولية لعنصر السحب
		CUT_T, // قيمة top الأولية لعنصر السحب
		CUT_R, // قيمة right الأولية لعنصر السحب
		CUT_B, // قيمة bottom الأولية لعنصر السحب
		CUT_W, // عرض عنصر السحب الأولي
		CUT_H, //  ارتفاع عنصر السحب الأولي
		IMG_RATIO, // نسبة الصورة
		IMG_REAL_W, // العرض الفعلي للصورة
		IMG_REAL_H, // الارتفاع الفعلي للصورة
		DRAFG_MOVE_RATIO = 1, // النسبة عند الحركة,
		INIT_DRAG_POSITION = 100, // الفرق بين عرض الشاشة الأولي وعرض منطقة القص، لتعيين عرض القص الأولي
		DRAW_IMAGE_W = sysInfo.screenWidth // تعيين عرض الصورة المُنشأة

	export default {
		/**
		 * البيانات الأولية للصفحة
		 */
		data() {
			return {
				imageSrc: store.getters.avatar,
				isShowImg: false,
				// العرض والارتفاع الأوليان
				cropperInitW: SCREEN_WIDTH,
				cropperInitH: SCREEN_WIDTH,
				// العرض والارتفاع الديناميكيان
				cropperW: SCREEN_WIDTH,
				cropperH: SCREEN_WIDTH,
				// قيم left و top الديناميكية
				cropperL: 0,
				cropperT: 0,

				transL: 0,
				transT: 0,

				// قيمة تكبير/تصغير الصورة
				scaleP: 0,
				imageW: 0,
				imageH: 0,

				// عرض وارتفاع إطار القص
				cutL: 0,
				cutT: 0,
				cutB: SCREEN_WIDTH,
				cutR: '100%',
				qualityWidth: DRAW_IMAGE_W,
				innerAspectRadio: DRAFG_MOVE_RATIO
			}
		},
		/**
		 * دالة دورة الحياة - الاستماع لإكمال العرض الأولي للصفحة
		 */
		onReady: function () {
			this.loadImage()
		},
		methods: {
			setData: function (obj) {
				let that = this
				Object.keys(obj).forEach(function (key) {
					that.$set(that.$data, key, obj[key])
				})
			},
			getImage: function () {
				var _this = this
				uni.chooseImage({
					success: function (res) {
						_this.setData({
							imageSrc: res.tempFilePaths[0],
						})
						_this.loadImage()
					},
				})
			},
			loadImage: function () {
				var _this = this

				uni.getImageInfo({
					src: _this.imageSrc,
					success: function success(res) {
						IMG_RATIO = 1 / 1
						if (IMG_RATIO >= 1) {
							IMG_REAL_W = SCREEN_WIDTH
							IMG_REAL_H = SCREEN_WIDTH / IMG_RATIO
						} else {
							IMG_REAL_W = SCREEN_WIDTH * IMG_RATIO
							IMG_REAL_H = SCREEN_WIDTH
						}
						let minRange = IMG_REAL_W > IMG_REAL_H ? IMG_REAL_W : IMG_REAL_H
						INIT_DRAG_POSITION = minRange > INIT_DRAG_POSITION ? INIT_DRAG_POSITION : minRange
						// عرض تأثيرات مختلفة حسب عرض وارتفاع الصورة لضمان عرض الصورة بشكل طبيعي
						if (IMG_RATIO >= 1) {
							let cutT = Math.ceil((SCREEN_WIDTH / IMG_RATIO - (SCREEN_WIDTH / IMG_RATIO - INIT_DRAG_POSITION)) / 2)
							let cutB = cutT
							let cutL = Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH + INIT_DRAG_POSITION) / 2)
							let cutR = cutL
							_this.setData({
								cropperW: SCREEN_WIDTH,
								cropperH: SCREEN_WIDTH / IMG_RATIO,
								// تهيئة left و right
								cropperL: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2),
								cropperT: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH / IMG_RATIO) / 2),
								cutL: cutL,
								cutT: cutT,
								cutR: cutR,
								cutB: cutB,
								// قيمة تكبير/تصغير الصورة
								imageW: IMG_REAL_W,
								imageH: IMG_REAL_H,
								scaleP: IMG_REAL_W / SCREEN_WIDTH,
								qualityWidth: DRAW_IMAGE_W,
								innerAspectRadio: IMG_RATIO
							})
						} else {
							let cutL = Math.ceil((SCREEN_WIDTH * IMG_RATIO - (SCREEN_WIDTH * IMG_RATIO)) / 2)
							let cutR = cutL
							let cutT = Math.ceil((SCREEN_WIDTH - INIT_DRAG_POSITION) / 2)
							let cutB = cutT
							_this.setData({
								cropperW: SCREEN_WIDTH * IMG_RATIO,
								cropperH: SCREEN_WIDTH,
								// تهيئة left و right
								cropperL: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH * IMG_RATIO) / 2),
								cropperT: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2),

								cutL: cutL,
								cutT: cutT,
								cutR: cutR,
								cutB: cutB,
								// قيمة تكبير/تصغير الصورة
								imageW: IMG_REAL_W,
								imageH: IMG_REAL_H,
								scaleP: IMG_REAL_W / SCREEN_WIDTH,
								qualityWidth: DRAW_IMAGE_W,
								innerAspectRadio: IMG_RATIO
							})
						}
						_this.setData({
							isShowImg: true
						})
						uni.hideLoading()
					}
				})
			},
			// حدث touchStart الذي يتم تشغيله عند السحب
			contentStartMove(e) {
				PAGE_X = e.touches[0].pageX
				PAGE_Y = e.touches[0].pageY
			},

			// حدث touchMove الذي يتم تشغيله عند السحب
			contentMoveing(e) {
				var _this = this
				var dragLengthX = (PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
				var dragLengthY = (PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
				// الانتقال لليسار
				if (dragLengthX > 0) {
					if (this.cutL - dragLengthX < 0) dragLengthX = this.cutL
				} else {
					if (this.cutR + dragLengthX < 0) dragLengthX = -this.cutR
				}

				if (dragLengthY > 0) {
					if (this.cutT - dragLengthY < 0) dragLengthY = this.cutT
				} else {
					if (this.cutB + dragLengthY < 0) dragLengthY = -this.cutB
				}
				this.setData({
					cutL: this.cutL - dragLengthX,
					cutT: this.cutT - dragLengthY,
					cutR: this.cutR + dragLengthX,
					cutB: this.cutB + dragLengthY
				})

				PAGE_X = e.touches[0].pageX
				PAGE_Y = e.touches[0].pageY
			},

			contentTouchEnd() {

			},

			// الحصول على الصورة
			getImageInfo() {
				var _this = this
				uni.showLoading({
					title: 'جاري إنشاء الصورة...',
				})
				// كتابة الصورة على اللوحة
				const ctx = uni.createCanvasContext('myCanvas')
				ctx.drawImage(_this.imageSrc, 0, 0, IMG_REAL_W, IMG_REAL_H)
				ctx.draw(true, () => {
					// الحصول على موضع وعرض القص على اللوحة - كلاهما نسبة مئوية * عرض الصورة في اللوحة - يضمن حل مشكلة ضبابية الصورة وموضعها غير الصحيح في برنامج WeChat المصغر canvasT = (_this.cutT / _this.cropperH) * (_this.imageH / pixelRatio)
					var canvasW = ((_this.cropperW - _this.cutL - _this.cutR) / _this.cropperW) * IMG_REAL_W
					var canvasH = ((_this.cropperH - _this.cutT - _this.cutB) / _this.cropperH) * IMG_REAL_H
					var canvasL = (_this.cutL / _this.cropperW) * IMG_REAL_W
					var canvasT = (_this.cutT / _this.cropperH) * IMG_REAL_H
					uni.canvasToTempFilePath({
						x: canvasL,
						y: canvasT,
						width: canvasW,
						height: canvasH,
						destWidth: canvasW,
						destHeight: canvasH,
						quality: 0.5,
						canvasId: 'myCanvas',
						success: function (res) {
							uni.hideLoading()
							let data = {name: 'avatarfile', filePath: res.tempFilePath}
							uploadAvatar(data).then(response => {
								store.commit('SET_AVATAR', baseUrl + response.imgUrl)
								uni.showToast({ title: "تم التعديل بنجاح", icon: 'success' })
								uni.navigateBack()
							})
						}
					})
				})
			},
			// حدث touchStart الذي يتم تشغيله عند تعيين الحجم
			dragStart(e) {
				T_PAGE_X = e.touches[0].pageX
				T_PAGE_Y = e.touches[0].pageY
				CUT_L = this.cutL
				CUT_R = this.cutR
				CUT_B = this.cutB
				CUT_T = this.cutT
			},

			// حدث touchMove الذي يتم تشغيله عند تعيين الحجم
			dragMove(e) {
				var _this = this
				var dragType = e.target.dataset.drag
				switch (dragType) {
					case 'right':
						var dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
						if (CUT_R + dragLength < 0) dragLength = -CUT_R
						this.setData({
							cutR: CUT_R + dragLength
						})
						break
					case 'left':
						var dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
						if (CUT_L - dragLength < 0) dragLength = CUT_L
						if ((CUT_L - dragLength) > (this.cropperW - this.cutR)) dragLength = CUT_L - (this.cropperW - this.cutR)
						this.setData({
							cutL: CUT_L - dragLength
						})
						break
					case 'top':
						var dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
						if (CUT_T - dragLength < 0) dragLength = CUT_T
						if ((CUT_T - dragLength) > (this.cropperH - this.cutB)) dragLength = CUT_T - (this.cropperH - this.cutB)
						this.setData({
							cutT: CUT_T - dragLength
						})
						break
					case 'bottom':
						var dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
						if (CUT_B + dragLength < 0) dragLength = -CUT_B
						this.setData({
							cutB: CUT_B + dragLength
						})
						break
					case 'rightBottom':
						var dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
						var dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO

						if (CUT_B + dragLengthY < 0) dragLengthY = -CUT_B
						if (CUT_R + dragLengthX < 0) dragLengthX = -CUT_R
						let cutB = CUT_B + dragLengthY
						let cutR = CUT_R + dragLengthX

						this.setData({
							cutB: cutB,
							cutR: cutR
						})
						break
					default:
						break
				}
			}
		}
	}
</script>

<style scoped>
	.cropper-config {
		padding: 20rpx 40rpx;
	}

	.cropper-content {
		min-height: 750rpx;
		width: 100%;
	}

	.uni-corpper {
		position: relative;
		overflow: hidden;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		box-sizing: border-box;
	}

	.uni-corpper-content {
		position: relative;
	}

	.uni-corpper-content image {
		display: block;
		width: 100%;
		min-width: 0 !important;
		max-width: none !important;
		height: 100%;
		min-height: 0 !important;
		max-height: none !important;
		image-orientation: 0deg !important;
		margin: 0 auto;
	}

	/* تأثير تحريك الصورة */
	.uni-cropper-drag-box {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		cursor: move;
		background: rgba(0, 0, 0, 0.6);
		z-index: 1;
	}

	/* المعلومات الداخلية */
	.uni-corpper-crop-box {
		position: absolute;
		background: rgba(255, 255, 255, 0.3);
		z-index: 2;
	}

	.uni-corpper-crop-box .uni-cropper-view-box {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
		outline: 1rpx solid #69f;
		outline-color: rgba(102, 153, 255, .75)
	}

	/* خط منقط أفقي */
	.uni-cropper-dashed-h {
		position: absolute;
		top: 33.33333333%;
		left: 0;
		width: 100%;
		height: 33.33333333%;
		border-top: 1rpx dashed rgba(255, 255, 255, 0.5);
		border-bottom: 1rpx dashed rgba(255, 255, 255, 0.5);
	}

	/* خط منقط عمودي */
	.uni-cropper-dashed-v {
		position: absolute;
		left: 33.33333333%;
		top: 0;
		width: 33.33333333%;
		height: 100%;
		border-left: 1rpx dashed rgba(255, 255, 255, 0.5);
		border-right: 1rpx dashed rgba(255, 255, 255, 0.5);
	}

	/* خطوط الاتجاهات الأربعة - لأحداث السحب اللاحقة*/
	.uni-cropper-line-t {
		position: absolute;
		display: block;
		width: 100%;
		background-color: #69f;
		top: 0;
		left: 0;
		height: 1rpx;
		opacity: 0.1;
		cursor: n-resize;
	}

	.uni-cropper-line-t::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 0rpx;
		width: 100%;
		-webkit-transform: translate3d(0, -50%, 0);
		transform: translate3d(0, -50%, 0);
		bottom: 0;
		height: 41rpx;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-r {
		position: absolute;
		display: block;
		background-color: #69f;
		top: 0;
		right: 0rpx;
		width: 1rpx;
		opacity: 0.1;
		height: 100%;
		cursor: e-resize;
	}

	.uni-cropper-line-r::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		width: 41rpx;
		-webkit-transform: translate3d(-50%, 0, 0);
		transform: translate3d(-50%, 0, 0);
		bottom: 0;
		height: 100%;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-b {
		position: absolute;
		display: block;
		width: 100%;
		background-color: #69f;
		bottom: 0;
		left: 0;
		height: 1rpx;
		opacity: 0.1;
		cursor: s-resize;
	}

	.uni-cropper-line-b::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 0rpx;
		width: 100%;
		-webkit-transform: translate3d(0, -50%, 0);
		transform: translate3d(0, -50%, 0);
		bottom: 0;
		height: 41rpx;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-l {
		position: absolute;
		display: block;
		background-color: #69f;
		top: 0;
		left: 0;
		width: 1rpx;
		opacity: 0.1;
		height: 100%;
		cursor: w-resize;
	}

	.uni-cropper-line-l::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		width: 41rpx;
		-webkit-transform: translate3d(-50%, 0, 0);
		transform: translate3d(-50%, 0, 0);
		bottom: 0;
		height: 100%;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-point {
		width: 5rpx;
		height: 5rpx;
		background-color: #69f;
		opacity: .75;
		position: absolute;
		z-index: 3;
	}

	.point-t {
		top: -3rpx;
		left: 50%;
		margin-left: -3rpx;
		cursor: n-resize;
	}

	.point-tr {
		top: -3rpx;
		left: 100%;
		margin-left: -3rpx;
		cursor: n-resize;
	}

	.point-r {
		top: 50%;
		left: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-rb {
		left: 100%;
		top: 100%;
		-webkit-transform: translate3d(-50%, -50%, 0);
		transform: translate3d(-50%, -50%, 0);
		cursor: n-resize;
		width: 36rpx;
		height: 36rpx;
		background-color: #69f;
		position: absolute;
		z-index: 1112;
		opacity: 1;
	}

	.point-b {
		left: 50%;
		top: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-bl {
		left: 0%;
		top: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-l {
		left: 0%;
		top: 50%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-lt {
		left: 0%;
		top: 0%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	/* محتوى معاينة إطار القص */
	.uni-cropper-viewer {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.uni-cropper-viewer image {
		position: absolute;
		z-index: 2;
	}
</style>
