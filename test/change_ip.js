const { changeEip } = require("../service.js");
const BrowerPage = require("../utils/browser-page");
const log = require("../utils/log");
(async () => {
  // 切换代理测试
  let browerPage = new BrowerPage({
    // proxyServer: "http://proxy-01.int.taou.com:8888",
  });

  let n = 0;

  while (n < 10) {
    n++;
    const $ = await browerPage.open("https://myip.ipip.net/", ["body pre"]);
    if (!$) {
      continue;
    }
    log.info($("body pre").html());
    await browerPage.destroy();

    log.info("销毁浏览器对象");
    await changeEip();
    log.info("切换ip成功");
    browerPage = new BrowerPage({
      // proxyServer: "http://proxy-01.int.taou.com:8888",
    });
    log.info("创建浏览器对象");
  }
})();
