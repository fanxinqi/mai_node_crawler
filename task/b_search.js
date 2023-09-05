const { B_SEARCH } = require("../config.js");
const { saveTaskStatus } = require("../service");
const uploadImage = require("../utils/upload-image.js");
const getFileStream = require("../utils/get-file-stream.js");
const getFilterIndex = (type, value) => {
  if (!type || !value) return 1;
  if (Array.isArray(value)) {
    return value.map((v) => B_SEARCH[type].indexOf(v) + 1 || 1);
  }
  return B_SEARCH[type].indexOf(value) + 1 || 1;
};

const clickFilter = async (frame, index) => {
  await frame.evaluate(async (index) => {
    const dom = document.querySelector(".filter-2-item:nth-child(5)");
    if (dom) {
      dom.click();
    } else {
      document.querySelector(".filter-2-item:nth-child(5)").click();
      setTimeout(() => {
        document
          .querySelector(`.filter-2-item:nth-child(5) li:nth-child(${index})`)
          .click();
      }, 0);
    }
  }, index);
};

const resetFilterStatus = async (frame) => {
  //重设求职状态筛选按钮
  await clickFilter(frame, 1);
  //重设置学校筛选按钮
  await frame.evaluate(async () => {
    return document
      .querySelectorAll(".school-ui .school-item .checked")
      .forEach((item) => item.click());
  });

  await frame.waitForTimeout(100);
};

const login = async (brower) => {
  if (brower.page) return;

  let $ = await brower.open(
    "https://www.zhipin.com/web/user/?ka=header-login",
    ".switch-tip"
  );

  if ($(".qr-img-box").length == 0) {
    await brower.page.click(".switch-tip");
    $ = await brower.await(".qr-img-box", 20);
    const stream = await getFileStream($(".qr-img-box img").attr(src));
    const res = await uploadImage(stream, encodeURIComponent(url));
    const resultUrl = res.tokenInfo.url;
    console.log(resultUrl);
    return true;
  }

  $ = await brower.await(".label-name", 200);
  const name = $(".label-name").text();

  if (!name) throw "no name";

  const cookies = await brower.page.cookies();
  if (!cookies) throw "no cookies";

  brower.eventEmitter.on("xhr", async (url) => {
    if (url.includes("search/geeks.json")) {
      if (!brower.frame) return;
      if (!brower.frame.evaluate) return;
      brower.currentPage++;
      console.log("brower.currentPage", brower.currentPage);
      console.log("brower.limit", brower.limit);
      const emptyData = await brower.frame.evaluate(async () => {
        return !!document.querySelector(".tip-nodata");
      });

      const bottomStatus = await brower.frame.evaluate(async () => {
        return !!document.querySelector(".no-data-recommend-card");
      });

      if (emptyData || bottomStatus) {
        brower.frame && (await resetFilterStatus(brower.frame));
        brower.taskEnd = true;
        await brower.frame.evaluate(function () {
          /* 这里做的是渐进滚动，如果一次性滚动则不会触发获取新数据的监听 */
          window.scrollTimer && clearInterval(window.scrollTimer);
          window.scrollTimer = null;
        });
        brower.eventEmitter.emit("task_end");
        return;
      }
      // 超过任务限制
      if (brower.currentPage >= brower.limit && brower.frame) {
        brower.frame && (await resetFilterStatus(brower.frame));
        // 清楚滚动监听
        await brower.frame.evaluate(function () {
          /* 这里做的是渐进滚动，如果一次性滚动则不会触发获取新数据的监听 */
          window.scrollTimer && clearInterval(window.scrollTimer);
          window.scrollTimer = null;
        });
        brower.taskEnd = true;
        brower.eventEmitter.emit("task_end");
      }
    }
  });

  await brower.open(
    "https://www.zhipin.com/web/chat/search",
    ".frame-box>iframe",
    {
      n: 100,
    }
  );

  await brower.page.waitForTimeout(2000);

  await brower.await(".frame-box>iframe", 100);
  const frame = await brower.page.frames()[1];
  await frame.waitForTimeout(2000);

  if (!frame) throw `iframe not find~`;

  brower.frame = frame;
};

const BSearch = async (context) => {
  const { brower, task } = context || {};
  const { info = {} } = task || {};
  console.log("info", info);

  const {
    keyword,
    degree,
    school,
    age,
    exp,
    filter_on_job_status,
    page = 1,
  } = info;

  if (brower.taskEnd) return false;

  limit = page;

  await login(brower);

  const frame = brower.frame;

  if (brower.firstTask) {
    await frame.click(".search-container div.ui-dropmenu-label");
    await frame.waitForTimeout(200);

    await frame.click(
      ".search-container .ui-dropmenu-list ul > li:nth-child(1)"
    );
    await frame.waitForTimeout(200);
    brower.firstTask = false;
  }
  // 学历
  const degreeIndex = getFilterIndex("degree", degree);
  if (degreeIndex > 0) {
    // 从1 不限开始
    await frame.click(`.degree-item:nth-child(${degreeIndex})`);
  }
  await frame.waitForTimeout(200);
  // 学校
  if (Array.isArray(school)) {
    for (let i = 0; i < school.length; i++) {
      const index = getFilterIndex("school", school[i]);
      if (index > 1) {
        // 从3开始 统招本科 开始
        await frame.click(`.school-ui .school-item:nth-child(${index + 1})`);
      }
    }
  }

  //工作年限
  const expIndex = getFilterIndex("exp", exp);
  if (expIndex) {
    await frame.waitForTimeout(200);
    // 从1 不限开始
    await frame.click(`.exp-list-ui .exp-item:nth-child(${expIndex})`);
  }

  //年龄
  const aggIndex = getFilterIndex("age", age);
  if (aggIndex) {
    // 从1 不限开始
    await frame.click(`.age-list-ui .age-item:nth-child(${aggIndex})`);
  }
  await frame.waitForTimeout(200);
  //  点击求职状态筛选按钮
  // await frame.waitForTimeout(200);
  if (Array.isArray(filter_on_job_status)) {
    for (let i = 0; i < filter_on_job_status.length; i++) {
      await clickFilter(
        frame,
        getFilterIndex("filter_on_job_status", filter_on_job_status[i])
      );
      // 从1:不限开始
      // await frame.click(
      //   `.filter-2-item:nth-child(5) li:nth-child(${getFilterIndex(
      //     "filter_on_job_status",
      //     filter_on_job_status[i]
      //   )})`
      // );
    }
  }
  await frame.waitForTimeout(200);

  // 搜索
  await frame.waitForTimeout(100);
  await brower.page.evaluate((keyword) => {
    const dom = document.querySelector("iframe");
    // document
    //   .querySelector("iframe")
    //   .contentDocument.body.querySelector(".search-input").value = keyword;
  }, keyword);
  await frame.type(".search-input", keyword);
  await frame.waitForTimeout(100);
  await frame.click(".icon-search");
  brower.currentPage = 0;

  await frame.evaluate(function () {
    /* 这里做的是渐进滚动，如果一次性滚动则不会触发获取新数据的监听 */
    if (!window.scrollTimer) {
      window.scrollTimer = setInterval(function () {
        window.scrollTo(0, window.scrollY + 100);
      }, 100);
    }
  });
};
module.exports = BSearch;
