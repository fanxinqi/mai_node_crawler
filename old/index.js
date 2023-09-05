const SyncBailHook = require("./utils/SyncBailHook.js");
const log = require("./utils/log.js");
const BrowerPage = require("./utils/browser-page");
const names = require("./name.js");
const sleep = require("./utils/sleep");
const {
  saveCompanyOrJobInfo,
  changeEip,
  getConsumeTask,
  saveTask,
} = require("./service");

const {
  ERROR_LOG,
  NO_DATA_LOG,
  proxyServer,
  browerUa,
} = require("./config.js");
const error_company_names = [];

// 初始化页面对象
let browerPage = new BrowerPage({
  proxyServer: proxyServer,
  headless: true,
  ua: browerUa,
});

const insertErrorCompanyNames = (name) => {
  if (!error_company_names.includes(name)) {
    error_company_names.push(name);
  }
};

const task = new SyncBailHook();

const switchIP = async () => {
  log.info("切换ip");
  await sleep(2000);
  await browerPage.destroy();
  await changeEip();
  log.info("切换ip成功");
  log.info(`销毁浏览器实例成功`);
  browerPage = new BrowerPage({
    // proxyServer: proxyServer,
  });
  log.info(`重启浏览器实例成功`);
};

/*
 * 获取公司任务
 */
task.tap("获取搜索任务列表", async (browerPage, result, context) => {
  const data = (await getConsumeTask()) || {};
  // 无搜索任务，熔断流程
  if (!data.keyword) {
    await sleep(3000);
    return true;
  }

  log.info(`搜索关键字：${data.keyword},任务id:${data.id}`);
  context["task"] = data;
});

/*
 * @pa browerPage
 */
// task.tap("搜索公司页面", async (browerPage, result, context) => {
//   const { keyword, id } = context.task || {};
//   result["query"] = keyword;
//   const pageUrl = `https://www.zhipin.com/web/geek/job?city=101010100&query=${encodeURIComponent(
//     keyword
//   )}`;
//   // 被封的选择器
//   const selecter403 = ".error-content .text h1";

//   // 验证码页面
//   const selecterverifySlider = ".wrap-verify-slider";

//   // 公司信息选择器
//   const selecterCompanyInfoTag =
//     ".company-card-wrapper .company-info .company-info-tag";

//   // 公司在招职位数量选择器
//   const selecterCompanyJobNum = ".company-item-right .count-item .count-text";

//   // 公司详情页链接选择器
//   const selecterCompanyLink = ".company-info-top .company-name a";

//   // 公司无数据
//   const selectNoData = ".job-result-empty";

//   // 公司信息选择器
//   const selecterCompanyFromJob = ".job-list-box .job-card-wrapper";

//   const $ = await browerPage.open(pageUrl, [
//     selecter403,
//     selecterCompanyInfoTag,
//     selectNoData,
//     selecterCompanyFromJob,
//     selecterverifySlider,
//   ]);
//   if (!$) {
//     log.error(`${keyword},获取页面失败了`);
//     insertErrorCompanyNames(keyword);
//     saveTask({
//       tid: id,
//       failed: 1,
//     });
//     await switchIP();
//     return true;
//   }

//   if ($(selecter403).text() == "403") {
//     log.file(`,${keyword}`, ERROR_LOG);
//     log.error(`${keyword},被封了,查看链接：${pageUrl}`);
//     insertErrorCompanyNames(keyword);
//     saveTask({
//       tid: id,
//       failed: 1,
//     });
//     await switchIP();
//     return true;
//   }

//   if ($(selecterverifySlider).html()) {
//     log.file(`,${keyword}`, ERROR_LOG);
//     log.error(`${keyword},需要验证码登陆,查看链接：${pageUrl}`);
//     await switchIP();
//     return true;
//   }

