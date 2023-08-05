const template = require("./content.html")
const utils = require('utils/common.js');
require('./index.scss')
const outletInfoStatisticsService = require('services/drainageLedgerService');

const comm = Vue.extend({
  template: template,
  data() {
    return {
      saveLoading: false, // 保存loading
      dialogVisible: false, // 弹窗显隐
      form: {
        id: "",
        systemId: "",
        basin: "",
        subunit: "",
        sunMixedFlow: "",
        isOutlet: "",
        systemType: "",
        remark: ""
      },
      editField: "",
      editFieldData: [],
      batchEditData: [],
    }
  },
  computed: {
    // 弹窗标题
    dailogTitle() {
      return `批量修改`
    },
    // 表格数据
    tableData() {
      const tableData = this.batchEditData.map((item) => {
        return utils.deepClone(item)
      })
      return tableData
    },
    selectedEditFieldObj() {
      return this.editFieldData.find((v) => v.key === this.editField)
    },
  },
  methods: {
    // 重置数据
    resetData() {
      this.editField = this.$options.data().editField
    },
    // 打开弹窗
    openDialog(list) {
      this.editFieldData = this.$parent.formStructure.filter(
        (v) => v.operationType == "edit"
      )
      // 重置
      Object.keys(this.form).forEach((key) => {
        this.form[key] = ""
      })
      this.batchEditData = utils.deepClone(list)
      this.dialogVisible = true
    },
    // 关闭弹窗
    closeDialog() {
      this.dialogVisible = false
      this.resetData()
    },

    // 批量编辑保存
    async batchEditSave() {
      if (this.saveLoading) {
        return
      }
      const editField = this.editField
      // 提交校验
      const tipsArr = []
      if (!editField) {
        tipsArr.push("请选择要修改的字段")
      }
      if (tipsArr.length) {
        return this.$message.warning(tipsArr[0])
      }
      const selectedEditFieldObj = this.selectedEditFieldObj
      const updateArrs = this.tableData.map((item) => {
        const form = Object.assign({}, item)
        if (selectedEditFieldObj && selectedEditFieldObj.code) {
          form[this.editField] = this.form.fieldCode[this.editField]
        } else {
          form[this.editField] = this.form[this.editField]
        }
        return form
      })
      const updateJson = updateArrs.map(item => ({
        id: item.id,
        basin: item.basin,
        subunit: item.subunit,
        sunMixedFlow: item.sunMixedFlow,
        isOutlet: item.isOutlet,
        systemType: item.systemType,
        remark: item.remark
      }))

      console.log("updateArrs------", updateArrs)
      console.log("updateJson------", updateJson)
      this.saveLoading = true
      try {
        const params = {
          editJsonStr: updateJson
        }
        const result = await outletInfoStatisticsService.spoutMonthStatBatchEdit(params)
        console.log('result------batchEditSave', result);
        this.saveLoading = false
        this.$message.success("保存成功")
        this.closeDialog()
        this.$parent.resetSelected()
        this.$parent.getBasinData()
        this.$parent.getList()
      } catch (error) {
        console.log('error------batchEditSave', error);
        this.saveLoading = false
        this.$message.error(error.msg || "保存失败，请稍后再试")
      }
    },
  },
})

module.exports = comm
