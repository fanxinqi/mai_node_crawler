const log = require("../utils/log");
const { saveCompanyOrJobInfo } = require("../service");

const { openBossPage } = require("../utils/safety-container");
/**
 * 公司列表爬取任务
 * @param {*} context
 */
const company_list = async (context) => {
  const { keyword, page = 1 } = context.task || {};
  const { browerPage } = context;
  const getOnePageCompanyList = async (browerPage, url, page) => {
    log.info(`爬地址: ${url}?page=${page}&ka=page-${page}`);
    const $ = await openBossPage(
      browerPage,
      `${url}?page=${page}&ka=page-${page}`,
      [".company-tab-box"]
    );
    if (!$) {
      throw "获取页面结果失败";
    }
    const $li = $(".company-list li");
    if ($li.length == 0 && $(".data-blank").length > 0) {
      return true;
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
      log.info("数据入库成功～");
    }

    if ($li.length == 28) {
      page++;
      // 设置上下文page，重试可以继续分页
      context.task.page = page;
      log.info(`开始爬取第${page}页`);
      await getOnePageCompanyList(browerPage, url, page);
    }
    return;
  };

  // 递归爬取分页
  await getOnePageCompanyList(
    browerPage,
    `https://www.zhipin.com${keyword}`,
    page
  );
};

module.exports = company_list;
