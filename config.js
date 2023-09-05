const path = require("path");
// 爬取异常日志路径
module.exports.ERROR_LOG = path.join(__dirname, "erorr.json");

// 爬取无数据日志路径
module.exports.NO_DATA_LOG = path.join(__dirname, "no_data.json");

// 爬取成功日志路径
module.exports.ACCESS_LOG = path.join(__dirname, "access.josn");

// 爬取成功日志路径
module.exports.getCompanyDataPath = (name) => {
  return path.join(__dirname, `/data/${name}.json`);
};

// proxy
module.exports.proxyServer = "";

// user agent
module.exports.browerUa =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36";

// ip change tab
module.exports.instance = "proxy-01";

module.exports.feishuBotId = "8e91152a-2a49-40c6-951e-5300c88ca323";

module.exports.lipinHost = "https://www.liepin.com";

module.exports.macNetPosition = {
  "6c2a75560b6bb031": {
    moveSwitch: {
      x: -280,
      y: 0,
    },
    clickSwitch: {
      x: -40,
      y: 40,
    },
  },
};

const PAGE_TIME_OUT = "页面超时";
const PAGE_BLOCKED = "页面被封";
module.exports.ERROR_TYPE = {
  PAGE_TIME_OUT,
  PAGE_BLOCKED,
};

module.exports.LOGIN_ERROR = {
  banned: "banned",
  expired: "expired",
  ok: "ok",
  other: "other",
};

module.exports.LOGIN_ERROR_STATUS = {
  banned: 1,
  expired: 1,
  other: 1,
};

module.exports.TASK_HOME_URL = {
  lactivate: "https://www.liepin.com",
  lcollect: "https://www.liepin.com",
  ldeliver: "https://www.liepin.com",
  llogin: "https://www.liepin.com",
  lresume: "https://www.liepin.com",
  lwrite_info: "https://www.liepin.com",
  login: "https://www.zhipin.com",
  deliver: "https://www.zhipin.com",
  collect: "https://www.zhipin.com",
};

module.exports.B_SEARCH = {
  degree: ["不限", "本科及以上", "硕士及以上", "博士"],
  school: ["不限", "统招本科", "双一流院校", "211院校", "985院校", "留学生"],
  exp: ["不限", "在校/应届", "1-3年", "3-5年", "5-10年"],
  age: ["不限", "20-25", "25-30", "30-35", "35-40", "40-50", "50以上"],
  filter_on_job_status: [
    "不限",
    "离职-随时到岗",
    "在职-暂不考虑",
    "在职-考虑机会",
    "在职-月内到岗",
  ],
};
