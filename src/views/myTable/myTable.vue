<template>
  <div class="main-container myTable" v-loading="loading">
    <div class="container-page">
      <!-- 查询表单部分 -->
      <div class="container-header">
        <div class="container-flex">
          <el-form class="container-flex-left">
            <el-form-item>
              <el-date-picker
                class="year-selector"
                v-model="searchForm.yearMonth"
                type="month"
                key="month"
                placeholder="请选择月份"
                prefix-icon="none"
                value-format="yyyy-MM"
                :clearable="false"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="searchForm.company"
                placeholder="请选择所属分公司"
                clearable
              >
                <el-option
                  :label="item.text"
                  :value="item.value"
                  v-for="item in companyOptions"
                  :key="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="">
              <el-input
                v-model="searchForm.keyword"
                style="width: 385px"
                placeholder="输入排口编号、所属流域等进行多条件筛选"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="btnClickHandle('searchData')"
                >查询</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="btnClickHandle('reset')"
                >重置</el-button
              >
            </el-form-item>
          </el-form>
          <div class="container-flex-right">
            <template v-if="!isOpenEdit">
              <el-button
                type="primary"
                icon="el-icon-edit"
                @click="btnClickHandle('openEdit')"
                >开启编辑</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-upload"
                @click="btnClickHandle('import')"
                >导入数据</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-document"
                @click="btnClickHandle('exportData')"
                >导出数据</el-button
              >
            </template>
            <template v-else>
              <el-button
                type="primary"
                icon="el-icon-close"
                @click="btnClickHandle('closeEdit')"
                >关闭编辑</el-button
              >
              <el-button type="primary" @click="btnClickHandle('saveEdit')"
                ><img
                  :src="imgUrls.saveIcon"
                  style="margin-right: 5px; vertical-align: text-bottom"
                />保存当前信息
              </el-button>
              <el-button type="primary" @click="btnClickHandle('batchEdit')"
                ><img
                  :src="imgUrls.batchEditIcon"
                  style="margin-right: 5px; vertical-align: text-bottom"
                />批量修改
              </el-button>
            </template>
          </div>
        </div>
      </div>
      <div class="container-body">
        <!-- 统计数据 -->
        <div class="total-count">
          <span>检索出</span>
          <span class="total-count-num">{{ pageData.totalRecord }}</span>
          <span>条数据</span>
        </div>
        <!-- 表格数据 -->
        <div class="table-container" v-loading="tableLoading">
          <el-table
            height="100%"
            :data="tableData"
            size="medium"
            ref="table"
            :border="true"
            stripe
            :header-cell-style="{ background: '#F5F5F5' }"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="80"
              v-if="isOpenEdit"
            ></el-table-column>
            <el-table-column
              label="序号"
              type="index"
              align="center"
            ></el-table-column>
            <template v-for="item in formStructure">
              <el-table-column
                v-if="item.formatter"
                :key="item.key"
                :prop="item.key"
                show-overflow-tooltip
                align="center"
              ></el-table-column>
              <el-table-column v-else :key="item.key" min-width="110px">
                <!-- 表头 -->
                <template slot="header">
                  <template v-if="item.label == '是否净口'">
                    <el-select
                      class="table-select"
                      :class="{ 'is-selected': searchForm[item.key] }"
                      v-model="searchForm[item.key]"
                      clearable
                      @change="searchData"
                      :placeholder="item.label"
                    >
                      <el-option
                        v-for="item in isOutletOptions"
                        :label="item.text"
                        :value="item.value"
                        :key="item.value"
                      ></el-option>
                    </el-select>
                  </template>
                  <span v-else>{{ item.label }}</span>
                </template>
                <template slot-scope="scope">
                  <div v-for="(form, index) in [scope.row]" :key="index">
                    <!-- 其他 -->
                    <div
                      class="code-content"
                      v-if="item.operationType == 'edit'"
                    >
                      <!-- 单行文本 -->
                      <template v-if="item.type === 'input'">
                        <el-input
                          class="maxWidth"
                          v-model="form[item.key]"
                          placeholder="请输入"
                          :type="item.detailType || 'text'"
                          size="medium"
                        >
                        </el-input>
                      </template>
                      <!-- 多行文本 -->
                      <template v-else-if="item.type === 'textarea'">
                        <el-input
                          class="maxWidth"
                          type="textarea"
                          v-model="form[item.key]"
                          :rows="2"
                          placeholder="请输入"
                          size="medium"
                        >
                        </el-input>
                      </template>
                      <!-- 选择器 -->
                      <template v-else-if="item.type === 'select'">
                        <el-select
                          class="maxWidth"
                          clearable
                          :filterable="item.filterable"
                          :allow-create="
                            item.allowCreate ? item.allowCreate : false
                          "
                          :multiple="item.detailType == 'multiple'"
                          :collapse-tags="item.collapseTags"
                          v-model="form[item.key]"
                          placeholder="请选择"
                          size="medium"
                        >
                          <el-option
                            v-for="option in item.options || []"
                            :label="option.text"
                            :value="option.value"
                            :key="option.value"
                            size="medium"
                          >
                          </el-option>
                        </el-select>
                      </template>
                      <!-- 日期选择器 -->
                      <template v-else-if="item.type === 'date'">
                        <el-date-picker
                          class="maxWidth"
                          v-model="form[item.key]"
                          type="date"
                          :value-format="item.valueFormat"
                          placeholder="选择日期"
                        >
                        </el-date-picker>
                      </template>
                    </div>
                    <div v-else class="code-content">
                      {{ getValue(item, scope.row) || "-" }}
                    </div>
                  </div>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>
        <!-- 分页 -->
        <div class="page-tool">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageData.pageNumber"
            :page-sizes="[20, 50, 100, 500]"
            :page-size="pageData.pageSize"
            layout="prev, pager, next, sizes"
            :total="pageData.totalRecord"
          >
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 批量编辑弹窗 -->
    <batchEditDialog ref="batchEditDialog"></batchEditDialog>
    <!-- 批量导入弹窗 -->
    <uploadDialog
      :dialogVisible.sync="uploadDialogVisible"
      :on-success="searchData"
    ></uploadDialog>
  </div>
