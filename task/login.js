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

// const namePhone = {
//   张明: 13337568834,
//   刘泽: 15733237535,
// };

module.exports = async (env, taskContent) => {
  const brower = env.getBrower();
  // 登陆
  let $ = await brower.open(
    "https://www.zhipin.com/web/user/?ka=header-login",
    ".switch-tip"
  );
  if ($(".qr-img-box").length == 0) {
    await brower.page.click(".switch-tip");
    await brower.await(".qr-img-box", 20);
  }

  $ = await brower.await(".label-text", 200);
  const name = $(".label-text").text();

  if (!name) return "no name";

  const cookies = await brower.page.cookies();
  if (!cookies) return "no cookies";

  console.log(cookies);

  // await saveRemoteData(
  //   {
  //     phone: namePhone[name],
  //     type: "boss",
  //     status: "ok",
  //   },
  //   cookies
  // );
};
