const { browerUa } = require("../../../config.js");
const log = require("../../../utils/log");
const login = require("./login");
const singleBrower = require("../../../utils/single-brower")({
  headless: false,
  ua: browerUa,
});
const mycookie = require("./cookie.json");

const adb = require("../../../adb");
const { cookie } = require("request");

let tab = singleBrower.getInstance();

(async () => {
  await tab.open("https://www.zhipin.com/");
  //   const cookies = await tab.page.cookies();
  //   await tab.page.deleteCookie(cookies);
  //   console.log(mycookie.cookies);
  await tab.page.setCookie(...mycookie.cookies);
  await tab.open("https://www.zhipin.com/");

  $ = await tab.await(".label-text", 200);
  const name = $(".label-text").text();

  if (!name) return null;
  return name;
})();
