const BrowerPage = require("../utils/browser-page");
const { browerUa, feishuBotId, getCompanyDataPath } = require("../config.js");
const log = require("../utils/log");
const sleep = require("../utils/sleep");

const tab = new BrowerPage({
  headless: false,
  ua: browerUa,
});
(async () => {
  // 登陆
  let $ = await tab.open(
    "https://www.zhipin.com/web/user/?ka=header-login",
    ".switch-tip"
  );
  await sleep(500);
  if ($(".qr-img-box").length == 0) {
    await tab.page.click(".switch-tip");
    await tab.await(".qr-img-box", 20);
  }
  let clip = await tab.page.evaluate(() => {
    let { x, y, width, height } = document
      .querySelector(".qr-img-box img")
      .getBoundingClientRect();
    return {
      x,
      y,
      width,
      height,
    };
  });

  await tab.page.screenshot({
    path: "./qr-img-box.png",
    clip: clip,
  });
  log.info("验证码生成成功～");

  await sleep(8000);

  console.log(await tab.page.cookies());
  //   console.log(qr);
})();
