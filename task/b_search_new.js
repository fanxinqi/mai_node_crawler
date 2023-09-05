const { B_SEARCH } = require("../config.js");
const log = require("../utils/log.js");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sleep = require("../utils/sleep");
const qs = require("querystring");
const { getToken, uploadImage } = require("../utils/upload-feishu-image.js");
const getFileStream = require("../utils/get-file-stream.js");
const feishu = require("../utils/feishu");
const feishuBotId = "dfc8bcd7-a9df-471c-883b-6814c521e007";

let isSearchEd = false;

const getCookieJson = () => {
  try {
    const cookiesStr = fs.readFileSync(
      path.join(__dirname, `../cookies/${os.hostname()}.json`),
      { encoding: "utf-8" }
    );
    return JSON.parse(cookiesStr);
  } catch (e) {
    return null;
  }
};

const writeCookieJson = (cookiesJSON) => {
  try {
    console.log(__dirname);
    console.log(path.join(__dirname, `../cookies/${os.hostname()}.json`));
    fs.writeFileSync(
      path.join(__dirname, `../cookies/${os.hostname()}.json`),
      JSON.stringify(cookiesJSON),
      { encoding: "utf-8" }
    );
    log.info("写入cookie成功");
  } catch (e) {
    return null;
  }
};

const getFilterIndex = (type, value) => {
  if (!type || !value) return 1;
  if (Array.isArray(value)) {
    return value.map((v) => B_SEARCH[type].indexOf(v) + 1 || 1);
  }
  return B_SEARCH[type].indexOf(value) + 1 || 1;
};

