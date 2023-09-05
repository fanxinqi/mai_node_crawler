const { saveCompanyOrJobInfo } = require("../service");
const log = require("../utils/log.js");
const { ERROR_LOG, ERROR_TYPE } = require("../config");

/**
 * 搜索公司爬取任务
 * @param {*} context
 * @returns
 */
const geek = async (context) => {
  const { keyword } = context.task || {};
  const { browerPage, instance } = context;
  const pageUrl = `https://www.zhipin.com/web/geek/job?city=100010000&query=${encodeURIComponent(
    keyword
  )}`;

  // 当前页面结果
  const result = {};

  // 403 selecter
  const selecter403 = ".error-content .text h1";

  // verify code selecter
  const selecterverifySlider = ".wrap-verify-slider";

  // has company info selecter
  const selecterCompanyInfoTag =
    ".company-card-wrapper .company-info .company-info-tag";

  // company link selecter
  const selecterCompanyLink = ".company-info-top .company-name a";

  // no company selecter
  const selecterNoData = ".job-result-empty";

  const pageJobIner = ".page-job-inner";

  // loading page
  const $ = await browerPage.open(pageUrl, [
    selecter403,
    selecterCompanyInfoTag,
    selecterNoData,
    selecterverifySlider,
    pageJobIner,
  ]);

  // if get page dom error
  if (!$) {
    throw "获取页面结果失败";
  }

  const $selecterNoData = $(selecterNoData);
  const $companyInfoTag = $(selecterCompanyInfoTag);

  // if has 403
  if ($(selecter403).text() == "403") {
    log.file(`,${keyword}`, ERROR_LOG);
    log.error(`${keyword},被封了,查看链接：${pageUrl}`);
    throw ERROR_TYPE.PAGE_BLOCKED;
  }

  // if has verify code
  if ($(selecterverifySlider).length > 0) {
    log.file(`,${keyword}`, ERROR_LOG);
    log.error(`${keyword},需要验证码登陆,查看链接：${pageUrl}`);
    throw ERROR_TYPE.PAGE_BLOCKED;
  }

  // if no company data
  if ($selecterNoData.length > 0) {
    await saveCompanyOrJobInfo({
      instance,
      type: "geek",
      query: keyword,
      cid: "",
      name: "",
      icon_url: "",
    });
    log.warn(`${keyword},没数据, 打开链接：${pageUrl}`);
    // 该任务结束，熔断后续流程
  }
  result["tags"] = [];
  if ($companyInfoTag.length > 0) {
    $companyInfoTag.each((i, item) => {
      result["tags"].push($(item).text());
    });
  }

  // 跳转链接获取，为下个流程提供上下文
  const $link = $(selecterCompanyLink);

  result["name"] = $link.text();
  result["url"] = $link.attr("href");
  await saveCompanyOrJobInfo({
    instance,
    type: "geek",
    query: keyword,
    cid: result["url"],
    name: result["name"],
    icon_url: $link.find("img").attr("src"),
  });
  log.info("保存任务成功～");
};

module.exports = geek;
