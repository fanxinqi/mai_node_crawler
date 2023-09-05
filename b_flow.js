const log = require("./utils/log");
const os = require("os");
const getTask = require("./task/get_consume_task");
const taskType = require("./task/b_index.js");
const sleep = require("./utils/sleep");
const BrowerPage = require("./utils/browser-page");
const events = require("events");
const { saveCompanyOrJobInfo, saveTaskStatus } = require("./service");
const { sentMsg } = require("./utils/kp-utils");
const hostname = os.hostname();

const net = require('net')
const pipeFile = process.platform === 'win32' ? '\\\\.\\pipe\\mypip' : '/tmp/unix.sock'
const client = net.connect(pipeFile)
client.on('connect', () => console.log('connected.'))
client.on('data', data => console.log(`receive: ${data}`))
client.on('end', () => console.log('disconnected.'))
client.on('error', err => console.error(err.message))

class Brower extends BrowerPage {
  constructor(p) {
    super(p);
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
        request.continue();
      } else if (request.resourceType() === "xhr") {
        // this.eventEmitter.emit("xhr", request.url());
        request.continue();
      } else request.continue();
    });

    page.on("response", async (response) => {
      if (response.url().includes("search/geeks.json")) {
        client.write("b_search process: 发送心跳")
        const res = await response.json();
        // console.log(res);
        if (res.code === 0) {
          if (res.zpData) {
            await saveCompanyOrJobInfo({
              type: "b_search",
              data: res,
            });
            this.eventEmitter.emit("xhr", response.url());
          }
          if (res.zpData && res.zpData.hasMore === false) {
            this.eventEmitter.emit("task_end");
          }
        } else {
          this.eventEmitter.emit("task_end");
        }
      }
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

class BFlow {
  constructor() {
    // 初始化work环境
    log.info("**********************初始化work环境**********************");
    this._brower = new Brower({
      headless: false,
      ua: '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.0 Safari/537.36',
    });
    log.info("**********************完成初始化work环境**********************");
    this.prevTask = {};
  }
  async runOneTask(isMock = false) {
    console.log("runOneTask");
    const task = await getTask(hostname, isMock,client);
    console.log(task);
    const { info = {} } = task || {};
    this._brower.limit = info.page;
    this._brower.currentPage = 0;
    this._brower.taskInfo = task;
    try {
      await taskType[task.type]({
        brower: this._brower,
        task,
      });
    } catch (error) {
      console.log(error);
      await saveTaskStatus({
        tid: task.id,
        failed: 1,
        status: error,
      });
    }
  }
}

(async () => {
  client.write("b_search process: 发送心跳")
  const opts = getOpts();
  const isMock = !!opts.mock;
  const BF = new BFlow();
  BF._brower.firstTask = true;
  BF._brower.eventEmitter.on("task_end", async () => {
    await saveTaskStatus({
      tid: BF._brower.taskInfo.id,
      failed: 0,
      status: "ok",
    });
    await sentMsg(`执行任务结束`,'b-search-bot');
    // 重新开始任务
    BF._brower.taskEnd = false;
    await sentMsg(`开始执行新的任务:${JSON.stringify(BF._brower.taskInfo)}`,'b-search-bot');
    await sleep(1000);
    BF.runOneTask(isMock);
  });
  BF.runOneTask(isMock);
  // 等所有异步任务执行完毕

  // while (true) {
  //   try {
  //     await BF.runOneTask(isMock);
  //   } catch (error) {
  //     log.error(error);
  //   }
  //   await sleep(parseInt(Math.random() * 3 + 1) * 1000);
  // }
})();
