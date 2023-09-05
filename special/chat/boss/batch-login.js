const { browerUa } = require("../../../config.js");
const log = require("../../../utils/log");
const login = require("./login");
const singleBrower = require("../../../utils/single-brower")({
  headless: false,
  ua: browerUa,
});
const fs = require("fs");

const adb = require("../../../adb");

let tab = singleBrower.getInstance();

(async () => {
  try {
    adb.loopTouch();
  } catch (error) {}
  while (true) {
    try {
      const res = await login({
        tab,
      });
      //   fs.writeFileSync(__dirname + "cookie.json", JSON.stringify(res));
      // save result
      log.info("保存登陆态成功");
      console.log(res);
    } catch (error) {
      log.error(error);
    }

    try {
      log.info("开始重启浏览器");
      // reset brower
      tab = await singleBrower.restart();
      log.info("重启浏览器成功");
    } catch (error) {
      log.error(error);
    }

    try {
      // change ip
      log.info("开始切换ip");
      await adb.swichIp();
      log.info("切换ip成功");
    } catch (error) {
      log.error(error);
    }
  }
})();
