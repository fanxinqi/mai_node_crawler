const { saveCompanyOrJobInfo } = require("../service");
const { lipinHost } = require("../config");
const { wrapLiepinCheck } = require("../utils/safety-container");

/**
 * liepin company search task
 * @param {*} context
 * @returns
 */
const lgongsi = async (context) => {
  const { keyword } = context.task || {};
  const { browerPage, instance } = context;

  const companyData = {
    cid: keyword,
    type: "lgongsi",
    instance,
  };

  const openPage = wrapLiepinCheck(browerPage);
  let noFind = false;
  let noUse = false;
  let $;
  try {
    $ = await openPage(`${lipinHost}${keyword}`, [
      ".company-header",
      ".error-main-container",
    ]);
  } catch (error) {
    if (error === "此页面似乎不存在") {
      noFind = true;
    }
    if (error === "该职位已暂停招聘") {
      noUse = true;
    }
    if (
      !browerPage.page.url().includes("https://vip.liepin.com/") &&
      error !== "此页面似乎不存在" &&
      error !== "该职位已暂停招聘"
    ) {
      throw error;
    }
  }

  if (noFind) {
    companyData["result_type"] = "此页面似乎不存在";
    await saveCompanyOrJobInfo(companyData);
    return;
  }
  if (noUse) {
    companyData["result_type"] = "该职位已暂停招聘";
    await saveCompanyOrJobInfo(companyData);
    return;
  }

  if (browerPage.page.url().includes("https://vip.liepin.com/")) {
    console.log(browerPage.page.url());
    await saveCompanyOrJobInfo({
      vip_url: browerPage.page.url(),
      ...companyData,
    });
    return;
  }

  // logo
  companyData["icon_url"] = $(".company-header .logo").attr("src");
  companyData["公司简称"] = $(".company-header .title").text();
  const tagPStr = $(".company-header .name-right p").html() || "";
  companyData["tags"] = tagPStr.replace(/\s/gi, "").split("<span>·</span>");
  companyData["other_tags"] = [];
  $(".company-header .tags-container .tags-item").each((i, tagItem) => {
    companyData["other_tags"].push($(tagItem).find("span").text());
  });
  companyData["公司简介"] = $(".company-introduction .inner-text").text();
  companyData["公司地址"] = $(
    "div#company-address-root div.title-box > span"
  ).text();
  const $locate = $("div#company-address-root div.title-box > .locate");

  companyData["公司经纬度"] =
    $locate[0] && $locate[0].getAttribute
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
  companyData["相关公司"] = [];
  $(".related-company-content>.company-item").each((i, item) => {
    companyData["相关公司"].push({
      link: $(item).attr("href"),
      icon_url: $(item).find("img").attr("src"),
    });
  });

  companyData["jobs_link"] = $(
    ".company-header-content-tab a:nth-child(2)"
  ).text();

  try {
    const JSONData = JSON.parse(
      $('script[type="application/ld+json"]').text().replace(/\s/gi, "")
    );
    companyData["upDate"] = JSONData.upDate;
    companyData["pubDate"] = JSONData.pubDate;
  } catch (error) {}

  await saveCompanyOrJobInfo(companyData);
};

module.exports = lgongsi;