//   const $selectNoData = $(selectNoData);
//   if ($selectNoData.html()) {
//     try {
//       await saveCompanyOrJobInfo({
//         type: "geek",
//         query: keyword,
//         cid: "",
//         name: "",
//         icon_url: "",
//       });
//       // await saveTask({
//       //   tid: id,
//       //   failed: 0,
//       // });
//     } catch (error) {
//       await saveTask({
//         tid: id,
//         failed: 1,
//       });
//       return true;
//     }

//     log.file(`,${keyword}`, NO_DATA_LOG);
//     log.warn(`${keyword},没数据, 打开链接：${pageUrl}`);
//     // 该任务结束，熔断后续流程
//     return true;
//   }
//   result["tags"] = [];
//   const $companyInfoTag = $(selecterCompanyInfoTag);
//   if ($companyInfoTag.html()) {
//     // 跳转链接获取，为下个流程提供上下文
//     const $link = $(selecterCompanyLink);

//     result["name"] = $link.text();
//     result["url"] = $link.attr("href");
//     try {
//       await saveCompanyOrJobInfo({
//         type: "geek",
//         query: keyword,
//         cid: result["url"],
//         name: result["name"],
//         icon_url: $link.find("img").attr("src"),
//       });
//       // await saveTask({
//       //   tid: id,
//       //   failed: 0,
//       // });
//     } catch (error) {
//       await saveTask({
//         tid: id,
//         failed: 1,
//       });
//       return true;
//     }
//   }

//   // console.log($(selecterCompanyFromJob).html())
//   if (!$companyInfoTag.html() && $(selecterCompanyFromJob).html()) {
//     log.file(`,${keyword}`, NO_DATA_LOG);
//     log.warn(`${keyword},没数据, 打开链接：${pageUrl}`);
//     await saveTask({
//       tid: id,
//       failed: 0,
//     });
//     return true;
//   }

//   if (!result["url"]) {
//     return true;
//   }
// });

// task.tap("公司详情页", async (browerPage, result, context) => {
//   const { keyword, id } = context.task || {};
//   // 跳转
//   const selectorHotPosition = "#main .company-tab a";
//   const $ = await browerPage.open(
//     `https://www.zhipin.com${keyword}`,
//     selectorHotPosition
//   );
//   if (!$) {
//     insertErrorCompanyNames(keyword);
//     // saveTask({
//     //   tid: id,
//     //   failed: 1,
//     // });
//     await switchIP();
//     return true;
//   }

//   // 公司信息
//   const companyInfo = {};
//   companyInfo["cid"] = result.url;
//   companyInfo["type"] = "gongsi";
//   companyInfo["公司简称"] = $(".company-banner .info h1.name").text();
//   companyInfo["公司简介"] = $(".company-info-box").find(".fold-text").text();
//   let tags = $(".info p").html().split('<em class="dolt"></em>');
//   tags = tags.map((tag) => {
//     if (tag.includes("href=")) {
//       return $(tag).text();
//     } else {
//       return tag;
//     }
//   });
//   companyInfo["tags"] = tags;
//   $(".company-stat span b").each((i, item) => {
//     if (i == 0) {
//       companyInfo["在招职位"] = $(item).text();
//     }
//     if (i == 1) {
//       companyInfo["boss数量"] = $(item).text();
//     }
//   });
//   companyInfo["icon_url"] = $(".info-primary").find("img").attr("src");
//   companyInfo["工商信息"] = [];

//   $(".business-detail ul li").each((i, li) => {
//     companyInfo["工商信息"].push($(li).text());
//   });

//   companyInfo["公司地址"] = [];
//   companyInfo["公司经纬度"] = [];
//   $(".job-location .location-item").each((i, item) => {
//     companyInfo["公司地址"].push($(item).find(".location-address").text());
//     companyInfo["公司经纬度"].push(
//       $(item).find(".map-container").attr("data-lat")
//     );
//   });

//   result["companyInfo"] = companyInfo;

