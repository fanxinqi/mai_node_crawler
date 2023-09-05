const BrowerPage = require("../../../utils/browser-page");
const {
  browerUa,
  feishuBotId,
  getCompanyDataPath,
} = require("../../../config.js");
const log = require("../../../utils/log");
const sleep = require("../../../utils/sleep");
const login = require("./login");

const tab = new BrowerPage({
  headless: false,
  ua: browerUa,
});

(async () => {
  await login({
    tab,
  });
  await sleep(5000);
  // 登陆
  let $ = await tab.open(
    "https://www.zhipin.com/job_detail/88a3682273ce13c61nR72tu1E1BV.html",
    ".btn-startchat"
  );
  await tab.page.click(".btn-startchat");
  await tab.await(".chat-user", 20);
  const scrollChat = await tab.page.evaluate(async () => {
    async function sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    const scrollItem = document.querySelector(".user-list");
    if (!scrollItem) return false;
    let n = 0;
    while (n < 5) {
      n++;
      scrollItem.scrollTop = 1000 * n;
      //   if (document.querySelector(".__im_basic__max-contacts")) {
      //     return true;
      //   }
      await sleep(500);
    }
    // return false;
  });
  const chatlistNumber = await tab.page.evaluate(async () => {
    const chatlist = document.querySelectorAll(".user-list ul>li");
    return chatlist.length;
  });

  const result = [];

  for (let index = 0; index < chatlistNumber; index++) {
    const chatOne = `.user-list ul>li:nth-child(${index + 1})`;
    await tab.page.click(chatOne);
    let n = 0;
    let $;
    while (n < 3) {
      n++;
      const titleSelecter = `${chatOne} .title-box`;
      $ = await tab.await(titleSelecter);
      const clickTitle = $(titleSelecter).find(".name-text").text();
      const title = $(
        "#container div.top-info > div.user-info > p > span.name"
      ).text();
      log.info(`title:${title}`);
      log.info(`clickTitle${clickTitle}`);

      if (clickTitle.includes(title)) {
        break;
      }
    }
    if (n > 2) {
      break;
    }
    const idx_rid = $(chatOne).attr("data-pos");
    const chats = [];
    $(".message-content ul li").each((index, li) => {
      const chat = {};
      const psrc = $(li).find(".figure img").src;
      const text = $(li).text();
      if (psrc) {
        chat["psrc"] = psrc;
      }

      if (text) {
        chat["text"] = text;
      }
      chats.push(chats);
    });

    result.push({
      idx_rid,
      chats,
    });
  }
  console.log(result);
})();
