const singleBrower = require("../../../../utils/single-brower")({
  headless: false,
});
const login = require("./login.js");
const log = require("../../../../utils/log");

const { getTask, updateTask } = require("../service/lchat");
const sleep = require("../../../../utils/sleep");

const { getPhone, getCode } = require("../service/lregister");
const adb = require("../../../../adb");

// 随机密码
function genPassword() {
  var chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 12;
  var password = "";
  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
}

const register = async ({ browerPage, task = {} }) => {
  //   const phone = await getPhone();
  const phone = 16521179986;
  let $ = await browerPage.open("https://www.liepin.com/", "#tel");

  //   const $telInput = $("#tel");
  await browerPage.page.type("#tel", phone.toString());
  await sleep(100);
  await browerPage.page.click(
    "#home-banner-login-container div.get-smscode-btn"
  );
  //   $ = await browerPage.await(".ant-message-success", 20);
  //   if ($(".ant-message-success").length === 0) throw `获取验证码失败`;
  await sleep(1000);
  const password = genPassword();
  const code = await getCode(phone);
  await browerPage.page.type("#smsCode", code.toString());
  log.info("phone:", phone);
  log.info("password:", password);
  log.info("code:", code);
  await browerPage.page.click(
    "#home-banner-login-container  button.login-submit-btn"
  );
};

(async () => {
  const browerPage = await singleBrower.getInstance();
  await register({
    browerPage,
  });
})();
