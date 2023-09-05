const { saveCompanyOrJobInfo } = require("../service");
const { lipinHost } = require("../config");

const { wrapLiepinCheck } = require("../utils/safety-container");
/**
 * liepin job list
 * @param {*} context
 * @returns
 */
const lgongsir = async (context) => {
  const { keyword } = context.task || {};
  const { browerPage, instance } = context;
  const result = {
    cid: keyword,
    type: "lgongsir",
    instance,
  };

  const openPage = wrapLiepinCheck(browerPage);
  let noFind = false;
  let noUse = false;
  let noPublish = false;
  let $;
  try {
    $ = await openPage(`${lipinHost}${keyword}`, [
      ".left-list-box > ul li",
      ".error-main-container",
    ]);
  } catch (error) {
    if (error === "此页面似乎不存在") {
      noFind = true;
    }
    if (error === "该职位已暂停招聘") {
      noUse = true;
    }
    if (error === "未发布职位") {
      noPublish = true;
    }

    if (
      !browerPage.page.url().includes("https://vip.liepin.com/") &&
      error !== "此页面似乎不存在" &&
      error !== "该职位已暂停招聘" &&
      error !== "未发布职位"
    ) {
      throw error;
    }
  }

  if (browerPage.page.url().includes("https://vip.liepin.com/")) {
    await saveCompanyOrJobInfo({
      vip_url: browerPage.page.url(),
      ...result,
    });
    return;
  }

  if (noFind) {
    result["result_type"] = "此页面似乎不存在";
    await saveCompanyOrJobInfo(result);
    return;
  }
  if (noUse) {
    result["result_type"] = "该职位已暂停招聘";
    await saveCompanyOrJobInfo(result);
    return;
  }

  if (noPublish) {
    result["result_type"] = "未发布职位";
    await saveCompanyOrJobInfo(result);
    return;
  }

  result["page"] = 1;
  // 注意第二页面元素变了
  const $jobList = $(".left-list-box > ul li");
  const jobList = [];
  $jobList.each((i, item) => {
    const $job = $(item);
    const jobInfo = {};
    const $ellipsis = $(item).find(
      "div.job-detail-header-box .job-title-box .ellipsis-1"
    );
    const jobName = [];
    $ellipsis.each((i, name) => {
      jobName.push($(name).html());
    });
    jobInfo["title"] = jobName;
    jobInfo["salary"] = $job.find(".job-salary").text();
    jobInfo["tags"] = [];
    $job.find(".labels-tag").each((i, tag) => {
      jobInfo["tags"].push($(tag).text());
    });
    jobInfo["icon_url"] = $job.find("div.recruiter-photo > img").attr("src");
    jobInfo["url"] = $job.find("div.job-card-left-box > div > a").attr("href");
    jobInfo["name"] = $job
      .find("div.recruiter-info-text-box > div.recruiter-name.ellipsis-1")
      .text();
    jobInfo["liepin_title"] = $job
      .find("div.recruiter-info-text-box > div.recruiter-title.ellipsis-1")
      .text();
    jobInfo["liepin_id"] = {};
    try {
      jobInfo["liepin_id"] = JSON.parse(
        $job.find("div.recruiter-photo").attr("data-params")
      );
    } catch (error) {}

    jobList.push(jobInfo);
  });
  result["selecters"] = [];

  // 下拉刷新需要模拟点击才能出来
  await browerPage.page.click(
    ".options-filter-container .option-item:nth-child(1)"
  );
  await browerPage.page.click(
    ".options-filter-container .option-item:nth-child(2)"
  );
  await browerPage.page.click(
    ".options-filter-container .option-item:nth-child(3)"
  );
  await browerPage.page.click(
    ".options-filter-container .option-item:nth-child(4)"
  );

  $ = await browerPage.getPageJqueryForSelecter([".ant-select-dropdown"]);
  $(".ant-select-dropdown").each((i, selecter) => {
    const selecterArray = [];
    $(selecter)
      .find(".ant-select-item-option-content")
      .each((j, content) => {
        selecterArray.push($(content).text());
      });
    result["selecters"].push(selecterArray);
  });
  result["list"] = jobList;
  await saveCompanyOrJobInfo(result);
};

module.exports = lgongsir;
