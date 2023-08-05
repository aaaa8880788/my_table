const template = require('./content.html');
const moment = require('moment');
const outletInfoStatisticsService = require('services/drainageLedgerService');
require('./index.scss')

// 定义组件
const comm = Vue.extend({
    template,

    components: {

    },

    props: {
        dialogVisible: {
            type: Boolean,
            default: false
        },
        // 成功回调
        onSuccess: {
            type: Function,
            default: () => (() => {})
        },
    },

    data() {
        return {
            pageLoading: false,
            pageLoadingText: '文件上传中',
            title: '批量导入',
            // 文件上传bizType
            bizType: '',
            bizId: '',
            // 文件列表
            fileList: [],
            searchForm: {
                yearMonth: ""
            }
        }
    },

    watch: {
        dialogVisible(newValue) {
            if(newValue) {
                Object.assign(this.$data, this.$options.data())
            }
        }
    },

    methods: {
        // 选中文件后触发
        handleUploadChange(file, fileList) {
            this.fileList = fileList
        },
        // 文件上传处理和监听
        toUploadFile() {
            if(!this.fileList.length) return this.$message.error('请先上传附件')
            let fileList = this.fileList
            let file = this.fileList[0]
            this.pageLoading = true
            this.uploadFile({
                yearMonth: this.searchForm.yearMonth || '',
                file: file.raw
            }, progressEvent => {
                file.status = 'uploading'
                file.percentage = (progressEvent.loaded / progressEvent.total * 100 | 0)
            }).then(res => {
                this.pageLoading = false
                // file.id = res.id
                file.status = 'success'
                this.$message.success('数据导入成功')
                this.onSuccess()
                this.closeDialog()
            }).catch(err => {
                this.pageLoading = false
                let index = fileList.findIndex(item => item == file)
                fileList.splice(index, 1)
                this.$message.error(err.msg ||'文件上传失败')
            })
        },
        // 上传附件
        uploadFile(params, progressListener) {
            let formData = new FormData()
            formData.append('file', params.file)
            formData.append('yearMonth', params.yearMonth)
            return outletInfoStatisticsService.importAddEditExcel(formData, progressEvent => {
                progressListener(progressEvent)
            })
        },
        /**
         * 关闭弹框
         */
        closeDialog() {
            this.$emit('update:dialogVisible', false)
        }
    },
});

module.exports = comm;
