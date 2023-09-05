const singleBrower = require("../../../utils/single-brower")();
const login = require("./task/login.js");
const log = require("../../../utils/log");

const { saveCompanyOrJobInfo } = require("../../../service");

const getChatData = async ({ browerPage }) => {
  await browerPage.await("#im-c-entry", 10);
  await browerPage.page.click("#im-c-entry");
  await browerPage.await("#im-contact .__im_basic__contacts-wrap");
  const scrollChat = await browerPage.page.evaluate(async () => {
    async function sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    const scrollItem = document.querySelector(
      "#im-contact .__im_basic__contacts-wrap"
    );
    alert(scrollItem.scrollTop);
    if (!scrollItem) return false;
    let n = 0;
    while (n < 10) {
      n++;
      scrollItem.scrollTop = 1000 * n;
      if (document.querySelector(".__im_basic__max-contacts")) {
        return true;
      }
      await sleep(500);
    }
    return false;
  });

  const chatlistNumber = await browerPage.page.evaluate(async () => {
    const chatlist = document.querySelectorAll(
      "#im-contact .__im_basic__contacts-wrap  .__im_basic__list-item"
    );
    return chatlist.length;
  });

  // 点击
  if (scrollChat && chatlistNumber) {
    const messageAll = [];
    log.info("chat 窗口滚动底部成功");
    for (let index = 0; index < chatlistNumber; index++) {
      //   if (index == 0) {
      try {
        const chatPSelector = `#im-contact .__im_basic__contacts-wrap  .__im_basic__list-item:nth-child(${
          index + 1
        })`;
        await browerPage.page.click(chatPSelector);
        let n = 0;
        let $;
        while (n < 3) {
          $ = await browerPage.await("#im-chatwin .__im_basic__user-title");
          const clickTitle = $(chatPSelector)
            .find(".__im_basic__contact-title-name")
            .text();
          const clickSubTitle = $(chatPSelector)
            .find(".__im_basic__contact-title-title")
            .text();
          const title = $("#im-chatwin .__im_basic__user-title").text();
          const subtitle = $("#im-chatwin .__im_basic__user-sub-title").text();
          console.log(title, subtitle, clickTitle, clickSubTitle);
          if (title === clickTitle) {
            break;
          }
        }
        if (n > 2) {
          break;
        }

        //去除前两位就是 recruiterId
        const pre_recruiterId = $(chatPSelector).attr("data-key");

        let messgeArray = [];
        const $messageListDom = $(
          ".__im_basic__msg-list-content>.__im_basic__message"
        );
        $messageListDom.each((i, item) => {
          messgeArray.push($(item).text());
        });
        messageAll.push({
          pre_recruiterId,
          messgeArray,
        });
      } catch (error) {
        log.error(error);
      }

      //   }
    }

    saveCompanyOrJobInfo({
      phone: task.PHONE,
      password: task.PASSWORD,
      chats: messageAll,
    });
    // console.log(messageAll);
  } else {
    log.error("chat 窗口滚动底部失败");
  }
};

// main run
(async () => {
  const browerPage = singleBrower.getInstance();
  await login({
    browerPage,
    userName: "16257971526",
    passWord: "1roWeFO9@25H",
  });
  await getChatData({
    browerPage,
  });
})();
