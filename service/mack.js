const request = require("../utils/request");
const log = require("../utils/log");

const getMockFn = (index) => {
  // const mackData = [
  //   {
  //     type: "wx_video",
  //     vid:'wxv_2848695386960609283',
  //     url: "https://mp.weixin.qq.com/s?__biz=MzU5Njc5NzU4MQ==&mid=2247488587&idx=1&sn=16e1da3bebf3de446b3ea4dd07e78593&chksm=fe5c65a9c92becbf4a9250d96ed93292c934c2a2418adba016bc5d99e957446dc184d0a40541#rd",
  //   },
  // ];

  const mackData = [
    {
      type: "job",
      keyword: "/job_detail/cd4e166b599ef8fd1Xdz3Nu1FVNX.html",
    },
  ];

  return function () {
    let index = 1;
    const data = mackData[0];
    index++;
    return data;
  };
};

module.exports.saveCompanyOrJobInfo = async (data) => {
  return true;
};

// 保存公司或职位
module.exports.changeIp = async (instance = "proxy-01") => {
  return true;
};

const getmock = getMockFn();
// 公司搜索任务
module.exports.getConsumeTask = async (instance) => {
  return getmock();
};

//
module.exports.saveTaskStatus = async (data) => {
  return true;
};
