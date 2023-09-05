
const { update, query } = require("../service");

const request = require("../utils/request");
const log = require("../utils/log");
const qs = require("querystring");
const sleep = require("../utils/sleep");

const saveStatus = async (id, status) => {
  await update(`update PHONE set STATUS = ${status} where ID = ${id}`);
};

const getTask = async () => {
  const task = await query("select * from PHONE where  STATUS =1 limit 1;");
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
module.exports = async (env, taskContent) => {
  log.info("cookie 种植成功");
  try {
    const cookies = await env.getBrower().page.cookies();
    await saveRemoteData(
      {
        phone: taskContent["keyword"],
        status: "ok",
      },
      cookies
    );
    log.info('cookie 保存成功～');
  } catch (error) {
    log.error(error);
    //   return fasle;
  }
};
