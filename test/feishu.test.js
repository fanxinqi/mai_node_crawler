const feishu = require("../utils/feishu");
const { feishuBotId } = require("../config.js");

(async () => {
  const res = await feishu.sendErrorTaskMsg(
    feishuBotId,
    "测试：任务执行失败，客户端重试次数超过最大次数",
    {
      type: "lgongsi",
      keyword: "test",
      taskid: 1,
    }
  );
  console.log(res)
})();
