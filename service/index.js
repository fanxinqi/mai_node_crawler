const request = require("../utils/request");
const log = require("../utils/log");
const os = require("os");
const qs = require("querystring");

const hostname = os.hostname();

// 切换代理ip
module.exports.saveCompanyOrJobInfo = async (data) => {
  // try {
  const res = await request.post(
    "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/save_bcompany",
    data
  );
  // } catch (error) {
  //   console.log(error);
  // }
};

// 保存公司或职位
module.exports.changeIp = async (instance = hostname) => {
  try {
    await request.get(
      "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/change_ip",
      {
        instance,
      },
      {
        timeout: 1000,
      }
    );
  } catch (error) {
    console.log(error);
  }
};
// moack
// const taskMack = [
//   {
//     id: 123,
//     type: "geek",
//     keyword: "百度",
//   },
//   {
//     id: 456,
//     type: "gongsi",
//     keyword: "/gongsi/02cd05cce753437e33V50w~~.html",
//   },
//   {
//     id: 789,
//     type: "gongsir",
//     keyword: "/gongsi/02cd05cce753437e33V50w~~.html",
//   },
//   {
//     id: 1234,
//     type: "company_list",
//     keyword: "/gongsi/_zzz_iy100001_t801/",
//   },
// ];

// function getRndInteger(min, max) {
//   return Math.floor(Math.random() * (max - min)) + min;
// }

// 公司搜索任务
module.exports.getConsumeTask = async (instance = hostname) => {
  try {
    return await request.get(
      "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/consume_task",
      { instance }
    );
  } catch (error) {
    console.log(error);
    return {};
  }
};

//
module.exports.saveTaskStatus = async (data) => {
  try {
    return await request.get(
      "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/task_done",
      data
    );
  } catch (error) {
    console.log(error);
    return {};
  }
};


module.exports.saveLaccount = async (querydata, pastdata) => {
  const res = await request.post(
    "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/save_laccount?" +
      qs.stringify(querydata),
    pastdata
  );
  return res;
};


module.exports.saveAccount = async (querydata, pastdata) => {
  const res = await request.post(
    "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/save_account?" +
      qs.stringify(querydata),
    pastdata
  );
  return res;
};
