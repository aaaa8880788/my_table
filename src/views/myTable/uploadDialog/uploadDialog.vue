<template>
  <el-dialog
    class="uploadDialog"
    :modal="false"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :title="title"
    :before-close="closeDialog"
    width="530px"
    v-loading="pageLoading"
  >
    <template slot="title">
      <div class="dialog-header">
        <div class="dialog-header-title">
          <span>{{ title }}</span>
        </div>
        <div class="dialog-header-picker">
          <el-date-picker
            class="year-selector"
            style="width: 140px"
            v-model="searchForm.yearMonth"
            type="month"
            key="month"
            placeholder="请选择月份"
            prefix-icon="none"
            value-format="yyyy-MM"
            :clearable="false"
          >
          </el-date-picker>
        </div>
      </div>
    </template>
    <template v-if="searchForm.yearMonth">
      <el-row  :element-loading-text="pageLoadingText">
        <el-form ref="form" class="form" label-width="0" size="medium">
          <el-form-item label="">
            <el-upload
              class="upload-demo"
              ref="upload"
              action=""
              drag
              :file-list="fileList"
              :on-change="handleUploadChange"
              :limit="1"
              :auto-upload="false"
              multiple
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row>
        <span class="warning-title-left">请按照模板录入数据</span>
        <span class="warning-title-right"
          >导入会清空现有数据，请先导出一份数据备份</span
        >
      </el-row>
    </template>
    <template slot="footer">
      <div class="dialog-footer">
        <el-button
          type="primary"
          class="submit-btn btn-detail"
          @click="toUploadFile"
          :disabled="pageLoading"
          >提交</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "uploadDialog",
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    // 成功回调
    onSuccess: {
      type: Function,
      default: () => () => {},
    },
  },
  data() {
    return {
      pageLoading: false,
      pageLoadingText: "文件上传中",
      title: "批量导入",
      // 文件上传bizType
      bizType: "",
      bizId: "",
      // 文件列表
      fileList: [],
      searchForm: {
        yearMonth: "",
      },
    };
  },
  watch: {
    dialogVisible(newValue) {
      if (newValue) {
        Object.assign(this.$data, this.$options.data());
      }
    },
  },
  methods: {
    // 选中文件后触发
    handleUploadChange(file, fileList) {
      // console.log('handleUploadChange------选中文件后触发', file);
      // console.log('handleUploadChange------选中文件后触发', fileList);
      this.fileList = fileList;
    },
    // 文件上传处理和监听
    async toUploadFile() {
      if (!this.fileList.length) return this.$message.error("请先上传附件");
      let fileList = this.fileList;
      let file = this.fileList[0];
      this.pageLoading = true;
      // 模拟网络请求
      const result = await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
      this.pageLoading = false
      this.$message.success("数据导入成功");
      this.onSuccess();
      this.closeDialog();
    },
    /**
     * 关闭弹框
     */
    closeDialog() {
      this.$emit("update:dialogVisible", false);
    },
  },
};
</script>

<style lang="scss" scoped>
.uploadDialog {
  // 头
  .dialog-header{
    display: flex;
    align-items: center;
    justify-content: center;
    .dialog-header-title{
      font-size: 18px;
      font-weight: 700;
      margin-right: 10px;
    }
  }
  // 头
  // body
  .upload-demo {
      display: flex;
      flex-direction: column;
      align-items: center;
     .el-upload-dragger {
      width: 470px;
     }
  }
  .warning-title-left {
    margin-left: 20px;
  }
  .warning-title-right {
    font-size: 18px;
    font-weight: 700;
    color: #ff5656;
  }
  // body
  // 尾
  .dialog-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    .submit-btn{
      width: 80%;
      margin: 0;
    }
  }
  // 尾
}
</style>
