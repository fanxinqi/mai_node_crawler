const { saveCompanyOrJobInfo } = require("../service");
const { openBossPage } = require("../utils/safety-container");
/**
 * 职位详情页面爬取任务
 * @param {*} context
 */
const job = async (context) => {
  const { keyword, type } = context.task || {};
  const { browerPage, instance } = context;
  const result = {
    instance,
    cid: keyword,
    type,
  };
  const $ = await openBossPage(browerPage, `https://www.zhipin.com${keyword}`, [
    "#main > div.job-banner",
  ]);
  result["status"] = $(
    "#main > div.job-banner div.info-primary > div.job-status"
  ).text();
  result["name"] = $("#main div.name > h1").text();
  result["salary"] = $("#main div.name > .salary").text();

  result["tags"] = [];
  const $tags = $(
    "#main > div.job-banner  div.tag-container-new > div.job-tags span"
  );
  $tags.each((i, tag) => {
    result["tags"].push($(tag).text());
  });

  result["job_keyword_list"] = [];
  const $job_keyword_list = $(
    "#main > div.job-box > div > div.job-detail > .job-detail-section > ul >li"
  );
  $job_keyword_list.each((i, k) => {
    result["job_keyword_list"].push($(k).text());
  });

  result["text_desc"] = [];
  const $textDesc = $("#main > div.job-banner div.info-primary > p .text-desc");
  $textDesc.each((i, t) => {
    result["text_desc"].push($(t).text());
  });

  result["desc"] = $("#main div.job-detail div.job-sec-text").text();

  result["recruiter_icon"] = $(
    "#main  div.job-boss-info > div.detail-figure > img"
  ).attr("src");

  const recruiter_name = $("#main  div.job-boss-info > h2.name").text();
  result["recruiter_name"] = recruiter_name
    ? recruiter_name
        .replace(/\n/gi, ",")
        .replace(/\s/gi, "")
        .replace(/,,/gi, ",")
        .replace(/^,+|,+$/gm, "")
    : recruiter_name;

  const recruiter_other = $(
    "#main  div.job-boss-info > div.boss-info-attr"
  ).text();
  result["recruiter_other"] = recruiter_other
    ? recruiter_other
        .replace(/\n/gi, ",")
        .replace(/\s/gi, "")
        .replace(/,,/gi, ",")
        .replace(/^,+|,+$/gm, "")
    : recruiter_other;

  result["recruiter_chat"] = $(
    "#main > div.job-banner  div.info-primary   div.btn-container > a.btn.btn-startchat"
  ).attr("redirect-url");

  const companyName = $(".job-box .company-info a:nth-child(2)").text();
  result["company_id"] = $(".job-box .company-info a:nth-child(2)").attr(
    "href"
  );
  result["company"] = companyName
    ? companyName.replace(/\s/g, "")
    : companyName;

  try {
    result["update_info"] = JSON.parse(
      $('script[type="application/ld+json"]').text().replace(/\n|\t/gi, "")
    );
  } catch (e) {
    console.log(e);
  }

  console.log(result);
  await saveCompanyOrJobInfo(result);
};

module.exports = job;
