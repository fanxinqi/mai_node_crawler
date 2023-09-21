const path = require("path");
const fs = require("fs");
const BrowerPage = require("./utils/browser-page");
const { browerUa } = require("./config.js");
const login = require("./special/chat/liepin/task/login.js");

// fanxinqi123!@#
const user = {
  phone: "17310261909",
  password: "fanxinqi123!@#",
};

const cookiesStr = path.join(__dirname, `./cookies/liepin_${user.phone}.json`);
const browerInitOrg = {
  headless: false, // 生产环境不需要开启，依赖 chromium-browse
  ua: browerUa,
};

let browerPage = new BrowerPage(browerInitOrg);

const writeCookieJson = (cookiesJSON) => {
  try {
    // console.log(cookiesStr);
    // console.log(cookiesJSON);
    fs.writeFileSync(cookiesStr, JSON.stringify(cookiesJSON), {
      encoding: "utf-8",
    });
    console.log("写入cookie成功");
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getCookieJson = () => {
  try {
    const cookies = fs.readFileSync(cookiesStr, { encoding: "utf-8" });
    return JSON.parse(cookies);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const checkLogin = async () => {
  //    await  browerPage.open("https://liepin.com");
  const oldCookie = getCookieJson();
  console.log("hasCookie");
  if (oldCookie) {
    await browerPage.open("https://liepin.com");
    await browerPage.page.setCookie(...oldCookie);
    return true;
  }
  const islogin = await login({
    browerPage: browerPage,
    userName: user["phone"].toString(),
    passWord: user["password"],
  });

  if (!islogin) {
    throw "other";
  }

  if (islogin === "banned") {
    throw "banned";
  }

  const cookies = await browerPage.page.cookies();
  if (!cookies) return null;

  writeCookieJson(cookies);
  return "ok";
};

(async () => {
  const isLogin = await checkLogin();
  if (isLogin) {
    console.log("已登陆");
    await browerPage.open("https://liepin.com");
  }
})();
