const Env = require("../../../../utils/env");
const login = require("./login");
const { update, query } = require("../service");

const request = require("../../../../utils/request");
const log = require("../../../../utils/log");
const qs = require("querystring");
const sleep = require("../../../../utils/sleep");

const saveStatus = async (id, status) => {
  await update(`update PHONE set STATUS = ${status} where ID = ${id}`);
};

const getTask = async () => {
  const task = await query("select * from PHONE where  STATUS =-1 limit 1;");
  return task[0];
};

const saveRemoteData = async (querydata, pastdata) => {
  const res = await request.post(
    "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/save_laccount?" +
      qs.stringify(querydata),
    pastdata
  );
  return res;
};

(async () => {
  // 初始化环境
  const env = new Env();
  //   env.getBrower().open();
  while (true) {
    let brower = env.getBrower();
    const task = (await getTask()) || {};

    if (!task.ID) {
      log.info("暂无任务");
      await sleep(5000);
      return;
    }
    try {
      const islogin = await login({
        browerPage: brower,
        userName: task.PHONE.toString(),
        passWord: task.PASSWORD,
      });
      if (!islogin) {
        throw "is not login";
      }

      if (islogin === "被封禁") {
        await saveRemoteData(
          {
            phone: task.PHONE,
            status: "banned",
          },
          {}
        );
        throw "被封禁";
      }

      const cookies = await brower.page.cookies();
      if (!cookies) return null;
      await saveRemoteData(
        {
          phone: task.PHONE,
          status: "ok",
        },
        cookies
      );
      await saveStatus(task.ID, 0);
    } catch (error) {
      log.error(error);
      await saveStatus(task.ID, 2);
    }
    await env.restart();
  }
})();
