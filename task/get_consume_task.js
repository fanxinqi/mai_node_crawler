const { getConsumeTask } = require("../service");
const mock = require("../service/mack");
const log = require("../utils/log.js");
const sleep = require("../utils/sleep");

/**
 * 获取任务
 * @param {object} context {
 *  task: {
 *      keyword,
 *     id,
 *     type
 *    }
 *  }
 */
const get_consume_task = async (instance, isMock = false, client) => {
  const getTask = isMock ? mock.getConsumeTask : getConsumeTask;
  const data = (await getTask(instance)) || {};
  // 无搜索任务，long Polling
  if (!data.type) {
    log.info("无执行任务，等待5s中...");
    if (client) {
      client.write("b_search process: 发送心跳")
    }
    await sleep(5000);
    log.info("获取任务中...");
    return await get_consume_task(instance, isMock,client);
  }
  return data;
};

module.exports = get_consume_task;
