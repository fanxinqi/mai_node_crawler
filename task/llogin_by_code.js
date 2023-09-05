const log = require("../utils/log");
const { getCode } = require("../service/lregister");
const { sentMsg } = require("../utils/kp-utils");
const sleep = require("../utils/sleep");

const getErorrMsg = (phone, passWord) => {
  return `${phone}/${passWord}:登陆失败`;
};

const getSuccessMsg = (phone, passWord) => {
  return `${phone}/${passWord}:登陆成功`;
};

const getInitStatus = async (brower) => {
  let $ = null;
  try {
    $ = (await brower.await(".resume-complete-container", 3)) || null;
  } catch (error) {
    console.log(error);
    return null;
  }
  return $;
};

const login = async (env, taskContent) => {
  const phone = taskContent["keyword"];
  const passWord = taskContent["passWord"];
  const brower = env.getBrower();
  log.info(`login:${phone}`);
  await brower.open(
    "https://www.liepin.com/",
    ".login-switch-bar-line>div:nth-child(1)"
  );
  log.info(`open home page:https://www.liepin.com/`);
  await brower.await(".login-switch-bar-line>div:nth-child(1)", 20);
  await brower.await("#tel", 20);
  await brower.page.type("#tel", phone.toString());
  await brower.page.click(".get-smscode-btn");
  await sleep(500);
  const code = await getCode(phone);
  if (!code) return; // 验证码失败
  await brower.page.type("#smsCode", code.match(/\d+/g)[0].toString());
  await brower.page.click(".ant-checkbox-input");
  await brower.page.click("button.login-submit-btn");

  try {
    let $ = await brower.await(
      [
        ".header-quick-menu-username",
        ".ant-message-notice-content",
        ".resume-complete-container",
      ],
      20
    );

    if ($(".resume-complete-container").length > 0) {
      log.info(`${phone}/${passWord}:初始化状态`);
      return "init";
    }
    let new$ = await getInitStatus(brower);
    if (new$) {
      $ = new$;
    }

    if ($(".resume-complete-container").length > 0) {
      log.info(`${phone}/${passWord}:初始化状态`);
      return "init";
    }
    if ($(".ant-message-notice-content").length > 0) {
      log.error(`${phone}/${passWord}:被封禁`);
      return "banned";
    }
    if ($ && $(".header-quick-menu-username").length > 0) {
      const msg = getSuccessMsg(phone, passWord);
      log.info(msg);
      sentMsg(msg);
      return "ok";
    } else {
      log.error(`${phone}/${passWord}:登陆失败`);
      return "ohter";
    }
  } catch (error) {
    // const msg = getErorrMsg(phone, passWord);
    log.error(error);
    return "ohter";
  }
};

module.exports = login;
