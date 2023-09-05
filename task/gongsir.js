const qs = require("qs");
const { saveCompanyOrJobInfo } = require("../service");
const log = require("../utils/log");
const { openBossPage } = require("../utils/safety-container");
/**
 * 公司职位列表爬取
 * @param {*} context
 * @returns
 */
const gongsir = async (context) => {
  const { keyword, page = 1 } = context.task || {};
  const { browerPage, instance } = context;

  // 爬取结果
  const result = {
    type: "gongsir",
    cid: keyword,
    instance,
  };

  const queryStr = qs.stringify({
    page: page,
    // ka: `page-${page}`,
  });

  const pageUrl = `https://www.zhipin.com${keyword}?${queryStr}`;
  const noDataTip = "#main > div.job-box.company-job  div.job-list.data-tips";
  const noneData = ".job-empty-wrapper";

  log.info(`访问链接：${pageUrl}`);
  const $ = await openBossPage(browerPage, pageUrl, [
    ".company-position-box  .position-job-list",
    noDataTip,
    noneData,
  ]);

  const jobList = [];
  const $jobSelecters = $(".filter-select-dropdown");
  const $joblistLi = $(
    ".position-job-container ul.position-job-list li.job-card-box"
  );
  const $dataTip = $(noDataTip);
  const $noneData = $(noneData);

  // 无数据
  if ($joblistLi.length === 0 && $dataTip.length > 0) {
    // save result
    await saveCompanyOrJobInfo(result);
    return true;
  }

  if ($joblistLi.length === 0 && $noneData.length > 0) {
    // save result
    await saveCompanyOrJobInfo(result);
    return true;
  }

  const selecters = [];
  $jobSelecters.each((i, selecter) => {
    // const dataKey = $(selecter).attr("data-ka");
    // if (dataKey) {
    //   selecters[dataKey] = [];
    //   const $a = $(selecter).find(">div.job-options a");
    //   if ($a.length > 0) {
    //     $a.each((j, a) => {
    //       selecters[dataKey].push($(a).text());
    //     });
    //   }
    // }
    const selectItems = [];
    $(selecter)
      .find("li a")
      .each((i, j) => {
        selectItems.push($(j).text());
      });
    selecters.push(selectItems);
  });

  result["selecters"] = selecters;
  result["职位类型"] = [];

  const $categorylist = $("ul.position-select-list li a");
  $categorylist.each((i, category) => {
    result["职位类型"].push({
      url: $(category).attr("href"),
      text: $(category).text().replace(/\s/gi, ""),
    });
  });

  $($joblistLi).each(async (i, li) => {
    const jobData = {
      title: $(li).find(".job-title  a").text(),
      area: $(li).find(".company-location").text(),
      salary: $(li).find(".job-salary").text(),
    };
    jobData["tags"] = [];
    $(li)
      .find(".tag-list li")
      .each((i, tag) => {
        jobData["tags"].push($(tag).text());
      });
    const $onlineTag = $(li).find(".boss-online-icon");
    if ($onlineTag.length > 0) {
      jobData["is_online"] = true;
    } else {
      jobData["is_online"] = false;
    }
    // jobData["boss_id"] = $(li).find(".startchat-box a").attr("redirect-url");
    jobData["url"] = $(li).find(".job-title a").attr("href");
    jobData["icon_url"] = $(li).find(".boss-info .boss-logo img").attr("src");
    const name_title = $(li).find(".boss-info .boss-name").text().split('·');
    jobData["name"] = name_title[0];
    jobData["boss_title"] = name_title[1];
    // jobData["boss_title"] = $(li).find(".info-publis-info .boss-title").text();

    jobList.push(jobData);
  });
  result["page"] = 1;
  result["version"] = "v20230614";
  result["职位"] = jobList;
  // save result
  await saveCompanyOrJobInfo(result);
  log.info("数据入库成功～");
};

const withRecursion = async (context) => {
  if (!context) return;
  if (!context.task) return;

  const { limit_page = 1 } = context.task || {};
  if (!context.task.page) {
    context.task.page = 1;
  }
  while (context.task.page <= limit_page) {
    const end = await gongsir(context);
    log.info(`第${context.task.page}页面爬取结束`);
    // console.log("end", end);
    // 直到遍历到无内容
    if (end) break;
    context.task.page++;
  }
};

module.exports = withRecursion;
