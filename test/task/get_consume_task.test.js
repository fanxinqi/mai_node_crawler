const get_company_list = require("../../task/get_company_list");
const BrowerPage = require("../../utils/browser-page");

const { proxyServer, browerUa } = require("../../config.js");

test("获取爬虫任务", async () => {
  let browerPage = new BrowerPage({
    proxyServer: proxyServer,
    headless: true,
    ua: browerUa,
  });
  const task = {
    id: 1234,
    type: "company_list",
    keyword: "/gongsi/_zzz_iy100001_t802/",
  };
  const res = await get_company_list({
    browerPage,
    task,
  });

  expect(res).toBe(true);

});

// test("adds 1 + 2 to equal 3", () => {
//   expect(1 + 2).toBe(3);
// });
