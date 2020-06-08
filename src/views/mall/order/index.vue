<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下单时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          clearable
          size="small"
          style="width: 200px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择下单时间"
        />
      </el-form-item>
      <el-form-item label="发货时间" prop="deliveryTime">
        <el-date-picker
          v-model="queryParams.deliveryTime"
          clearable
          size="small"
          style="width: 200px"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择发货时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:order:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:order:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:order:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['mall:order:export']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange" style="width: 100%;">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="orderId" />
      <el-table-column label="订单号" align="center" prop="orderNum" width="200"/>
      <!-- <el-table-column label="订单明细编号" align="center" prop="orderInfoId" /> -->
      <!-- <el-table-column label="下单人编号" align="center" prop="userId" /> -->
      <el-table-column label="订单状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status==0?'warning':scope.row.status==5?'danger':'success'">
          {{ statusFormat(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总计金额(￥)" align="center" prop="totalPrice" width="110"/>
      <el-table-column label="运费(￥)" align="center" prop="freight" width="110"/>
      <el-table-column label="数量" align="center" prop="total" />
      <el-table-column label="收件人" align="center" prop="recipients" />
      <el-table-column label="收件手机" align="center" prop="phone" width="100"/>
      <el-table-column label="收货地址" align="center" prop="address" width="300">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>{{ scope.row.orderAddressId }}</p>
          </el-popover>
          <div slot="reference" class="name-wrapper">
            <el-tag size="medium">{{ scope.row.orderAddressId }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="留言" align="center" prop="remark" width="150" show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right">
            <p>{{ scope.row.remark }}</p>
          </el-popover>
          <div slot="reference" class="name-wrapper">
            <el-tag size="medium">{{ scope.row.remark }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" prop="createTime" width="180" />
      <el-table-column label="发货时间" align="center" prop="deliveryTime" width="180" />
      <el-table-column label="收货时间" align="center" prop="receivingTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['mall:order:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['mall:order:remove']"
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

    <!-- 添加或修改商品订单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单明细编号" prop="orderInfoId">
          <el-input v-model="form.orderInfoId" placeholder="请输入订单明细编号" />
        </el-form-item>
        <el-form-item label="下单人编号" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入下单人编号" />
        </el-form-item>
        <el-form-item label="收件地址编号" prop="orderAddressId">
          <el-input v-model="form.orderAddressId" placeholder="请输入收件地址编号" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="总计金额" prop="totalPrice">
          <el-input v-model="form.totalPrice" placeholder="请输入总计金额" />
        </el-form-item>
        <el-form-item label="运费" prop="freight">
          <el-input v-model="form.freight" placeholder="请输入运费" />
        </el-form-item>
        <el-form-item label="购买数量" prop="total">
          <el-input v-model="form.total" placeholder="请输入购买数量" />
        </el-form-item>
        <el-form-item label="发货时间" prop="deliveryTime">
          <el-date-picker
            v-model="form.deliveryTime"
            clearable
            size="small"
            style="width: 200px"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择发货时间"
          />
        </el-form-item>
        <el-form-item label="收货时间" prop="receivingTime">
          <el-date-picker
            v-model="form.receivingTime"
            clearable
            size="small"
            style="width: 200px"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择收货时间"
          />
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
import { listOrder, getOrder, delOrder, addOrder, updateOrder, exportOrder } from '@/api/mall/order'

export default {
  name: 'Order',
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
      // 总条数
      total: 0,
      // 商品订单表格数据
      orderList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 订单状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderInfoId: undefined,
        userId: undefined,
        orderAddressId: undefined,
        status: undefined,
        totalPrice: undefined,
        freight: undefined,
        total: undefined,
        remark: undefined,
        createTime: undefined,
        deliveryTime: undefined,
        receivingTime: undefined
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
    this.getDicts('mall_order_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询商品订单列表 */
    getList() {
      this.loading = true
      listOrder(this.queryParams).then(response => {
        this.orderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 订单状态字典翻译
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
        orderId: undefined,
        orderNum: undefined,
        orderInfoId: undefined,
        userId: undefined,
        orderAddressId: undefined,
        status: '0',
        totalPrice: undefined,
        freight: undefined,
        total: undefined,
        remark: undefined,
        createTime: undefined,
        deliveryTime: undefined,
        receivingTime: undefined
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
      this.ids = selection.map(item => item.orderId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加商品订单'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const orderId = row.orderId || this.ids
      getOrder(orderId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改商品订单'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.orderId != undefined) {
            updateOrder(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addOrder(this.form).then(response => {
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
      const orderIds = row.orderId || this.ids
      this.$confirm('是否确认删除商品订单编号为"' + orderIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delOrder(orderIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有商品订单数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportOrder(queryParams)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {})
    }
  }
}
</script>
