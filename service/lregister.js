const request = require("../utils/request");
const log = require("../utils/log");
const os = require("os");
const qs = require("querystring");

const hostname = os.hostname();

// save task status
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

// save account
module.exports.saveLaccount = async (querydata, pastdata) => {
  const res = await request.post(
    "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/save_laccount?" +
      qs.stringify(querydata),
    pastdata
  );
  return res;
};

module.exports.getPhone = async (querydata, pastdata) => {
  const res = await request.getHtml(
    "https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/get_phone",
    {},
    {
      isJquery: false,
    }
  );
  console.log(res);
  return res;
};

module.exports.getCode = async (phone) => {
    const res = await request.getHtml(
      `https://cb.taou.com/sec/52b22a468c0f11eda0259a192f830f34/get_code?phone=${phone}`,
      {},
      {
        isJquery: false,
        timeout:60000
      }
    );
    console.log(res);
    return res;
  };