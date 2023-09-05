const Env = require("./utils/env");
const { getPhone, getCode } = require("./service/lregister");
const sleep = require("./utils/sleep");
const { randomPassword } = require("./utils/password");
const { sentMsg } = require("./utils/kp-utils");
const { saveLaccount } = require("./service");
const log = require("./utils/log");

const { program } = require("commander");
const { cookie } = require("request");

const getOpts = () => {
  program.option("-n, --number <type>", "注册数量", 1);

  program.parse();

  return program.opts();
};

const register = async (env) => {
  const phone = await getPhone();
  const brower = env.getBrower();
  await brower.open("https://www.liepin.com/", ".login-container");
  await brower.page.type("#tel", phone.toString());
  await brower.page.click(".get-smscode-btn");
  await sleep(500);
  const code = await getCode(phone);
  if (code) {
    await brower.page.type("#smsCode", code.match(/\d+/g)[0].toString());
    await brower.page.click(".ant-checkbox-input");
    await brower.page.click("button.login-submit-btn");

    // 修改密码
    await brower.open(
      "https://account.liepin.com/profile/getsecret?key=modifyPhone",
      "#passwordSettings"
    );
    await brower.page.click("#passwordSettings button");
    await brower.await(".ant-modal");
    await brower.page.click(".code-text");
    const passwordCode = await getCode(phone);
    if (!passwordCode) return;
    await brower.page.type(
      "#smsCode",
      passwordCode.match(/\d+/g)[0].toString()
    );

    const password = randomPassword();
    await brower.page.type("#pwd", password.toString());
    await brower.page.type("#repwd", password.toString());

    await brower.await(".ant-modal-footer .ant-btn-primary");
    await brower.page.click(".ant-modal-footer .ant-btn-primary");

    await brower.await(".modify-success-content", 20);
    await saveLaccount({
      phone,
      password: password,
      status: "init",
    }),
      sentMsg(
        `机器人自动注册成功，账号/密码:${phone}/${password}`,
        "53a3387b-d722-4c6d-a9f1-1514e7fe2ec1"
      );
  }
};
(async () => {
  const opts = getOpts();
  const number = opts.number;
  const env = new Env(false);
  let n = 0;
  while (n < number) {
    n++;
    try {
      await register(env);
    } catch (error) {
      log.error(error);
    }
    await env.restart();
  }
})();
