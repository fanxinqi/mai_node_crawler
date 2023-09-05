const log = require("../utils/log");
const sleep = require("../utils/sleep");
const { saveCompanyOrJobInfo } = require("../service");
module.exports = async (env, taskContent) => {
  await env.getBrower().await("#im-c-entry", 10);
  log.info(`点击：#im-c-entry`);
  await sleep(500);
  await env.getBrower().page.click("#im-c-entry");

  log.info(`await im-contact .__im_basic__contacts-wrap`);
  let $ = await env
    .getBrower()
    .await(
      [
        "#im-contact .__im_basic__contacts-wrap",
        ".__im_basic__contact-list-empty",
      ],
      50
    );

  if ($(".__im_basic__contact-list-empty").length > 0) {
    log.info(`没有聊天记录`);
    return;
  }
  // retry 一次
  if ($ === null) {
    await sleep(500);
    await env.getBrower().page.click("#im-c-entry");

    log.info(`await im-contact .__im_basic__contacts-wrap`);
    let $ = await env
      .getBrower()
      .await("#im-contact .__im_basic__contacts-wrap", 50);
  }

  const scrollChat = await env.getBrower().page.evaluate(async () => {
    async function sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    const scrollItem = document.querySelector(
      "#im-contact .__im_basic__contacts-wrap"
    );
    if (!scrollItem) return false;
    let n = 0;
    while (n < 500) {
      n++;
      scrollItem.scrollTop = scrollItem.scrollTop + 1000;
      if (document.querySelector(".__im_basic__max-contacts")) {
        return true;
      }
      await sleep(500);
    }
    return true;
  });

  const chatlistNumber = await env.getBrower().page.evaluate(async () => {
    const chatlist = document.querySelectorAll(
      "#im-contact .__im_basic__contacts-wrap  .__im_basic__list-item"
    );
    return chatlist.length;
  });

  // 点击
  if (scrollChat && chatlistNumber) {
    const messageAll = [];
    log.info(`窗口滚动底部成功,共${chatlistNumber}个聊天记录`);
    for (let index = 0; index < chatlistNumber; index++) {
      //   if (index == 0) {
      try {
        const chatPSelector = `#im-contact .__im_basic__contacts-wrap  .__im_basic__list-item:nth-child(${
          index + 1
        })`;
        await env.getBrower().page.click(chatPSelector);
        let n = 0;
        let $;
        while (n < 3) {
          n++;
          $ = await env
            .getBrower()
            .await("#im-chatwin .__im_basic__user-title");
          const clickTitle = $(chatPSelector)
            .find(".__im_basic__contact-title-name")
            .text();
          const clickSubTitle = $(chatPSelector)
            .find(".__im_basic__contact-title-title")
            .text();
          const title = $("#im-chatwin .__im_basic__user-title").text();
          const subtitle = $("#im-chatwin .__im_basic__user-sub-title").text();
          log.info(`title:${title}`);
          log.info(`clickTitle${clickTitle}`);
          log.info(`subtitle${subtitle}`);
          log.info(`clickSubTitle${clickSubTitle}`);

          if (clickTitle.includes(title)) {
            break;
          }
        }
        if (n > 2) {
          break;
        }

        //去除前两位就是 recruiterId
        const idx_rid = $(chatPSelector).attr("data-key");

        if (
          $(".__im_basic__universal-card-btn").length > 0 &&
          $(".__im_basic__universal-card-btn").text() === "查看"
        ) {
          //   alert(1);
          await env.getBrower().page.click(".__im_basic__universal-card-btn");
          $ = await env.getBrower().await(".__im_basic__universal-card-btn", 1);
        }
        let messgeArray = [];
        const $messageListDom = $(
          ".__im_basic__msg-list-content>.__im_basic__message"
        );
        $messageListDom.each((i, item) => {
          messgeArray.push($(item).text());
        });
        messageAll.push({
          idx_rid,
          chat: messgeArray,
        });
      } catch (error) {
        log.error(error);
      }

      //   }
    }
    console.log(messageAll);
    // 上传数据库
    await saveCompanyOrJobInfo({
      type: "lcollect",
      phone: taskContent.keyword,
      chats: messageAll,
    });
    log.info(
      `task:${taskContent.keyword},保存消息成功，消息个数：${messageAll.length}`
    );
  } else {
    throw "chat 窗口滚动底部失败";
  }
};
