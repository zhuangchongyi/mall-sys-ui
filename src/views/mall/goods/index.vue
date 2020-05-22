<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      </el-form-item>
      <el-form-item label="商品标题" prop="mainTitle">
        <el-input
          v-model="queryParams.mainTitle"
          placeholder="请输入商品标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="商品状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:goods:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:goods:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:goods:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:goods:putaway']"
          type="success"
          icon="el-icon-upload2"
          size="mini"
          :disabled="multiple"
          @click="handleStatusChange(1)"
        >上架</el-button>
        <el-button
          v-hasPermi="['mall:goods:putaway']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          :disabled="multiple"
          @click="handleStatusChange(0)"
        >下架</el-button>
        <el-button
          v-hasPermi="['mall:goods:putaway']"
          type="success"
          icon="el-icon-upload"
          size="mini"
          :disabled="single"
          @click="handleGoodsImage"
        >图片</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="goodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品编号" align="center" prop="goodsId" />
      <el-table-column label="商品主标题" align="center" prop="mainTitle" />
      <el-table-column label="商品副标题" align="center" prop="subTitle" />
      <el-table-column label="商品售价" align="center" prop="price" />
      <el-table-column label="商品原价" align="center" prop="oldPrice" />
      <el-table-column label="封面图(点击查看大图)" align="center">
        <template slot-scope="scope" prop="goodsImg">
          <el-image
            class="table-td-thumb"
            :src="checkImage(scope.row.goodsImg)"
            :preview-src-list="[checkImage(scope.row.goodsImg)]"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status===1?'success':'danger'">{{ statusFormat(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['mall:goods:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['mall:goods:edit']"
            size="mini"
            type="text"
            icon="el-icon-info"
            @click="handleUpdate(scope.row)"
          >明细</el-button>
          <el-button
            v-hasPermi="['mall:goods:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
          <el-button
            v-hasPermi="['mall:goods:edit']"
            size="mini"
            type="text"
            icon="el-icon-upload"
            @click="handleGoodsImage(scope.row)"
          >图片</el-button>
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

    <!-- 添加或修改商品管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="50%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品主标题" prop="mainTitle">
          <el-input v-model="form.mainTitle" placeholder="请输入商品主标题" />
        </el-form-item>
        <el-form-item label="商品副标题" prop="subTitle">
          <el-input v-model="form.subTitle" placeholder="请输入商品副标题" />
        </el-form-item>
        <el-form-item label="商品售价" prop="price">
          <el-input v-model="form.price" placeholder="请输入商品售价" />
        </el-form-item>
        <el-form-item label="商品原价" prop="oldPrice">
          <el-input v-model="form.oldPrice" placeholder="请输入商品原价" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 商品明细对话框 -->

    <!-- 上传商品图片 -->
    <el-dialog title="图片上传" :visible.sync="openImage" width="50%" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="商品编号" prop="uploadGoodsId">
          <el-input v-model="uploadGoodsId" :disabled="true" />
        </el-form-item>
        <el-form-item label="选择图片" prop="goodsImg">
          <el-upload
            ref="upload"
            action="#"
            list-type="picture-card"
            :multiple="false"
            :on-preview="handlePictureCardPreview"
            :before-remove="handleRemove"
            :http-request="uploadGoodsImage"
            :before-upload="beforeGoodsImageUpload"
            :file-list="fileList"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listGoods, getGoods, delGoods, addGoods, updateGoods, changeStatus } from '@/api/mall/goods'