//   // console.log(companyInfo);
//   try {
//     await saveCompanyOrJobInfo(companyInfo);
//     // await saveTask({
//     //   tid: id,
//     //   failed: 0,
//     // });
//   } catch (error) {
//     await saveTask({
//       tid: id,
//       failed: 1,
//     });
//     return true;
//   }
//   // return true;

//   // tab links
//   const $hotPosition = $("#main .company-tab a");
//   let hotPositionLink = "";

//   $hotPosition.each((i, text) => {
//     if (i === 1) {
//       hotPositionLink = $(text).attr("href");
//     }
//   });

//   result["hotPositionLink"] = hotPositionLink;

//   // 熔断任务
//   if (!hotPositionLink) {
//     return true;
//   }
// });

// task.tap("公司招聘职位tab页面", async (browerPage, result, context) => {
//   const { hotPositionLink } = result;
//   const { keyword, id } = context.task || {};
//   // 打开tab链接
//   const $ = await browerPage.open(`https://www.zhipin.com${hotPositionLink}`);
//   if (!$) {
//     insertErrorCompanyNames(keyword);
//     saveTask({
//       tid: id,
//       failed: 1,
//     });
//     await switchIP();
//     return true;
//   }
//   const classes = [];
//   const classesLinks = [];
//   $($(".job-category  .job-category-items")[0])
//     .find("a")
//     .each((i, dom) => {
//       if (i == 0) {
//         classesLinks.push($(dom).attr("href"));
//       }
//       classes.push($(dom).text().replace(/\n|\s/g, ""));
//     });

//   const jobInfo = {
//     cid: result["companyInfo"].cid,
//     type: "gongsir",
//   };
//   jobInfo["职位类型"] = classes;
//   result["classesLinks"] = classesLinks;
//   result["jobInfo"] = jobInfo;
//   // return true;
// });

// task.tap("公司职位列表页面", async (browerPage, result, context) => {
//   const jobList = [];
//   const { keyword, id } = context.task || {};

//   // 目前classesLinks只有全部的链接
//   for (let i = 0; i < result["classesLinks"].length; i++) {
//     const link = result["classesLinks"][i];
//     const $ = await browerPage.open(`https://www.zhipin.com${link}`);
//     if (!$) {
//       insertErrorCompanyNames(keyword);
//       saveTask({
//         tid: id,
//         failed: 1,
//       });
//       await switchIP();
//       return true;
//     }
//     const $joblistLi = $(".company-position-main .job-list li");

//     if ($joblistLi.length === 0) {
//       return true;
//     }
//     $($joblistLi).each(async (i, li) => {
//       const jobData = {
//         title: $(li).find("a").text(),
//         area: $(li).find(".job-area").text(),
//         salary: $(li).find(".salary").text(),
//       };
//       jobData["tags"] = $(li).find(".tag-list .tag-list-item").text();
//       const $onlineTag = $(li).find(".boss-online-tag");
//       if ($onlineTag && $onlineTag.text()) {
//         jobData["is_online"] = true;
//       } else {
//         jobData["is_online"] = false;
//       }
//       jobData["boss_id"] = $(li).find(".startchat-box a").attr("redirect-url");
//       jobData["url"] = $(li).find(".title-box a").attr("href");
//       jobData["icon_url"] = $(li).find(".info-publis-avatar img").attr("src");
//       jobData["name"] = $(li).find(".info-publis-info .name").text();
//       jobData["boss_title"] = $(li)
//         .find(".info-publis-info .boss-title")
//         .text();

//       jobList.push(jobData);
//     });
//   }

//   result["jobInfo"]["page"] = 1;

//   result["jobInfo"]["职位"] = jobList;

//   try {
//     await saveCompanyOrJobInfo(result["jobInfo"]);
//     // await saveTask({
//     //   tid: id,
//     //   failed: 0,
//     // });
//   } catch (error) {
//     await saveTask({
//       tid: id,
//       failed: 1,
//     });
//   }
//   // return true;
// });