</template>

<script>
import mixins from "./mixins.vue";
import common from "@/utils/common";
import batchEditDialog from './batchEditDialog/batchEditDialog.vue'
import uploadDialog from './uploadDialog/uploadDialog.vue'
export default {
  name: "myTable",
  mixins: [mixins],
  components: {
    batchEditDialog,
    uploadDialog
  },
  data() {
    return {
      // 搜索数据
      searchForm: {
        // 顶部搜索部分
        yearMonth: "", // 年月
        company: "", // 分公司
        keyword: "", // 关键词
        // 表格搜索部分
        isOutlet: "", // 是否净口
        basin: "", // 流域
        systemType: "", // 系统类型
      },
      // 旧搜索数据
      searchFormOrigin: {
        // 顶部搜索部分
        yearMonth: "", // 年月
        company: "", // 分公司
        keyword: "", // 关键词
        // 表格搜索部分
        isOutlet: "", // 是否净口
        basin: "", // 流域
        systemType: "", // 系统类型
      },
      // 开启编辑按钮编辑状态
      isOpenEdit: false,
      // 分页数据
      pageData: {
        pageNumber: 1,
        pageSize: 20,
        totalRecord: 0,
      },
      // 页面loading
      loading: false,
      // 表格loading
      tableLoading: false,
      // 表格数据
      tableData: [],
      // 旧表格数据
      tableDataOrigin: [],
      // 批量编辑的数据
      batchEditData: [],
      // 是否显示导入弹窗
      uploadDialogVisible: false,
      // 是否显示导出按钮
      importBtnVisible: false,
    };
  },
  methods: {
    // 页面初始化
    init() {
      this.getList();
    },
    // 获取表格数据
    async getList() {
      try {
        this.tableLoading = true;
        const { yearMonth, company, keyword, isOutlet, basin, systemType } =
          this.searchForm;
        const { pageNumber, pageSize } = this.pageData;
        const queryParams = {
          yearMonth: yearMonth || "",
          company: company || "",
          keyword: keyword || "",
          isOutlet: isOutlet || "",
          basin: basin || "",
          systemType: systemType || "",
          pageNumber,
          pageSize,
        };
        // 网络请求模拟-3s
        const result = await new Promise((resolve, reject) => {
          setTimeout(() => {
            const result = {
              records: [
                {
                  id: 1,
                  systemId: "000",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域", "南山流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 2,
                  systemId: "001",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 3,
                  systemId: "002",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 4,
                  systemId: "003",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
                {
                  id: 5,
                  systemId: "004",
                  type: '重点排口',
                  yearMonth: "2023-01-01",
                  company: "布沙分公司",
                  basin: ["布沙流域"],
                  sunMixedFlow: "20",
                  isOutlet: "是",
                  systemType: "沿河截污系统",
                  remark: "备注信息",
                },
              ],
              totalRecord: 20,
            };
            resolve(result);
          }, 1000);
        });
        // console.log("result------getList", result);
        // console.log('common------', common);
        this.tableData = result.records;
        this.tableDataOrigin = common.deepClone(result.records);
        this.pageData.totalRecord = result.totalRecord;
        this.$refs.table.doLayout();
        this.tableLoading = false;
      } catch (error) {
        // console.log("error------getList", error);
        this.tableLoading = false;
        this.$message.error(error.msssage);
      }
    },
    /**
     * 查询
     */
    searchData() {
      // 获取搜索数据keys
      const searchFormKeys = Object.keys(this.searchForm);
      // 判断是否为新的搜索数据
      const isDifferent = searchFormKeys.some((key) => {
        return `${this.searchForm[key]}` !== `${this.searchFormOrigin[key]}`;
      });
      if (isDifferent) {
        // 搜索内容变化，新的搜索数据
        // 保存搜索数据
        // console.log("搜索内容变化，新的搜索数据");
        this.searchFormOrigin = common.deepClone(this.searchForm);
        this.getList();
      } else {
        // 搜索内容不变
        // console.log("搜索内容不变");
        if (!this.tableData.length) {
          this.getList();
        }
      }
    },
    openEdit() {
      this.isOpenEdit = true;
    },
    /**
     * 导出
     */
    async exportData() {
      if (!this.searchForm.yearMonth) {
        return this.$message({
          message: "月份筛选不能为空",
          type: "warning",
        });
      }
      this.loading = true
      // 模拟网络请求
      const result = await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
      this.loading = false
      this.$message.success('导出成功')
      // console.log('点击了到处数据');
    },
    /**
     * 导入
     */
    import() {
      // console.log("点击了导入按钮");
      this.uploadDialogVisible = true;
    },
    /**
     * 关闭编辑
     */
    closeEdit() {
      const tableDataStr = JSON.stringify(this.tableData);
      const tableOriginDataStr = JSON.stringify(this.tableDataOrigin);
      // 判断如果存在已修改数据未保存，则提示保存
      if (tableDataStr !== tableOriginDataStr) {
        this.$confirm("存在已修改的数据未保存，请问是否需要保存？", "提示", {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        })
          .then(() => {
            this.saveEdit();
          })
          .catch(() => {
            this.isOpenEdit = false;
            this.tableData = common.deepClone(this.tableDataOrigin);
          });
      } else {
        this.isOpenEdit = false;
      }
    },
    /**
     * 批量修改
     */
    batchEdit() {
      if (!this.batchEditData.length) {
        return this.$message.warning("请先勾选需要批量修改的数据");
      }
      this.$refs.batchEditDialog.openDialog(this.batchEditData);
    },
    /**
     * 重置
     */
    reset() {
      this.searchForm = this.$options.data().searchForm;
      this.searchData();
    },
    /**
     * 保存
     */
    async saveEdit() {
      if (this.tableLoading || this.loading) {
        return;
      }
      console.log("tableData----", this.tableData);
      // 找出修改了的数据
      const updateArrs = this.tableData.filter((item, index) => {
        return (
          JSON.stringify(item) !== JSON.stringify(this.tableDataOrigin[index])
        );
      });
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
      // console.log("updateArrs------", updateArrs);
      // console.log("updateJson------", updateJson);
      this.tableLoading = true;
      try {
        const params = {
          editJsonStr: updateJson,
        };
        console.log('params-------', params);
        // 模拟网络请求
        const result = await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
        this.tableLoading = false;
        this.$message.success("保存成功");
        this.getList();
      } catch (error) {
        console.log("error------saveEdit", error);
        this.tableLoading = false;
        this.$message.error(error.msg || "保存失败，请稍后再试");
      }
    },
    /**
     * 新增
     */
    add() {},
    /**
     * 删除
     */
    delete() {},
    /**
     * 表格选中
     */
    handleSelectionChange(val) {
      console.log("handleSelectionChange------表格选中", val);
      this.batchEditData = val;
    },
    /**
     * 重置选中
     */
    resetSelected() {
      this.batchEditData = [];
      this.$refs.table.clearSelection();
    },
    /**
     * 分页回调
     * @param value
     */
    handleSizeChange(value) {
      this.pageData.pageSize = value;
      this.getList();
    },

    /**
     * 点击当前页回调
     * @param value
     */
    handleCurrentChange(value) {
      this.pageData.pageNumber = value;
      this.getList();
    },
    /**
     * 显示值
     */
    getValue(struct, obj) {
      let form = obj;
      // showContent-Function-用于数据修饰
      if (struct.showContent) return struct.showContent(form);
      // showKey-String-用于展示其他数据
      if (struct.showKey) return form[struct.showKey];
      if (struct.options && struct.options.length) {
        // 当type为select时，显示options的text值
        if (struct.detailType == "multiple") {
          let arr = form[struct.key] || [];
          let result = [];
          arr.forEach((_value) => {
            let obj = struct.options.find((v) => v.value == _value);
            if (obj) result.push(obj.text);
            else result.push();
          });
          return result.join();
        } else {
          let obj = struct.options.find((v) => v.value == form[struct.key]);
          if (obj) return obj.text;
        }
      }
      if (struct.key) return form[struct.key];
      return "";
    },
  },
  computed: {
    formStructure() {
      // 项目基础字段
      let projectStructure = [
        {
          label: "排水口编号",
          key: "systemId",
          type: "",
          required: true,
          operationType: "view",
        },
        {
          label: "排口类型",
          key: "type",
          type: "",
          required: true,
          operationType: "view",
          // 这里对其他数据进行展示
          showKey: 'company',
        },
        {
          label: "所属分公司",
          key: "company",
          type: "",
          required: true,
          operationType: "view",
          // 这里对数据进行了修饰
          showContent(item) {
            return `${item.company}-数据修饰`
          }
        },
        {
          label: "时间",
          key: "yearMonth",
          // 日期选择器
          type: "date",
          valueFormat: 'yyyy-MM',
          required: true,
          operationType: this.isOpenEdit ? "edit" : "view",
        },
        {
          label: "所属流域",
          key: "basin",
          // 选择器-多选
          type: "select",
          detailType: "multiple",
          collapseTags: true,
          options: this.basinOptions,
          required: false,
          allowCreate: true,
          filterable: true,
          operationType: this.isOpenEdit ? "edit" : "view",
        },
        {
          label: "晴天混流量（m3/d）",
          key: "sunMixedFlow",
          type: "input",
          required: true,
          operationType: this.isOpenEdit ? "edit" : "view",
        },
        {
          label: "是否净口",
          key: "isOutlet",
          // 选择器-单选
          type: "select",
          options: this.isOutletOptions,
          required: true,
          operationType: this.isOpenEdit ? "edit" : "view",
        },
        {
          label: "系统类型",
          key: "systemType",
          type: "select",
          options: this.systemTypeOptions,
          required: true,
          operationType: this.isOpenEdit ? "edit" : "view",
        },
        // 备注放后面
        {
          label: "备注",
          key: "remark",
          type: "textarea",
          required: false,
          operationType: this.isOpenEdit ? "edit" : "view",
        },
      ];
      return projectStructure.filter((v) => v.visible !== false);
    },
  },
  created() {
    this.init();
  },
};
</script>

<style lang="scss" scoped></style>