import { uploadGoodsImage, deleteGoodsImage, listGoodsImage } from '@/api/mall/goods_image.js'
export default {
  name: 'Goods',
  data() {
    return {
      uploadGoodsId: '',
      dialogImageUrl: '',
      dialogVisible: false,
      picList: [],
      fileList: [],
      openImage: false,
      // 状态数据字典
      statusOptions: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 商品管理表格数据
      goodsList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        storeId: undefined,
        mainTitle: undefined,
        subTitle: undefined,
        price: undefined,
        oldPrice: undefined,
        status: undefined,
        createDate: undefined,
        updateDate: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('mall_goods_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 上传图片按钮操作 */
    handleGoodsImage(row) {
      this.uploadGoodsId = row.goodsId || this.ids
      console.log(this.uploadGoodsId)
      this.openImage = true
      listGoodsImage(this.uploadGoodsId).then(res => {
        this.$refs.upload.clearFiles()
        this.picList = []
        this.fileList = []
        console.log(res)
        if (res.code === 200) {
          res.data.forEach(item => {
            this.fileList.push({ name: item.imageName, url: process.env.VUE_APP_BASE_API + item.url, imageId: item.imageId })
            this.picList = this.fileList
          })
        }
      })

    },
    uploadGoodsImage(item) {
      const formData = new FormData()
      formData.append('file', item.file)
      formData.append('goodsId', this.uploadGoodsId)
      const uid = item.file.uid
      console.log(formData)
      uploadGoodsImage(formData).then(res => {
        if (res.code === 200) {
          this.msgSuccess('上传成功')
          const url = process.env.VUE_APP_BASE_API + res.url
          this.picList.push({ key: uid, url: url, imageId: res.imageId })
          // this.fileList.push({key: uid, url: url, imageId: item.imageId })
          // this.emptyUpload()
          this.resetQuery()
        } else {
          this.msgError(res.msg)
        }
      }).catch((res) => {
        this.$message.error('上传失败，请重新上传')
        this.emptyUpload()
      })
    },
    beforeGoodsImageUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPng = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG && !isPng) {
        this.$message.error('上传图片只能是 JPG或png 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return (isJPG || isPng) && isLt2M
    },
    handleRemove(file, fileList) {
      for (const i in this.picList) {
        if (this.picList[i].key === file.uid || this.picList[i].imageId === file.imageId) {
          const data = { imageId: this.picList[i].imageId, url: this.picList[i].url, goodsId: this.picList[i].goodsId }
          deleteGoodsImage(data).then(res => {
            console.log(res)
            if (res.code === 200) {
              this.msgSuccess(res.msg)
              this.picList.splice(i, 1)
              this.resetQuery()
            } else {
              this.msgError(res.msg)
              return false
            }
          }).catch((res) => {
            this.$message.error('删除失败', res.msg)
            return false
          })
        }
      }
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    /** 清空上传组件 */
    emptyUpload() {
      const mainImg = this.$refs.upload
      if (mainImg) {
        if (mainImg.length) {
          mainImg.forEach(item => {
            item.clearFiles()
          })
        } else {
          this.$refs.upload.clearFiles()
        }
      }
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 查询商品管理列表 */
    getList() {
      this.loading = true
      listGoods(this.queryParams).then(response => {
        this.goodsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.openImage = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        goodsId: undefined,
        storeId: undefined,
        mainTitle: undefined,
        subTitle: undefined,
        price: undefined,
        oldPrice: undefined,
        goodsImg: undefined,
        status: '0',
        delFlag: undefined,
        createDate: undefined,
        createBy: undefined,
        updateDate: undefined,
        updateBy: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.goodsId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加商品管理'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const goodsId = row.goodsId || this.ids
      getGoods(goodsId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改商品管理'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.goodsId != undefined) {
            updateGoods(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addGoods(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const goodsIds = row.goodsId || this.ids
      this.$confirm('是否确认删除商品编号为"' + goodsIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(function() {
        return delGoods(goodsIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    // 商品状态修改
    handleStatusChange(status) {
      const goodsIds = this.ids
      const text = status == '1' ? '上架' : '下架'
      this.$confirm('确认要 "' + text + '" 编号为 "' + goodsIds + '" 的商品?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeStatus(goodsIds, status)
      }).then(() => {
        this.getList()
        this.msgSuccess(text + '成功')
      }).catch(function() {
        console.log('取消')
      })
    }

  }
}
</script>

<style scoped>

/* 图片css */
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>
