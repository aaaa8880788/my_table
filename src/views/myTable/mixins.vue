<script>
export default {
  data() {
    return {
      // 图片地址
      imgUrls: {
        saveIcon: require("./image/save-icon.svg"),
        batchEditIcon: require("./image/batch-edit-icon.svg"),
      },
      // 是否净口Options数据
      isOutletOptions: [
        {
          text: "是",
          value: "是",
        },
        {
          text: "否",
          value: "否",
        },
      ],
      // 系统类型净口Options数据
      systemTypeOptions: [
        {
          text: "沿河截污系统",
          value: "沿河截污系统",
        },
        {
          text: "非沿河截污系统",
          value: "非沿河截污系统",
        },
      ],
      // 所属流域Options数据
      basinOptions: [
        {
          text: "南山流域--",
          value: "南山流域",
        },
        {
          text: "福田流域--",
          value: "福田流域",
        },
        {
          text: "罗湖流域--",
          value: "罗湖流域",
        },
        {
          text: "盐田流域--",
          value: "盐田流域",
        },
        {
          text: "布沙流域--",
          value: "布沙流域",
        },
      ],
      // 所属单位Options数据
      companyOptions: [
        {
          text: "南山分公司",
          value: "南山分公司",
        },
        {
          text: "福田分公司",
          value: "福田分公司",
        },
        {
          text: "罗湖分公司",
          value: "罗湖分公司",
        },
        {
          text: "盐田分公司",
          value: "盐田分公司",
        },
        {
          text: "布沙分公司",
          value: "布沙分公司",
        },
      ],
    }
  },
  methods: {
    // 按钮点击处理函数
    btnClickHandle(type) {
      switch (type) {
        // 查询
        case "searchData":
          this.searchData();
          break;
        // 导出数据
        case "exportData":
          this.exportData();
          break;
        // 开启编辑
        case "openEdit":
          this.openEdit();
          break;
        // 关闭编辑
        case "closeEdit":
          this.closeEdit();
          break;
        // 保存当前信息
        case "saveEdit":
          this.saveEdit();
          break;
        // 批量修改
        case "batchEdit":
          this.batchEdit();
          break;
        // 添加
        case "add":
          this.add();
          break;
        // 删除
        case "delete":
          this.delete();
          break;
        case "reset":
          this.reset();
          break;
        // 导入
        case "import":
          this.import();
          break;
      }
    },
  },
};
</script>