// task.tap("本次loop任务结束", async (browerPage, result, context) => {
//   const { id } = context.task || {};
//   await saveTask({
//     tid: id,
//     failed: 0,
//   });
// });
task.tap("爬取公司列表", async (browerPage, result, context) => {
  const { keyword, id } = context.task || {};
  /**
 * 获取一页公司列表信息 ref:https://www.zhipin.com/gongsi/_zzz_iy100001_t801/?ka=brand_list_stage_801
 * @param browerPage  浏览器对象
 * @param url 公司列表地址
 * @param page 页码
 * @returns 公司列表数组 
 * [{
    tag: [ '已上市', '游戏' ],
    name: '成都IGG',
    cid: '/gongsi/a4a25565283de9941XV509q9GVU~.html',
    icon_url: 'https://img.bosszhipin.com/beijin/upload/com/workfeel/20220602/7bf6f160950405e961739bdabe018b630109be6326830b2eac770e8dc01a176939a50e94a172256c.jpg?x-oss-process=image/resize,w_120,limit_0'
   }
 * ]
 */
  const getOnePageCompanyList = async (browerPage, url, page) => {
    log.info(`爬地址: ${url}?page=${page}&ka=page-${page}`);
    const $ = await browerPage.open(
      `${url}?page=${page}&ka=page-${page}`,
      ".company-tab-box"
    );
    if (!$) {
      return true;
    }
    const $li = $(".company-list li");
    if ($($li.length == 0) && $(".data-blank").length > 0) {
      return;
    }

    const companyList = {};
    companyList["type"] = "company_list";
    companyList["page"] = page;

    companyList["公司地点"] = $(".location .content .selected").text();
    companyList["行业类型"] = $(".industry .content .selected").text();
    companyList["融资阶段"] = $(".stage .content .selected").text();
    companyList["公司规模"] = $(".scale .content .selected").text();

    // 有数据
    if ($li.length > 0) {
      const list = [];
      $li.each((i, item) => {
        const companyData = {};
        companyData["tag"] = [];
        const $item = $(item);
        companyData["name"] = $item
          .find(".company-info .conpany-text h4")
          .text();
        $item.find(".company-info .conpany-text span").each((i, tag) => {
          companyData["tag"].push($(tag).text());
        });
        companyData["cid"] = $item.find("a.company-info").attr("href");
        companyData["icon_url"] = $item.find(".company-info img").attr("src");
        list.push(companyData);
      });
      companyList["list"] = list;
      await saveCompanyOrJobInfo(companyList);
    }

    if ($li.length == 28) {
      page++;
      log.info(`开始爬取第${page}页`);
      await getOnePageCompanyList(browerPage, url, page);
    }
    return;
  };

  try {
    await getOnePageCompanyList(
      browerPage,
      `https://www.zhipin.com${keyword}`,
      1
    );
    await saveTask({
      tid: id,
      failed: 0,
    });
  } catch (error) {
    await saveTask({
      tid: id,
      failed: 1,
    });
  }
});

(async () => {
  // for (let i = 0; i < names.length; i++) {
  //   const result = {};
  //   // 当前流程上下文对象
  //   const context = {
  //     task: {
  //       keyword: names[i],
  //     },
  //   };
  //   await task.callAsync(browerPage, result, context);
  //   // 重试错误的公司
  //   if (error_company_names.length > 0) {
  //     context.task.keyword = error_company_names[0];
  //     await task.callAsync(browerPage, result, context);
  //   }
  // }
  while (true) {
    // 本次loop 结果
    const result = {};

    // 本次上下文
    const context = {};
    await task.callAsync(browerPage, result, context);
    // retry error task
    // if (error_company_names.length > 0) {
    //   context.task.keyword = error_company_names[0];
    //   await task.callAsync(browerPage, result, context);
    // }
  }

  // log.info("所有的任务都结束了");
  // await sleep(2000);
  // await browerPage.destroy();
})();
