const log = require("./utils/log");
const getTask = require("./task/get_consume_task");
const taskType = require("./task/wx_index.js");
const sleep = require("./utils/sleep");
const os = require("os");
const hostname = os.hostname();
const BrowerPage = require("./utils/browser-page");
const events = require("events");

class Brower extends BrowerPage {
  constructor() {
    super();
    if (!this.eventEmitter) {
      this.eventEmitter = new events.EventEmitter();
    }
  }
  /**
   * 初始化页面对象
   */
  async initPage() {
    const page = await this.browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    if (this.ua) {
      await page.setUserAgent(this.ua);
    }

    // webdriver pass
    await page.evaluateOnNewDocument(() => {
      const newProto = navigator.__proto__;
      delete newProto.webdriver; //删除 navigator.webdriver字段
      navigator.__proto__ = newProto;
    });

    // hook request
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.isInterceptResolutionHandled()) return;
      if (
        // request.url().endsWith(".css") ||
        request.url().endsWith(".png") ||
        request.url().endsWith(".jpg") ||
        request.url().startsWith("https://res.zhipin.com") ||
        request.url().startsWith("https://arms-retcode.aliyuncs.com") ||
        request.url().startsWith("https://img.bosszhipin.com") ||
        request.url().startsWith("https://img.bosszhipin.com")
      ) {
        request.abort();
      } else if (request.resourceType() === "media") {

        this.eventEmitter.emit("video_loaded", request.url());
        request.abort();
      } else request.continue();
    });

    this.page = page;
  }
}

const { program } = require("commander");

const getOpts = () => {
  program.option("-m, --mock <type>", "是否开启mock", 0);
  program.parse();

  return program.opts();
};

class WeixinFlow {
  constructor() {
    // 初始化work环境
    log.info("**********************初始化work环境**********************");
    this._brower = new Brower();
    log.info("**********************完成初始化work环境**********************");

    this.prevTask = {};
  }
  async runOneTask(isMock = false) {
    // 获取任务
    const task = await getTask(hostname, isMock);
    try {
      await taskType[task.type]({
        brower: this._brower,
        task,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

(async () => {
  const opts = getOpts();
  const isMock = !!opts.mock;
  const wf = new WeixinFlow();
  while (true) {
    try {
      await wf.runOneTask(isMock);
    } catch (error) {
      log.error(error);
    }
    await sleep(parseInt(Math.random() * 3 + 1) * 1000);
  }
})();
