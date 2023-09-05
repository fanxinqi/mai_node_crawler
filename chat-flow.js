const Env = require("./utils/env");
const log = require("./utils/log");
const getTask = require("./task/get_consume_task");
const taskType = require("./task/chat_index.js");
const mock = require("./service/mack");
const { saveTaskStatus, saveAccount } = require("./service");
const { LOGIN_ERROR, TASK_HOME_URL } = require("./config");
const sleep = require("./utils/sleep");
const os = require("os");
const hostname = os.hostname();

const { program } = require("commander");

const getOpts = () => {
  program.option("-m, --mock <type>", "是否开启mock", 0);

  program.parse();

  return program.opts();
};

const checkBoss = (type) => {
  return TASK_HOME_URL[type] === "https://www.zhipin.com";
};

const checkLipin = (type) => {
  return TASK_HOME_URL[type] === "https://www.liepin.com";
};

class ChatFlow {
  constructor() {
    // 初始化work环境
    log.info("**********************初始化work环境**********************");
    this._env = new Env();
    log.info("**********************完成初始化work环境**********************");

    this.prevTask = {};
  }
  async runOneTask(isMock = false) {
    // 获取任务
    const task = await getTask(hostname, isMock);
    const homeUrl = TASK_HOME_URL[task.type];

    if (
      (this.prevTask.keyword && task.keyword != this.prevTask.keyword) ||
      task.refresh_env === 1
    ) {
      let isChaged = false;
      while (!isChaged) {
        isChaged = await this._restartEnv();
      }
    }

    try {
      const cookie = task.cookie;
      if (cookie) {
        if (!homeUrl) throw "没有配置首页";
        await this._env.getBrower().open(homeUrl);
        //plat cookies;
        await this._plantCookie(cookie);

        // check login
        try {
          if (checkBoss(task.type)) {
            await this._checkBosslogin(homeUrl);
          }

          if (checkLipin(task.type)) {
            await this._checkLiepinlogin(homeUrl);
          }
        } catch (error) {
          await saveAccount({
            phone: task.keyword,
            status: error,
          });
          throw error;
        }
      }

      // run task
      const statusStr = await taskType[task.type](this._env, task);

      await saveTaskStatus({
        tid: task.id,
        failed: 0,
        status: statusStr || LOGIN_ERROR.ok,
      });
    } catch (error) {
      console.log(error);
      const failed = error === LOGIN_ERROR.banned ? 0 : 1;
      await saveTaskStatus({
        tid: task.id,
        failed: failed,
        status: LOGIN_ERROR[error] || "other",
      });
      throw error;
    }
    this.prevTask = task;
  }
  stop() {}

  // 重启环境
  async _restartEnv() {
    try {
      await this._env.restart();
      return true;
    } catch (error) {
      log.error(error);
      return false;
      // throw error;
    }
  }

  // 种植cookie
  async _plantCookie(cookie) {
    if (!cookie) throw LOGIN_ERROR.other;
    try {
      await this._env.getBrower().page.setCookie(...cookie);
    } catch (error) {
      console.log(error);
      throw LOGIN_ERROR.other;
      //   return fasle;
    }
  }

  // 是否登陆
  async _checkBosslogin(homeUrl) {
    await this._env._browerPage.open(homeUrl);
    // try {
    let $ = await this._env._browerPage.await(
      [".nav-figure .label-text", ".header-login-btn"],
      20
    );
    if ($ && $(".header-login-btn").length > 0) {
      throw LOGIN_ERROR.expired;
    }
    if ($ && $(".nav-figure .label-text").length > 0) {
      try {
        const cookies = await brower.page.cookies();
        saveAccount(
          {
            name: $(".nav-figure .label-text").text(),
            status: "ok",
          },
          cookies
        );
      } catch (error) {}
      return true;
    } else {
      throw LOGIN_ERROR.expired;
    }
  }

  // 是否登陆
  async _checkLiepinlogin(homeUrl) {
    await this._env._browerPage.open(homeUrl);
    // try {
    let $ = await this._env._browerPage.await(
      [
        ".header-quick-menu-username",
        "#header-quick-menu-login",
        ".ant-message-notice-content",
        ".resume-complete-container",
      ],
      20
    );
    if ($(".ant-message-notice-content").length > 0) {
      throw LOGIN_ERROR.banned;
    }

    if ($ && $("#header-quick-menu-login").length > 0) {
      throw LOGIN_ERROR.expired;
    }

    if ($(".resume-complete-container").length > 0) {
      return true;
    }
    if ($ && $(".header-quick-menu-username").length > 0) {
      return true;
    } else {
      throw LOGIN_ERROR.expired;
    }
    // } catch (error) {
    //   //   log.error(error);
    //   throw LOGIN_ERROR.other;
    // }
  }
}

(async () => {
  const opts = getOpts();
  const isMock = !!opts.mock;
  const cf = new ChatFlow();
  while (true) {
    try {
      await cf.runOneTask(isMock);
    } catch (error) {
      log.error(error);
    }
    await sleep(parseInt(Math.random() * 3 + 1) * 1000);
  }
})();
