<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dailogTitle"
    width="500px"
    center
    top="12vh"
    :modal-append-to-body="false"
    @close="closeDialog"
    v-loading="saveLoading"
  >
    <div class="batchEditDialog">
      <div class="batchEditDialog-wrapper">
        <el-form class="search-form" label-width="134px">
          <el-form-item label="选择要修改的字段">
            <el-select
              class="table-select"
              v-model="editField"
              placeholder="选择要修改的字段"
            >
              <el-option
                :label="item.label"
                :value="item.key"
                v-for="item in editFieldData"
                :key="item.key"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="修改为">
            <div v-if="selectedEditFieldObj" class="code-content">
              <!-- 单行文本 -->
              <template v-if="selectedEditFieldObj.type === 'input'">
                <el-input
                  class="maxWidth"
                  v-model="form[selectedEditFieldObj.key]"
                  placeholder="请输入"
                  :type="selectedEditFieldObj.detailType || 'text'"
                  size="medium"
                >
                </el-input>
              </template>
              <!-- 多行文本 -->
              <template v-else-if="selectedEditFieldObj.type === 'textarea'">
                <el-input
                  class="maxWidth"
                  type="textarea"
                  v-model="form[selectedEditFieldObj.key]"
                  :rows="2"
                  placeholder="请输入"
                  size="medium"
                >
                </el-input>
              </template>
              <!-- 选择器 -->
              <template v-else-if="selectedEditFieldObj.type === 'select'">
                <el-select
                  class="maxWidth"
                  clearable
                  :filterable="selectedEditFieldObj.filterable"
                  :allow-create="
                    selectedEditFieldObj.allowCreate
                      ? selectedEditFieldObj.allowCreate
                      : false
                  "
                  :multiple="selectedEditFieldObj.detailType == 'multiple'"
                  :collapse-tags="selectedEditFieldObj.collapseTags"
                  v-model="form[selectedEditFieldObj.key]"
                  placeholder="请选择"
                  size="medium"
                >
                  <el-option
                    v-for="option in selectedEditFieldObj.options || []"
                    :label="option.text"
                    :value="option.value"
                    :key="option.value"
                    size="medium"
                  >
                  </el-option>
                </el-select>
              </template>
              <!-- 日期选择器 -->
              <template v-else-if="selectedEditFieldObj.type === 'date'">
                <el-date-picker
                  class="maxWidth"
                  v-model="form[selectedEditFieldObj.key]"
                  type="date"
                  :value-format="selectedEditFieldObj.valueFormat"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </template>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div class="tableContainer">
        <el-table
          :data="tableData"
          size="medium"
          :border="true"
          stripe
          :header-cell-style="{ background: '#F5F5F5' }"
          height="100%"
          style="width: 100%"
        >
          <el-table-column label="排口编号" prop="systemId"></el-table-column>
          <el-table-column
            :label="selectedEditFieldObj ? selectedEditFieldObj.label : ''"
          >
            <el-table-column label="修改前" prop="beforeEditVal">
              <template slot-scope="scope">
                <div class="code-content" v-if="selectedEditFieldObj">
                  {{ $parent.getValue(selectedEditFieldObj, scope.row) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="修改后" prop="afterEditVal">
              <template slot-scope="scope">
                <div class="code-content" v-if="selectedEditFieldObj">
                  {{ $parent.getValue(selectedEditFieldObj, form) }}
                </div>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <template slot="footer">
      <div class="dialog-btns">
        <el-button type="primary" @click="batchEditSave">保存修改</el-button>
        <el-button type="primary" class="cancel-btn" @click="closeDialog">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import common from "@/utils/common";
export default {
  name: "batchEditDialog",
  data() {
    return {
      saveLoading: false, // 保存loading
      dialogVisible: false, // 弹窗显隐
      form: {
        id: "",
        systemId: "",
        company: "",
        yearMonth: "",
        basin: "",
        sunMixedFlow: "",
        isOutlet: "",
        systemType: "",
        remark: "",
      },
      editField: "",
      editFieldData: [],
      batchEditData: [],
    };
  },
  computed: {
    // 弹窗标题
    dailogTitle() {
      return `批量修改`;
    },
    // 表格数据
    tableData() {
      const tableData = this.batchEditData.map((item) => {
        return common.deepClone(item);
      });
      return tableData;
    },
    selectedEditFieldObj() {
      return this.editFieldData.find((v) => v.key === this.editField);
    },
  },
  methods: {
    // 重置数据
    resetData() {
      this.editField = this.$options.data().editField;
    },
    // 打开弹窗
    openDialog(list) {
      this.editFieldData = this.$parent.formStructure.filter(
        (v) => v.operationType == "edit"
      );
      // 重置
      Object.keys(this.form).forEach((key) => {
        this.form[key] = "";
      });
      this.batchEditData = common.deepClone(list);
      this.dialogVisible = true;
    },
    // 关闭弹窗
    closeDialog() {
      this.dialogVisible = false;
      this.resetData();
    },

    // 批量编辑保存
    async batchEditSave() {
      if (this.saveLoading) {
        return;
      }
      const editField = this.editField;
      // 提交校验
      const tipsArr = [];
      if (!editField) {
        tipsArr.push("请选择要修改的字段");
      }
      if (tipsArr.length) {
        return this.$message.warning(tipsArr[0]);
      }
      const updateArrs = this.tableData.map(item => ({
        ...item,
        [this.editField]: this.form[this.editField]
      }));
      const updateJson = updateArrs.map((item) => ({
        id: item.id,
        systemId: item.systemId,
        company: item.company,
        yearMonth: item.yearMonth,
        basin: item.basin,
        sunMixedFlow: item.sunMixedFlow,
        isOutlet: item.isOutlet,
        systemType: item.systemType,
        remark: item.remark,
      }));
      console.log("updateJson------", updateJson);
      this.saveLoading = true;
      try {
        const params = {
          editJsonStr: updateJson,
        }
        // 模拟网络请求
        const result = await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
        this.saveLoading = false;
        this.$message.success("保存成功");
        this.closeDialog();
        this.$parent.resetSelected();
        this.$parent.getList();
      } catch (error) {
        console.log("error------batchEditSave", error);
        this.saveLoading = false;
        this.$message.error(error.msg || "保存失败，请稍后再试");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// 设置滚动条样式
@mixin scrollBarStyle($color, $size, $trackColor: #eceeef) {
  /*定义滚动条轨道 内阴影+圆角*/
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba($color, 0.3);
    border-radius: 10px;
    background-color: $trackColor;
  }

  &::-webkit-scrollbar {
    // 宽高不一致会到导致elementUI table 列fixed时无法对齐
    width: $size;
    height: $size;
    background-color: transparent;
  }

  /*定义滑块 内阴影+圆角*/
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 8px rgba($color, 0.3);
    border-radius: 10px;
    background-color: $color;
  }
}

.batchEditDialog {
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 10px 10px 20px;
  @include scrollBarStyle(#ccc, 5px);
  .batchEditDialog-wrapper {
    padding: 0 15px;
    .el-form {
      padding: 18px 20px 5px;
      background-color: #f5f5f5;
      border-radius: 5px;
      .el-form-item {
        margin-bottom: 8px;
        &__label {
          text-align: right;
        }
      }
    }
  }

  .tableContainer {
    height: auto;
    flex: 1;
    padding: 10px;
  }
}
.dialog-btns {
  text-align: center;
  .cancel-btn {
    background-color: #dd4949;
  }
}
</style>
