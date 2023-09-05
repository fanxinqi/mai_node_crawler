const { saveCompanyOrJobInfo } = require("../service");
const { lipinHost } = require("../config");
const { wrapLiepinCheck } = require("../utils/safety-container");
/**
 * liepin job detail
 * @param {*} context
 * @returns
 */
const ljob = async (context) => {
  const { keyword = "/job/1936478517.shtml", request_type = "brower" } =
    context.task || {};
  const { browerPage, instance } = context;

  let $;
  let noFind = false;
  let noUse = false;
  const result = {
    cid: keyword,
    type: "ljob",
    instance,
  };

  const openPage = wrapLiepinCheck(browerPage);

  try {
    $ = await openPage(
      `${lipinHost}${keyword}`,
      ["div.name-box > span.name.ellipsis-1"],
      request_type
    );
  } catch (error) {
    console.log(error);
    if (error === "此页面似乎不存在") {
      noFind = true;
    }
    if (error === "该职位已暂停招聘") {
      noUse = true;
    }
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

  const jobInfo = {};
  jobInfo["title"] = $(
    "body > section.job-apply-container > div.job-apply-content > div.name-box > span.name.ellipsis-1"
  ).text();

  // 急聘
  jobInfo["type"] = $(
    "body > section.job-apply-container > div.job-apply-content > div.name-box > span.mark"
  ).text();
  jobInfo["tags_1"] = [];
  jobInfo["tags_2"] = [];
  $(
    "body > section.job-apply-container > div.job-apply-content > div.job-properties > span:nth-child(2n+1)"
  ).each((i, item) => {
    jobInfo["tags_1"].push($(item).text());
  });
  $("body > section.job-apply-container-desc  div.labels > span").each(
    (i, item) => {
      jobInfo["tags_2"].push($(item).text());
    }
  );

  const $recruiter = $("body > main > content > section.recruiter-container");
  const recruiter = {};

  if ($recruiter.length > 0) {
    recruiter["icon_url"] = $recruiter.find("img.avator").attr("src");
    recruiter["name"] = $recruiter.find("div>.name-box>.name").text();
    recruiter["online"] = $recruiter.find("div>.name-box>.online").text();
    recruiter["certification"] = $recruiter
      .find("div>.name-box>.certification")
      .text();
    recruiter["title"] = $recruiter
      .find("div>.title-box span:nth-child(1)")
      .text();
    const companyText = $recruiter
      .find("div>.title-box span:nth-child(2) a")
      .text()
      .replace(" · ", "")
      .replace(".", "");
    recruiter["company"] = companyText
      ? companyText
      : $recruiter
          .find("div>.title-box span:nth-child(2)")
          .text()
          .replace(/\s/gi, "")
          .replace(" · ", "")
          .replace(".", "");

    recruiter["company_url"] = $recruiter.find("div>.title-box a").attr("href");
    jobInfo["recruiter"] = recruiter;
    jobInfo["btn-chat"] = {};
    jobInfo["labels"] = [];
    const $labels = $recruiter.find("div.labels > span");
    if ($labels.length) {
      $labels.each((i, label) => {
        jobInfo["labels"].push($(label).text());
      });
    }
    try {
      jobInfo["btn-chat"] = JSON.parse(
        $recruiter.find(".btn-chat").attr("data-params")
      );
    } catch (error) {}

    try {
      const JSONData = JSON.parse(
        $('script[type="application/ld+json"]').text().replace(/\s/gi, "")
      );
      jobInfo["upDate"] = JSONData.upDate;
      jobInfo["pubDate"] = JSONData.pubDate;
    } catch (error) {}
  }

  jobInfo["薪资"] = $(
    "body > section.job-apply-container > div.job-apply-content > div.name-box > span.salary"
  ).text();

  const $jobTags = $(
    "body > main > content > section.job-intro-container .tag-box>ul>li"
  );
  jobInfo["职位tag"] = [];
  if ($jobTags.length > 0) {
    $jobTags.each((i, li) => {
      jobInfo["职位tag"].push($(li).text());
    });
  }

  const $jobDes = $(
    "body > main > content > section.job-intro-container > dl:nth-child(1) > dd"
  );
  jobInfo["职位描述"] = $jobDes.text();

  jobInfo["职位其他信息"] = [];
  const $otherInfo = $(
    "body > main > content > section.job-intro-container > dl:nth-child(2) > dd"
  );
  if ($otherInfo.length) {
    $otherInfo.each((i, other) => {
      jobInfo["职位其他信息"].push($(other).text());
    });
  }

  result["job_info"] = jobInfo;
  await saveCompanyOrJobInfo(result);
};

module.exports = ljob;
