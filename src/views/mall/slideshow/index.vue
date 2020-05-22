<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
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
          v-hasPermi="['mall:slideshow:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="slideshowList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="slideshowId" />
      <el-table-column label="图片(点击查看大图)" align="center">
        <template slot-scope="scope" prop="url">
          <el-image
            class="table-td-thumb"
            :src="checkImage(scope.row.url)"
            :preview-src-list="[checkImage(scope.row.url)]"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status===1?'success':'danger'">{{ statusFormat(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['mall:slideshow:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['mall:slideshow:edit']"
            size="mini"
            type="text"
            icon="el-icon-lock"
            @click="handleStatus(scope.row)"
          >启用 | 停用</el-button>
          <el-button
            v-hasPermi="['mall:slideshow:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 添加或修改轮播图对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="排序" prop="sort">
          <!-- </el-input-number><el-input v-model="form.sort" placeholder="请输入排序" /> -->
          <el-input-number v-model="form.sort" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="图片地址" prop="url">
          <el-upload
            action="#"
            list-type="picture-card"
            :before-upload="beforeAvatarUpload"
            :multiple="true"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="form.url" alt="">
          </el-dialog>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSlideshow, getSlideshow, delSlideshow, addSlideshow, updateSlideshow, updateSlideshowStatus } from '@/api/mall/slideshow'

export default {
  name: 'Slideshow',
  data() {
    return {
      // 上传图片
      dialogImageUrl: '',
      dialogVisible: false,
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
      // 轮播图表格数据
      slideshowList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 5,
        url: undefined,
        status: undefined,
        sort: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        sort: [
          { required: true, message: '必填项', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_start_stop').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    // 上传之前的钩子函数
    beforeAvatarUpload(file) {
      const fd = new FormData()
      this.$refs['form'].validate(valid => {
        if (valid) {
          fd.append('file', file)// 传文件
          fd.append('sort', this.form.sort)// 传其他参数
          addSlideshow(fd).then(response => {
            if (response.code === 200) {
              this.msgSuccess('新增成功')
              this.resetQuery()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
      return false// 屏蔽了action的默认上传
    },
    /** 查询轮播图列表 */
    getList() {
      this.loading = true
      listSlideshow(this.queryParams).then(response => {
        this.slideshowList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        slideshowId: undefined,
        url: undefined,
        status: undefined,
        sort: undefined
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
      this.ids = selection.map(item => item.slideshowId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加轮播图'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const slideshowId = row.slideshowId || this.ids
      getSlideshow(slideshowId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改轮播图'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.slideshowId != undefined) {
            updateSlideshow(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            this.open = false
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const slideshowIds = row.slideshowId || this.ids
      this.$confirm('是否确认删除轮播图编号为"' + slideshowIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delSlideshow(slideshowIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /* 修改状态 */
    handleStatus(row) {
      const data = { status: '', slideshowId: '' }
      data.status = row.status === 0 ? 1 : 0
      data.slideshowId = row.slideshowId
      const text = this.statusFormat(data)
      this.$confirm('是否确认 "' + text + '" 编号为 "' + row.slideshowId + '" 的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateSlideshowStatus(data)
      }).then(() => {
        this.getList()
        this.msgSuccess(text + '成功')
      }).catch(function() {})
    }
  }
}
</script>
<style scoped >
/deep/ .el-image__inner, .el-image__placeholder, .el-image__error {
    width: 50%;
    height: 50%;
}
</style>
