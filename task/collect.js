const log = require("../utils/log");
const { saveCompanyOrJobInfo } = require("../service");
const { sentMsg } = require("../utils/kp-utils");
module.exports = async (env, taskContent) => {
  const brower = env.getBrower();
  await brower.open("https://www.zhipin.com/web/geek/chat", ".user-list ul li");
  const scrollChat = await brower.page.evaluate(async () => {
    async function sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    const scrollItem = document.querySelector(".user-list");
    if (!scrollItem) return false;
    let n = 0;
    while (n < 20) {
      n++;
      scrollItem.scrollTop = scrollItem.scrollTop + 2000;
      //   if (document.querySelector(".__im_basic__max-contacts")) {
      //     return true;
      //   }
      await sleep(200);
    }
    // return false;
  });
  const chatlistNumber = await brower.page.evaluate(async () => {
    const chatlist = document.querySelectorAll(".user-list ul>li");
    return chatlist.length;
  });

  const result = [];

  for (let index = 0; index < chatlistNumber; index++) {
    const chatOne = `.user-list ul>li:nth-child(${index + 1})`;
    await brower.page.click(chatOne);
    let n = 0;
    let $;
    while (n < 3) {
      n++;
      const titleSelecter = `${chatOne} .title-box`;
      $ = await brower.await(titleSelecter);
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
      chats.push(chat);
    });

    result.push({
      idx_rid,
      chats,
    });

    if (!chats.some((item) => item.text === "我可以把我的简历发给您看看吗？")) {
      await brower.page.click(".btn-dict");
      $ = await brower.await(".sentence-panel", 3);
      let index = 0;

      $("#container  div.sentence-panel > ul > li").each((i, item) => {
        if ($(item).text() === "我可以把我的简历发给您看看吗？") {
          index = i + 1;
        }
      });
      if (index > 0) {
        await brower.page.click(
          `#container  div.sentence-panel > ul > li:nth-child(${index})`
        );
      }
    }

    if (!chats.some((item) => item.text === "附件简历已发送")) {
      // 交换手机号
      $ = await brower.await(".btn-contact");

      if (!$(".btn-resume").attr("class").includes("unable")) {
        await brower.page.click(".btn-resume");

        await brower.await(".panel-resume .btn-sure-v2");
        await brower.page.click(".panel-resume .btn-sure-v2");
        sentMsg(`发送简历成功`);
      }

      if (!$(".btn-contact").attr("class").includes("unable")) {
        await brower.page.click(".btn-contact");
        await brower.await(".panel-contact .btn-sure-v2");
        await brower.page.click(".panel-contact .btn-sure-v2");
        sentMsg(`交换联系方式成功`);
      }
    }
  }

  // 上传数据库
  await saveCompanyOrJobInfo({
    type: "collect",
    keyword: taskContent.keyword,
    chats: result,
  });

  log.info(
    `task:${taskContent.keyword},保存消息成功，消息个数：${result.length}`
  );
};
