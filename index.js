const BrowerPage = require("./utils/browser-page");
const { browerUa, feishuBotId, ERROR_TYPE } = require("./config.js");
const taskType = require("./task/index");
const get_consume_task = require("./task/get_consume_task");
const log = require("./utils/log");
const sleep = require("./utils/sleep");
const getCommanderOpts = require("./utils/get-commander-opts");
const { changeIp, saveTaskStatus } = require("./service");
const feishu = require("./utils/feishu");

const commanderOpts = getCommanderOpts() || {};

const isChangeIp = () => {
  return parseInt(commanderOpts.changeIp) > 0;
};

const pause = async () => {
  log.info(`sleep ${commanderOpts.sleep}ms`);
  await sleep(Number(commanderOpts.sleep));
};

(async () => {
  const browerInitOrg = {
    proxyServer: commanderOpts.proxy,
    headless: Boolean(Number(commanderOpts.headless)), // 生产环境不需要开启，依赖 chromium-browse
    ua: commanderOpts.ua || browerUa,
    loadPageOpiton: {
      retryTime: Number(commanderOpts.number) || 20,
      waitTime: Number(commanderOpts.waittime) || 200,
    },
    saveHtmlLocal: Number(commanderOpts.saveHtmlLocal),
  };
  let browerPage = new BrowerPage(browerInitOrg);
  const restartBrower = async () => {
    // 销毁浏览器对象
    try {
      log.info("开始重启浏览器,切换ip");
      await changeIp(commanderOpts.instance);
      await pause();
      await browerPage.destroy();
      browerPage = new BrowerPage(browerInitOrg);
      log.info("重启浏览器,切换ip成功");
    } catch (error) {
      console.log(error);
    }
  };

  const errorTask = [];
  const recordErrorTask = (task) => {
    const hasErrorTask = getErrorBytaskId(task.id);
    if (!!hasErrorTask) {
      if (hasErrorTask.count > Number(commanderOpts.retry)) {
        // 清空error task
        errorTask.splice(0, errorTask.length);
        const errorMsg = `任务执行失败，客户端重试次数超过${
          commanderOpts.retry || 3
        }次`;
        log.warn(errorMsg + JSON.stringify(hasErrorTask));
        // feishu.sendErrorTaskMsg(feishuBotId, errorMsg, task);
      } else {
        // feishu.sendErrorTaskMsg(
        //   feishuBotId,
        //   `任务执行失败，客户端重试第${hasErrorTask.count}次`,
        //   task
        // );
        log.warn("任务失败:" + JSON.stringify(task));
        hasErrorTask.count++;
      }
      // 飞书通知
    }
    if (!hasErrorTask) {
      log.warn("任务失败:" + JSON.stringify(task));
      // feishu.sendErrorTaskMsg(
      //   feishuBotId,
      //   `任务执行失败，客户端重试第1次`,
      //   task
      // );

      errorTask.push({
        task,
        count: 1,
      });
    }
  };

  const getErrorBytaskId = (id) => {
    if (errorTask.length > 0) {
      return errorTask.find((item) => item.task && item.task.id == id);
    } else {
      return null;
    }
  };

  // let i = 0;
  while (true) {
    // if no task, long polling
    let task = await get_consume_task(
      commanderOpts.instance,
      Boolean(Number(commanderOpts.test))
    );
    const executeTask = async (task, isErrorTask = false) => {
      try {
        if (task.type) {
          // if (i === 0) {
          // throw "error";
          // } else {
          await taskType[task.type]({
            task,
            browerPage,
            instance: commanderOpts.instance,
          });
          //执行成功后
          if (isErrorTask) {
            // 清空error task
            errorTask.splice(0, errorTask.length);
            log.info(
              `重试错误任务执行成功：任务id:${task.id} 关键字：${task.keyword}`
            );
          }
          // save task successed status
          await saveTaskStatus({
            tid: task.id,
            failed: 0,
          });
          log.info(`执行成功:任务id:${task.id} 关键字：${task.keyword}`);
          // }
        }
      } catch (error) {
        // save task  failed status
        await saveTaskStatus({
          tid: task.id,
          failed: 1,
        });
        const isSwitchIP = isChangeIp();
        // 不切ip 只sleep即可
        if (!isSwitchIP) {
          await pause();
        }
        if (Number(commanderOpts.retry)) {
          recordErrorTask(task);
        }
        // 仅仅被封重启浏览器，调用切换ip服务
        if (error === ERROR_TYPE.PAGE_BLOCKED && isSwitchIP) {
          // restart brower
          await restartBrower();
        }
      }
      // i++;
    };
    log.info(`开始执行任务:任务id:${task.id} 关键字：${task.keyword}`);

    await executeTask(task);

    let errtask = getErrorBytaskId(task.id);
    // if has error task, retry error task
    while (errtask && errtask.task) {
      log.info(
        `开始重试错误任务：任务id:${errtask.task.id} 关键字：${errtask.task.keyword}`
      );
      await executeTask(errtask.task, true);
      // 重新获取
      errtask = getErrorBytaskId(task.id);
    }
  }
  // 释放资源
})();
