const sleep = require("../../../utils/sleep");
const log = require("../../../utils/log");
const login = async ({ tab }) => {
  // 登陆
  let $ = await tab.open(
    "https://www.zhipin.com/web/user/?ka=header-login",
    ".switch-tip"
  );
  if ($(".qr-img-box").length == 0) {
    await tab.page.click(".switch-tip");
    await tab.await(".qr-img-box", 20);
  }

  $ = await tab.await(".label-text", 200);
  const name = $(".label-text").text();

  if (!name) return null;

  const cookies = await tab.page.cookies();
  if (!cookies) return null;
  return {
    name,
    cookies,
  };
};

module.exports = login;
