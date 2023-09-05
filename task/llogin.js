const login = require("../special/chat/liepin/task/login.js");
const request = require("../utils/request");
const log = require("../utils/log");
const qs = require("querystring");

const saveRemoteData = async (querydata, pastdata) => {
  const res = await request.post(
    "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/save_laccount?" +
      qs.stringify(querydata),
    pastdata
  );
  return res;
};

module.exports = async (env, taskContent) => {
  const islogin = await login({
    browerPage: env.getBrower(),
    userName: taskContent["keyword"].toString(),
    passWord: taskContent["password"],
  });

  if (!islogin) {
    throw "other";
  }

  if (islogin === "banned") {
    await saveRemoteData(
      {
        phone: taskContent["keyword"],
        status: "banned",
      },
      {}
    );
    throw "banned";
  }

  const cookies = await env.getBrower().page.cookies();
  if (!cookies) return null;

  const status = islogin === "init" ? "init" : "ok";
  await saveRemoteData(
    {
      phone: taskContent["keyword"],
      status,
    },
    cookies
  );
  return "ok";
};