const isExitSelector = async (brower, selector) => {
  try {
    let $ = await brower.await(selector, 3);
    return $(selector).length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const clickSeletor = async (brower, selector) => {
  try {
    let $ = await brower.await(selector, 50);
    if ($) {
      log.info(`模拟点击 ${selector}`);
      await brower.page.click(selector);
    }
  } catch (error) {
    console.log(error);
  }
};

const inputSeletor = async (brower, selector, value) => {
  try {
    let $ = await brower.await(selector, 50);
    if ($) {
      await brower.page.type(selector, value);
    }
  } catch (error) {
    console.log(error);
  }
};

const setCookies = async (brower, cookies) => {
  const cookiesJson = getCookieJson();
  if (cookiesJson != null) {
    await brower.page.setCookie(...cookiesJson);
    return;
  }
};

const QRLogin = async (brower) => {
  await brower.page.click(".header-login-btn");
  let $ = await brower.await(".qr-img-box", 20);
  if ($(".qr-img-box").length == 0) {
    try {
      await brower.page.click(".switch-tip");
      await brower.await(".qr-img-box", 200);
    } catch (error) {
      console.log(error);
    }
  }
  $ = await brower.await(".qr-img-box img", 20);
  // 发送登陆验证码到飞书
  const qrImagePath = $(".qr-img-box img").attr("src");
  console.log(qrImagePath);
  const stream = await getFileStream(`https://www.zhipin.com${qrImagePath}`);
  const tokenData = await getToken();
  const res = await uploadImage(stream, tokenData.tenant_access_token);

  feishu.sendMsg(
    feishuBotId,
    [
      [
        {
          tag: "img",
          image_key: res.data.image_key,
        },
        {
          tag: "at",
          user_id: "all", //取值使用"all"来at所有人
          user_name: "所有人",
        },
      ],
    ],
    `${os.hostname()},该woker,烦请扫码登录一下`
  );

  $ = await brower.await(".label-name", 200);
  const name = $(".label-name").text();

  if (!name) throw "no name";

  const cookies = await brower.page.cookies();
  if (!cookies) throw "no cookies";

  log.info("开始写入cookie");
  writeCookieJson(cookies);
  return cookies;
};

const login = async (brower) => {
  if (brower.page) return;

  // 测试当前登陆状态
  let $ = await brower.open("https://www.zhipin.com/web/chat/index", [
    ".header-login-btn",
    ".label-name",
  ]);

  // 尝试cookie登陆
  const cookiesJson = await getCookieJson();
  if (cookiesJson) {
    await brower.page.setCookie(...cookiesJson);
  }

  $ = await brower.open("https://www.zhipin.com/web/chat/index", [
    ".header-login-btn",
    ".label-name",
  ]);

  if ($(".header-login-btn").length > 0) {
    log.info("没有登陆，开始登陆");
    await QRLogin(brower);
    // return;
  }

  brower.eventEmitter.on("xhr", async (url) => {
    if (!isSearchEd) return;
    if (url.includes("search/geeks.json")) {
      const emptyData = await brower.page.evaluate(async () => {
        return !!document.querySelector(".tip-nodata");
      });

      const bottomStatus = await brower.page.evaluate(async () => {
        return !!document.querySelector(".no-data-recommend-card");
      });

      if (emptyData || bottomStatus) {
        // brower.page && (await resetFilterStatus(brower.frame));
        brower.taskEnd = true;
        // isSearchEd = false;
        brower.eventEmitter.emit("task_end");
        return;
      }

      // 超过任务限制
      if (brower.currentPage >= brower.limit) {
        // isSearchEd = false;
        brower.eventEmitter.emit("task_end");
        return;
      }

      const loaderMore = await isExitSelector(brower, ".loadmore");
      const page = qs.parse(url.split("?")[1]).page;
      if (loaderMore) {
        // console.log("命中条件，check是同一个分页不");
        if (Number(page) === Number(brower.currentPage + 1)) {
          console.log("命中条件，sleep2秒,开始点击更多按钮");
          brower.currentPage++;
          console.log("brower.currentPage", brower.currentPage);
          console.log("brower.limit", brower.limit);
          await sleep(2000);
          await clickSeletor(brower, ".loadmore");
          // isSearchEd = true;
          return;
        }
      }
    } else {
      brower.currentPage++;
      await sleep(1000);
      await clickSeletor(brower, ".loadmore");
    }
  });
};

const BSearch = async (context) => {
  const { brower, task } = context || {};
  const { info = {} } = task || {};
  const {
    keyword,
    degree,
    school,
    age,
    exp,
    filter_on_job_status,
    page = 1,
    city,
  } = info || {};
  isSearchEd = false;
  if (brower.taskEnd) return false;

  // limit = page;
  await login(brower);

  await brower.open(
    "https://www.zhipin.com/web/frame/search/?jobId=&keywords=&t=&source=&city=",
    ".geek-list-wrap"
  );
  // await clickSeletor(brower, ".reset-btn");
  await sleep(2000);
  //   if (brower.firstTask) {
  await clickSeletor(brower, ".search-container .search-current-job");
  await clickSeletor(
    brower,
    ".search-container .ui-dropmenu-list ul > li:nth-child(1)"
  );

  await sleep(2000);
  await clickSeletor(brower, ".search-city-kw input");
  await inputSeletor(brower, ".search-city-kw input", city);
  await clickSeletor(brower, ".city-box.searching");

  await sleep(2000);
  await inputSeletor(brower, ".search-input", keyword);

  // 搜索状态
  // isSearchEd = true;
  if (degree) {
    await sleep(1000);
    const degreeIndex = getFilterIndex("degree", degree);
    if (degreeIndex > 0) {
      await clickSeletor(brower, `.degree-item:nth-child(${degreeIndex})`);
    }
  }

  if (school) {
    await sleep(1000);
    // 学校
    if (Array.isArray(school)) {
      for (let i = 0; i < school.length; i++) {
        const index = getFilterIndex("school", school[i]);
        if (index > 1) {
          // 从3开始 统招本科 开始
          await clickSeletor(
            brower,
            `.school-ui .school-item:nth-child(${index + 1})`
          );
        }
      }
    }
  }

  if (exp) {
    await sleep(1000);
    //工作年限
    const expIndex = getFilterIndex("exp", exp);
    if (expIndex) {
      await clickSeletor(
        brower,
        `.exp-list-ui .exp-item:nth-child(${expIndex})`
      );
      // 从1 不限开始
    }
  }

  if (age) {
    await sleep(1000);
    //年龄
    const aggIndex = getFilterIndex("age", age);
    if (aggIndex) {
      // 从1 不限开始
      await clickSeletor(
        brower,
        `.age-list-ui .age-item:nth-child(${aggIndex})`
      );
    }
  }

  if (filter_on_job_status) {
    await sleep(1000);
    //  点击求职状态筛选按钮
    await brower.page.waitForTimeout(500);
    if (Array.isArray(filter_on_job_status)) {
      await clickSeletor(brower, ".filter-2-item:nth-child(5)");
      for (let i = 0; i < filter_on_job_status.length; i++) {
        const index = getFilterIndex(
          "filter_on_job_status",
          filter_on_job_status[i]
        );

        await clickSeletor(
          brower,
          `.filter-2-item:nth-child(5) li:nth-child(${index})`
        );
      }
    }
  }

  await sleep(1000);
  await clickSeletor(brower, ".icon-search");
  isSearchEd = true;
  brower.currentPage = 0;
};
module.exports = BSearch;
