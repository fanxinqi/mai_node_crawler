const singleBrower = require("./single-brower")({
  headless: true,
  ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.0 Safari/537.36",
});
const adb = require("../adb");

class Env {
  constructor(isIintAdb = true) {
    this._browerPage = singleBrower.getInstance();
    this.isIintAdb = isIintAdb;
    if (isIintAdb) {
      this._adb = adb;
      this._adb.loopTouch();
    }
  }

  // 重启环境
  async restart() {
    this._browerPage = await singleBrower.restart();
    if (this._adb && this.isIintAdb) {
      await this._adb.swichIp();
    }

    return this;
  }

  getBrower() {
    return this._browerPage;
  }
}

module.exports = Env;
