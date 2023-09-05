const { saveCompanyOrJobInfo } = require("../service");
const log = require("../utils/log");
const { openBossPage } = require("../utils/safety-container");
/**
 * 公司详情页面爬取任务
 * @param {*} context
 */
const gongsi = async (context) => {
  const { keyword } = context.task || {};
  const { browerPage, instance } = context;

  // 跳转
  const selectorHotPosition = "#main .company-tab a";
  const selecterErrorTitle = ".error-content .text h1";
  const $ = await openBossPage(browerPage, `https://www.zhipin.com${keyword}`, [
    selectorHotPosition,
    selecterErrorTitle
  ]);

  // company info
  const companyInfo = {
    instance,
  };
  companyInfo["cid"] = keyword;
  companyInfo["type"] = "gongsi";

  if (
    $(selecterErrorTitle).length > 0 &&
    $(selecterErrorTitle).text() === "Oops!"
  ) {
    companyInfo["error"] = "Oops!";
    await saveCompanyOrJobInfo(companyInfo);
    log.info("没找到这家公司，数据入库成功～");
    return;
  }

  companyInfo["公司简称"] = $(".company-banner .info h1.name").text();
  companyInfo["公司简介"] = $(".company-info-box").find(".fold-text").text();
  let tags = $(".info p").html().split('<em class="dolt"></em>');
  tags = tags.map((tag) => {
    if (tag.includes("href=")) {
      return $(tag).text();
    } else {
      return tag;
    }
  });
  companyInfo["tags"] = tags;
  $(".company-stat span b").each((i, item) => {
    if (i == 0) {
      companyInfo["在招职位"] = $(item).text();
    }
    if (i == 1) {
      companyInfo["boss数量"] = $(item).text();
    }
  });
  companyInfo["icon_url"] = $(".info-primary").find("img").attr("src");
  companyInfo["工商信息"] = [];

  $(".business-detail ul li").each((i, li) => {
    companyInfo["工商信息"].push($(li).text());
  });

  companyInfo["公司地址"] = [];
  companyInfo["公司经纬度"] = [];
  $(".job-location .location-item").each((i, item) => {
    companyInfo["公司地址"].push($(item).find(".location-address").text());
    companyInfo["公司经纬度"].push(
      $(item).find(".map-container").attr("data-lat")
    );
  });

  companyInfo["公司高管"] = [];
  const $topManger = $("#main div.job-sec.manager-list .manager-inner ul>li");
  if ($topManger.length > 0) {
    $topManger.each((i, manger) => {
      companyInfo["公司高管"].push({
        icon_url: $(manger).find(".info-user img").attr("src"),
        name: $(manger).find(".info-user .name").text(),
        job_title: $(manger).find(".info-user .job-title").text(),
        job_des: $(manger).find(".text").text(),
      });
    });
  }

  companyInfo["工作时间"] = [];
  const $workTime = $(".job-sec.work-time p");

  if ($workTime.length > 0) {
    $workTime.each((i, w) => {
      const $w = $(w);
      companyInfo["工作时间"].push($w.text());
    });
  }

  companyInfo["福利"] = [];

  const $welfare = $(".job-sec.work-time>.work-tags>.work-tag-item");

  if ($welfare.length > 0) {
    $welfare.each((i, w) => {
      const $w = $(w);
      companyInfo["福利"].push($w.text());
    });
  }

  companyInfo["招聘Boss"] = [];

  const $jobBoss = $(".job-sec.recruiter-list>ul>li");

  if ($jobBoss.length > 0) {
    $jobBoss.each((i, b) => {
      const $b = $(b);
      companyInfo["招聘Boss"].push({
        job_url: $b.find(">a").attr("href"),
        icon_url: $b.find(">a>div.figure>img").attr("src"),
        company_full_name: $b
          .find(">a>div.text>.name>.company-full-name")
          .text(),
        name: $b.find(">a>div.text>.name").text().replace(/\s/gi, ""),
        postion: $b.find(">a>div.text>.name>span").text(),
        grey: $b.find(">a>div.text>.gray").text(),
      });
    });
  }

  await saveCompanyOrJobInfo(companyInfo);
  log.info("数据入库成功～");
};

module.exports = gongsi;
