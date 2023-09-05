const { saveCompanyOrJobInfo } = require("../service");
const { wrapLiepinCheck } = require("../utils/safety-container");
const { lipinHost } = require("../config");

/**
 * liepin company search task
 * @param {*} context
 * @returns
 */
const lgeek = async (context) => {
  return;
  const { keyword, type } = context.task || {};
  const { browerPage } = context;

  const openPage = wrapLiepinCheck(browerPage);

  const $ = await openPage(`${lipinHost}${keyword}`, [".company-header"]);

  const companyData = {
    type,
    cid: keyword,
  };
  // logo
  companyData["icon_url"] = $(".company-header .logo").attr("src");
  companyData["公司简称"] = $(".company-header .title").text();
  companyData["tags"] = $(".company-header .name-right p")
    .html()
    .replace(/\s/gi, "")
    .split("<span>·</span>");
  companyData["other_tags"] = [];
  $(".company-header .tags-container .tags-item").each((i, tagItem) => {
    companyData["other_tags"].push($(tagItem).find("span").text());
  });
  companyData["公司简介"] = $(".company-introduction .inner-text").text();
  companyData["公司地址"] = $(
    "div#company-address-root div.title-box > span"
  ).text();
  const $locate = $("div#company-address-root div.title-box > .locate");
  companyData["公司经纬度"] = $locate[0]
    ? $locate[0].getAttribute("viewBox")
    : "";
  companyData["工商信息"] = [];
  $(
    "div.business-register-comp > div.business-register-content > div.business-register-content-item"
  ).each((i, item) => {
    const business = {};
    business[$(item).find("p.name-box > span.name").text()] = $(item)
      .find("p.text")
      .text();
    companyData["工商信息"].push(business);
  });

  await saveCompanyOrJobInfo();
};

module.exports = lgeek;
